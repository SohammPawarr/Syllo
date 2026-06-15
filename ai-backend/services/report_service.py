import os
import uuid
from config import settings
from .groq_client import get_groq_client
from fpdf import FPDF

def generate_pdf_report(context: str, topic: str, format_type: str) -> str:
    """
    Generates a PDF report based on the requested format type.
    """
    if format_type == "Briefing Doc":
        prompt_instruction = "Create a Briefing Document providing an overview of the sources featuring key insights and quotes."
    elif format_type == "Study Guide":
        prompt_instruction = "Create a Study Guide containing a short-answer quiz, suggested essay questions, and a glossary of key terms."
    else:
        prompt_instruction = "Create a Blog Post distilling insightful takeaways into a highly readable article."

    prompt = f"""You are an expert content creator. {prompt_instruction}
Format the output as clean plain text with clear section headers. Do NOT use markdown symbols like **, ##, etc.
Just use capital letters for headers and clear spacing. 

Topic: {topic}

Document Context:
{context}
"""

    client = get_groq_client()
    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.7,
    )
    report_text = response.choices[0].message.content.strip()

    # Generate PDF using fpdf2
    pdf = FPDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)
    
    # Title
    pdf.set_font("Helvetica", "B", 16)
    pdf.cell(0, 10, f"{format_type}: {topic}", ln=True, align="C")
    pdf.ln(10)
    
    # Body
    pdf.set_font("Helvetica", "", 11)
    
    # Handle UTF-8 encoding by replacing unsupported characters
    safe_text = report_text.encode('latin-1', 'replace').decode('latin-1')
    
    pdf.multi_cell(0, 6, safe_text)
    
    filename = f"report_{uuid.uuid4().hex}.pdf"
    filepath = os.path.join("outputs", filename)
    pdf.output(filepath)

    return f"{settings.NEXT_PUBLIC_AI_BACKEND_URL}/outputs/{filename}"
