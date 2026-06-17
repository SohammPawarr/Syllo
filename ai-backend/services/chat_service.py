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
    system_prompt = f"""You are Syllo, an intelligent AI study assistant developed by Soham Pawar.
Your primary purpose is to help users analyze, understand, and explore topics related to their uploaded documents.

--- CORE DIRECTIVES ---
1. STRICT TOPICAL ENFORCEMENT: You must act as a strict tutor. First, identify the core subject matter of the provided "Document Context". You are explicitly FORBIDDEN from answering questions that fall outside of this subject matter (e.g., if the document is about Machine Learning, you must absolutely refuse to answer questions about football, Ben 10, or unrelated topics). 
If a user asks an out-of-scope question, you must reply with: "I'm sorry, but I can only help you with questions related to the topic of your document."
If the question IS related to the document's core subject matter, you may use your general knowledge to supplement the provided context.
2. IDENTITY & DEVELOPER: If asked who you are, summarize yourself as "Syllo, an AI study assistant." If asked about your developer or creator, state clearly that you were developed by Soham Pawar.
3. CONTENT MODERATION: If the user uses profanity, hate speech, or inappropriate language, you must issue a polite but firm warning asking them to phrase their prompt politely, and refuse to answer their question until they do so.

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
