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
        ids = []
        documents = []
        embeddings = []
        metadatas = []

        for i, chunk in enumerate(chunks):
            chunk_id = f"{workspace_id}-{uuid4()}-{i}"
            ids.append(chunk_id)
            documents.append(chunk)
            embeddings.append(embed_text(chunk))
            metadatas.append({
                "workspace_id": workspace_id,
                "filename": filename,
                "chunk_id": chunk_id
            })

        # Add all chunks at once
        collection.add(
            ids=ids,
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas
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

        results = collection.query(
            query_embeddings=[
                embed_text(query)
            ],
            n_results=top_k,
            where={
                "workspace_id": workspace_id
            },
            include=["documents", "distances", "metadatas"]
        )

        return results

    @staticmethod
    def retrieve_context(
        query: str,
        workspace_id: int,
        search_query: str = None,
        top_k: int = 4
    ):
        actual_query = search_query if search_query is not None else query
        
        results = RAGService.search(actual_query, workspace_id, top_k)

        documents = results.get("documents", [[]])[0]
        distances = results.get("distances", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]
        
        context = "\n\n".join(documents)
        
        print("QUESTION:", query)
        print("SEARCH QUERY:", actual_query)
        print("CONTEXT:", context)

        return context
