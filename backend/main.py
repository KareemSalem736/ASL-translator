"""
Main file for running FastAPI backend. Declares standard
predict endpoint and basic settings for backend.
"""
import os
import time
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tensorflow as tf
import numpy as np
import config
import uvicorn

app = FastAPI()

config.initialize_config()

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.get_config().get('CORS', 'allow_origins'),
    allow_credentials=config.get_config().get('CORS', 'allow_credentials'),
    allow_methods=config.get_config().get('CORS', 'allow_methods'),
    allow_headers=config.get_config().get('CORS', 'allow_headers'),
)

model = tf.keras.models.load_model("model" + os.path.sep + "landmark_model.keras")
label_classes = np.load("model" + os.path.sep + "label_classes.npy", allow_pickle=True)


class LandmarkInput(BaseModel):
    """
    Class for storing landmark input data.
    """
    landmarks: list[float]


def current_time_milli():
    """
    Get current time in milliseconds
    """
    return round(time.time() * 1000)


@app.post(f"{config.get_config().get('HOST', 'path')}/predict")
def predict(input_data: LandmarkInput):
    """
    FastAPI route for receiving and predicting landmark data from the frontend.
    """
    # Get start time of operation.
    start_time = current_time_milli()

    # Take landmark data and apply it to the prediction model
    landmarks = np.array(input_data.landmarks).reshape(1, -1)
    prediction = model.predict(landmarks)[0]
    top_class = label_classes[np.argmax(prediction)]
    confidence = float(np.max(prediction))

    # This will be an average accuracy of the model over all predictions.
    accuracy = 0.100

    end_time = current_time_milli() - start_time
    return {"prediction": top_class, "confidence": confidence,
            "accuracy": accuracy, "probabilities": {}, "inferenceTimeMs": end_time }


if __name__ == "__main__":
    uvicorn.run(app, host='0.0.0.0', port=int(config.get_config().get('HOST', 'port')))
