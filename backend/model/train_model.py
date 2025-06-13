"""
Train model using asl_landmark data and apply to label classes.
"""
import pandas as pd
import numpy as np
import torch
import os

from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from torch import nn
from torch.utils.data import DataLoader
import torch.optim as optim

import extract_landmarks
from backend.utils.preprocessing import normalize_landmarks
from model_classes.ASLDataset import ASLDataset
from model_classes.ASLClassifier import ASLClassifier


def main():
    device_type = 'cpu'

    # Check if cuda device or apple silicon gpu is available.
    if torch.cuda.is_available():
        device_type = 'cuda'
    elif torch.backends.mps.is_available():
        device_type = 'mps'

    device = torch.device(device_type)

    # Extract landmark data from images.
    extract_landmarks.safe_compile_landmarks()

    # Create seed to make data more consistent
    seed = 42
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed(seed)

    # Load asl_landmarks file to train our model on this data.
    df = pd.read_csv("asl_landmarks.csv", header=None)
    x_raw = df.iloc[:, :-1].values  # 63 landmark features
    y = df.iloc[:, -1].values   # labels

    # Normalize landmark data.
    x = np.array([normalize_landmarks(landmark_row) for landmark_row in x_raw])

    # Create labels for each dataset (i.e. A, B, C, ...)
    label_encoder = LabelEncoder()
    y_encoded = label_encoder.fit_transform(y)

    if not os.path.exists("label_classes.npy"):
        # Save label classes
        np.save("label_classes.npy", label_encoder.classes_)
    else:
        print("label_classes.npy exists, skipping creation.")

    # Split data into training and validation
    x_train, x_val, y_train, y_val = train_test_split(
        x, y_encoded, test_size=0.2, random_state=seed, stratify=y_encoded
    )

    if not os.path.exists("landmark_model.pt"):
        # Create training and validation dataset and dataloaders.
        train_dataset = ASLDataset(x_train, y_train)
        val_dataset = ASLDataset(x_val, y_val)

        train_loader = DataLoader(train_dataset, batch_size=64, shuffle=True)
        val_loader = DataLoader(val_dataset, batch_size=64, shuffle=False)

        # Initialize the model and send it to the device.
        model = ASLClassifier(num_classes=len(set(y_encoded)))
        model.to(device)

        criterion = nn.CrossEntropyLoss()
        optimizer = optim.Adam(model.parameters(), lr=0.001)

        best_val_acc = 0
        # Increase this number for more data passes.
        num_epochs = 200

        for epoch in range(num_epochs):
            model.train()
            total_loss = 0
            for x_batch, y_batch in train_loader:
                x_batch, y_batch = x_batch.to(device), y_batch.to(device)
                preds = model(x_batch)
                loss = criterion(preds, y_batch)

                optimizer.zero_grad()
                loss.backward()
                optimizer.step()

                total_loss += loss.item()

            print(f"Epoch {epoch + 1} Loss: {total_loss / len(train_loader):.4f}")

            # Validate our model.
            model.eval()
            all_preds = []
            all_labels = []
            with torch.no_grad():
                for x_val_batch, y_val_batch in val_loader:
                    x_val_batch, y_val_batch = x_val_batch.to(device), y_val_batch.to(device)
                    outputs = model(x_val_batch)
                    _, predicted = torch.max(outputs, 1)
                    all_preds.extend(predicted.cpu().numpy())
                    all_labels.extend(y_val_batch.cpu().numpy())

            val_acc = accuracy_score(all_labels, all_preds)

            print(
                f"Epoch {epoch + 1}/{num_epochs} - "
                f"Train Loss: {total_loss / len(train_loader):.4f} - "
                f"Val Accuracy: {val_acc:.4f}"
            )

            # If the current model has the best validation accuracy,
            # replace it as the current best_model
            if val_acc > best_val_acc:
                best_val_acc = val_acc
                torch.save(model.state_dict(), "best_model.pt")

        # Load the best_model after training completion and
        # create a trace for use by the backend.
        model.load_state_dict(torch.load("best_model.pt"))
        model.eval()
        traced_model = torch.jit.trace(model, torch.randn(1, 63))
        traced_model.save("landmark_model.pt")


if __name__ == "__main__":
    main()