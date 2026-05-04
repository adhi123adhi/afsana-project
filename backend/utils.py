"""
utils.py – Shared utilities for image preprocessing and model management.
"""

import io
import numpy as np
from PIL import Image, ImageOps, ImageFilter


IMG_SIZE = (224, 224)


# ─── Image Preprocessing ──────────────────────────────────────────────────────

def load_image_from_bytes(image_bytes: bytes) -> Image.Image:
    """Load a PIL Image from raw bytes."""
    img = Image.open(io.BytesIO(image_bytes))
    img = ImageOps.exif_transpose(img)   # correct orientation
    return img.convert("RGB")


def preprocess_for_mobilenet(image_bytes: bytes) -> np.ndarray:
    """
    Prepare image for MobileNetV2 inference.
    Returns shape (1, 224, 224, 3) float32 array in [-1, 1].
    """
    img = load_image_from_bytes(image_bytes)
    img = img.resize(IMG_SIZE, Image.BILINEAR)
    arr = np.array(img, dtype=np.float32)
    arr = arr / 127.5 - 1.0      # MobileNetV2 native normalization
    return np.expand_dims(arr, axis=0)


def preprocess_for_resnet(image_bytes: bytes) -> np.ndarray:
    """
    Prepare image for ResNet50 inference.
    Returns shape (1, 224, 224, 3) float32 array, ImageNet mean-subtracted.
    """
    img = load_image_from_bytes(image_bytes)
    img = img.resize(IMG_SIZE, Image.BILINEAR)
    arr = np.array(img, dtype=np.float32)
    # ImageNet channel means
    arr[..., 0] -= 103.939
    arr[..., 1] -= 116.779
    arr[..., 2] -= 123.68
    return np.expand_dims(arr, axis=0)


# ─── Confidence Formatting ───────────────────────────────────────────────────

def softmax(logits: np.ndarray) -> np.ndarray:
    """Compute softmax of a 1-D array."""
    e = np.exp(logits - np.max(logits))
    return e / e.sum()


def top_k_predictions(probabilities: np.ndarray, class_names: list, k: int = 3) -> list:
    """Return top-k (breed, confidence%) pairs sorted by confidence descending."""
    sorted_idx = np.argsort(probabilities)[::-1][:k]
    return [
        {
            "breed": class_names[i],
            "confidence": round(float(probabilities[i]) * 100, 2),
        }
        for i in sorted_idx
    ]


# ─── Validation ──────────────────────────────────────────────────────────────

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp", ".gif"}


def is_valid_image(filename: str) -> bool:
    """Check if the uploaded file has an allowed image extension."""
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    return ext in ALLOWED_EXTENSIONS


def validate_image_bytes(image_bytes: bytes, max_size_mb: float = 10.0) -> None:
    """Raise ValueError if the image bytes are invalid or too large."""
    if len(image_bytes) == 0:
        raise ValueError("Empty image file.")
    max_bytes = int(max_size_mb * 1024 * 1024)
    if len(image_bytes) > max_bytes:
        raise ValueError(f"Image too large. Max allowed: {max_size_mb} MB.")
    # Try to open to validate it's a real image
    try:
        Image.open(io.BytesIO(image_bytes)).verify()
    except Exception:
        raise ValueError("Invalid or corrupt image file.")
