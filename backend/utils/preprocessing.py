import numpy as np


def normalize_landmarks(landmark_row):
    """
    Normalize individual row of landmark data.
    """
    landmarks = landmark_row.reshape(-1, 3)
    origin = landmarks[0]
    landmarks -= origin

    max_dist = np.max(np.abs(landmarks))
    if max_dist > 0:
        landmarks /= max_dist

    return landmarks.flatten()
