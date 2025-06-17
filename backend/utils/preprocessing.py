import numpy as np


def normalize_landmarks(landmark_row):
    """
    Normalize individual row of landmark data.
    """
    landmarks = np.array(landmark_row).reshape(-1, 3)
    origin = landmarks[0]
    landmarks -= origin

    max_dist = np.max(np.abs(landmarks))
    if max_dist > 0:
        landmarks /= max_dist

    return landmarks.flatten()


def normalize_landmark_sequence(frames: list[list[float]]) -> np.ndarray:
    landmarks = np.array(frames).reshape(-1, 21, 3)

    origin = landmarks[0, 0]  # Use wrist from first frame
    landmarks -= origin

    max_dist = np.max(np.abs(landmarks))
    if max_dist > 0:
        landmarks /= max_dist

    return landmarks.reshape(len(frames), -1)  # Return shape: (sequence_len, 63)