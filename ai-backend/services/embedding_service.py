"""Vector embedding generation service."""

from fastembed import TextEmbedding
from config import settings

# Lazy-loaded singleton so the model is only downloaded once
_model: TextEmbedding | None = None


def _get_model() -> TextEmbedding:
    global _model
    if _model is None:
        # FastEmbed natively supports the exact same model but via ONNX
        _model = TextEmbedding(model_name=f"sentence-transformers/{settings.EMBEDDING_MODEL}")
    return _model


def generate_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Generate 384-dimensional embeddings for a list of text strings.
    Uses all-MiniLM-L6-v2 by default.
    """
    model = _get_model()
    # FastEmbed returns a generator of numpy arrays
    embeddings_generator = model.embed(texts)
    return [emb.tolist() for emb in embeddings_generator]


def generate_single_embedding(text: str) -> list[float]:
    """Generate an embedding for a single text string."""
    return generate_embeddings([text])[0]
