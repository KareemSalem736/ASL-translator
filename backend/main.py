from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import tensorflow as tf
import numpy as np
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,  # Caution: Use specific origins in production
    allow_methods=["*"],
    allow_headers=["*"],
)

model = tf.keras.models.load_model("model" + os.path.sep + "landmark_model.keras")
label_classes = np.load("model" + os.path.sep + "label_classes.npy", allow_pickle=True)


class LandmarkInput(BaseModel):
    landmarks: list[float]


@app.post("/predict")
def predict(input_data: LandmarkInput):
    landmarks = np.array(input_data.landmarks).reshape(1, -1)
    prediction = model.predict(landmarks)[0]
    top_class = label_classes[np.argmax(prediction)]
    confidence = float(np.max(prediction))
    return {"prediction": top_class, "confidence": confidence}
