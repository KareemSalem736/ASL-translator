from torch import nn


class ASLSequenceClassifier(nn.Module):
    """
    LSTM-based classifier for ASL landmark sequences.
    Input shape: (batch_size, seq_len, input_size=63)
    Output shape: (batch_size, num_classes)
    """

    def __init__(self, input_size=63, hidden_size=128, num_layers=2, num_classes=26, dropout=0.3):
        super(ASLSequenceClassifier, self).__init__()

        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0.0,
            bidirectional=False,
        )

        self.batch_norm = nn.BatchNorm1d(hidden_size)

        self.classifier = nn.Sequential(
            nn.Linear(hidden_size, 64),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(64, num_classes)
        )

    def forward(self, x):
        assert x.dim() == 3 and x.size(-1) == 63, f"Expected (batch, seq_len, 63), got {x.shape}"
        # x shape: (batch, seq_len, input_size)
        lstm_out, (h_n, c_n) = self.lstm(x)  # lstm_out: (batch, seq_len, hidden_size)

        # Take output of last time step
        last_out = lstm_out[:, -1, :]  # shape: (batch, hidden_size)

        # Batch norm expects 2D: (batch, features)
        normed = self.batch_norm(last_out)

        out = self.classifier(normed)  # (batch, num_classes)
        return out