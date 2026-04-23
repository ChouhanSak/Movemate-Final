# model.py

from keras.applications import MobileNetV2
from keras.applications.mobilenet_v2 import preprocess_input
from keras.applications.imagenet_utils import decode_predictions
from keras.models import Model
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
    img = cv2.resize(img, (224, 224))
    img = img.astype(np.float32)

    img = preprocess_input(img)
    img = np.expand_dims(img, axis=0)

    preds = base_model.predict(img, verbose=0)
    features = feature_model.predict(img, verbose=0)[0]

    decoded = decode_predictions(preds, top=3)[0]
    labels = [item[1] for item in decoded]

    return features.tolist(), labels   # <-- fix