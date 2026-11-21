# Prototype architecture

```text
React/Vite frontend
  ├─ interaction-state controller
  ├─ prompt / feedback UI
  ├─ simulated input selector (development only)
  └─ optional Tavus CVI viewport
          │
          ├──────────────┐
          │              │
          ▼              ▼
FastAPI backend       Tavus CVI
  ├─ /api/analyse       presentation / conversational avatar
  ├─ mock analysis
  ├─ feedback mapper
  └─ Tavus proxy routes
          │
          ▼ future
ML stuttering detector
```

## Key principle

The frontend depends on the stable `AnalysisResponse` schema, not on the implementation that produced it. The deterministic mock service can therefore be replaced by a future ML adapter without redesigning the user-facing flow.
