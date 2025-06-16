"""
Main file for running FastAPI backend. Declares standard
predict endpoint and basic settings for backend.
"""
import os
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch

from backend.utils.preprocessing import normalize_landmarks
import numpy as np
import backend.config as config
import uvicorn

app = FastAPI()

device = torch.device("cpu")

config.initialize_config()

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.get_config().get('CORS', 'allow_origins'),
    allow_credentials=config.get_config().get('CORS', 'allow_credentials'),
    allow_methods=config.get_config().get('CORS', 'allow_methods'),
    allow_headers=config.get_config().get('CORS', 'allow_headers'),
)

model = torch.jit.load("model" + os.path.sep + "landmark_model.pt")
model = torch.compile(model)
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


def detect_j_or_z(sequence: list[list[float]]) -> str | None:
    """
    Attempt to detect 'J' or 'Z' from sequence of frames.
    """
    landmarks_seq = [np.array(f).reshape(-1, 3) for f in sequence]

    # Get tip of pinky (landmark 20) for J or index finger (landmark 8) for Z
    j_tip_path = [frame[20][:2] for frame in landmarks_seq]  # x, y path
    z_tip_path = [frame[8][:2] for frame in landmarks_seq]

    def direction_changes(path):
        """Rough zig-zag pattern detector."""
        deltas = np.diff(np.array(path), axis=0)
        signs = np.sign(deltas)
        return np.sum(np.abs(np.diff(signs, axis=0)), axis=0)

    z_changes = direction_changes(z_tip_path)
    j_changes = direction_changes(j_tip_path)

    if z_changes[0] >= 2 and z_changes[1] >= 1:
        return "Z"
    elif j_changes[0] >= 1 and j_changes[1] >= 2:
        return "J"
    return None


@app.post(f"{config.get_config().get('HOST', 'path')}/predict")
def predict(input_data: LandmarkInput):
    """
    FastAPI route for receiving and predicting landmark data from the frontend.
    """
    # Get start time of operation.
    start_time = current_time_milli()

    # This will be an average accuracy of the model over all predictions.
    accuracy = 0.100

    """
    Work in progress. Frontend needs to be modified.
    # Check for motion letters (J and Z)
    determine_motion = detect_j_or_z(input_data.landmarks)
    if determine_motion:
        end_time = current_time_milli() - start_time
        return {"prediction": determine_motion, "confidence": 1.0,
                "accuracy": accuracy, "probabilities": {}, "inferenceTimeMs": end_time}
    """

    input_np = np.array(input_data.landmarks)
    normalized_landmarks = normalize_landmarks(input_np)
    landmarks = np.array(normalized_landmarks).reshape(1, -1)
    x_tensor = torch.tensor(landmarks, dtype=torch.float32).to(device)

    with torch.no_grad():
        output = model(x_tensor)
        prediction = torch.softmax(output, dim=1).cpu().numpy()[0]

    top_class = label_classes[np.argmax(prediction)]
    confidence = float(np.max(prediction))

    end_time = current_time_milli() - start_time
    return {"prediction": top_class, "confidence": confidence,
            "accuracy": accuracy, "probabilities": {}, "inferenceTimeMs": end_time}


if __name__ == "__main__":
    uvicorn.run(app, host='0.0.0.0', port=int(config.get_config().get('HOST', 'port')))
