"""Service for handling document chat using Gemini."""

# pyrefly: ignore [missing-import]
# pyrefly: ignore [missing-import]
import google.generativeai as genai
from config import settings

genai.configure(api_key=settings.GEMINI_API_KEY)

# Use the pro model for better reasoning in chat
model = genai.GenerativeModel("gemini-1.5-pro")

def generate_chat_response(context: str, messages: list[dict]) -> str:
    """
    Takes a list of messages (history + current message) and document context.
    Returns the AI's next response.
    """
    if not messages:
        raise ValueError("Message history cannot be empty.")

    # The last message is the current query
    current_message = messages[-1]["content"]
    
    # We construct a system instruction implicitly by injecting the context 
    # into the first message or framing the current message.
    # To keep it simple and robust, we inject the context into the current prompt
    # and use Gemini's standard generate_content with the history.

    history = []
    for msg in messages[:-1]:
        # Convert "user" or "assistant" (or "model") to Gemini's expected roles ("user" or "model")
        role = "model" if msg["role"] in ["assistant", "model"] else "user"
        history.append({
            "role": role,
            "parts": [msg["content"]]
        })

    # Initialize chat session with history
    chat = model.start_chat(history=history)

    # Frame the new message with context
    prompt = f"""You are a helpful AI assistant answering questions about a specific document.
Use the following relevant context extracted from the document to answer the user's question accurately.
If the answer is not contained within the context, you can use your general knowledge but mention that it's not explicitly stated in the document.

--- Document Context ---
{context}
---

User Question: {current_message}
"""
    
    response = chat.send_message(prompt)
    return response.text
