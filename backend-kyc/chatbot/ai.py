import os
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def ai_response(query):

    system_prompt = """
You are MoveMate Assistant.

MoveMate is a goods transportation platform.
Only answer questions related to MoveMate.
Keep answers short and helpful.
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": query}
        ],
        temperature=0.4
    )

    return response.choices[0].message.content