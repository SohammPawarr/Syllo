"""Knowledge Graph generation service using Google Gemini with structured JSON output."""

import json
# pyrefly: ignore [missing-import]
import google.generativeai as genai
from config import settings

# Configure Gemini on module load
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)


def build_graph_prompt(
    context: str,
    topic: str,
) -> str:
    """Build the generation prompt for Gemini."""
    return f"""You are an expert system that extracts entities and their relationships to form a knowledge graph.
Analyze the provided context material and extract a knowledge graph focused on the topic.

PARAMETERS:
- Topic Focus: {topic}

CONTEXT MATERIAL:
\"\"\"
{context}
\"\"\"

RULES:
1. Extract the most important concepts/entities as nodes.
2. Extract the relationships between them as edges.
3. Return ONLY valid JSON matching this structure suitable for React Flow/Cytoscape:
{{
  "nodes": [
    {{
      "id": "node_id_1",
      "label": "Entity Name",
      "type": "concept"
    }}
  ],
  "edges": [
    {{
      "source": "node_id_1",
      "target": "node_id_2",
      "label": "Relationship Description"
    }}
  ]
}}"""


def generate_knowledge_graph(
    context: str,
    topic: str,
) -> dict:
    """
    Call Gemini to generate a structured knowledge graph from the given context.
    Returns parsed JSON dict.
    """
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is not configured")

    model = genai.GenerativeModel(settings.GEMINI_MODEL)

    prompt = build_graph_prompt(context, topic)

    response = model.generate_content(
        prompt,
        generation_config=genai.types.GenerationConfig(
            temperature=0.2,
            response_mime_type="application/json",
        ),
    )

    return json.loads(response.text)
