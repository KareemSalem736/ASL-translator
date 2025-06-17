import torch.nn as nn


class ASLClassifier(nn.Module):
    """Class for classifying ASL gestures"""

    def __init__(self, input_size=63, hidden_sizes=[256, 128], num_classes=26):  # 26 letters
        super(ASLClassifier, self).__init__()
        layers = []
        in_features = input_size

        # Build hidden layers
        for hidden_size in hidden_sizes:
            # Add a dense layer and perform normalization
            layers.append(nn.Linear(in_features, hidden_size))
            layers.append(nn.BatchNorm1d(hidden_size))

            # Add GELU activation and dropout to reduce overfitting
            layers.append(nn.GELU())
            layers.append(nn.Dropout(0.3))
            in_features = hidden_size

        # Add final output layer and combine them into a single sequential model
        layers.append(nn.Linear(in_features, num_classes))
        self.model = nn.Sequential(*layers)

    def forward(self, x):
        """
        Forward pass of the classifier.
        """
        assert x.dim() == 2 and x.size(-1) == 63, f"Expected (batch, 63), got {x.shape}"
        return self.model(x)
