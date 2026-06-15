"""Service for generating document summaries using Gemini."""

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

def generate_summary(context: str, topic: str, length: str) -> str:
    """
    Given document context and a length parameter (short, medium, in-depth), 
    generates a summary using Groq.
    """
    
    length_instructions = {
        "short": "Provide a concise 2-3 sentence overview of the most critical points.",
        "medium": "Provide a structured summary of about 2-3 paragraphs highlighting the main ideas and key takeaways.",
        "in-depth": "Provide a comprehensive, highly detailed summary. Use bullet points for key arguments, outline major sections, and explain the underlying concepts thoroughly."
    }
    
    instruction = length_instructions.get(length, length_instructions["medium"])

    prompt = f"""You are an expert AI summarization assistant.
Your task is to generate a summary based ONLY on the provided context material.

PARAMETERS:
- Focus Topic: {topic}
- Length/Detail requirement: {instruction}

CONTEXT MATERIAL:
\"\"\"
{context}
\"\"\"

RULES:
1. Do NOT hallucinate or include outside information.
2. Format the output elegantly using Markdown (bolding, bullet points if appropriate).
3. Do not include phrases like "Here is the summary", just provide the summary directly.
"""

    client = get_groq_client()

    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
    )
    
    return response.choices[0].message.content.strip()
