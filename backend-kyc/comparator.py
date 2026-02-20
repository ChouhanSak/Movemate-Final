import cv2
import numpy as np
import requests
from sklearn.metrics.pairwise import cosine_similarity
from model import extract_features

def url_to_image(url):
    resp = requests.get(url, timeout=10)
    image = np.asarray(bytearray(resp.content), dtype="uint8")
    image = cv2.imdecode(image, cv2.IMREAD_COLOR)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    return image

def compare_multiple(driver_photos, customer_photos):
    results = []

    driver_features = []

    # Extract features for driver images
    for d_url in driver_photos:
        d_img = url_to_image(d_url)
        d_feat = extract_features(d_img)
        driver_features.append(d_feat)

    # Compare each customer image
    for c_url in customer_photos:
        c_img = url_to_image(c_url)
        c_feat = extract_features(c_img)

        best_score = 0

        for d_feat in driver_features:
            score = cosine_similarity([c_feat], [d_feat])[0][0]
            if score > best_score:
                best_score = score

        results.append(best_score)

    overall = sum(results) / len(results)

    similarity_percent = round(overall * 100, 2)

    if similarity_percent > 85:
       damage = "NO_DAMAGE"
    elif similarity_percent > 65:
       damage = "MINOR_DAMAGE"
    elif similarity_percent > 40:
       damage = "MAJOR_DAMAGE"
    else:
       damage = "PRODUCT_MISMATCH"

    return {
        "similarity": similarity_percent,
        "damageLevel": damage,
        "perImageScores": [round(r * 100, 2) for r in results]
    }
