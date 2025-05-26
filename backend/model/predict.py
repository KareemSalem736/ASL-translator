# backend/model/predict.py

import os
import numpy as np
import pandas as pd
import tensorflow as tf

MODEL_PATH = os.path.join(os.path.dirname(__file__), "asl_model.h5")
TEST_FILE = os.path.join(os.path.dirname(__file__), "dataset", "sign_mnist_test.csv")

# Load model
model = tf.keras.models.load_model(MODEL_PATH)

# Load test data
df = pd.read_csv(TEST_FILE)
labels = df['label'].values
images = df.drop('label', axis=1).values.reshape(-1, 28, 28, 1).astype('float32') / 255.0

# Predict first 5 images
predictions = model.predict(images[:5])

for i, probs in enumerate(predictions):
    predicted_label = np.argmax(probs)
    actual_label = labels[i]
    print(f"Image {i+1}: Predicted = {predicted_label}, Actual = {actual_label}")
