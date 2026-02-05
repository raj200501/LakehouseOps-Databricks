# Architecture

```mermaid
flowchart LR
  SRC[CSV/JSON/REST/Mocked Stream] --> BRONZE
  BRONZE --> SILVER
  SILVER --> GOLD
  GOLD --> ML[MLflow Training]
  GOLD --> API[FastAPI]
  API --> UI[React Dashboard]
```
