import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def get_token():
    print("Logging in...")
    # Register first just in case
    requests.post(f"{BASE_URL}/auth/register", json={"username": "testuser", "email": "test@test.com", "password": "password"})
    res = requests.post(f"{BASE_URL}/auth/login", json={"email": "test@test.com", "password": "password"})
    return res.json()["access_token"]

def test_rag():
    token = get_token()
    headers = {"Authorization": f"Bearer {token}"}

    print("Creating workspace...")
    ws_name = f"Debug RAG Test {int(time.time())}"
    ws_res = requests.post(f"{BASE_URL}/workspaces", json={"name": ws_name}, headers=headers)
    ws_id = ws_res.json()["id"]

    print(f"Uploading file to workspace {ws_id}...")
    doc_content = "The fictitious Blorbos language was invented in 2042 by Dr. Aris Thorne. It features 17 distinct clicking consonants and a base-12 counting system. The primary greeting in Blorbos translates to 'May your water be cool'."
    
    with open("blorbos.txt", "w") as f:
        f.write(doc_content)
        
    with open("blorbos.txt", "rb") as f:
        files = {"file": ("blorbos.txt", f, "text/plain")}
        up_res = requests.post(f"{BASE_URL}/workspaces/{ws_id}/documents", headers=headers, files=files)
        print("Upload result:", up_res.json())

    # Give ChromaDB a second to sync
    time.sleep(2)

    print("Testing /rag/debug endpoint...")
    q_payload = {
        "workspace_id": ws_id,
        "question": "Who invented the Blorbos language and when?"
    }
    
    rag_res = requests.post(f"{BASE_URL}/rag/debug", headers=headers, json=q_payload)
    data = rag_res.json()
    
    print("\n========== DEBUG OUTPUT ==========")
    print("QUESTION:", data.get("question"))
    print("\nRETRIEVED CHUNKS:")
    for c in data.get("retrieved_chunks", []):
        print(f" - Score: {c['score']}")
        metadata = c.get('metadata') or {}
        print(f" - File: {metadata.get('filename', 'unknown')}")
        print(f" - Text: {c['text'][:100]}...")
    
    print("\nFINAL ANSWER:")
    print(data.get("answer"))

if __name__ == "__main__":
    test_rag()
