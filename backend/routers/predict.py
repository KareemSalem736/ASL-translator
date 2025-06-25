"""
Predict route
"""
import os
import time
from typing import Optional

import torch
import numpy as np

from pydantic import BaseModel
from fastapi import APIRouter, Depends

from backend.database.user_queries import database_increment_predict_count
from backend.utils.auth.auth_tokens import get_current_token, is_valid_token, get_user_from_token
from backend.utils.preprocessing import normalize_landmarks

router = APIRouter()

device = torch.device("cpu")

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


class PredictionResult(BaseModel):
    """
    Class for storing a prediction result.
    """
    prediction: str
    confidence: float
    accuracy: float
    probabilities: list[str] | None = None
    inferenceTimeMs: int


def current_time_milli():
    """
    Get current time in milliseconds
    """
    return round(time.time() * 1000)


@router.post("/predict")
async def predict(input_data: LandmarkInput,
                  token: Optional[str] = Depends(get_current_token)):
    """
    FastAPI route for receiving and predicting landmark data from the frontend.
    """
    # Get start time of operation.
    start_time = current_time_milli()

    # This will be an average accuracy of the model over all predictions.
    accuracy = 0.100

    input_np = np.array(input_data.landmarks)
    normalized_landmarks = normalize_landmarks(input_np)
    landmarks = np.array(normalized_landmarks).reshape(1, -1)
    x_tensor = torch.tensor(landmarks, dtype=torch.float32).to(device)

    with torch.no_grad():
        output = model(x_tensor)
        prediction = torch.softmax(output, dim=1).cpu().numpy()[0]

    top_class = label_classes[np.argmax(prediction)]
    confidence = float(np.max(prediction))

    # Check if the confidence is over 80% and if the user is logged in, increment the predict count.
    if confidence >= 0.80:
        if token:
            user = get_user_from_token(token, "access")
            if user:
                database_increment_predict_count(user.email)

    end_time = current_time_milli() - start_time
    return PredictionResult(prediction=top_class, confidence=confidence,
                            accuracy=accuracy, probabilities=[], inferenceTimeMs=end_time)
