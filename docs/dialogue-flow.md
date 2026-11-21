# Draft Exercise Dialogue Flow

This deterministic dialogue layer is adapted from the broader project team's draft exercise script.
It is deliberately separated from the speech-event analysis adapter so the interface can be built and tested independently of the final ML model.

## Main flow

1. Welcome and readiness prompt
2. Avatar presents a sentence
3. Child response is mapped to one of five development intents:
   - `answered`
   - `repeat_request`
   - `dont_know`
   - `no_response`
   - `stop`
4. Only `answered` invokes the current mock speech-analysis adapter.
5. The dialogue engine returns one or more supportive avatar messages and a deterministic next action.

## Clinical boundary

The wording is prototype dialogue only and must be reviewed by speech-pathology collaborators before any study with children.
The system avoids diagnosis and does not autonomously prescribe fluency strategies.
