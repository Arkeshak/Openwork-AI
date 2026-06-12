from typing import List

from sentence_transformers import SentenceTransformer

model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


def embed_text(text: str) -> List[float]:
    return model.encode(text).tolist()
