"""
Train model using asl_landmark data and apply to label classes.
"""
import os
import numpy as np
import torch

from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from torch import nn
from torch.utils.data import DataLoader, TensorDataset
from torch import optim
from torch.nn.utils.rnn import pad_sequence

from backend.model.extract_landmarks import safe_compile_landmarks
from backend.utils.preprocessing import normalize_landmarks
from backend.model.model_classes.ASLCombinedModel import ASLCombinedModel
from backend.model.model_classes.ASLClassifier import ASLClassifier
from backend.model.model_classes.ASLSequenceClassifier import ASLSequenceClassifier


def collate_video_batch(batch):
    videos, labels = zip(*batch)
    videos = [torch.tensor(v, dtype=torch.float32) for v in videos]
    videos_padded = pad_sequence(videos, batch_first=True)
    labels = torch.tensor(labels, dtype=torch.long)
    return videos_padded, labels


def main():
    device_type = 'cpu'

    print("PyTorch version:", torch.__version__)
    print("CUDA available:", torch.cuda.is_available())
    print("CUDA device count:", torch.cuda.device_count())

    # Check if cuda device or apple silicon gpu is available.
    if torch.cuda.is_available():
        device_type = 'cuda'
        print("CUDA available. Using {} GPU.".format(torch.cuda.device_count()))
    elif torch.backends.mps.is_available():
        device_type = 'mps'
        print("MPS available. Using {} GPU.".format(torch.cuda.device_count()))
    else:
        print("No GPU available. Using CPU.")

    device = torch.device(device_type)

    # Extract landmark data from images.
    safe_compile_landmarks()

    # Create seed to make data more consistent
    seed = 42
    np.random.seed(seed)
    torch.manual_seed(seed)
    if torch.cuda.is_available():
        torch.cuda.manual_seed(seed)

    # Load landmark files and labels to train our model on this data.
    image_x = np.load("asl_image_landmarks.npy", allow_pickle=True)
    video_x = np.load("asl_video_landmarks.npy", allow_pickle=True)
    labels = np.load("asl_labels.npy", allow_pickle=True)

    num_images = len(image_x)
    num_videos = len(video_x)

    image_y = labels[:num_images]
    video_y = labels[num_images:num_images + num_videos]

    image_x = np.array([normalize_landmarks(row) for row in image_x])

    label_encoder = LabelEncoder()
    label_encoder.fit(labels)

    image_y_encoded = label_encoder.transform(image_y)
    video_y_encoded = label_encoder.transform(video_y)

    np.save("label_classes.npy", label_encoder.classes_)

    if not os.path.exists("label_classes.npy"):
        # Save label classes
        np.save("label_classes.npy", label_encoder.classes_)
    else:
        print("label_classes.npy exists, skipping creation.")

    img_x_train, img_x_val, img_y_train, img_y_val = train_test_split(
        image_x, image_y_encoded, test_size=0.2, stratify=image_y_encoded, random_state=seed
    )
    vid_x_train, vid_x_val, vid_y_train, vid_y_val = train_test_split(
        video_x, video_y_encoded, test_size=0.2, stratify=video_y_encoded, random_state=seed
    )

    if not os.path.exists("landmark_model.pt"):
        image_train_dataset = TensorDataset(torch.tensor(img_x_train, dtype=torch.float32),
                                            torch.tensor(img_y_train, dtype=torch.long))
        image_val_dataset = TensorDataset(torch.tensor(img_x_val, dtype=torch.float32),
                                          torch.tensor(img_y_val, dtype=torch.long))

        video_train_dataset = list(zip(vid_x_train, vid_y_train))
        video_val_dataset = list(zip(vid_x_val, vid_y_val))

        # Dataloaders
        image_train_loader = DataLoader(image_train_dataset, batch_size=64, shuffle=True)
        image_val_loader = DataLoader(image_val_dataset, batch_size=64, shuffle=False)

        video_train_loader = DataLoader(video_train_dataset, batch_size=16, shuffle=True,
                                        collate_fn=collate_video_batch)
        video_val_loader = DataLoader(video_val_dataset, batch_size=16, shuffle=False, collate_fn=collate_video_batch)

        # Initialize models and combined model
        image_model = ASLClassifier(num_classes=len(label_encoder.classes_))
        sequence_model = ASLSequenceClassifier(num_classes=len(label_encoder.classes_))
        model = ASLCombinedModel(image_model, sequence_model).to(device)

        criterion = nn.CrossEntropyLoss()
        optimizer = optim.Adam(model.parameters(), lr=0.001, weight_decay=1e-5)
        scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, 'max', patience=3, factor=0.5)

        num_epochs = 100
        best_val_acc = 0.0
        patience = 5
        epochs_no_improvement = 0

        for epoch in range(num_epochs):
            model.train()

            running_loss = 0.0
            num_batches = 0

            for loader in [image_train_loader, video_train_loader]:
                for x_batch, y_batch in loader:
                    optimizer.zero_grad()
                    x_batch, y_batch = x_batch.to(device), y_batch.to(device)
                    preds = model(x_batch)
                    loss = criterion(preds, y_batch)
                    loss.backward()
                    optimizer.step()
                    running_loss += loss.item()
                    num_batches += 1

            avg_loss = running_loss / num_batches
            print(f"[Epoch {epoch+1}] Training Loss: {avg_loss:.4f}")

            # Validate data
            model.eval()
            all_preds = []
            all_labels = []

            with torch.no_grad():
                # Validate images
                for x_img, y_img in image_val_loader:
                    x_img = x_img.to(device)
                    preds = model(x_img)
                    all_preds.extend(preds.argmax(dim=1).cpu().numpy())
                    all_labels.extend(y_img.numpy())

                # Validate videos
                for x_vid, y_vid in video_val_loader:
                    x_vid = x_vid.to(device)
                    preds = model(x_vid)
                    all_preds.extend(preds.argmax(dim=1).cpu().numpy())
                    all_labels.extend(y_vid.numpy())

            val_acc = accuracy_score(all_labels, all_preds)
            print(f"[Epoch {epoch + 1}] Validation Accuracy: {val_acc:.4f}")

            scheduler.step(val_acc)

            if val_acc > best_val_acc:
                best_val_acc = val_acc
                epochs_no_improvement = 0
                torch.save(model.state_dict(), "best_model.pt")
            else:
                epochs_no_improvement += 1

            if epochs_no_improvement >= patience:
                print(f"Early stopping triggered after {epoch + 1} epochs.")
                break

        # Save final model as TorchScript
        model.load_state_dict(torch.load("best_model.pt"))
        model.eval()

        traced_model = torch.jit.script(model)
        traced_model.save("landmark_model.pt")
        print("Model training complete. Saved as 'landmark_model.pt'")


if __name__ == "__main__":
    main()
