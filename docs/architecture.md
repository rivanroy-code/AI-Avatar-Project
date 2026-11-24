# Prototype architecture

```text
                    Tavus CVI Embed
                    ┌──────────────┐
                    │ live avatar  │
                    │ face + voice │
                    └──────▲───────┘
                           │ conversation.echo / lifecycle events
                           │
┌──────────────────────────┴──────────────────────────┐
│ React / Vite frontend                              │
│  ├─ interaction-state controller                   │
│  ├─ prompt / feedback UI                           │
│  ├─ Tavus presentation integration                 │
│  ├─ deterministic research controls                │
│  └─ retry / error / next-task states               │
└───────────────────────┬─────────────────────────────┘
                        │ stable JSON contract
                        ▼
              ┌──────────────────────┐
              │ FastAPI backend      │
              │  ├─ /api/analyse    │
              │  ├─ /api/session    │
              │  ├─ mock analysis   │
              │  └─ feedback mapper │
              └──────────┬───────────┘
                         │ future adapter
                         ▼
                 ML stuttering detector
```

## Key principle

The avatar presentation layer and analysis layer are independent. The frontend consumes a stable `AnalysisResponse` schema, so deterministic mock analysis can be replaced by a future ML adapter without redesigning the interface. Tavus is used through an Embed deployment; its public deployment ID is configured in the frontend, while no Tavus API key is exposed or required by the browser.
