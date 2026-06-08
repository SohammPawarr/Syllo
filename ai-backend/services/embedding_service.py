"""Vector embedding generation service."""

# pyrefly: ignore [missing-import]
from sentence_transformers import SentenceTransformer
from config import settings

# Lazy-loaded singleton so the model is only downloaded once
_model: SentenceTransformer | None = None


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer(settings.EMBEDDING_MODEL)
    return _model


def generate_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Generate 384-dimensional embeddings for a list of text strings.
    Uses all-MiniLM-L6-v2 by default.
    """
    model = _get_model()
    embeddings = model.encode(texts, show_progress_bar=False)
    return [emb.tolist() for emb in embeddings]


def generate_single_embedding(text: str) -> list[float]:
    """Generate an embedding for a single text string."""
    return generate_embeddings([text])[0]
