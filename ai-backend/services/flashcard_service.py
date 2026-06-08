"""Flashcard generation service using Google Gemini with structured JSON output."""

import json
# pyrefly: ignore [missing-import]
import google.generativeai as genai
from config import settings

# Configure Gemini on module load
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)


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
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not configured")

    model = genai.GenerativeModel(settings.GEMINI_MODEL)

    prompt = build_flashcard_prompt(context, topic, count)

    response = model.generate_content(
        prompt,
        generation_config=genai.types.GenerationConfig(
            temperature=0.3,
            response_mime_type="application/json",
        ),
    )

    return json.loads(response.text)
