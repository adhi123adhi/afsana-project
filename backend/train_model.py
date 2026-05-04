"""
train_model.py – Transfer Learning Training Script
===================================================
Trains a MobileNetV2 model on a cattle breed image dataset.

DATASET STRUCTURE EXPECTED:
  data/
    train/
      Gir/        ← folder name = class label
      Sahiwal/
      Jersey/
      ...
    val/
      Gir/
      Sahiwal/
      Jersey/
      ...

USAGE:
  python train_model.py --data_dir ./data --epochs 20 --batch_size 32

The trained model is saved to: model/cattle_model.h5
"""

import os
import argparse
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models, optimizers, callbacks
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# ─── Constants ────────────────────────────────────────────────────────────────
IMG_SIZE    = (224, 224)
BATCH_SIZE  = 32
EPOCHS      = 20
LR_INITIAL  = 1e-3
LR_FINETUNE = 1e-5
MODEL_SAVE  = os.path.join(os.path.dirname(__file__), "model", "cattle_model.keras")

CLASSES = [
    "Gir", "Sahiwal", "Tharparkar", "Rathi", "Ongole",
    "Kankrej", "Hallikar", "Holstein Friesian", "Jersey", "Red Sindhi",
]


# ─── Data Augmentation ───────────────────────────────────────────────────────

def build_generators(data_dir: str, batch_size: int):
    train_gen = ImageDataGenerator(
        rescale=1.0 / 127.5,
        preprocessing_function=lambda x: x - 1.0,
        rotation_range=20,
        width_shift_range=0.15,
        height_shift_range=0.15,
        shear_range=0.1,
        zoom_range=0.2,
        horizontal_flip=True,
        brightness_range=[0.8, 1.2],
        fill_mode="nearest",
    )
    val_gen = ImageDataGenerator(
        rescale=1.0 / 127.5,
        preprocessing_function=lambda x: x - 1.0,
    )

    train_ds = train_gen.flow_from_directory(
        os.path.join(data_dir, "train"),
        target_size=IMG_SIZE,
        batch_size=batch_size,
        class_mode="categorical",
        shuffle=True,
    )
    val_ds = val_gen.flow_from_directory(
        os.path.join(data_dir, "val"),
        target_size=IMG_SIZE,
        batch_size=batch_size,
        class_mode="categorical",
        shuffle=False,
    )
    return train_ds, val_ds


# ─── Model Definition ─────────────────────────────────────────────────────────

def build_model(num_classes: int) -> tf.keras.Model:
    base = MobileNetV2(
        input_shape=(*IMG_SIZE, 3),
        include_top=False,
        weights="imagenet",
    )
    base.trainable = False   # Freeze base initially

    inputs = tf.keras.Input(shape=(*IMG_SIZE, 3))
    x = base(inputs, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dense(512, activation="relu")(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dropout(0.4)(x)
    x = layers.Dense(256, activation="relu")(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)

    return tf.keras.Model(inputs, outputs)


# ─── Training ─────────────────────────────────────────────────────────────────

def train(args):
    print(f"\n{'='*60}")
    print("  Cattle Breed Recognition – Model Training")
    print(f"{'='*60}\n")

    # Generators
    train_ds, val_ds = build_generators(args.data_dir, args.batch_size)
    num_classes = train_ds.num_classes
    print(f"[INFO] Detected {num_classes} classes: {list(train_ds.class_indices.keys())}")

    # Build model
    model = build_model(num_classes)
    model.compile(
        optimizer=optimizers.Adam(learning_rate=LR_INITIAL),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )
    model.summary()

    # Callbacks
    os.makedirs(os.path.dirname(MODEL_SAVE), exist_ok=True)
    cbs = [
        callbacks.ModelCheckpoint(
            MODEL_SAVE,
            monitor="val_accuracy",
            save_best_only=True,
            verbose=1,
        ),
        callbacks.EarlyStopping(
            monitor="val_accuracy",
            patience=7,
            restore_best_weights=True,
            verbose=1,
        ),
        callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=3,
            verbose=1,
        ),
        callbacks.TensorBoard(log_dir="./logs"),
    ]

    # Phase 1 – Train classification head only
    print("\n[PHASE 1] Training classification head (base frozen)…\n")
    history1 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=args.epochs,
        callbacks=cbs,
    )

    # Phase 2 – Fine-tune top layers of base
    print("\n[PHASE 2] Fine-tuning top MobileNetV2 layers…\n")
    base_model = model.layers[1]
    base_model.trainable = True
    for layer in base_model.layers[:-30]:   # freeze all except last 30
        layer.trainable = False

    model.compile(
        optimizer=optimizers.Adam(learning_rate=LR_FINETUNE),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    history2 = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=10,
        callbacks=cbs,
    )

    print(f"\n✅ Model saved to: {MODEL_SAVE}")

    # Save class mapping
    class_map_path = os.path.join(os.path.dirname(MODEL_SAVE), "class_indices.json")
    import json
    with open(class_map_path, "w") as f:
        json.dump(train_ds.class_indices, f, indent=2)
    print(f"✅ Class indices saved to: {class_map_path}")


# ─── Mock Dataset Generator (for testing without real data) ──────────────────

def create_mock_dataset(output_dir: str = "./data"):
    """
    Creates a tiny mock dataset with random noise images for testing the
    training pipeline without a real cattle dataset.
    """
    from PIL import Image
    import random

    for split in ["train", "val"]:
        for cls in CLASSES:
            folder = os.path.join(output_dir, split, cls)
            os.makedirs(folder, exist_ok=True)
            n_imgs = 20 if split == "train" else 5
            for i in range(n_imgs):
                arr = np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8)
                img = Image.fromarray(arr)
                img.save(os.path.join(folder, f"mock_{i}.jpg"))
    print(f"✅ Mock dataset created at: {output_dir}")


# ─── CLI ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train Cattle Breed Classifier")
    parser.add_argument("--data_dir",    default="./data",  help="Path to dataset root")
    parser.add_argument("--epochs",      type=int, default=EPOCHS)
    parser.add_argument("--batch_size",  type=int, default=BATCH_SIZE)
    parser.add_argument("--mock",        action="store_true",
                        help="Generate mock dataset and train on it (for testing)")
    args = parser.parse_args()

    if args.mock:
        create_mock_dataset(args.data_dir)

    train(args)
