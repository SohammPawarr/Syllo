import asyncio
from services.voice_service import generate_voice_summary

async def main():
    try:
        url = await generate_voice_summary("Test context about ajax", "Ajax architecture", "English")
        print("Success:", url)
    except Exception as e:
        print("Error:", repr(e))

asyncio.run(main())
