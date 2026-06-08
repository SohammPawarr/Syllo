"""MongoDB connection and helper functions."""

# pyrefly: ignore [missing-import]
from pymongo import MongoClient
# pyrefly: ignore [missing-import]
from pymongo.database import Database
# pyrefly: ignore [missing-import]
from bson import ObjectId
import certifi
from config import settings

_client: MongoClient | None = None


def get_db() -> Database:
    """Return a cached MongoDB database handle."""
    global _client
    if _client is None:
        _client = MongoClient(settings.MONGODB_URI, tlsCAFile=certifi.where())
    return _client[settings.MONGODB_DB_NAME]


# ---------------------------------------------------------------------------
# Document helpers
# ---------------------------------------------------------------------------

def update_document_status(document_id: str, status: str) -> None:
    """Update the processingStatus field of a document."""
    db = get_db()
    # Try ObjectId first, fall back to string match
    try:
        filter_id = ObjectId(document_id)
    except Exception:
        filter_id = document_id
    db.documents.update_one(
        {"_id": filter_id},
        {"$set": {"processingStatus": status}},
    )


def get_document(document_id: str) -> dict | None:
    """Fetch a single document by ID."""
    db = get_db()
    try:
        filter_id = ObjectId(document_id)
    except Exception:
        filter_id = document_id
    return db.documents.find_one({"_id": filter_id})


def insert_chunks(chunks: list[dict]) -> None:
    """Bulk-insert document chunks with embeddings."""
    if not chunks:
        return
    db = get_db()
    db.documentchunks.insert_many(chunks)


def get_chunks_for_document(document_id: str, limit: int = 20) -> list[dict]:
    """Retrieve stored chunks for a given document."""
    db = get_db()
    return list(
        db.documentchunks.find({"documentId": document_id}).limit(limit)
    )


def save_quiz(quiz_data: dict) -> str:
    """Persist a generated quiz and return its inserted ID."""
    db = get_db()
    result = db.quizzes.insert_one(quiz_data)
    return str(result.inserted_id)
