import torch.nn as nn


class ASLCombinedModel(nn.Module):
    def __init__(self, image_model, sequence_model):
        super().__init__()
        self.image_model = image_model
        self.sequence_model = sequence_model

    def forward(self, x):
        if len(x.shape) == 2:  # (batch_size, 63)
            return self.image_model(x)
        elif len(x.shape) == 3:  # (batch_size, T, 63)
            return self.sequence_model(x)
        else:
            raise ValueError(f"Unsupported input shape: {x.shape}")
