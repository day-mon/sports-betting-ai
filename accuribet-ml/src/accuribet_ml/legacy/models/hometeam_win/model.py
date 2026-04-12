"""
Legacy home-team-win classifier — PyTorch port of the Keras model from origin/main.

Architecture (derived from the useable/v2 SavedModel checkpoint):

    Linear(84  → 170)   ReLU
    Linear(170 → 150)   ReLU
    Linear(150 → 75)    ReLU
    Linear(75  → 30)    ReLU
    Linear(30  → 15)    ReLU
    Linear(15  → 2)     Softmax  →  [P(away wins), P(home wins)]

Input
─────
A float tensor of shape (batch_size, 84) containing the per-game feature
vector produced by the original data pipeline.

Output
──────
A float tensor of shape (batch_size, 2) where each row is a probability
distribution over [away-team win, home-team win].

Usage
─────
    from accuribet_ml.legacy.models.hometeam_win.model import HometeamWinModel

    model = HometeamWinModel.load()   # loads bundled model.pt
    model.eval()

    with torch.no_grad():
        probs = model(features)       # (batch, 2)
        home_win_prob = probs[:, 1]
"""

from __future__ import annotations

from pathlib import Path

import torch
import torch.nn as nn
import torch.nn.functional as F

_HERE = Path(__file__).parent
_DEFAULT_WEIGHTS = _HERE / "model.pt"

# Exact layer dimensions extracted from the useable/v2 TF checkpoint.
_LAYER_DIMS: list[tuple[int, int]] = [
    (84, 170),
    (170, 150),
    (150, 75),
    (75, 30),
    (30, 15),
    (15, 2),
]

_ACTIVATIONS: list[str] = ["relu", "relu", "relu", "relu", "relu", "softmax"]


class HometeamWinModel(nn.Module):
    """
    PyTorch port of the legacy Keras win/loss classifier.

    The model is intentionally kept as a faithful structural replica of the
    original so that the converted weights produce numerically identical
    inference results.

    Note
    ────
    The original Keras layer 4 carried L1 kernel regularisation and L2 activity
    regularisation.  Regularisation terms only influence training dynamics; they
    are not encoded in the weight values, so inference is unaffected by their
    absence here.
    """

    #: Input feature dimension expected by this model.
    INPUT_DIM: int = _LAYER_DIMS[0][0]

    #: Number of output classes (away-win=0, home-win=1).
    NUM_CLASSES: int = _LAYER_DIMS[-1][1]

    def __init__(self) -> None:
        super().__init__()
        self.linears = nn.ModuleList([
            nn.Linear(in_f, out_f) for in_f, out_f in _LAYER_DIMS
        ])

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        Parameters
        ----------
        x:
            Float tensor of shape ``(batch_size, INPUT_DIM)``.

        Returns
        -------
        torch.Tensor
            Float tensor of shape ``(batch_size, NUM_CLASSES)`` containing
            class probabilities that sum to 1 along dim=-1.
        """
        for linear, activation in zip(self.linears, _ACTIVATIONS):
            x = linear(x)
            if activation == "relu":
                x = F.relu(x)
            elif activation == "softmax":
                x = F.softmax(x, dim=-1)
        return x

    # ── convenience constructors ───────────────────────────────────────────────

    @classmethod
    def load(
        cls,
        weights_path: str | Path = _DEFAULT_WEIGHTS,
        *,
        map_location: torch.device | str | None = None,
    ) -> "HometeamWinModel":
        """
        Instantiate the model and load a saved state dict.

        Parameters
        ----------
        weights_path:
            Path to the ``.pt`` file produced by ``convert.py``.
            Defaults to the ``model.pt`` bundled alongside this module.
        map_location:
            Passed directly to ``torch.load``; use ``"cpu"`` to force CPU
            loading when no GPU is available.
        """
        model = cls()
        state = torch.load(
            weights_path,
            map_location=map_location,
            weights_only=True,
        )
        model.load_state_dict(state)
        return model
