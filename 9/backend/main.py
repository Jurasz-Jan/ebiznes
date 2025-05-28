from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from backend.filters import filter_topic, filter_sentiment
from transformers import pipeline
import torch

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Local model pipeline
generator = pipeline("text-generation", model="EleutherAI/gpt-neo-1.3B")


@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    message = data["message"]

    if not filter_topic(message):
        return {"response": "Porozmawiajmy o czymś ze sklepu – np. ubraniach!"}

    prompt = f"User: {message}\nBot:"
    output = generator(prompt, max_new_tokens=100, do_sample=True, temperature=0.7)[0]["generated_text"]

    answer = output.split("Bot:")[-1].strip()
    if not filter_sentiment(answer):
        answer = "Odpowiedź została ocenzurowana ze względu na negatywny wydźwięk."

    return {"response": answer}
