# comparator.py

import cv2
import numpy as np
import requests
from sklearn.metrics.pairwise import cosine_similarity
from model import extract_features_and_labels

def url_to_image(url):
    resp = requests.get(url, timeout=10)
    image = np.asarray(bytearray(resp.content), dtype="uint8")
    image = cv2.imdecode(image, cv2.IMREAD_COLOR)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    return image

def compare_multiple(driver_photos, customer_photos):
    results = []
    driver_features = []
    driver_labels = []

    # 🔹 Extract driver features + labels
    for d_url in driver_photos:
        d_img = url_to_image(d_url)
        d_feat, d_labels = extract_features_and_labels(d_img)

        driver_features.append(d_feat)
        driver_labels.extend(d_labels)

    mismatch_detected = False

    # 🔹 Compare each customer image
    for c_url in customer_photos:
        c_img = url_to_image(c_url)
        c_feat, c_labels = extract_features_and_labels(c_img)

        # Category mismatch check (soft match using top-3 labels)
        if not any(label in driver_labels for label in c_labels):
            mismatch_detected = True

        # Similarity check
        best_score = 0
        for d_feat in driver_features:
            score = cosine_similarity([c_feat], [d_feat])[0][0]
            best_score = max(best_score, score)

        results.append(best_score)

    # Edge case: no images
    if len(results) == 0:
        return {
            "similarity": 0,
            "damageLevel": "NO_IMAGES",
            "perImageScores": []
        }

    overall = sum(results) / len(results)
    similarity_percent = round(overall * 100, 2)

    # 🔹 Final Decision Logic
    if mismatch_detected:
        damage = "PRODUCT_MISMATCH"
    else:
        if similarity_percent > 88:
            damage = "NO_DAMAGE"
        elif similarity_percent > 75:
            damage = "MINOR_DAMAGE"
        elif similarity_percent > 60:
            damage = "MAJOR_DAMAGE"
        else:
            damage = "MAJOR_DAMAGE"

    return {
        "similarity": similarity_percent,
        "damageLevel": damage,
        "perImageScores": [round(r * 100, 2) for r in results]
    }