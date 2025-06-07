"""
Connect to kaggle api and download dataset for training model
"""
import os
from kaggle.api.kaggle_api_extended import KaggleApi

# Dataset to download and destination for storage.
DATASET = "datamunge/sign-language-mnist"
DEST = os.path.join(os.path.dirname(__file__), "dataset")


def download_kaggle_data():
    """
    Connect to kaggle api and initiate download of dataset.
    """
    api = KaggleApi()
    api.authenticate()

    os.makedirs(DEST, exist_ok=True)
    print("Downloading dataset...")
    api.dataset_download_files(DATASET, path=DEST, unzip=True)
    print("Download complete!")


if __name__ == "__main__":
    download_kaggle_data()
