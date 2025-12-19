# API Reference

## Rovo Actions

### `analyzeSprintAction`

Analyze sprint health and metrics.

**Input:**
```json
{
  "sprintId": "optional-sprint-id",
  "includeRisks": true
}
```

**Output:**
```json
{
  "healthScore": 78,
  "progress": { "completed": 12, "total": 20 },
  "velocity": { "current": 34, "committed": 50 },
  "risks": []
}
```

---

### `predictVelocityAction`

Predict sprint completion.

**Input:**
```json
{
  "sprintId": "optional-sprint-id"
}
```

**Output:**
```json
{
  "completionPercentage": 85,
  "confidence": 0.92,
  "trend": "improving"
}
```

---

### `generateStandupAction`

Auto-generate standup summary.

**Output:**
```json
{
  "completed": [],
  "inProgress": [],
  "blockers": []
}
```

---

### `suggestPitStopAction`

Get sprint adjustment recommendations.

**Output:**
```json
{
  "needed": true,
  "recommendations": []
}
```

## Forge Storage Keys

| Key Pattern | Description |
|-------------|-------------|
| `sprint_metrics_{id}` | Sprint health metrics |
| `user_{id}` | User gamification data |
| `alerts_{sprintId}` | Active alerts |
| `events_{sprintId}` | Event log |
