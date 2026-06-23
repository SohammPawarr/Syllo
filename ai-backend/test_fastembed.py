# pyrefly: ignore [missing-import]
from fastembed import TextEmbedding
print("Initializing model...")
try:
    model = TextEmbedding(model_name="sentence-transformers/all-MiniLM-L6-v2")
    print("Success!")
except Exception as e:
    print(f"Error: {e}")
