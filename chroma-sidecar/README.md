# AETHER Chroma Sidecar

A small FastAPI service wrapping ChromaDB, used by the Gap Analysis Agent
(`server/agents/gapAnalysisAgent.js`) for semantic search over the resource
library, and by the Curator Agent indirectly (it ranks whatever this
returns).

Chroma's real client is Python, so this runs as its own process next to the
Node server rather than being embedded in it — `server/chroma/chromaClient.js`
talks to it over plain HTTP.

## Run it

```bash
cd chroma-sidecar
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --host 0.0.0.0 --port 8000
```

Data persists to `./chroma_data` (created automatically), so you don't need
to re-seed on every restart.

## Seed the resource library

Once this is running, from the `server/` folder:

```bash
node seed/seedResources.js
```

That pushes the starter catalog in `server/seed/resources.js` into the
`resources` collection here. See that file's comments for how to add your
own resources.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/health` | liveness check — the Node client uses this to decide whether to degrade gracefully |
| POST | `/collections/{name}/upsert` | `{ ids, documents, metadatas }` — add/update resources |
| POST | `/collections/{name}/query` | `{ query_text, n_results, where }` — semantic search |
| DELETE | `/collections/{name}` | dev convenience — drop a collection to re-seed cleanly |

## Env var on the Node side

`server/.env` needs:

```
CHROMA_SIDECAR_URL=http://localhost:8000
```

If this service isn't running, the Gap Analysis Agent detects that via
`/health` and degrades gracefully — the Curator Agent just proposes specific
resources itself instead of ranking a candidate pool. Nothing breaks; you
just lose the "matched against our own resource library" part until this is
running.