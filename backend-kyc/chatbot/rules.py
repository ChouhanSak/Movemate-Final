FAQS = {
    ("hello", "hi"): "Hello! 👋 Welcome to MoveMate 🚚",
    ("price", "cost"): "Pricing depends on distance and load.",
    ("help",): "You can ask about booking, pricing or tracking."
}

def rule_based_response(query):
    query = query.lower()
    for keywords, answer in FAQS.items():
       words = query.split()

       if any(word == w for word in words for w in keywords):
            return answer
    return None