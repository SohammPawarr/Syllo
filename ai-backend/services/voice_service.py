import os
import uuid
from config import settings
from .groq_client import get_groq_client

async def generate_voice_summary(context: str, topic: str, language: str) -> str:
    """
    Generates a voice summary by creating a script with Groq and converting to audio with edge-tts.
    Returns the public URL of the generated audio.
    """
    import edge_tts
    
    # 1. Generate the script using Groq
    lang_instruction = "Hindi" if language == "Hindi" else "English"
    prompt = f"""You are a professional podcast host. Create a very engaging, conversational script summarizing the following topic based on the document context.
The script will be read aloud by an AI voice, so make it sound natural, dynamic, and easy to listen to.
Do not include any sound effects, speaker labels, or markdown formatting. Just write the raw text that should be spoken.

Topic: {topic}
Language: {lang_instruction}

Document Context:
{context}
"""

    client = get_groq_client()
    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )
    script_text = response.choices[0].message.content.strip()

    # 2. Convert text to speech using edge-tts
    voice = "hi-IN-MadhurNeural" if language == "Hindi" else "en-US-ChristopherNeural"
    filename = f"audio_{uuid.uuid4().hex}.mp3"
    filepath = os.path.join("outputs", filename)

    communicate = edge_tts.Communicate(script_text, voice)
    await communicate.save(filepath)

    # Return the URL to access this file via the FastAPI static mount
    return f"{settings.NEXT_PUBLIC_AI_BACKEND_URL}/outputs/{filename}"
