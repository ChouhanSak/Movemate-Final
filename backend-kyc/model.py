import tensorflow as tf
import numpy as np

# Load pretrained MobileNetV2
model = tf.keras.applications.MobileNetV2(
    weights="imagenet",
    include_top=False,
    pooling="avg"
)

def extract_features(img_array):
    img = tf.image.resize(img_array, (224, 224))
    img = tf.keras.applications.mobilenet_v2.preprocess_input(img)
    img = tf.expand_dims(img, axis=0)
    features = model(img)
    return features.numpy()[0]
