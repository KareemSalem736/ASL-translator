import torch
from torch.utils.data import Dataset


class ASLDataset(Dataset):
    """
    Dataset class for ASL landmark data and labels to be used by DataLoader.
    """
    def __init__(self, x, y):
        # Convert inputs to tensor types.
        self.X = torch.tensor(x, dtype=torch.float32)
        self.y = torch.tensor(y, dtype=torch.long)

    def __len__(self):
        # Return length of dataset.
        return len(self.x)

    def __getitem__(self, idx):
        # Retrieve an item from the dataset by index.
        return self.X[idx], self.y[idx]