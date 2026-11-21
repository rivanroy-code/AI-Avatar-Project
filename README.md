# Avatar-Guided Speech Practice — Honours Prototype

A deliberately small vertical-slice research prototype for an avatar-mediated speech-practice interaction.

## What works now

- Seven interaction outcomes can be exercised through deterministic mock analysis.
- React frontend calls a FastAPI backend.
- Backend returns a stable typed integration contract.
- Feedback is mapped separately from technical event data.
- Success, retry, low-confidence and backend-error paths are explicit.
- Tavus CVI integration is isolated behind optional server-side proxy routes, so the app still works without Tavus credentials.
- Automated backend tests cover the core branches.

## Architecture rationale

The avatar, UI state, analysis and feedback mapping are separate. This allows the current mock analysis to be replaced by the wider project's stuttering-detection model later without changing the frontend contract.

## Run the backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Open `http://localhost:8000/docs` for FastAPI's interactive API documentation.

## Run tests

```bash
cd backend
pytest -q
```

## Run the frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:5173`.

## Tavus setup

1. Create/configure a Tavus PAL in Tavus PAL Maker.
2. Put the server-only API key and PAL ID in `backend/.env`:

```env
TAVUS_API_KEY=...
TAVUS_PAL_ID=...
TAVUS_FACE_ID=...   # optional
```

3. Restart FastAPI.
4. Click **Start Tavus session** in the frontend.

The backend creates the Tavus conversation so the API key is never exposed to browser JavaScript.

## Current research limitation

The `/api/analyse` endpoint currently implements mock analysis only. This is intentional for the honours vertical slice: it validates the interaction and integration contract independently of the ML mini-project. Audio/model integration is the next adapter rather than a redesign.

## Emergency no-build demo

If npm installation is a problem on presentation day, the repository also contains `emergency-demo/index.html`. Run:

```bash
cd emergency-demo
python -m http.server 5173
```

Keep FastAPI running on port 8000, then open `http://localhost:5173`. This is only a presentation fallback; the intended frontend remains React/Vite.

## Dialogue-flow prototype

The prototype now includes `POST /api/session/turn`, a deterministic interaction controller based on the wider project's draft exercise flow. It distinguishes conversational intent (answered, repeat request, uncertainty/no response, stop) from the mock speech-event analysis. This keeps the frontend independent of the unfinished ML model while providing repeatable branches for evaluation.

Current automated backend result: **10/10 tests passing**.

> The dialogue wording is a research prototype and should be reviewed by speech-pathology collaborators before child-facing evaluation.
