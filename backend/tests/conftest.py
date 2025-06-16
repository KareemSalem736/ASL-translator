import sys
from unittest.mock import MagicMock

# --- PyTorch ---
mock_torch = MagicMock()

# Mock common PyTorch submodules and functions:
mock_torch.tensor = MagicMock()
mock_torch.nn = MagicMock()
mock_torch.nn.Module = MagicMock()
mock_torch.optim = MagicMock()
mock_torch.cuda = MagicMock()
mock_torch.device = MagicMock()
mock_torch.manual_seed = MagicMock()

sys.modules["torch"] = mock_torch

# --- Kaggle API ---
mock_kaggle_api = MagicMock()
mock_kaggle_api_instance = MagicMock()
mock_kaggle_api.return_value = mock_kaggle_api_instance
mock_kaggle_api_instance.authenticate.return_value = None
mock_kaggle_api_instance.dataset_download_files.return_value = None

sys.modules["kaggle"] = MagicMock()
sys.modules["kaggle.api"] = MagicMock()
sys.modules["kaggle.api.kaggle_api_extended"] = MagicMock(KaggleApi=mock_kaggle_api)

# --- OpenCV ---
mock_cv2 = MagicMock()
mock_cv2.imread.return_value = MagicMock(name="DummyImage")
mock_cv2.cvtColor.return_value = MagicMock(name="ConvertedImage")
sys.modules["cv2"] = mock_cv2

# --- MediaPipe ---
mock_mediapipe = MagicMock()
mock_mediapipe.solutions = MagicMock()
mock_mediapipe.solutions.hands = MagicMock()
mock_mediapipe.solutions.hands.Hands.return_value.process.return_value = MagicMock()
sys.modules["mediapipe"] = mock_mediapipe

