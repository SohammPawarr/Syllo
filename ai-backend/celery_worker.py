"""
Celery worker for background document processing.

Pipeline:
  1. Download PDF and extract text
  2. Split text into overlapping chunks
  3. Generate vector embeddings for each chunk
  4. Store chunks + embeddings in MongoDB
  5. Update document status to READY
"""

import os
# pyrefly: ignore [missing-import]
from celery import Celery
from config import settings

celery_app = Celery(
    "syllo_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    task_track_started=True,
    worker_hijack_root_logger=False,
)


@celery_app.task(bind=True, name="process_document")
def process_document_task(self, document_id: str, file_url: str):
    """
    Full ingestion pipeline: extract → chunk → embed → store.
    Updates progress via Celery state so the frontend can poll.
    """
    from services.pdf_service import extract_text_from_pdf, chunk_text
    from services.embedding_service import generate_embeddings
    from database import update_document_status, insert_chunks

    try:
        # ── Step 1: Extract ──────────────────────────────────────────
        self.update_state(state="PROGRESS", meta={"phase": "EXTRACTING"})
        update_document_status(document_id, "EXTRACTING")
        raw_text = extract_text_from_pdf(file_url)

        if not raw_text.strip():
            raise ValueError("PDF produced no extractable text")

        # ── Step 2: Chunk ────────────────────────────────────────────
        self.update_state(state="PROGRESS", meta={"phase": "CHUNKING"})
        update_document_status(document_id, "CHUNKING")
        chunks = chunk_text(raw_text)

        # ── Step 3: Embed ────────────────────────────────────────────
        self.update_state(state="PROGRESS", meta={"phase": "EMBEDDING"})
        update_document_status(document_id, "EMBEDDING")
        texts = [c["text"] for c in chunks]
        embeddings = generate_embeddings(texts)

        # ── Step 4: Store ────────────────────────────────────────────
        chunk_docs = []
        for chunk, embedding in zip(chunks, embeddings):
            chunk_docs.append(
                {
                    "documentId": document_id,
                    "pageNumber": chunk["index"] + 1,
                    "text": chunk["text"],
                    "embedding": embedding,
                }
            )
        insert_chunks(chunk_docs)

        # ── Step 5: Mark complete ────────────────────────────────────
        update_document_status(document_id, "READY")

        return {
            "status": "SUCCESS",
            "document_id": document_id,
            "chunks_created": len(chunk_docs),
        }

    except Exception as e:
        update_document_status(document_id, "FAILED")
        self.update_state(state="FAILURE", meta={"error": str(e)})
        raise
