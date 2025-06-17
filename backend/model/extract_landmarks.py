"""
Create landmark data for all files in asl_alphabet_train folder and create
label classes for each folder.
"""
import gc
import os
import sys
import threading
import time
import mimetypes
import multiprocessing
from multiprocessing.spawn import freeze_support
from multiprocessing import Pool, cpu_count

import cv2
import numpy as np
import mediapipe as mp
from tqdm import tqdm

from backend.utils.preprocessing import normalize_landmarks, normalize_landmark_sequence

# Dataset to train off of
DATASET_DIR = "asl_alphabet_train"

# Location of landmarks file and label_classes files.
# These need to be alongside the fastapi backend.
OUTPUT_IMAGE_LANDMARKS = "asl_image_landmarks.npy"
OUTPUT_VIDEO_LANDMARKS = "asl_video_landmarks.npy"
OUTPUT_LABELS = "asl_labels.npy"

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


def process_job(job):
    """
    Process job file types and return correct function.
    """
    file_type, args = job
    if file_type == "image":
        result = extract_landmarks(args)
        return ("image", result) if result is not None else None
    elif file_type == "video":
        result = extract_landmarks_video(args)
        return ("video", *result) if result is not None else None
    return None


def is_landmark_frame_valid(landmarks, min_distance_threshold=0.05, max_distance_threshold=1.0):
    """
    Check if the landmark frame is valid based on wrist-to-fingertip distance.
    Prevents including very noisy or partial detections.
    """
    landmarks = np.array(landmarks).reshape(-1, 3)
    wrist = landmarks[0]
    index_tip = landmarks[8]
    distance = np.linalg.norm(index_tip - wrist)

    return min_distance_threshold < distance < max_distance_threshold


def extract_landmarks_video(args, max_frames=30, frame_skip=2):
    """
    Extract landmarks from video files and save them as a numpy array.
    """
    video_path, label = args
    try:
        supress_stderr()
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            print(f"[ERROR] Cannot open video {video_path}")
            return None

        landmarks_sequence = []
        frame_count = 0
        with mp_hands.Hands(static_image_mode=False, max_num_hands=1) as hands:
            while True:
                ret, frame = cap.read()
                if not ret:
                    break

                # Skip frames for efficiency
                if frame_count % frame_skip != 0:
                    frame_count += 1
                    continue

                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                equalized = cv2.equalizeHist(gray)
                image = cv2.cvtColor(equalized, cv2.COLOR_GRAY2RGB)

                results = hands.process(image)

                if results.multi_hand_landmarks:
                    hand = results.multi_hand_landmarks[0]
                    landmarks = [coord for lm in hand.landmark for coord in (lm.x, lm.y, lm.z)]

                    if not is_landmark_frame_valid(landmarks):
                        frame_count += 1
                        continue
                    landmarks_sequence.append(landmarks)
                else:
                    # Skip frame as no hand is detected.
                    frame_count += 1
                    continue

                frame_count += 1
                if len(landmarks_sequence) >= max_frames:
                    break

        cap.release()

        if len(landmarks_sequence) == 0:
            return None

        landmarks_sequence = normalize_landmark_sequence(landmarks_sequence)

        return landmarks_sequence, label

    except Exception as e:
        print(f"[ERROR] Failed on video {video_path}: {e}")
        return None


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
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            equalized = cv2.equalizeHist(gray)
            image = cv2.cvtColor(equalized, cv2.COLOR_GRAY2RGB)

            results = hands.process(image)

            # If there are results, get the first result and map it to landmark variable.
            if results.multi_hand_landmarks:
                hand = results.multi_hand_landmarks[0]
                landmarks = [coord for lm in hand.landmark for coord in (lm.x, lm.y, lm.z)]

                if not is_landmark_frame_valid(landmarks):
                    return None

                landmarks = normalize_landmarks(landmarks)

                return landmarks, label
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
    if (os.path.exists(OUTPUT_IMAGE_LANDMARKS) & os.path.exists(OUTPUT_VIDEO_LANDMARKS)
            & os.path.exists(OUTPUT_LABELS)):
        print("Dataset already exists. Skipping compilation.")
        return

    gesture_classes = []
    job_list = []

    print("Preparing job list...")

    # Create a label based on folder name in asl_alphabet_train
    for label in sorted(os.listdir(DATASET_DIR)):
        class_path = os.path.join(DATASET_DIR, label)
        if not os.path.isdir(class_path):
            continue

        gesture_classes.append(label)

        # For all pictures in each alphabet folder, extract landmark data and append to the dataset.
        for filename in os.listdir(class_path):
            file_path = os.path.join(class_path, filename)

            mime_type, _ = mimetypes.guess_type(file_path)
            if mime_type is None:
                continue

            if mime_type.startswith('image'):
                # Append right hand jobs
                job_list.append(("image", (file_path, label, False)))

                # Append left hand jobs excluding J and Z (these are not reversible)
                if label not in ['J', 'Z']:
                    job_list.append(("image", (file_path, label, True)))

            elif mime_type.startswith('video'):
                # Add video to processing jobs.
                job_list.append(("video", (file_path, label)))

    print(f"Total jobs: {len(job_list)}")
    print(f"Running landmark extraction in parallel using {cpu_count() // 2} CPUs.")

    # Make sure everything from mediapipe is available before starting pool.
    warm_up_mediapipe()

    # Create processes for all the jobs with a process limit of half of total cores.
    with Pool(processes=cpu_count() // 2) as pool:
        results = list(tqdm(pool.imap(process_job, job_list), total=len(job_list)))

    image_rows = []
    video_sequences = []
    video_labels = []
    image_labels = []

    for result in results:
        if result is None:
            continue
        result_type = result[0]
        if result_type == "image":
            landmarks, label = result[1]
            image_rows.append((landmarks, label))
        elif result_type == "video":
            video_sequences.append(result[1])
            video_labels.append(result[2])

    if image_rows:
        image_landmarks = [row[0] for row in image_rows]
        image_labels = [row[1] for row in image_rows]
        np.save(OUTPUT_IMAGE_LANDMARKS, np.array(image_landmarks))
        print(f"Saved {len(image_landmarks)} image samples → {OUTPUT_IMAGE_LANDMARKS}")

    if video_sequences:
        np.save(OUTPUT_VIDEO_LANDMARKS, np.array(video_sequences, dtype=object))
        print(f"Saved {len(video_sequences)} video sequences → {OUTPUT_VIDEO_LANDMARKS}")

    combined_labels = image_labels + video_labels
    if combined_labels:
        np.save(OUTPUT_LABELS, np.array(combined_labels))
        print(f"Saved class labels → {OUTPUT_LABELS}")


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
