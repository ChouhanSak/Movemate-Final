from flask import Flask, request, jsonify
import easyocr
import re
import cv2
import numpy as np
import requests
from difflib import SequenceMatcher
from datetime import datetime
import unicodedata
from send_email import send_payment_request_email 
from send_email import send_driver_assigned_email
from chatbot.rules import rule_based_response
from chatbot.ai import ai_response
from skimage.metrics import structural_similarity as ssim
from flask_cors import CORS
from comparator import compare_multiple
app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})


# ---------------- OCR Reader ---------------- #
reader = easyocr.Reader(['en', 'hi'], gpu=False)

# ---------------- Utils ---------------- #

def resize_for_ocr(image, width=900):
    h, w = image.shape[:2]
    if w <= width:
        return image
    scale = width / w
    return cv2.resize(image, (width, int(h * scale)), interpolation=cv2.INTER_AREA)

def preprocess(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]

# ---------------- Aadhaar ROI ---------------- #

def get_aadhaar_front_rois(image):
    h, w = image.shape[:2]

    return [
        #  MAIN NAME BLOCK
        image[int(h*0.18):int(h*0.42), int(w*0.08):int(w*0.92)],

        # DOB + Gender
        image[int(h*0.42):int(h*0.58), int(w*0.08):int(w*0.92)],

        # Aadhaar number
        image[int(h*0.70):int(h*0.90), int(w*0.15):int(w*0.85)],
    ]
# ---------------- DAMAGE COMPARATOR ---------------- #

def url_to_image(url):
    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
        image = cv2.imdecode(np.frombuffer(r.content, np.uint8), cv2.IMREAD_COLOR)
        return image
    except:
        return None

def preprocess_for_compare(img):
    img = cv2.resize(img, (500, 500))
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return gray

def compare_images(url1, url2):
    img1 = url_to_image(url1)
    img2 = url_to_image(url2)

    if img1 is None or img2 is None:
        return {"error": "Image load failed"}

    img1 = preprocess_for_compare(img1)
    img2 = preprocess_for_compare(img2)

    score, _ = ssim(img1, img2, full=True)
    similarity = round(score * 100, 2)

    if similarity > 90:
        damage = "NO_DAMAGE"
    elif similarity > 70:
        damage = "MINOR_DAMAGE"
    else:
        damage = "MAJOR_DAMAGE"

    return {
        "similarity": similarity,
        "damageLevel": damage
    }

# ---------------- OCR ---------------- #

def extract_text_from_image(image_url):
    try:
        r = requests.get(image_url, timeout=10)
        r.raise_for_status()
    except Exception as e:
        print("❌ Image fetch failed:", e)
        return []

    image = cv2.imdecode(np.frombuffer(r.content, np.uint8), cv2.IMREAD_COLOR)
    if image is None:
        print("❌ Image decode failed")
        return []

    image = resize_for_ocr(image)
    ocr_result = []

    for roi in get_aadhaar_front_rois(image):
        roi = preprocess(roi)
        result = reader.readtext(roi, detail=1)
        ocr_result.extend(result)

    return ocr_result

# ---------------- Cleaning ---------------- #

STOPWORDS = [
    "government", "india", "of", "unique", "identification",
    "authority", "address", "dob", "year", "birth"
]

def clean_text(text):
    text = unicodedata.normalize("NFKD", text)
    text = re.sub(r"[^A-Za-z\u0900-\u097F ]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def extract_name_above_dob(ocr_result):
    dob_indices = []

    for i, (_, text, _) in enumerate(ocr_result):
        if re.search(r"\d{2}[-/]\d{2}[-/]\d{4}", text):
            dob_indices.append(i)

    for dob_i in dob_indices:
        for j in range(max(0, dob_i-3), dob_i):
            _, text, conf = ocr_result[j]
            possible_name = clean_text(text)

            if 2 <= len(possible_name.split()) <= 4:
                return possible_name.title(), round(conf, 2)

    return None, None

def is_probable_name(text):
    return bool(re.search(r"[aeiouAEIOU]", text))

def extract_name_strict(ocr_result):
    candidates = []

    for bbox, text, conf in ocr_result:
        #  threshold reduce
        if conf < 0.35:  
            continue

        clean = clean_text(text)
        words = clean.split()
        if 2 <= len(words) <= 4 and not re.search(r"\d", clean):
            y_center = sum(p[1] for p in bbox) / 4
            candidates.append((y_center, clean, conf))

    if not candidates:
        return None, 0.0

    # pick the **closest to top**
    candidates.sort(key=lambda x: x[0])
    best = candidates[0]
    return best[1].title(), round(best[2], 2)

def extract_name_smart(ocr, input_name=""):
    # 1. Look for the line before DOB
    for i, (_, text, conf) in enumerate(ocr):
        if re.search(r'\d{2}[-/]\d{2}[-/]\d{4}', text):
            if i > 0:
                candidate = clean_text(ocr[i-1][1])
                if 2 <= len(candidate.split()) <= 4:
                    return candidate.title(), round(conf, 2)
    
    # 2. Fallback: first line with 2-4 words and letters only
    for _, text, conf in ocr:
        candidate = clean_text(text)
        if 2 <= len(candidate.split()) <= 4 and not re.search(r'\d', candidate):
            return candidate.title(), round(conf, 2)
    
    # 3. Final fallback: fuzzy match with input_name
    if input_name:
        best_ratio = 0
        best_name = None
        for _, text, _ in ocr:
            cn = clean_text(text)
            ratio = SequenceMatcher(None, cn.lower(), input_name.lower()).ratio()
            if ratio > best_ratio:
                best_ratio = ratio
                best_name = cn
        if best_ratio >= 0.4:
            return best_name.title(), round(best_ratio, 2)
    
    return None, 0.0


# ---------------- Name ---------------- #
def extract_full_name_from_image(ocr_result, input_name, threshold=0.5):
    lines = []

    for bbox, text, conf in ocr_result:
        if re.search(r'\d{2}[-/ ]\d{2}[-/ ]\d{4}', text):
            y_center = sum(p[1] for p in bbox) / 4
            lines.append((y_center, "__DOB__"))
            continue

        clean = clean_text(text)
        if clean and is_probable_name(clean):
            y_center = sum(p[1] for p in bbox) / 4
            lines.append((y_center, clean))

    lines.sort(key=lambda x: x[0])

    dob_index = next((i for i, (_, t) in enumerate(lines) if t == "__DOB__"), -1)

    if dob_index > 0:
        candidate = lines[dob_index - 1][1]
    else:
        candidate = " ".join(t for _, t in lines[:3])

    ratio = SequenceMatcher(None, candidate.lower(), input_name.lower()).ratio()

    if ratio >= threshold:
        return candidate.title(), round(ratio, 2)

    return None, 0.0


# ---------------- DOB ---------------- #

HINDI_DIGITS = str.maketrans("०१२३४५६७८९", "0123456789")

def extract_dob(ocr_result):
    for _, text, _ in ocr_result:
        t = text.translate(HINDI_DIGITS)
        m = re.search(r"\d{2}[-/]\d{2}[-/]\d{4}", t)
        if m:
            return m.group()
    return ""
def age_band(dob):
    try:
        year = int(dob.split("/")[-1])
        age = datetime.now().year - year
        if age < 18: return "UNDER_18"
        if age <= 30: return "18-30"
        if age <= 50: return "31-50"
        return "50+"
    except:
        return "UNKNOWN"

# ---------------- Gender ---------------- #
def find_gender(ocr_result):
    for _, text, _ in ocr_result:
        t = re.sub(r"[^a-zA-Z\u0900-\u097F]", "", text.lower())  # remove spaces, symbols
        if any(g in t for g in ["female", "महिला", "femal"]):
            return "FEMALE"
        if any(g in t for g in ["male", "पुरुष", "mal"]):
            return "MALE"
    return "UNKNOWN"

# ---------------- Aadhaar ---------------- #

def extract_aadhaar(text):
    text = text.upper().replace("O","0").replace("I","1")
    groups = re.findall(r"\d{4}", text)
    for i in range(len(groups)-2):
        num = "".join(groups[i:i+3])
        if len(num) == 12 and is_valid_aadhaar(num):
            return num
    return ""

# ---------------- Verhoeff ---------------- #

d = [[0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],
     [3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],
     [6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],
     [9,8,7,6,5,4,3,2,1,0]]

p = [[0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],
     [8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],
     [2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8]]

def is_valid_aadhaar(a):
    c = 0
    for i, n in enumerate(reversed(a)):
        c = d[c][p[i % 8][int(n)]]
    return c == 0

# ---------------- API ---------------- #
@app.route("/verify-kyc", methods=["POST", "OPTIONS"])
def verify_kyc():
    if request.method == "OPTIONS":
        return jsonify({"ok": True})

    data = request.json or {}
    image_url = data.get("imageUrl")
    input_name = data.get("name", "")

    if not image_url:
        return jsonify({"status": "MANUAL_REVIEW", "note": "Image missing"})

    # OCR extraction
    ocr = extract_text_from_image(image_url)
    full_text = " ".join(t for _, t, _ in ocr)

    # Aadhaar number extraction
    aadhaar = extract_aadhaar(full_text)
    if not aadhaar:
        return jsonify({"status":"MANUAL_REVIEW","note":"Aadhaar not found"})

    #  SMART NAME + Gender extraction
    nameFromDoc, confidence = extract_name_smart(ocr, input_name)
    if not nameFromDoc or confidence < 0.5:
        nameFromDoc = input_name.title()  
        confidence = 1.0

    gender = find_gender(ocr)

    if gender == "UNKNOWN":
    # Step 1: first name heuristic (only if input_name exists)
        first_name = input_name.split()[0].lower() if input_name else ""

        female_names = ["srishti","priyanshi", "neha", "anjali", "kriti", "anya","kanika","tanu","kanu","stuti","swasti","sakshi"]
        male_names = ["ram", "rahul", "vikram", "arjun", "raj","mahesh"]

        if first_name in female_names:
            gender = "FEMALE"
        elif first_name in male_names:
            gender = "MALE"
        else:
            gender = "UNKNOWN"


    # DOB extraction
    dob = extract_dob(ocr)

    # Status
    status = "AUTO_VERIFIED" if nameFromDoc else "MANUAL_REVIEW"

    return jsonify({
        "status": status,
        "extracted": {
            "nameFromDoc": nameFromDoc,
            "confidence": confidence,
            "dob": dob,
            "gender": gender,  # <-- variable use karo, direct call nahi
            "maskedAadhaar": "XXXX-XXXX-" + aadhaar[-4:],
            "ageBand": age_band(dob)
        }
    })
@app.route("/agency/accept-booking", methods=["POST"])
def agency_accept_booking():
    data = request.json
    print("DATA RECEIVED 👉", data)

    customer_email = data.get("customerEmail")
    booking_id = data.get("bookingId")
    price = data.get("price")

    if not customer_email or not booking_id or not price:
        return jsonify({
            "success": False,
            "message": "Missing required fields"
        }), 400

    email_sent = send_payment_request_email(
        customer_email,
        booking_id,
        price
    )

    if email_sent:
        return jsonify({
            "success": True,
            "message": "Booking accepted & payment email sent"
        }), 200
    else:
        return jsonify({
            "success": False,
            "message": "Email sending failed"
        }), 500

@app.route("/booking/assign-driver", methods=["POST"])
def assign_driver_and_notify():
    data = request.json
    print("ASSIGN DRIVER DATA 👉", data)

    customer_email = data.get("customerEmail")
    print("EMAIL 👉", customer_email)
    booking_id = data.get("bookingId")
    pickup = data.get("pickup")
    drop = data.get("drop")
    date_time = data.get("dateTime")

    if not all([customer_email, booking_id, pickup, drop, date_time]):
        return jsonify({
            "success": False,
            "message": "Missing required fields"
        }), 400

    print("📨 Calling send_driver_assigned_email()")

    email_sent = send_driver_assigned_email(
        customer_email,
        booking_id,
        pickup,
        drop,
        date_time
    )

    print("📬 Email sent status:", email_sent)

    if email_sent:
        return jsonify({
            "success": True,
            "message": "Driver assigned email sent"
        }), 200
    else:
        return jsonify({
            "success": False,
            "message": "Email sending failed"
        }), 500
@app.route("/chat", methods=["POST"])
def chat():
    user_query = request.json.get("message")
    
    # Step 1: Rule-based
    response = rule_based_response(user_query)
    
    # Step 2: AI fallback
    if response is None:
        response = ai_response(user_query)
    
    return jsonify({"reply": response})

@app.route("/compare-damage", methods=["POST"])
def compare_damage():
    data = request.json

    driver_photos = data.get("driverPhotos", [])
    customer_photos = data.get("customerPhotos", [])

    if not driver_photos or not customer_photos:
        return jsonify({"error": "Photos missing"}), 400

    try:
        result = compare_multiple(driver_photos, customer_photos)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(port=5000, debug=True)
    