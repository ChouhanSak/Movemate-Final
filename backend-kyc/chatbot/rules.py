FAQS = {
    "hello": "Hi! 👋 How can I help you today?",
    "hi": "Hello! Welcome to MoveMate 🚚",
    "how are you": "I'm doing great! Ready to assist you with MoveMate 😊",
    "help": "You can ask about booking, pricing, shipment tracking, or agencies.",
    "track": "Please enter your shipment ID to track your order 📦",
    "price": "Pricing depends on distance and load. You can create a booking to get an estimate.",
}

def rule_based_response(query):
    query = query.lower()
    for key in FAQS:
        if key in query:
            return FAQS[key]
    return None