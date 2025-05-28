import os
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline
import torch
import nltk
from nltk.tokenize import word_tokenize
from typing import Dict, List, Any
import random # Importujemy do losowego wyboru otwarć/zamknięć

# Pobierz wymagane dane NLTK (tylko raz, przy pierwszym uruchomieniu)
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
        print("Loading text generation model: microsoft/DialoGPT-small...")
        self.generator = pipeline(
            "text-generation",
            model="microsoft/DialoGPT-small", # Public, English conversational model
            device=self.device,
            do_sample=True,
            temperature=0.7,
            max_new_tokens=150,
            no_repeat_ngram_size=3
        )
        print("Text generation model loaded.")

        # === Sentiment Analysis Pipeline (DistilBERT for English) ===
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
        self.allowed_categories = {
            "clothes_general": ["clothes", "apparel", "attire", "garment", "fashion", "outfit"],
            "garment_items": ["t-shirt", "pants", "dress", "jacket", "sweater", "hoodie", "skirt", "shoes", "sneakers", "sandals", "scarf", "hat", "socks", "underwear", "coat", "blazer", "tie", "jeans", "leggings", "shorts", "top", "bra", "briefs"],
            "shopping_process": ["store", "shop", "shopping", "order", "price", "cost", "delivery", "shipping", "size", "try on", "cart", "payment", "return", "exchange", "promotion", "discount", "sale"],
            "colors_styles": ["color", "style", "trendy", "elegant", "casual", "sporty", "classic", "vintage", "design", "fit", "pattern"],
            "materials": ["cotton", "silk", "linen", "wool", "leather", "polyester", "viscose", "acrylic", "denim", "flannel", "satin", "chiffon"],
            "accessories": ["bag", "purse", "belt", "jewelry", "necklace", "earrings", "bracelet", "watch", "glasses", "wallet", "backpack", "gloves"],
            "occasions": ["wedding", "party", "prom", "everyday", "work", "special occasion", "sport", "workout"],
            "dialogue_control": ["thank you", "thanks", "goodbye", "bye", "see you", "later", "cheers", "that's all", "enough", "stop"] # New category for farewells
        }

        # --- Conversation Openings and Closings ---
        self.conversation_openings = [
            "Hello! How can I help you with your shopping today?",
            "Hi there! Welcome to our store. What are you looking for?",
            "Greetings! I'm here to assist you with any questions about our clothes or shopping. How can I help?",
            "Hey! Glad you're here. How can I assist you with your fashion needs?",
            "Welcome! Ask me anything about our products or your order. What's on your mind?"
        ]

        self.conversation_closings = [
            "You're welcome! Feel free to ask if you need anything else. Have a great day!",
            "Glad I could assist you! Come back anytime. Goodbye!",
            "It was a pleasure helping you. Have a wonderful shopping experience!",
            "Thanks for chatting! Let me know if you have more questions later. Bye for now!",
            "Alright! If anything else comes up, don't hesitate to reach out. Have a fantastic day!"
        ]

        # Przechowywanie historii czatu (dla uproszczenia, w pamięci)
        self.chat_histories: Dict[str, List[Dict[str, str]]] = {}

    # === Filtering functions ===
    def filter_topic(self, text: str) -> bool:
        """
        Filters the message for keywords related to store/clothing topics, including dialogue control.
        """
        words = word_tokenize(text.lower(), language='english')
        for category, keywords in self.allowed_categories.items():
            if any(word in words for word in keywords):
                return True
        return False

    def is_farewell(self, text: str) -> bool:
        """Checks if the user's message is a farewell."""
        words = word_tokenize(text.lower(), language='english')
        farewell_keywords = self.allowed_categories["dialogue_control"]
        return any(word in words for word in farewell_keywords)

    def filter_sentiment(self, text: str) -> bool:
        """
        Filters the response for negative sentiment using an English model.
        """
        if not self.sentiment_analyzer:
            return True # If sentiment model failed to load, don't filter

        result = self.sentiment_analyzer(text)[0]
        label = result["label"]
        score = result["score"]
        
        if label == "NEGATIVE" and score > 0.9:
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
        
        # Limit history to the last few conversations
        if len(self.chat_histories[session_id]) >= 8: # 4 (user, bot) pairs
            self.chat_histories[session_id] = self.chat_histories[session_id][-8:]
        self.chat_histories[session_id].append({"role": role, "content": content})

    async def generate_response(self, message: str, session_id: str) -> str:
        """Main logic for generating responses."""
        self.add_to_chat_history(session_id, "User", message)
        current_history = self.get_chat_history(session_id)

        # Prompt formatting for conversational models (DialoGPT)
        dialog_prompt = ""
        for entry in current_history:
            dialog_prompt += f"{entry['role']}: {entry['content']}\n"
        dialog_prompt += "Bot:"

        try:
            result_list = self.generator(
                dialog_prompt,
                max_new_tokens=150,
                do_sample=True,
                temperature=0.7,
                no_repeat_ngram_size=3
            )
            generated_text = result_list[0]["generated_text"].strip()

            answer = generated_text.split("Bot:")[-1].strip()

            # Clean up potential artifacts
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

    # Check if it's the first message in the session to provide an opening
    is_first_message = len(chatbot_instance.get_chat_history(session_id)) == 0
    if is_first_message:
        # Provide a random opening if it's the very first message
        # This will be overridden if the topic is out of scope.
        initial_response = random.choice(chatbot_instance.conversation_openings)
        # Add to history to avoid repeating for the same first message
        chatbot_instance.add_to_chat_history(session_id, "Bot", initial_response)
        # You might want to return this first, then process the user's actual query
        # For simplicity, we'll process the query and add the opening to history if relevant
        # or return it directly if the topic is out of scope.

    # Check for farewell intent
    if chatbot_instance.is_farewell(message):
        response_text = random.choice(chatbot_instance.conversation_closings)
        chatbot_instance.add_to_chat_history(session_id, "Bot", response_text)
        # Immediately return closing and optionally clear history to signify end of conversation
        del chatbot_instance.chat_histories[session_id] # Clear history for next conversation
        return {"response": response_text}

    # If not a farewell and not an initial greeting, proceed with topic filtering
    if not chatbot_instance.filter_topic(message):
        response_text = "I can help you with questions about clothes, fashion, or shopping! Please keep our conversation focused on those topics."
        # If it's the first message and out of topic, the initial opening is not appropriate.
        # So we override it with the topic-out-of-scope message.
        if is_first_message:
             # Remove the initial opening from history if it was just added and user is off-topic
             if chatbot_instance.get_chat_history(session_id) and chatbot_instance.get_chat_history(session_id)[-1]["role"] == "Bot":
                 chatbot_instance.get_chat_history(session_id).pop()
             chatbot_instance.add_to_chat_history(session_id, "Bot", response_text)
        return {"response": response_text}

    # If everything is fine, generate a response
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