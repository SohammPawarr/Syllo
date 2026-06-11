"""Flashcard generation service using Google Gemini with structured JSON output."""

import json
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


def build_flashcard_prompt(
    context: str,
    topic: str,
    count: int,
) -> str:
    """Build the generation prompt for Gemini."""
    return f"""You are an expert tutor. Generate flashcards based ONLY on the provided context material.

PARAMETERS:
- Topic Focus: {topic}
- Total Flashcards: {count}

CONTEXT MATERIAL:
\"\"\"
{context}
\"\"\"

RULES:
1. Every flashcard MUST be derived from the context above.
2. Keep the front concise (a question or concept).
3. Keep the back explanatory but brief.
4. Return ONLY valid JSON matching this structure:
{{
  "title": "...",
  "flashcards": [
    {{
      "front": "...",
      "back": "..."
    }}
  ]
}}"""


def generate_flashcards(
    context: str,
    topic: str,
    count: int = 10,
) -> dict:
    """
    Call Gemini to generate structured flashcards from the given context.
    Returns parsed JSON dict.
    """
    client = get_groq_client()
    system_prompt = build_flashcard_prompt(context, topic, count)

    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "Generate the flashcards now."}
        ],
        response_format={"type": "json_object"},
        temperature=0.3,
    )

    return json.loads(response.choices[0].message.content)
