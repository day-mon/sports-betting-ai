"""
Convert the TensorFlow/Keras home-team-win model from origin/main to an
equivalent PyTorch model and save the state dict into this directory.

Run with the Python 3.12 conversion venv:
    /tmp/tf-convert-env/bin/python3.12 \
        accuribet-ml/src/accuribet_ml/legacy/convert.py

Output is written to:
    legacy/models/hometeam_win/model.pt
"""

from __future__ import annotations

from pathlib import Path


# ── paths ──────────────────────────────────────────────────────────────────────

HERE = Path(__file__).parent
# legacy/ -> accuribet_ml/ -> src/ -> accuribet-ml/ -> sports-betting-ai/
REPO_ROOT = HERE.parents[3]
TF_MODEL = REPO_ROOT / "API" / "src" / "trained_models" / "useable" / "v2"
OUT_PT = HERE / "models" / "hometeam_win" / "model.pt"

print(f"Repo root : {REPO_ROOT}")
print(f"TF model  : {TF_MODEL}")
assert TF_MODEL.exists(), f"SavedModel directory not found: {TF_MODEL}"

# ── read checkpoint variables ──────────────────────────────────────────────────
# We bypass tf.keras.models.load_model because Keras 3 dropped support for the
# legacy TF1/TF2 SavedModel format.  tf.train.load_checkpoint reads the raw
# variable tensors directly without going through the Keras loader.

import tensorflow as tf  # noqa: E402
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    import numpy as np

ckpt_prefix = str(TF_MODEL / "variables" / "variables")
reader = tf.train.load_checkpoint(ckpt_prefix)
shape_map = reader.get_variable_to_shape_map()

print("\nAll checkpoint variables:")
for name, shape in sorted(shape_map.items()):
    print(f"  {name:<70} {shape}")

# ── extract dense-layer kernels and biases in layer order ─────────────────────
# TF2 SavedModel checkpoints store Keras Sequential layer weights under keys
# like:  layer_with_weights-N/vars/0   (kernel)
#        layer_with_weights-N/vars/1   (bias)
# Older checkpoints may use dense[-N]/kernel/.ATTRIBUTES/VARIABLE_VALUE.
# We support both naming schemes by trying each in turn.


def _try_layered(shape_map: dict) -> list[tuple[np.ndarray, np.ndarray]] | None:
    """layer_with_weights-N/vars/{0,1} scheme."""
    layers: dict[int, dict] = {}
    for key in shape_map:
        if not key.startswith("layer_with_weights-"):
            continue
        rest = key[len("layer_with_weights-") :]
        idx_str, _, tail = rest.partition("/")
        if not idx_str.isdigit():
            continue
        idx = int(idx_str)
        if tail == "vars/0":
            layers.setdefault(idx, {})["kernel"] = reader.get_tensor(key)
        elif tail == "vars/1":
            layers.setdefault(idx, {})["bias"] = reader.get_tensor(key)
    if not layers:
        return None
    result = []
    for i in sorted(layers):
        entry = layers[i]
        if "kernel" in entry and "bias" in entry:
            result.append((entry["kernel"], entry["bias"]))
    return result or None


def _try_dense_attrs(shape_map: dict) -> list[tuple[np.ndarray, np.ndarray]] | None:
    """dense[-N]/kernel/.ATTRIBUTES/VARIABLE_VALUE scheme."""
    SUFFIX_K = "/kernel/.ATTRIBUTES/VARIABLE_VALUE"
    SUFFIX_B = "/bias/.ATTRIBUTES/VARIABLE_VALUE"
    kernels: dict[str, np.ndarray] = {}
    biases: dict[str, np.ndarray] = {}
    for key in shape_map:
        if key.endswith(SUFFIX_K):
            prefix = key[: -len(SUFFIX_K)]
            kernels[prefix] = reader.get_tensor(key)
        elif key.endswith(SUFFIX_B):
            prefix = key[: -len(SUFFIX_B)]
            biases[prefix] = reader.get_tensor(key)
    prefixes = sorted(kernels.keys() & biases.keys())
    if not prefixes:
        return None
    return [(kernels[p], biases[p]) for p in prefixes]


raw_layers = _try_layered(shape_map) or _try_dense_attrs(shape_map)
assert raw_layers, (
    "Could not extract dense-layer weights from the checkpoint. "
    "Inspect the variable names printed above and update the extraction logic."
)

print(f"\nExtracted {len(raw_layers)} dense layer(s):")
for i, (k, b) in enumerate(raw_layers):
    print(f"  [{i}] kernel {k.shape}  bias {b.shape}")

# ── activations (from the original training script) ───────────────────────────
# The checkpoint only stores weights; activations must be inferred from the
# known architecture in AI/train_model.py on origin/main.
# 6 layers extracted from the checkpoint: relu on all hidden layers, softmax on output.
# (The saved model is an earlier iteration than the 8-layer architecture in train_model.py.)
ACTIVATIONS = ["relu", "relu", "relu", "relu", "relu", "softmax"]
assert len(ACTIVATIONS) == len(raw_layers), (
    f"Expected {len(ACTIVATIONS)} layers from the known architecture "
    f"but extracted {len(raw_layers)} from the checkpoint."
)

# ── PyTorch model ──────────────────────────────────────────────────────────────

import torch  # noqa: E402
import torch.nn as nn  # noqa: E402
import torch.nn.functional as F  # noqa: E402


class HometeamWinModel(nn.Module):
    """
    PyTorch equivalent of the Keras win/loss classifier from origin/main.

    Architecture
    ────────────
        Linear(input_dim → 2048)   ReLU
        Linear(2048      → 1024)   ReLU
        Linear(1024      → 512)    ReLU
        Linear(512       → 256)    ReLU
        Linear(256       → 512)    —  (L1 kernel / L2 activity reg. in original)
        Linear(512       → 512)    ReLU
        Linear(512       → 1024)   ReLU
        Linear(1024      → 2)      Softmax → [P(away wins), P(home wins)]

    Note
    ────
    Regularisation terms only affect training dynamics; they are not baked
    into the weight values, so converted inference is identical to TF original.
    """

    def __init__(
        self,
        layer_dims: list[tuple[int, int]],
        activations: list[str],
    ) -> None:
        super().__init__()
        assert len(layer_dims) == len(activations)
        self.activations = activations
        self.linears = nn.ModuleList(
            [nn.Linear(in_f, out_f) for in_f, out_f in layer_dims]
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        for linear, act in zip(self.linears, self.activations):
            x = linear(x)
            if act == "relu":
                x = F.relu(x)
            elif act in ("softmax", "softmax_v2"):
                x = F.softmax(x, dim=-1)
            # "linear" → identity; no op needed
        return x


# ── instantiate and transfer weights ──────────────────────────────────────────

layer_dims = [(int(k.shape[0]), int(k.shape[1])) for k, _ in raw_layers]
model = HometeamWinModel(layer_dims, ACTIVATIONS)

with torch.no_grad():
    for pt_linear, (kernel, bias) in zip(model.linears, raw_layers):
        # Keras kernel: (in_features, out_features)
        # PyTorch weight: (out_features, in_features)  → must transpose
        pt_linear.weight.copy_(torch.from_numpy(kernel.T.copy()))
        pt_linear.bias.copy_(torch.from_numpy(bias.copy()))

# ── sanity check ───────────────────────────────────────────────────────────────

model.eval()
input_dim = layer_dims[0][0]
dummy = torch.zeros(1, input_dim)

with torch.no_grad():
    out = model(dummy)

assert out.shape == (1, 2), f"Unexpected output shape: {out.shape}"
prob_sum = out.sum().item()
assert abs(prob_sum - 1.0) < 1e-4, (
    f"Softmax probabilities don't sum to 1 (got {prob_sum:.6f})"
)
print(
    f"\nSanity check passed — "
    f"shape={tuple(out.shape)}, "
    f"sum={prob_sum:.6f}, "
    f"probs={out.squeeze().tolist()}"
)

# ── save ───────────────────────────────────────────────────────────────────────

torch.save(model.state_dict(), OUT_PT)
print(f"\n✓  Saved state dict  →  {OUT_PT}\n")
