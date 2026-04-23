from .tracking import extract_shipment_id, get_shipment_status
from .ai import ai_response

# ---------------- SESSION STORE ---------------- #
user_sessions = {}

# ---------------- INTENT DETECTOR ---------------- #
def detect_intent(message: str):
    m = message.lower().strip()

    if "how to track" in m:
        return "TRACK_GUIDE"

    if "track" in m or "parcel" in m:
        return "TRACK_EXECUTE"

    if "new booking" in m or "book" in m:
        return "BOOKING_INFO"

    if "payment history" in m or "earning" in m or "earnings" in m or "income" in m:
        return "EARNINGS_INFO"

    if "payment" in m or "pay" in m:
        return "PAYMENT_INFO"

    if "dispute" in m:
        return "DISPUTE_INFO"

    if "dashboard" in m or "overview" in m:
        return "DASHBOARD_INFO"

    if "assign driver" in m:
        return "ASSIGN_DRIVER"

    if "add vehicle" in m:
        return "ADD_VEHICLE"

    if m.startswith("why"):
        return "WHY"

    return "GENERAL"


# ---------------- CUSTOMER HANDLER ---------------- #
def handle_customer(intent, message, user_id, session):

    if intent == "DASHBOARD_INFO":
        return (
            "Your dashboard shows:\n"
            "• Total bookings\n"
            "• Completed bookings\n"
            "• Pending bookings"
        )

    if intent == "BOOKING_INFO":
        return (
            "To create a booking:\n"
            "1️⃣ Enter pickup & drop address\n"
            "2️⃣ Compare agencies by price & ratings\n"
            "3️⃣ Enter goods details\n"
            "4️⃣ Select pickup time slot\n"
            "5️⃣ Wait for agency confirmation"
        )

    if intent == "PAYMENT_INFO":
        return (
            "After agency confirmation:\n"
            "• Go to All Bookings\n"
            "• Upload goods photos (required for dispute)\n"
            "• Tick checkbox\n"
            "• Complete payment"
        )

    if intent == "EARNINGS_INFO":
        return (
            "Earnings section is available only for agencies.\n"
            "Customers do not have earnings."
        )

    if intent == "DISPUTE_INFO":
        return (
            "Dispute allowed ONLY if:\n"
            "• Booking is COMPLETED\n"
            "• Photos were uploaded at payment time\n\n"
            "To raise dispute:\n"
            "Open completed booking → Click 'Raise Dispute'"
        )

    if intent == "TRACK_GUIDE":
        return (
            "To track shipment:\n"
            "1️⃣ Go to Track Shipment page\n"
            "2️⃣ Enter Shipment ID\n"
            "3️⃣ Click Track"
        )

    if intent == "TRACK_EXECUTE":
        session["last_action"] = "TRACKING"
        return "Please provide your shipment ID 📦"

    if intent == "WHY":
        if session.get("last_action") == "UNAUTHORIZED":
            return "This shipment belongs to another account."
        if session.get("last_action") == "LOGIN_REQUIRED":
            return "You must login to access shipment details."

    return ai_response(message)


# ---------------- AGENCY HANDLER ---------------- #
def handle_agency(intent, message, user_id):

    if intent == "DASHBOARD_INFO":
        return (
            "Agency Dashboard shows:\n"
            "• Total deliveries\n"
            "• Completed deliveries\n"
            "• Latest booking requests\n"
            "• Earnings summary"
        )

    if intent == "BOOKING_INFO":
        return (
            "To manage booking requests:\n"
            "1️⃣ Go to Booking Requests\n"
            "2️⃣ Add additional price\n"
            "3️⃣ Send price\n"
            "4️⃣ Wait for customer payment"
        )

    if intent == "ASSIGN_DRIVER":
        return (
            "To assign driver:\n"
            "1️⃣ After payment confirmation\n"
            "2️⃣ Click 'Assign Driver'\n"
            "3️⃣ Enter driver details\n"
            "Customer will receive notification."
        )

    if intent == "ADD_VEHICLE":
        return (
            "To add vehicle:\n"
            "1️⃣ Go to Add Vehicle page\n"
            "2️⃣ Enter vehicle type\n"
            "3️⃣ Enter number plate\n"
            "4️⃣ Enter license details\n"
            "5️⃣ Save"
        )

    if intent == "EARNINGS_INFO":
        return (
            "You can view earnings in Completed Bookings page.\n"
            "It shows total earnings & payment status."
        )

    if intent == "DISPUTE_INFO":
        return (
            "To respond to dispute:\n"
            "1️⃣ Go to Disputes section\n"
            "2️⃣ Open case\n"
            "3️⃣ Upload delivery photos\n"
            "4️⃣ Submit response"
        )

    return ai_response(message)


# ---------------- MAIN ENTRY FUNCTION ---------------- #
def chat_response(message, user_id=None, role="customer"):

    if not message:
        return "Please enter a message."

    if not user_id:
        user_id = "guest"

    if user_id not in user_sessions:
        user_sessions[user_id] = {}

    session = user_sessions[user_id]

    # 🔥 UNIVERSAL TRACKING (for both agency & customer)
    shipment_id = extract_shipment_id(message)
    if shipment_id:
        if user_id == "guest":
            session["last_action"] = "LOGIN_REQUIRED"
            return "Please login to track shipment 🔐"

        result = get_shipment_status(shipment_id, user_id)

        if "not authorized" in result.lower():
            session["last_action"] = "UNAUTHORIZED"

        return result

    # Intent detection
    intent = detect_intent(message)

    # Role-based routing
    if role == "agency":
        return handle_agency(intent, message, user_id)

    if role == "customer":
        return handle_customer(intent, message, user_id, session)

    return ai_response(message)