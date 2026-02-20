import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def ai_response(query):
    try:
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",  # supported model
            messages=[
                {"role": "system", "content": "You are MoveMate Assistant."},
                {"role": "user", "content": query}
            ],
            max_tokens=512,
            temperature=0.7
        )
        return response.choices[0].message.content

    except Exception as e:
        print("Groq Error:", e)
        return "Sorry 😔 AI is not responding right now."