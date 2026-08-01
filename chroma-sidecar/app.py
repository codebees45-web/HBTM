"""
AETHER ChromaDB sidecar
=======================

A tiny FastAPI service that wraps a persistent ChromaDB instance. The Node
backend (server/chroma/chromaClient.js) talks to this over plain HTTP instead
of embedding Chroma in-process, since Chroma's first-class client is Python.

Used by:
  - Gap Analysis Agent: semantic search over the resource library per named gap
  - seed script (server/seed/seedResources.js -> this service's /upsert) to
    populate the resource library once, up front

Run it:
    pip install -r requirements.txt
    uvicorn app:app --host 0.0.0.0 --port 8000

Data persists to ./chroma_data (created automatically) so re-seeding isn't
needed on every restart.
"""

from typing import Any, Dict, List, Optional

import chromadb
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="AETHER Chroma Sidecar")

# Persistent local client — this IS the "local, embeddable" ChromaDB the doc
# calls for; it's just fronted by HTTP so a Node process can reach it.
client = chromadb.PersistentClient(path="./chroma_data")


class UpsertRequest(BaseModel):
    ids: List[str]
    documents: List[str]
    metadatas: List[Dict[str, Any]]


class QueryRequest(BaseModel):
    query_text: str
    n_results: int = 5
    where: Optional[Dict[str, Any]] = None


def get_collection(name: str):
    return client.get_or_create_collection(name)


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/collections/{name}/upsert")
def upsert(name: str, body: UpsertRequest):
    if not (len(body.ids) == len(body.documents) == len(body.metadatas)):
        raise HTTPException(400, "ids, documents, and metadatas must be the same length")
    collection = get_collection(name)
    collection.upsert(ids=body.ids, documents=body.documents, metadatas=body.metadatas)
    return {"upserted": len(body.ids)}


@app.post("/collections/{name}/query")
def query(name: str, body: QueryRequest):
    collection = get_collection(name)
    if collection.count() == 0:
        return {"results": []}

    result = collection.query(
        query_texts=[body.query_text],
        n_results=min(body.n_results, collection.count()),
        where=body.where or None,
    )

    results = []
    ids = result.get("ids", [[]])[0]
    documents = result.get("documents", [[]])[0]
    metadatas = result.get("metadatas", [[]])[0]
    distances = result.get("distances", [[]])[0]
    for i in range(len(ids)):
        results.append(
            {
                "id": ids[i],
                "document": documents[i],
                "metadata": metadatas[i],
                "distance": distances[i],
            }
        )
    return {"results": results}


@app.delete("/collections/{name}")
def reset_collection(name: str):
    """Dev convenience — drops a collection so the seed script can be re-run cleanly."""
    client.delete_collection(name)
    return {"deleted": name}