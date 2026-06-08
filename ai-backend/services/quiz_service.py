"""Quiz generation service using Google Gemini with structured JSON output."""

import json
# pyrefly: ignore [missing-import]
import google.generativeai as genai
from config import settings

# Configure Gemini on module load
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)


# ---------------------------------------------------------------------------
# JSON Schema for structured quiz output
# ---------------------------------------------------------------------------

QUIZ_SCHEMA = {
    "type": "object",
    "properties": {
        "quiz_title": {"type": "string"},
        "questions": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "question": {"type": "string"},
                    "options": {
                        "type": "array",
                        "items": {"type": "string"},
                    },
                    "correct_answer_index": {"type": "integer"},
                    "explanation": {"type": "string"},
                },
                "required": [
                    "question",
                    "options",
                    "correct_answer_index",
                    "explanation",
                ],
            },
        },
    },
    "required": ["quiz_title", "questions"],
}


def build_quiz_prompt(
    context: str,
    topic: str,
    difficulty: str,
    question_count: int,
) -> str:
    """Build the generation prompt for Gemini."""
    return f"""You are an expert university professor. Generate a quiz based ONLY on the provided context material.

PARAMETERS:
- Topic Focus: {topic}
- Difficulty: {difficulty}
- Total Questions: {question_count}

CONTEXT MATERIAL:
\"\"\"
{context}
\"\"\"

RULES:
1. Every question MUST be answerable from the context above. Do NOT use outside knowledge.
2. Formulate questions that require critical thinking, not just verbatim recall.
3. Each question must have exactly 4 options (A, B, C, D).
4. Provide the index (0-3) of the correct answer.
5. Write a 1-2 sentence explanation for why the correct answer is right.
6. Return ONLY valid JSON matching this structure:
{{
  "quiz_title": "...",
  "questions": [
    {{
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correct_answer_index": 0,
      "explanation": "..."
    }}
  ]
}}"""


def generate_quiz(
    context: str,
    topic: str,
    difficulty: str = "Intermediate",
    question_count: int = 5,
) -> dict:
    """
    Call Gemini to generate a structured quiz from the given context.
    Returns parsed JSON dict.
    """
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not configured")

    model = genai.GenerativeModel(settings.GEMINI_MODEL)

    prompt = build_quiz_prompt(context, topic, difficulty, question_count)

    response = model.generate_content(
        prompt,
        generation_config=genai.types.GenerationConfig(
            temperature=0.3,
            response_mime_type="application/json",
        ),
    )

    return json.loads(response.text)
