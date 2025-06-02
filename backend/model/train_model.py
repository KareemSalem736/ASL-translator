import pandas as pd
import numpy as np
import tensorflow as tf
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder

import extract_landmarks

# Extract landmark data from images.
extract_landmarks.compile_landmarks()

# Load asl_landmarks file to train our model on this data.
df = pd.read_csv("asl_landmarks.csv", header=None)
X = df.iloc[:, :-1].values  # 63 landmark features
y = df.iloc[:, -1].values   # labels

# Create labels for each dataset (i.e. A, B, C, ...)
le = LabelEncoder()
y_encoded = le.fit_transform(y)
y_categorical = tf.keras.utils.to_categorical(y_encoded)

if not os.path.exists("label_classes.npy"):
    # Save label classes
    np.save("label_classes.npy", le.classes_)
else:
    print("label_classes.npy exists, skipping creation.")

if not os.path.exists("landmark_model.keras"):
    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_categorical, test_size=0.2, random_state=42)

    # Define model
    model = tf.keras.Sequential([
        tf.keras.layers.Input(shape=(63,)),
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.Dropout(0.3),
        tf.keras.layers.Dense(64, activation='relu'),
        tf.keras.layers.Dense(y_categorical.shape[1], activation='softmax')
    ])

    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

    # Train
    model.fit(X_train, y_train, validation_data=(X_test, y_test), epochs=15, batch_size=32)

    # Save
    model.save("landmark_model.keras")
    print("✅ Model trained and saved.")
else:
    print("landmark_model.keras exists, skipping creation.")
