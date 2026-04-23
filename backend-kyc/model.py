# model.py

from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input, decode_predictions
from tensorflow.keras.models import Model
import numpy as np
import cv2

# Load MobileNetV2 (pretrained on ImageNet)
base_model = MobileNetV2(weights="imagenet")

# Feature extractor model (remove final classification layer)
feature_model = Model(
    inputs=base_model.input,
    outputs=base_model.get_layer("global_average_pooling2d").output
)

def extract_features_and_labels(img):
    # Resize to MobileNet expected size
    img = cv2.resize(img, (224, 224))
    img = img.astype(np.float32)

    # Preprocess
    img = preprocess_input(img)
    img = np.expand_dims(img, axis=0)

    # Forward pass
    preds = base_model.predict(img, verbose=0)
    features = feature_model.predict(img, verbose=0)[0]

    # Get top-3 predicted labels
    decoded = decode_predictions(preds, top=3)[0]
    labels = [item[1] for item in decoded]

    return features, labels