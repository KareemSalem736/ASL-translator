
"""
Unit tests for FastAPI routes defined in main.py.
Mocks TensorFlow model prediction and label classes.
"""
import sys
import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch
from unittest.mock import MagicMock
sys.modules["tensorflow"] = MagicMock()
from backend.main import app


@pytest.mark.asyncio
@patch("backend.main.model")
@patch("backend.main.label_classes", ["A", "B", "C"])
async def test_predict_success(mock_model):
    """
    Sends a valid landmark list and verifies the response structure and values.
    """

    # Mock model prediction output
    mock_model.predict.return_value = [[0.1, 0.8, 0.1]]  # Class 'B'

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/predict", json={"landmarks": [0.0] * 63})

    assert response.status_code == 200
    json_data = response.json()
    assert json_data["prediction"] == "B"
    assert isinstance(json_data["confidence"], float)
    assert 0 <= json_data["confidence"] <= 1


@pytest.mark.asyncio
async def test_predict_invalid_input():
    """
    Sends malformed input and expects a 422 validation error.
    """

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post("/predict", json={"invalid_key": [1.0, 2.0]})

    assert response.status_code == 422
