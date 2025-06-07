"""
Create landmark data for all files in asl_alphabet_train folder and create
label classes for each folder.
"""
import os
import csv
import cv2
import numpy as np
from tqdm import tqdm
import mediapipe as mp

# Dataset to train off of
DATASET_DIR = "asl_alphabet_train"

# Location of landmarks file and label_classes files.
# These need to be alongside the fastapi backend.
OUTPUT_CSV = "asl_landmarks.csv"
LABEL_CLASSES_FILE = "label_classes.npy"

# MediaPipe setup
mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=True, max_num_hands=1)


def extract_landmarks(image_path):
    """
    Extract landmarks from an image and save them as numpy arrays.
    """
    image = cv2.imread(image_path)
    if image is None:
        return None
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = hands.process(image_rgb)

    if results.multi_hand_landmarks:
        hand = results.multi_hand_landmarks[0]
        landmarks = []
        for lm in hand.landmark:
            landmarks.extend([lm.x, lm.y, lm.z])
        return landmarks
    return None


def compile_landmarks():
    """
    Iterate through asl_alphabet_train folder, extract label data and images and
    compile landmark data into numpy arrays.
    """
    if os.path.exists(OUTPUT_CSV) & os.path.exists(LABEL_CLASSES_FILE):
        print("Dataset already exists. Skipping compilation.")
        return

    gesture_classes = []
    data_rows = []

    print("Processing dataset...")

    # Create a label based on folder name in asl_alphabet_train
    for label in sorted(os.listdir(DATASET_DIR)):
        class_path = os.path.join(DATASET_DIR, label)
        if not os.path.isdir(class_path):
            continue

        gesture_classes.append(label)

        # For all pictures in each alphabet folder, extract landmark data and append to the dataset.
        for filename in tqdm(os.listdir(class_path), desc=f"Class {label}"):
            img_path = os.path.join(class_path, filename)
            landmarks = extract_landmarks(img_path)
            if landmarks:
                row = landmarks + [label]
                data_rows.append(row)

    # Save to CSV
    with open(OUTPUT_CSV, "w", newline="") as f:
        writer = csv.writer(f)
        for row in data_rows:
            writer.writerow(row)

    # Save gesture classes and save to numpy array.
    gesture_classes = sorted(list(set(gesture_classes)))
    np.save(LABEL_CLASSES_FILE, np.array(gesture_classes))

    print(f"Finished! Saved {len(data_rows)} samples.")
    print(f"→ Landmark CSV: {OUTPUT_CSV}")
    print(f"→ Class labels: {LABEL_CLASSES_FILE}")
