import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline
import torch
import nltk
from nltk.tokenize import word_tokenize
from typing import Dict, List, Any

# Download required NLTK data (only once, on first run)
try:
    nltk.data.find('tokenizers/punkt')
except nltk.downloader.DownloadError:
    nltk.download('punkt')

# --- FastAPI setup ---
app = FastAPI(
    title="Shopping Assistant AI",
    description="A simple chatbot to help with clothes and shopping related conversations."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models once when the application starts
class Chatbot:
    def __init__(self):
        # Check if GPU is available
        self.device = 0 if torch.cuda.is_available() else -1
        print(f"Using device: {'GPU' if self.device == 0 else 'CPU'}")

        # === Text Generation Pipeline (DialoGPT-small for English conversations) ===
        # Changed model to DialoGPT for better conversational quality on CPU
        print("Loading text generation model: microsoft/DialoGPT-small...")
        self.generator = pipeline(
            "text-generation",
            model="microsoft/DialoGPT-small", # Public, English conversational model
            device=self.device,
            do_sample=True,
            temperature=0.7,
            max_new_tokens=150, # Increased for potentially longer responses
            no_repeat_ngram_size=3 # Adjusting for DialoGPT
        )
        print("Text generation model loaded.")

        # === Sentiment Analysis Pipeline (DistilBERT for English) ===
        # Using a public, efficient English sentiment model
        try:
            print("Loading sentiment analysis model: distilbert-base-uncased-sentiment...")
            self.sentiment_analyzer = pipeline(
                "sentiment-analysis",
                model="distilbert-base-uncased-sentiment", # Public English sentiment model
                device=self.device
            )
            print("Sentiment analysis model loaded.")
        except Exception as e:
            print(f"Could not load sentiment analysis model: {e}. Sentiment filtering will be skipped.")
            self.sentiment_analyzer = None

        # --- Basic dictionaries for topic filtering ---
        # Keywords adjusted for English context
        self.allowed_categories = {
            "clothes_general": ["clothes", "apparel", "attire", "garment", "fashion", "outfit"],
            "garment_items": ["t-shirt", "pants", "dress", "jacket", "sweater", "hoodie", "skirt", "shoes", "sneakers", "sandals", "scarf", "hat", "socks", "underwear", "coat", "blazer", "tie", "jeans", "leggings", "shorts", "top", "bra", "briefs"],
            "shopping_process": ["store", "shop", "shopping", "order", "price", "cost", "delivery", "shipping", "size", "try on", "cart", "payment", "return", "exchange", "promotion", "discount", "sale"],
            "colors_styles": ["color", "style", "trendy", "elegant", "casual", "sporty", "classic", "vintage", "design", "fit", "pattern"],
            "materials": ["cotton", "silk", "linen", "wool", "leather", "polyester", "viscose", "acrylic", "denim", "flannel", "satin", "chiffon"],
            "accessories": ["bag", "purse", "belt", "jewelry", "necklace", "earrings", "bracelet", "watch", "glasses", "wallet", "backpack", "gloves"],
            "occasions": ["wedding", "party", "prom", "everyday", "work", "special occasion", "sport", "workout"]
        }
        # Storing chat history (for simplicity, in memory)
        self.chat_histories: Dict[str, List[Dict[str, str]]] = {}

    # === Filtering functions ===
    def filter_topic(self, text: str) -> bool:
        """
        Filters the message for keywords related to store/clothing topics.
        Uses NLTK tokenization for better precision.
        """
        words = word_tokenize(text.lower(), language='english') # Tokenization for English
        for category, keywords in self.allowed_categories.items():
            if any(word in words for word in keywords):
                return True
        return False

    def filter_sentiment(self, text: str) -> bool:
        """
        Filters the response for negative sentiment using an English model.
        """
        if not self.sentiment_analyzer:
            return True # If sentiment model failed to load, don't filter

        result = self.sentiment_analyzer(text)[0]
        label = result["label"]
        score = result["score"]

        # NOTE: Labels for 'distilbert-base-uncased-sentiment' are typically:
        # LABEL_0: Negative
        # LABEL_1: Positive
        
        # If sentiment is negative with high probability (e.g., > 90%)
        if label == "LABEL_0" and score > 0.9: # You can adjust the confidence threshold
            print(f"Censoring response due to negative sentiment: {text} (Label: {label}, Score: {score})")
            return False
        return True

    def get_chat_history(self, session_id: str) -> List[Dict[str, str]]:
        """Retrieves chat history for a given session."""
        return self.chat_histories.get(session_id, [])

    def add_to_chat_history(self, session_id: str, role: str, content: str):
        """Adds a message to the chat history."""
        if session_id not in self.chat_histories:
            self.chat_histories[session_id] = []
        # Limit history to the last few conversations to avoid excessively long prompts
        # 8 entries = 4 (user, bot) pairs
        if len(self.chat_histories[session_id]) >= 8:
            self.chat_histories[session_id] = self.chat_histories[session_id][-8:]
        self.chat_histories[session_id].append({"role": role, "content": content})

    async def generate_response(self, message: str, session_id: str) -> str:
        """Main logic for generating responses."""
        self.add_to_chat_history(session_id, "User", message)
        current_history = self.get_chat_history(session_id)

        # Prompt formatting for conversational models (DialoGPT)
        # It often works well with simple turn-based prompts
        dialog_prompt = ""
        for entry in current_history:
            dialog_prompt += f"{entry['role']}: {entry['content']}\n"
        dialog_prompt += "Bot:" # Expecting the bot's response

        try:
            result_list = self.generator(
                dialog_prompt,
                max_new_tokens=150,
                do_sample=True,
                temperature=0.7,
                no_repeat_ngram_size=3 # Retained for DialoGPT
            )
            generated_text = result_list[0]["generated_text"].strip()

            # Extract only the bot's response
            # DialoGPT tends to generate the full conversation history.
            # We take everything after the last "Bot:"
            answer = generated_text.split("Bot:")[-1].strip()

            # Clean up potential artifacts like extra "User:" or "Bot:"
            if "User:" in answer:
                answer = answer.split("User:")[0].strip()
            if "Bot:" in answer:
                answer = answer.split("Bot:")[0].strip()

            if not answer:
                answer = "I apologize, I don't have an answer for that question. Can you rephrase or ask something else related to clothes and shopping?"

            # Filter sentiment of the response
            if not self.filter_sentiment(answer):
                answer = "This response has been censored due to potentially negative or inappropriate sentiment. We apologize for any inconvenience."

            self.add_to_chat_history(session_id, "Bot", answer)
            return answer

        except Exception as e:
            print(f"Error during response generation: {e}")
            self.add_to_chat_history(session_id, "Bot", "A technical problem occurred while generating the response. Please try again in a moment.")
            return "A technical problem occurred while generating the response. Please try again in a moment."

# Initialize the chatbot instance
chatbot_instance = Chatbot()

@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    message = data.get("message", "").strip()
    session_id = data.get("session_id", "default_session")

    if not message:
        raise HTTPException(status_code=400, detail={"response": "Please provide a message."})

    if not chatbot_instance.filter_topic(message):
        response_text = "Let's talk about clothes, fashion, or shopping—that's what I can help you with! Feel free to ask about specific products, sizes, delivery, or returns."
        chatbot_instance.add_to_chat_history(session_id, "Bot", response_text)
        return {"response": response_text}

    response_text = await chatbot_instance.generate_response(message, session_id)
    return {"response": response_text}

# Optional: Endpoint to reset chat history for a given session
@app.post("/reset_chat/{session_id}")
async def reset_chat_history(session_id: str):
    if session_id in chatbot_instance.chat_histories:
        del chatbot_instance.chat_histories[session_id]
        return {"message": f"Chat history for session '{session_id}' has been reset."}
    raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found.")

# To run: uvicorn your_file_name:app --reload