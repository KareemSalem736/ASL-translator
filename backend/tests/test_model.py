
"""
Unit tests for backend.model modules:
    download_data.py: Tests Kaggle dataset download process using mocks.
    extract_landmarks.py: Tests image landmark extraction using mocked MediaPipe and OpenCV.
"""

from unittest.mock import patch, MagicMock

from backend.model import download_data
from backend.model.extract_landmarks import extract_landmarks


# Test: Kaggle dataset downloader
@patch("backend.model.download_data.KaggleApi")
@patch("os.makedirs")
def test_download_kaggle_data(mock_makedirs, mock_kaggle_api_class):
    """
    Ensures download_kaggle_data() calls Kaggle API methods and creates dataset directory.
    """
    # Mock KaggleApi instance and its methods
    mock_api_instance = MagicMock()
    mock_kaggle_api_class.return_value = mock_api_instance

    download_data.download_kaggle_data()

    # Check if os.makedirs was called with correct params
    mock_makedirs.assert_called_once_with(download_data.DEST, exist_ok=True)

    # Check if Kaggle API was used correctly
    mock_api_instance.authenticate.assert_called_once()
    mock_api_instance.dataset_download_files.assert_called_once_with(
        download_data.DATASET, path=download_data.DEST, unzip=True
    )


# Test: Successful landmark extraction
@patch("backend.model.extract_landmarks.supress_stderr", lambda: None)
@patch("backend.model.extract_landmarks.mp_hands")
@patch("cv2.cvtColor")
@patch("cv2.imread")
def test_extract_landmarks_success(mock_imread, mock_cvtcolor, mock_hands):
    """
    Ensures extract_landmarks returns landmark data when given a valid image.
    """
    # Setup dummy image
    dummy_image = MagicMock()
    mock_imread.return_value = dummy_image
    mock_cvtcolor.return_value = dummy_image

    # Mock landmarks return value
    landmark_list = []
    for _ in range(21):
        lm = MagicMock()
        lm.x = 0.1
        lm.y = 0.2
        lm.z = 0.3
        landmark_list.append(lm)

    # Mock a hand with a `.landmark` property that's a list of landmarks
    mock_hand = MagicMock()
    mock_hand.landmark = landmark_list

    result_mock = MagicMock()
    result_mock.multi_hand_landmarks = [mock_hand]

    # Setup mock for mp_hands.Hands()
    mock_context = MagicMock()
    mock_hands.Hands.return_value.__enter__.return_value = mock_context
    mock_context.process.return_value = result_mock

    mock_hands.process.return_value = result_mock

    args = ("dummy/path.jpg", "A", False)
    landmarks = extract_landmarks(args)
    assert landmarks == [0.1, 0.2, 0.3] * 21 + ["A"]


# Test: Invalid image returns None
@patch("backend.model.extract_landmarks.supress_stderr", lambda: None)
@patch("cv2.imread", return_value=None)
def test_extract_landmarks_invalid_image(mock_imread):
    """
    Ensures extract_landmarks returns None for invalid image input.
    """
    args = ("invalid/path.jpg", "A", False)
    result = extract_landmarks(args)
    assert result is None
