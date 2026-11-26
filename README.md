# Avatar-Guided Speech Practice — Honours Prototype

A browser-based honours research prototype integrating a live Tavus avatar with a React interaction interface and a FastAPI deterministic mock-analysis backend.

## Scope

This project demonstrates an end-to-end avatar-guided speech-practice and system-integration workflow. It does **not** claim to perform clinical stuttering detection or provide speech therapy.

The current backend deliberately returns deterministic mock-analysis outcomes so that the frontend, avatar interaction, feedback behaviour, error handling and integration contract can be developed and evaluated independently of the future machine-learning stuttering detector.

The prototype supports:

- Tavus as a replaceable avatar presentation layer
- React-controlled Welcome, Instruction, Recording, Feedback, Retry, Error/Fallback and Complete states
- speech-activity detection during the live Tavus interaction
- explicit user submission through **Done speaking**
- a stable FastAPI `/api/analyse` JSON contract
- deterministic success, repetition-style retry, low-confidence retry and backend-error scenarios
- supportive user-facing feedback separated from technical analysis output
- controlled avatar wording and interaction behaviour
- retry, progression, stopping and error-recovery pathways
- automated backend tests

The frontend remains the authoritative controller of task progression. Tavus presents the avatar and spoken interaction but does not independently determine whether speech was successful, classify stuttering, select feedback or advance the activity.

## Architecture

```text
            Tavus avatar
                 ▲
                 │
        presentation / speech
                 │
                 ▼
        React / Vite frontend
   interaction state + task controls
                 │
                 │ stable JSON contract
                 ▼
          FastAPI backend
 deterministic mock analysis
       + feedback mapping
                 │
                 │ future adapter
                 ▼
    ML stuttering detector
```

The frontend depends on the structured `AnalysisResponse` contract rather than on the internal implementation of the analysis component. A future machine-learning detector can therefore replace the deterministic mock service while preserving the same frontend interaction structure.

## Backend

From the project root:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Health check:

```text
http://localhost:8000/health
```

Swagger/API documentation:

```text
http://localhost:8000/docs
```

### Backend tests

```bash
cd backend
source .venv/bin/activate
pytest -q
```

Expected result:

```text
10 passed
```

## Frontend

Create the local environment file:

```bash
cd frontend
cp .env.example .env
```

Configure `frontend/.env`:

```env
VITE_API_BASE_URL=http://localhost:8000
VITE_TAVUS_DEPLOYMENT_ID=YOUR_TAVUS_EMBED_DEPLOYMENT_ID
```

Install dependencies and run the frontend:

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

The Tavus deployment must be active and configured to allow the local frontend origin.

## Tavus configuration

The Tavus avatar is configured as a controlled presentation layer for the research prototype.

It should not independently:

- diagnose stuttering
- assess speech severity
- decide whether speech is correct, incorrect, fluent or dysfluent
- recommend treatment techniques
- determine task progression
- generate independent clinical feedback

The React application controls the activity and supplies the task and feedback wording used by the avatar.

Additional Tavus guardrails address clinical boundaries, feedback boundaries, treatment advice, system uncertainty, stopping behaviour and privacy.

## Demonstrating the prototype

1. Run the FastAPI backend and React frontend in separate terminals.
2. Open the web application.
3. Start the Tavus interaction and select **Start practice**.
4. The application presents the current practice phrase.
5. Select **I'm ready** to enter the Recording state.
6. Speak during the Tavus session. The interface acknowledges when speech activity is detected.
7. Select **Done speaking** to submit the attempt.
8. The frontend sends an analysis request to `/api/analyse`.
9. The structured backend response maps to a Feedback, Retry or Error/Fallback state.
10. The user can retry the phrase, continue to the next task or stop the session.
11. After the final task, the application enters the Complete state.

The demonstration sequence uses predefined deterministic backend outcomes so that major interaction branches can be exercised reproducibly without exposing developer controls in the participant-facing interface.

## Important limitations

This prototype does **not** diagnose stuttering and does **not** classify live speech for stuttering-related events.

The Tavus interaction is used to provide embodied speech interaction and detect that user speech has occurred. The downstream analysis result is deterministic and simulated by design.

The current prototype is intended to demonstrate:

- avatar-guided speech interaction
- frontend state management
- frontend-to-backend communication
- a stable analysis integration contract
- supportive feedback mapping
- retry and error handling
- a path for later integration of the separate machine-learning stuttering detector

It has not been clinically validated or evaluated with children or parents.

## Research context

This prototype forms the interface and system-integration component of a wider honours research project investigating AI-supported speech pathology.

Its main contribution is the separation of the avatar presentation layer, frontend interaction state, backend analysis interface and future machine-learning component so that each can be developed or replaced independently.