import re
import firebase_admin
from firebase_admin import credentials, firestore

# ---------------- FIREBASE INIT ---------------- #
if not firebase_admin._apps:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)

db = firestore.client()


# ---------------- EXTRACT SHIPMENT ID ---------------- #
def extract_shipment_id(query):
    """
    Extract Firestore-style booking ID (15+ alphanumeric characters)
    """
    match = re.search(r'\b[A-Za-z0-9]{15,}\b', query)
    return match.group() if match else None


# ---------------- GET SHIPMENT STATUS ---------------- #
def get_shipment_status(shipment_id, user_id):
    try:
        doc = db.collection("bookings").document(shipment_id).get()

        # ❌ If shipment not found
        if not doc.exists:
            return "Shipment ID not found ❌"

        data = doc.to_dict()

        customer_id = data.get("customerId")
        agency_id = data.get("agencyId")

        # 🔐 SECURITY CHECK
        # Allow only booking customer OR assigned agency
        if user_id != customer_id and user_id != agency_id:
            return "You are not authorized to view this shipment ❌"

        # ✅ Authorized user
        status = data.get("status", "PROCESSING")

        pickup_city = data.get("pickupAddress", {}).get("city", "Unknown")
        drop_city = data.get("dropAddress", {}).get("city", "Unknown")

        driver_name = data.get("driverName", "Not Assigned Yet")

        return (
            f"📦 Shipment Details:\n"
            f"Pickup: {pickup_city}\n"
            f"Drop: {drop_city}\n"
            f"Status: {status} 🚚\n"
            f"Driver: {driver_name}"
        )

    except Exception as e:
        print("🔥 Firestore Error:", e)
        return "Unable to fetch shipment status right now 😔"