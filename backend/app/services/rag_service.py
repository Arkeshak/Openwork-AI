from typing import Any, Optional, cast

from app.rag.chunker import chunk_text
from app.rag.embedder import embed_text
from app.rag.vector_store import get_collection
from uuid import uuid4


class RAGService:

    @staticmethod
    def ingest_text(
        text: str,
        workspace_id: int,
        filename: str = "unknown"
    ):

        collection = get_collection()

        chunks = chunk_text(text)
        if not chunks:
            print("RAGService: No chunks generated from text.")
            return {"chunks": 0}

        print(f"RAGService: Ingesting {len(chunks)} chunks for {filename} (workspace {workspace_id})")

        # Batch operations
        ids: list[str] = []
        documents: list[str] = []
        embeddings: list[list[float]] = []
        metadatas: list[dict[str, str | int | float | bool | None]] = []

        for i, chunk in enumerate(chunks):
            chunk_id = f"{workspace_id}-{uuid4()}-{i}"
            ids.append(chunk_id)
            documents.append(chunk)
            embeddings.append(embed_text(chunk))
            metadatas.append({
                "workspace_id": workspace_id,
                "filename": filename,
                "chunk_id": chunk_id,
            })

        # Add all chunks at once
        collection.add(
            ids=ids,
            documents=documents,
            embeddings=cast(Any, embeddings),
            metadatas=cast(Any, metadatas),
        )

        print(f"RAGService: Successfully ingested {len(chunks)} chunks into ChromaDB.")

        return {
            "chunks": len(chunks)
        }

    @staticmethod
    def search(
        query: str,
        workspace_id: int,
        top_k: int = 4
    ):
        collection = get_collection()
        query_embedding = embed_text(query)

        # Try with workspace_id filter first (works when all metadata is set)
        try:
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k,
                where={"workspace_id": workspace_id},
                include=["documents", "distances", "metadatas"]
            )
            # Verify we actually got results
            docs = results.get("documents") or [[]]
            if docs[0]:
                return results
        except Exception as e:
            print(f"RAGService: filtered search error: {e}")

        # Fallback: fetch more results and post-filter by workspace_id
        try:
            total = collection.count()
            fetch_k = min(total, max(top_k * 10, 50))
            results = collection.query(
                query_embeddings=[query_embedding],
                n_results=fetch_k,
                include=["documents", "distances", "metadatas"]
            )
            docs = results.get("documents", [[]])[0] or []
            dists = results.get("distances", [[]])[0] or []
            metas = results.get("metadatas", [[]])[0] or []

            filtered_docs, filtered_dists, filtered_metas = [], [], []
            for d, dist, m in zip(docs, dists, metas):
                if m and m.get("workspace_id") == workspace_id:
                    filtered_docs.append(d)
                    filtered_dists.append(dist)
                    filtered_metas.append(m)
                    if len(filtered_docs) >= top_k:
                        break

            return {
                "documents": [filtered_docs],
                "distances": [filtered_dists],
                "metadatas": [filtered_metas],
            }
        except Exception as e:
            print(f"RAGService: fallback search error: {e}")
            return {"documents": [[]], "distances": [[]], "metadatas": [[]]}

    @staticmethod
    def retrieve_context(
        query: str,
        workspace_id: int,
        search_query: Optional[str] = None,
        top_k: int = 4
    ):
        actual_query = search_query if search_query is not None else query
        
        results = RAGService.search(actual_query, workspace_id, top_k)

        if not results:
            return ""

        documents = (results.get("documents") or [[]])[0]
        distances = (results.get("distances") or [[]])[0]
        metadatas = (results.get("metadatas") or [[]])[0]
        
        context = "\n\n".join(documents)
        
        print("QUESTION:", query)
        print("SEARCH QUERY:", actual_query)
        print("CONTEXT:", context)

        return context
