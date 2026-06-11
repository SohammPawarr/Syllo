"""Service for generating detailed image prompts using Gemini."""

# pyrefly: ignore [missing-import]
from groq import Groq
from config import settings
import urllib.parse

# Initialize Groq client lazy loading
_client = None

def get_groq_client():
    global _client
    if _client is None:
        if not settings.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is not configured")
        _client = Groq(api_key=settings.GROQ_API_KEY)
    return _client

def generate_image_url(context: str, topic: str) -> str:
    """
    Given document context and a topic, asks Gemini to write a highly detailed
    visual prompt, then formats it into a Pollinations.ai URL.
    """
    prompt = f"""You are an expert AI image prompt engineer. 
Your task is to create a highly detailed, descriptive, and visually striking prompt for an image generation model based on the following topic and document context.

Topic: {topic}

Document Context:
{context}

Requirements for the prompt:
1. Describe the scene, subject, lighting, style, and mood in vivid detail.
2. The style should be high-quality, professional, and fitting for the topic (e.g., photorealistic, 3D render, technical illustration, cinematic).
3. Do NOT include any introductory or concluding text (e.g. "Here is the prompt:").
4. Output ONLY the raw prompt text itself.
"""

    client = get_groq_client()

    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
    )
    image_prompt = response.choices[0].message.content.strip()
    
    import random
    seed = random.randint(1, 1000000)
    
    # URL encode the prompt for Pollinations
    encoded_prompt = urllib.parse.quote(image_prompt)
    
    # Construct the final URL using the updated Pollinations API
    url = f"https://pollinations.ai/p/{encoded_prompt}?width=1024&height=1024&nologo=true&seed={seed}"
    return url
