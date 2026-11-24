# Avatar-Guided Speech Practice — Honours Prototype

A research prototype demonstrating an avatar-guided speech-practice interaction with a live Tavus CVI avatar, deterministic dialogue branches and a mock analysis contract that can later be replaced by a stuttering-detection model.

## Implemented

- Tavus CVI embed as the replaceable avatar presentation layer.
- Programmatic Tavus start/end lifecycle and exact avatar speech (`conversation.echo`).
- React interaction states: welcome, instruction, attempt, analysing, feedback, retry and error.
- FastAPI stable analysis contract.
- Deterministic mock analysis scenarios for success, repetition, prolongation, long pause, low confidence and error.
- Separate supportive feedback mapping.
- Deterministic dialogue branches for repeat request, "I don't know", no response and stop.
- Research-only controls for exercising branches without the final ML detector.
- Automated backend tests.

## Architecture

The final prototype deliberately separates:

1. **Presentation:** Tavus CVI embed.
2. **Interaction/UI state:** React.
3. **Analysis and dialogue:** FastAPI.
4. **Future inference:** stuttering-detection model behind the existing JSON contract.

This allows the interface and evaluation flow to be developed independently of the ML mini-project.

## 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

Backend API docs: `http://localhost:8000/docs`

### Backend tests

```bash
cd backend
source .venv/bin/activate
pytest -q
```

## 2. Frontend

```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_TAVUS_DEPLOYMENT_ID=YOUR_EMBED_DEPLOYMENT_ID
```

Then:

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

The Tavus deployment must be **active** and must allow `http://localhost:5173` as an origin.

## How to test the complete prototype

1. Start FastAPI.
2. Start Vite.
3. Open the page and click **Start practice**. This programmatically starts the Tavus conversation.
4. Click **Hear sentence** to make the avatar speak the exercise phrase exactly.
5. Click **I'm ready**, say the phrase during the live Tavus session, then click **Finish attempt & analyse**.
6. The current analysis is deterministic/mock by design; the selected scenario controls the returned event, confidence and next action.
7. The feedback mapper returns supportive wording and the avatar speaks that exact wording.
8. Use **Research controls** to exercise low-confidence, retry, error and dialogue-intent branches.

## Important scope statement

The prototype does **not** diagnose stuttering and does not currently analyse recorded audio. The live Tavus layer handles the embodied interaction; the analysis endpoint deliberately uses mock results so the interface and integration contract can be tested independently of the future ML detector.
