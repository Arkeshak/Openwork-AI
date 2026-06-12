from sentence_transformers import SentenceTransformer

print("Loading model...")

model = SentenceTransformer("all-MiniLM-L6-v2")

print("Model loaded successfully!")

embedding = model.encode("Hello OpenWork AI")

print(f"Embedding dimension: {len(embedding)}")
