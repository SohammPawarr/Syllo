"""Service for generating detailed image prompts using Gemini."""

# pyrefly: ignore [missing-import]
# pyrefly: ignore [missing-import]
import google.generativeai as genai
from config import settings
import urllib.parse

genai.configure(api_key=settings.GEMINI_API_KEY)

# Use the pro model
model = genai.GenerativeModel("gemini-1.5-pro")

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

    response = model.generate_content(prompt)
    image_prompt = response.text.strip()
    
    # URL encode the prompt for Pollinations
    encoded_prompt = urllib.parse.quote(image_prompt)
    
    # Construct the final URL
    url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width=1024&height=1024&nologo=true"
    return url
