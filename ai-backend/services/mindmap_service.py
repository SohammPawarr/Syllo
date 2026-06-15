import json
from config import settings
from .groq_client import get_groq_client

def generate_mindmap_data(context: str, topic: str) -> dict:
    """
    Given a document context, extracts a mind map representation as JSON.
    Expected format:
    {
      "nodes": [ {"id": "1", "data": {"label": "Topic"}}, ... ],
      "edges": [ {"id": "e1-2", "source": "1", "target": "2"}, ... ]
    }
    """
    prompt = f"""You are an expert at distilling complex documents into hierarchical mind maps.
Based on the provided document context and the topic, extract a mind map structure.
The structure MUST be returned in raw JSON format with absolutely no markdown wrapping, backticks, or extra text.

Format:
{{
  "nodes": [
    {{ "id": "1", "data": {{ "label": "Root Topic" }} }},
    {{ "id": "2", "data": {{ "label": "Subtopic A" }} }}
  ],
  "edges": [
    {{ "id": "e1-2", "source": "1", "target": "2" }}
  ]
}}

Keep labels concise (1-3 words). Limit to 10-15 nodes total.

Topic: {topic}

Document Context:
{context}
"""

    client = get_groq_client()
    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
    )
    
    content = response.choices[0].message.content.strip()
    
    # In case the model still returns markdown ticks, clean them up
    if content.startswith("```json"):
        content = content[7:]
    if content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]
        
    content = content.strip()
    
    try:
        data = json.loads(content)
        return data
    except Exception as e:
        # Fallback empty graph on parse error
        return {"nodes": [{"id": "1", "data": {"label": "Parse Error"}}], "edges": []}
