# backend/model/train.py

import os
import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models
from model.download_data import download_kaggle_data

DATA_DIR = os.path.join(os.path.dirname(__file__), "dataset")
TRAIN_FILE = os.path.join(DATA_DIR, "sign_mnist_train.csv")
TEST_FILE = os.path.join(DATA_DIR, "sign_mnist_test.csv")
MODEL_FILE = os.path.join(os.path.dirname(__file__), "asl_model.h5")

def load_data(file_path):
    df = pd.read_csv(file_path)
    labels = df['label'].values
    images = df.drop('label', axis=1).values.reshape(-1, 28, 28, 1)
    images = images.astype('float32') / 255.0
    return images, labels

def build_model():
    model = models.Sequential([
        layers.Conv2D(32, (3, 3), activation='relu', input_shape=(28, 28, 1)),
        layers.MaxPooling2D(2, 2),
        layers.Conv2D(64, (3, 3), activation='relu'),
        layers.MaxPooling2D(2, 2),
        layers.Flatten(),
        layers.Dense(128, activation='relu'),
        layers.Dense(25, activation='softmax')  # 25 classes: A-Y excluding J
    ])
    model.compile(optimizer='adam',
                  loss='sparse_categorical_crossentropy',
                  metrics=['accuracy'])
    return model

def train_model():
    if not (os.path.exists(TRAIN_FILE) and os.path.exists(TEST_FILE)):
        print("Dataset not found locally.")
        download_kaggle_data()
    else:
        print("Dataset already exists. Skipping download")
    print("Loading data...")
    X_train, y_train = load_data(TRAIN_FILE)
    X_test, y_test = load_data(TEST_FILE)

    print("Building model...")
    model = build_model()

    print("Training model...")
    model.fit(X_train, y_train, epochs=5, validation_data=(X_test, y_test))

    print(f"Saving model to {MODEL_FILE}")
    model.save(MODEL_FILE)
    print("Training complete.")

if __name__ == "__main__":
    train_model()
