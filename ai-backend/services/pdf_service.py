"""PDF extraction and text chunking service."""

import io
import requests
import fitz  # PyMuPDF
# pyrefly: ignore [missing-import]
from langchain_text_splitters import RecursiveCharacterTextSplitter
from config import settings


def extract_text_from_pdf(file_path_or_url: str) -> str:
    """
    Extract all text from a PDF using PyMuPDF (fitz).
    Accepts a local file path or a remote URL.
    """
    if file_path_or_url.startswith(("http://", "https://")):
        response = requests.get(file_path_or_url, timeout=60)
        response.raise_for_status()
        pdf_bytes = response.content
    else:
        with open(file_path_or_url, "rb") as f:
            pdf_bytes = f.read()

    doc = fitz.open(stream=pdf_bytes, filetype="pdf")
    pages_text: list[str] = []
    for page in doc:
        text = page.get_text()
        if text:
            pages_text.append(text.strip())

    return "\n\n".join(pages_text)


def chunk_text(raw_text: str) -> list[dict]:
    """
    Split raw text into overlapping chunks using LangChain's
    RecursiveCharacterTextSplitter.

    Returns a list of dicts: [{"index": int, "text": str}, ...]
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    texts = splitter.split_text(raw_text)
    return [{"index": i, "text": t} for i, t in enumerate(texts)]
