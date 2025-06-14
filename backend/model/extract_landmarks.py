"""
Create landmark data for all files in asl_alphabet_train folder and create
label classes for each folder.
"""
import gc
import os
import csv
import sys
import threading
import time
import multiprocessing
from multiprocessing.spawn import freeze_support

import cv2
import numpy as np
from tqdm import tqdm
import mediapipe as mp
from multiprocessing import Pool, cpu_count

# Dataset to train off of
DATASET_DIR = "asl_alphabet_train"

# Location of landmarks file and label_classes files.
# These need to be alongside the fastapi backend.
OUTPUT_CSV = "asl_landmarks.csv"
LABEL_CLASSES_FILE = "label_classes.npy"

# MediaPipe setup
mp_hands = mp.solutions.hands


def periodic_gc():
    """
    Run a periodic garbage collection every 10 seconds.
    """
    while True:
        time.sleep(10)
        gc.collect()


def supress_stderr():
    """
    Set output channel to /dev/null to prevent console spawn for subprocesses.
    """
    sys.stderr.flush()
    devnull = os.open(os.devnull, os.O_WRONLY)
    os.dup2(devnull, sys.stderr.fileno())
    os.close(devnull)


def extract_landmarks(args):
    """
    Extract landmarks from an image and save them as numpy arrays.
    """
    try:
        # Expand args into trupled variables.
        image_path, label, flip = args
        # Disable output messages to prevent console spam.
        supress_stderr()

        #
        with mp_hands.Hands(static_image_mode=True, max_num_hands=1) as hands:
            image = cv2.imread(image_path)
            if image is None:
                return None

            # Check if this image should be flipped
            if flip:
                image = cv2.flip(image, 1)

            # Convert to rgb image and process using hands.
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            results = hands.process(image_rgb)

            # If there are results, get the first result and map it to landmark variable.
            if results.multi_hand_landmarks:
                hand = results.multi_hand_landmarks[0]
                landmarks = [coord for lm in hand.landmark for coord in (lm.x, lm.y, lm.z)]

                return landmarks + [label]
    except Exception as e:
        print(f"[ERROR] Failed on {args[0]}: {e}")
    return None


def warm_up_mediapipe():
    """
    Dummy run to make sure all models are loaded and cached
    """
    with mp_hands.Hands(static_image_mode=True, max_num_hands=1) as hands:
        dummy = np.zeros((256, 256, 3), dtype=np.uint8)
        _ = hands.process(dummy)


def compile_landmarks():
    """
    Iterate through asl_alphabet_train folder, extract label data and images and
    compile landmark data into numpy arrays.
    """
    if os.path.exists(OUTPUT_CSV) & os.path.exists(LABEL_CLASSES_FILE):
        print("Dataset already exists. Skipping compilation.")
        return

    gesture_classes = []
    job_list = []

    print("Preparing image list...")

    # Create a label based on folder name in asl_alphabet_train
    for label in sorted(os.listdir(DATASET_DIR)):
        class_path = os.path.join(DATASET_DIR, label)
        if not os.path.isdir(class_path):
            continue

        gesture_classes.append(label)

        # For all pictures in each alphabet folder, extract landmark data and append to the dataset.
        for filename in os.listdir(class_path):
            img_path = os.path.join(class_path, filename)

            # Append right hand jobs
            job_list.append((img_path, label, False))

            # Append left hand jobs excluding J and Z (these are not reversible)
            if label not in ['J', 'Z']:
                job_list.append((img_path, label, True))

    time.sleep(3)
    print(f"Total image jobs: {len(job_list)}")
    print(f"Running landmark extraction in parallel using {cpu_count() // 2} CPUs.")
    time.sleep(3)

    # Make sure everything from mediapipe is available before starting pool.
    warm_up_mediapipe()

    # Create processes for all the jobs with a process limit of half of total cores.
    with Pool(processes=cpu_count() // 2) as pool:
        results = list(tqdm(pool.imap(extract_landmarks, job_list), total=len(job_list)))

    # Loop through all data and discard any that is None.
    data_rows = [row for row in results if row is not None]

    print(f"Saving {len(data_rows)} samples to {OUTPUT_CSV}...")

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


def safe_compile_landmarks():
    """
    Determine if this file is the main application and provide freeze_support.
    If not, spawn a new process and attach.
    """
    # Create thread that performs garbage collection every 10 seconds.
    threading.Thread(target=periodic_gc, daemon=True).start()

    # Check if start method is set and if not, set it to spawn.
    try:
        if multiprocessing.get_start_method(allow_none=True) is None:
            multiprocessing.set_start_method("spawn", force=True)
    except RuntimeError:
        pass

    # Determine if this is the main thread. If it is, enable freeze_support and start compiling.
    # If it is being called from an outside process, spawn a new process of its own.
    if __name__ == "__main__":
        freeze_support()
        compile_landmarks()
    else:
        process = multiprocessing.Process(target=compile_landmarks)
        process.start()
        process.join()
