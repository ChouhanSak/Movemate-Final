from .ai import client

def detect_intent(query):

    prompt = f"""
Classify this message intent:

Message: "{query}"

Possible intents:
- track_shipment
- greeting
- pricing
- booking
- dispute
- unrelated

Return only the intent name.
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[{"role": "user", "content": prompt}],
        temperature=0
    )

    return response.choices[0].message.content.strip().lower()