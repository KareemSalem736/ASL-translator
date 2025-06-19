"""
Predict route
"""
import os
import time

import torch
import numpy as np

from pydantic import BaseModel
from fastapi import APIRouter
from scipy.ndimage import uniform_filter1d

from backend.utils.preprocessing import normalize_landmarks
from collections import Counter

router = APIRouter()

device = torch.device("cpu")

model = torch.jit.load("model" + os.path.sep + "landmark_model.pt")
model = torch.compile(model)
model.to(device)
model.eval()
label_classes = np.load("model" + os.path.sep + "label_classes.npy", allow_pickle=True)


class LandmarkInput(BaseModel):
    """
    Class for storing landmark input data.
    """
    landmarks: list[float]


class LandmarkSequenceInput(BaseModel):
    """
    Class for storing a buffer of landmark input data.
    """
    landmarks: list[list[float]]


def current_time_milli():
    """
    Get current time in milliseconds
    """
    return round(time.time() * 1000)


def normalize_landmarks_batch(landmarks_seq):
    """
    Normalize landmarks batch
    """
    return [normalize_landmarks(np.array(frame)) for frame in landmarks_seq]


def direction_changes(path: list[np.ndarray] | np.ndarray) -> np.ndarray:
    """
    Calculates how many times the direction of motion changes in the x and y directions
    using a smoothed path to reduce jitter-based false detections.
    """
    path_np = np.array(path)
    print("Raw path:", path_np.shape, path_np[:5])  # DEBUG

    # Smooth path to reduce jitter (adjust window size as needed)
    smoothed_path = uniform_filter1d(path_np, size=3, axis=0, mode='nearest')

    # Compute deltas between consecutive frames
    deltas = np.diff(smoothed_path, axis=0)

    # Get directional signs, ignore tiny movements
    threshold = 0.02  # ignore subpixel jitters
    signs = np.where(np.abs(deltas) < threshold, 0, np.sign(deltas))

    # Count how often the sign changes (ignoring 0 → flip to nonzero and vice versa)
    sign_changes = np.diff(signs, axis=0)
    change_counts = np.sum(sign_changes != 0, axis=0)

    return change_counts  # [x_changes, y_changes]


def is_j_motion(sequence: list[list[float]]) -> dict | None:
    landmarks_seq = [np.array(f).reshape(-1, 3) for f in sequence]
    j_tip_path = [frame[20][:2] for frame in landmarks_seq]  # Pinky tip
    j_changes = direction_changes(j_tip_path)

    # Example thresholds (adjust as needed)
    threshold_x = 10
    threshold_y = 10

    detected = (j_changes[0] >= threshold_x and j_changes[1] >= threshold_y)
    return {
        "detected": detected,
        "changes": j_changes
    }


def is_z_motion(sequence: list[list[float]]) -> dict | None:
    landmarks_seq = [np.array(f).reshape(-1, 3) for f in sequence]
    z_tip_path = [frame[8][:2] for frame in landmarks_seq]  # Index finger tip
    z_changes = direction_changes(z_tip_path)

    # Increased thresholds to reduce false positives
    threshold_x = 15
    threshold_y = 10

    detected = (z_changes[0] >= threshold_x and z_changes[1] >= threshold_y)
    return {
        "detected": detected,
        "changes": z_changes
    }


def detect_j_z_motion(path: np.ndarray, wrist_pos=None, finger_tip_pos=None) -> tuple[bool, bool]:
    if path is None or len(path) < 5:
        return False, False

    path = np.array(path)

    if wrist_pos is not None and finger_tip_pos is not None:
        scale = np.linalg.norm(finger_tip_pos - wrist_pos)
        if scale > 0:
            path = path / scale

    deltas = np.diff(path, axis=0)
    velocity = np.gradient(path, axis=0)
    speed = np.linalg.norm(velocity, axis=1)
    total_motion = np.sum(np.linalg.norm(deltas, axis=1))

    adaptive_thresh = 0.1 * len(path)
    j_like = total_motion > adaptive_thresh

    j_detected = False
    start = path[0]
    end = path[-1]
    delta_y = end[1] - start[1]
    delta_x = end[0] - start[0]
    if j_like and delta_y > 0.1 and delta_x > 0.05:
        j_detected = True

    x = path[:, 0]
    x_deltas = np.diff(x)
    sign_changes = np.diff(np.sign(x_deltas))
    direction_flips = np.count_nonzero(sign_changes)
    z_detected = direction_flips >= 2 and total_motion > adaptive_thresh

    return j_detected, z_detected


@router.post("/predict")
def predict(input_data: LandmarkSequenceInput):
    """
    FastAPI route for receiving and predicting landmark batch data from the frontend.
    """
    # Get start time of operation.
    start_time = current_time_milli()

    # This will be an average accuracy of the model over all predictions.
    accuracy = 0.100
    landmarks = input_data.landmarks

    if not landmarks:
        return {"error": "No landmarks provided."}

    landmarks_seq = [np.array(f).reshape(-1, 3) for f in landmarks]
    j_path = [frame[20][:2] for frame in landmarks_seq]
    z_path = [frame[8][:2] for frame in landmarks_seq]

    wrist_pos = landmarks_seq[0][0][:2]  # WRIST
    j_tip_pos = landmarks_seq[0][20][:2]  # Pinky tip
    z_tip_pos = landmarks_seq[0][8][:2]  # Index tip

    j_detected, z_detected = detect_j_z_motion(np.array(j_path), wrist_pos, j_tip_pos)
    _, z_alt_detected = detect_j_z_motion(np.array(z_path), wrist_pos, z_tip_pos)

    motion_detected = None
    if j_detected and not z_alt_detected:
        motion_detected = "J"
    elif z_detected:
        motion_detected = "Z"

    # Normalize all frames in batch
    normalized_seq = normalize_landmarks_batch(landmarks)
    landmarks_np = np.array(normalized_seq, dtype=np.float32)  # (T, 63)

    final_pred = None
    confidence = 0.0
    used_sequence_model = False

    with torch.no_grad():
        if motion_detected:
            # Try the sequence model path
            sequence_tensor = torch.tensor(landmarks_np, dtype=torch.float32).unsqueeze(0).to(device)  # (1, T, 63)
            seq_output = model(sequence_tensor)
            seq_probs = torch.softmax(seq_output, dim=1).cpu().numpy()[0]
            seq_pred_idx = np.argmax(seq_probs)
            seq_confidence = seq_probs[seq_pred_idx]
            predicted_seq_char = label_classes[seq_pred_idx]

            print(f"[Sequence Model] Predicted {predicted_seq_char} with confidence {seq_confidence:.2f}")

            # If high enough confidence, accept sequence prediction
            if seq_confidence >= 0.8:
                final_pred = predicted_seq_char
                confidence = float(seq_confidence)
                used_sequence_model = True

        if not used_sequence_model:
            frame_preds = []
            frame_probs = []

            for frame in landmarks_np:
                frame_tensor = torch.tensor(frame, dtype=torch.float32).unsqueeze(0).to(device)  # (1,63)
                output = model(frame_tensor)  # (1,num_classes)
                probs = torch.softmax(output, dim=1).cpu().numpy()[0]
                pred_idx = np.argmax(probs)
                frame_preds.append(pred_idx)
                frame_probs.append(probs)

            vote_counts = Counter(frame_preds)
            majority_idx, majority_count = vote_counts.most_common(1)[0]
            majority_prob = np.mean(
                [frame_probs[i][majority_idx] for i, p in enumerate(frame_preds) if p == majority_idx])
            final_pred = label_classes[majority_idx]
            confidence = float(majority_prob)
            print(f"[Frame Voting] Predicted {final_pred} with confidence {confidence:.2f}")

        # Handle motion conflict for logging/debug
        if motion_detected and final_pred != motion_detected:
            print(f"[Warning] Motion detected {motion_detected} but model predicted {final_pred}")

        # Boost confidence if both agree
        if motion_detected == final_pred:
            confidence = max(confidence, 0.95)

        end_time = current_time_milli() - start_time

    return {
        "prediction": final_pred,
        "confidence": confidence,
        "accuracy": accuracy,
        "probabilities": {},
        "inferenceTimeMs": end_time}
