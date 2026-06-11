"""Service for handling document chat using Gemini."""

# pyrefly: ignore [missing-import]
from groq import Groq
from config import settings

# Initialize Groq client lazy loading
_client = None

def get_groq_client():
    global _client
    if _client is None:
        if not settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is not configured")
        _client = Groq(api_key=settings.GROQ_API_KEY)
    return _client

def generate_chat_response(context: str, messages: list[dict]) -> str:
    """
    Takes a list of messages (history + current message) and document context.
    Returns the AI's next response.
    """
    if not messages:
        raise ValueError("Message history cannot be empty.")

    # The last message is the current query
    current_message = messages[-1]["content"]
    
    client = get_groq_client()
    
    # Construct the system message incorporating the document context
    system_prompt = f"""You are a helpful AI assistant answering questions about a specific document.
Use the following relevant context extracted from the document to answer the user's question accurately.
If the answer is not contained within the context, you can use your general knowledge but mention that it's not explicitly stated in the document.

--- Document Context ---
{context}
---"""

    # Format history for Groq
    formatted_messages = [
        {"role": "system", "content": system_prompt}
    ]
    
    for msg in messages[:-1]:
        # Convert roles (e.g., 'model' to 'assistant')
        role = "assistant" if msg["role"] in ["assistant", "model"] else "user"
        formatted_messages.append({"role": role, "content": msg["content"]})
        
    # Append the current query
    formatted_messages.append({"role": "user", "content": current_message})

    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=formatted_messages,
        temperature=0.3,
    )
    
    return response.choices[0].message.content
