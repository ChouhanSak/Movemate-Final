from flask import Flask, request, jsonify
from flask_cors import CORS
import easyocr
import re
import cv2
import numpy as np
import requests

app = Flask(__name__)
CORS(app)

# ✅ Reader for English + Hindi
reader = easyocr.Reader(['en', 'hi'], gpu=False)

def extract_text_from_image(image_url):
    response = requests.get(image_url)
    image_array = np.asarray(bytearray(response.content), dtype=np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    result = reader.readtext(image, detail=0)
    return " ".join(result)

def extract_name_from_text(ocr_text, input_name):
    """
    Checks if all words in input_name appear in OCR text (case-insensitive)
    Works for English or Hindi names
    """
    input_words = input_name.lower().split()
    text_lower = ocr_text.lower()
    match_count = sum(1 for w in input_words if w in text_lower)
    return True if match_count == len(input_words) else False

def extract_dob(text):
    # Aadhaar DOB format: DD/MM/YYYY
    match = re.search(r'\d{2}/\d{2}/\d{4}', text)
    return match.group() if match else ""

def extract_pan_number(text):
    text = text.replace(" ", "").upper()
    match = re.search(r'[A-Z]{5}[0-9]{4}[A-Z]', text)
    return match.group() if match else ""


def verify_pan_individual(text, input_name):
    name_match = extract_name_from_text(text, input_name)
    pan_found = extract_pan_number(text)
    return name_match and pan_found != ""

def verify_aadhaar(text, input_name):
    name_match = extract_name_from_text(text, input_name)
    return name_match

@app.route("/verify-kyc", methods=["POST"])
def verify_kyc():
    data = request.json
    image_url = data.get("imageUrl")
    input_name = data.get("name")
    doc_type = data.get("docType")

    ocr_text = extract_text_from_image(image_url)

    if doc_type == "PAN Card":
        verified = verify_pan_individual(ocr_text, input_name)

    elif doc_type == "Aadhar Card":
        verified = verify_aadhaar(ocr_text, input_name)

    else:
        verified = False
    return jsonify({
        "verified": verified,
        "docType": doc_type,
       
    })

if __name__ == "__main__":
    app.run(debug=True)
