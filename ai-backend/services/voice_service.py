import os
import uuid
import asyncio
from config import settings
from .groq_client import get_groq_client

async def generate_voice_summary(context: str, topic: str, language: str) -> str:
    """
    Generates a voice summary by creating a script with Groq and converting to audio with gTTS.
    Returns the public URL of the generated audio.
    """
    from gtts import gTTS
    
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

    # 2. Convert text to speech using gTTS
    lang_code = "hi" if language == "Hindi" else "en"
    filename = f"audio_{uuid.uuid4().hex}.mp3"
    filepath = os.path.join("outputs", filename)

    # gTTS is blocking, so run it in a thread to not block the FastAPI event loop
    def save_audio():
        tts = gTTS(text=script_text, lang=lang_code, slow=False)
        tts.save(filepath)

    await asyncio.to_thread(save_audio)

    # Return the URL to access this file via the FastAPI static mount
    return f"{settings.NEXT_PUBLIC_AI_BACKEND_URL}/outputs/{filename}"
