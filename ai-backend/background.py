"""
Background tasks without Celery for free deployment.
"""
from services.pdf_service import extract_text_from_pdf, chunk_text
from services.embedding_service import generate_embeddings
from database import update_document_status, insert_chunks
import traceback

def process_document_background(document_id: str, file_url: str):
    """
    Full ingestion pipeline: extract → chunk → embed → store.
    Updates progress via MongoDB so the frontend can poll.
    """
    try:
        # Step 1: Extract
        update_document_status(document_id, "EXTRACTING")
        raw_text = extract_text_from_pdf(file_url)

        if not raw_text.strip():
            raise ValueError("The uploaded document appears to be an image or contains no selectable text. Please upload a standard text-based PDF.")

        # Step 2: Chunk
        update_document_status(document_id, "CHUNKING")
        chunks = chunk_text(raw_text)

        # Step 3: Embed
        update_document_status(document_id, "EMBEDDING")
        texts = [c["text"] for c in chunks]
        embeddings = generate_embeddings(texts)

        # Step 4: Store
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

        # Step 5: Mark complete
        update_document_status(document_id, "READY")

    except Exception as e:
        print("====== BACKGROUND TASK FAILED ======")
        traceback.print_exc()
        print("================================")
        update_document_status(document_id, "FAILED")
