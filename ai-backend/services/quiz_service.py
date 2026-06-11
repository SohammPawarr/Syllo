"""Quiz generation service using Google Gemini with structured JSON output."""

import json
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
    """Build the system instructions for Groq."""
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
    client = get_groq_client()
    system_prompt = build_quiz_prompt(context, topic, difficulty, question_count)

    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": "Generate the quiz now."}
        ],
        response_format={"type": "json_object"},
        temperature=0.3,
    )

    quiz_data = json.loads(response.choices[0].message.content)
    quiz_data["quiz_title"] = f"{topic} Quiz"

    # Send to Google Apps Script to generate the form
    if settings.GOOGLE_APPS_SCRIPT_URL:
        import requests
        try:
            # Apps Script requires following redirects for POST
            gas_res = requests.post(
                settings.GOOGLE_APPS_SCRIPT_URL,
                json=quiz_data,
                headers={"Content-Type": "application/json"},
                allow_redirects=True,
                timeout=30
            )
            if gas_res.status_code == 200:
                gas_data = gas_res.json()
                if gas_data.get("status") == "success":
                    quiz_data["google_form_url"] = gas_data.get("publishedUrl")
                    quiz_data["google_form_edit_url"] = gas_data.get("editUrl")
        except Exception as e:
            print(f"Failed to generate Google Form: {e}")

    return quiz_data
