<div align="center">

# 🏎️ Rovo Sprint Strategist

### *AI-Powered Sprint Intelligence for Agile Teams*

[![Atlassian Forge](https://img.shields.io/badge/Built%20on-Atlassian%20Forge-0052CC?style=for-the-badge&logo=atlassian&logoColor=white)](https://developer.atlassian.com/platform/forge/)
[![Rovo AI](https://img.shields.io/badge/Powered%20by-Rovo%20AI-FF5630?style=for-the-badge&logo=atlassian&logoColor=white)](https://www.atlassian.com/software/rovo)
[![Jira Integration](https://img.shields.io/badge/Integrates%20with-Jira-0052CC?style=for-the-badge&logo=jira&logoColor=white)](https://www.atlassian.com/software/jira)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

### 🌐 [Live Demo](https://build-9aufuthni-samarabdelhameeds-projects-df99c328.vercel.app) | 📦 [GitHub Repository](https://github.com/samarabdelhameed/rovo-sprint-strategist)

<img src="assets/banner.png" alt="Rovo Sprint Strategist Banner" width="800"/>

**🏆 Codegeist 2025 Hackathon Submission**

[Demo Video](#-demo) • [Features](#-features) • [Installation](#-installation) • [Architecture](#-architecture) • [API Reference](#-api-reference)

</div>

---

## 🎯 The Problem

> **85% of Sprints fail to achieve their goals.** — *State of Agile Report 2024*

### Why Do Sprints Fail?

| Problem | Impact |
|---------|--------|
| 🔍 **No Early Visibility** | Teams discover delays on the last day |
| 📊 **Gut-Based Decisions** | No data to support re-prioritization |
| 😤 **Sprint Review = Blame Game** | Learning gets replaced by finger-pointing |
| 😓 **Overloaded Scrum Masters** | Time spent gathering info, not leading |
| ⚠️ **Hidden Blockers** | Issues go unnoticed until it's too late |
| 📉 **Inaccurate Velocity** | Past sprints don't predict future performance |

### The Real Cost

```
┌─────────────────────────────────────────────────────────────┐
│  🏢 Average Enterprise Team (8 developers)                  │
├─────────────────────────────────────────────────────────────┤
│  ⏱️  15 min/day × 5 days × 8 people = 10 hours/sprint       │
│  💰 10 hours × $75/hour = $750/sprint wasted                │
│  📅 26 sprints/year × $750 = $19,500/year per team          │
│  🏭 10 teams = $195,000/year in inefficiency                │
└─────────────────────────────────────────────────────────────┘
```

---

## 💡 The Solution

<div align="center">
<img src="assets/f1-concept.png" alt="F1 Strategy Concept" width="600"/>
</div>

### 🏎️ Inspired by Formula 1 Race Strategy!

In Formula 1, a **Race Strategist** monitors everything in real-time and decides:
- ⏱️ When to make a Pit Stop?
- 🔄 When to change the strategy?
- 🏆 How to win despite problems?

**We bring the same concept to Software Teams!**

### Meet Your AI Sprint Strategist

**Rovo Sprint Strategist** is an intelligent Atlassian Forge app that acts as your team's personal race engineer, providing:

- 🤖 **AI-Powered Insights** — Natural language queries about your sprint
- 📊 **Real-Time Telemetry** — Live sprint health monitoring
- 🏁 **Pit-Stop Recommendations** — Smart suggestions for mid-sprint adjustments
- 🎯 **Predictive Analytics** — Know your finish line before you get there

---

## ⚡ Features

### 1. 🤖 Rovo AI Sprint Agent

<table>
<tr>
<td width="50%">

**Natural Language Intelligence**

Ask questions like:
- *"Hey Rovo, what's blocking Sprint 42?"*
- *"Rovo, predict if we'll finish on time"*
- *"Rovo, suggest a pit-stop strategy"*

The AI Agent:
- ✅ Understands sprint context
- ✅ Answers natural questions
- ✅ Suggests proactive solutions
- ✅ Learns from your team patterns

</td>
<td width="50%">

```javascript
// Example Rovo Agent Interaction
{
  "query": "What's blocking Sprint 42?",
  "response": {
    "blockers": [
      {
        "issue": "PROJ-123",
        "blocked_for": "3 days",
        "assignee": "John",
        "suggested_action": "Reassign to Sarah"
      }
    ],
    "sprint_health_impact": "-15%",
    "recommendation": "Immediate attention needed"
  }
}
```

</td>
</tr>
</table>

---

### 2. 📊 Real-Time Sprint Dashboard

<div align="center">
<img src="assets/dashboard-preview.png" alt="Sprint Dashboard" width="700"/>
</div>

| Metric | Description |
|--------|-------------|
| 🏥 **Sprint Health Score** | 0-100 score updated every minute |
| 📈 **Velocity Predictor** | AI-based completion prediction |
| ⚠️ **Risk Radar** | Detects risks before they happen |
| 📉 **Smart Burndown** | AI-enhanced burndown with predictions |
| 👥 **Team Workload** | Real-time team capacity visualization |
| 🎯 **Goal Tracker** | Sprint goal progress with milestones |

---

### 3. 🏁 Pit-Stop Recommendations

When your sprint is at risk, the AI suggests strategic adjustments:

```
┌─────────────────────────────────────────────────────────────────┐
│  🚨 PIT-STOP ALERT: Sprint Overloaded                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Current Velocity: 34 points                                    │
│  Committed: 52 points                                           │
│  Predicted Completion: 65%                                      │
│                                                                 │
│  📋 RECOMMENDED ACTIONS:                                        │
│                                                                 │
│  1. Remove 3 low-priority stories (18 points)                   │
│     → PROJ-456, PROJ-789, PROJ-012                             │
│                                                                 │
│  2. Split PROJ-345 into smaller tasks                          │
│     → Estimated gain: 2 days                                   │
│                                                                 │
│  3. Reassign PROJ-567 from John → Sarah                        │
│     → John is overloaded (120% capacity)                       │
│                                                                 │
│  [Apply Recommendations]  [Dismiss]  [Customize]               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

### 4. 🎯 Smart Daily Standup Generator

**Save 15 minutes daily = 5 hours monthly per team!**

<table>
<tr>
<td>

**Before** 😓
- Manual status gathering
- Forgotten blockers
- Long, unfocused meetings
- No documentation

</td>
<td>

**After** 🚀
- Auto-generated from Jira
- AI-detected blockers
- Focused 5-min syncs
- Complete history

</td>
</tr>
</table>

```markdown
# 📋 Auto-Generated Standup — Sprint 42, Day 7

## ✅ Completed Yesterday
- PROJ-123: User authentication (Sarah) — 5 pts
- PROJ-124: Database optimization (John) — 3 pts

## 🔄 In Progress Today
- PROJ-125: Payment integration (Mike) — 8 pts [⚠️ At Risk]
- PROJ-126: UI redesign (Lisa) — 5 pts

## 🚫 Blockers Detected
- PROJ-125 blocked by: Waiting for API credentials (3 days)
- PROJ-127 blocked by: Dependency on PROJ-125

## 📊 Sprint Health: 72% | Days Left: 3
```

---

### 5. 📈 Sprint Post-Mortem AI

Automatic sprint analysis with actionable insights:

<div align="center">

| Analysis | Insight |
|----------|---------|
| 📊 **Velocity Trend** | +12% improvement from last 3 sprints |
| ⏱️ **Estimation Accuracy** | 78% (target: 85%) |
| 🚫 **Top Blockers** | External dependencies (45%), Unclear requirements (30%) |
| 👥 **Team Balance** | 2 developers overloaded, 1 underutilized |
| 💡 **AI Recommendations** | 5 specific improvements for next sprint |

</div>

---

### 6. 🔔 Intelligent Alerts System

Real-time notifications for critical events:

| Alert Type | Trigger | Action |
|------------|---------|--------|
| ⏰ **Stuck Task** | Task unchanged for >2 days | Notify assignee + Scrum Master |
| 😓 **Overload** | Developer at >100% capacity | Suggest rebalancing |
| ⚠️ **Sprint Risk** | Health score drops below 60% | Trigger pit-stop analysis |
| 🎯 **Goal Drift** | Sprint goal progress stalls | Alert Product Owner |
| 🔥 **Burndown Alert** | Off-track by >20% | Recommend scope adjustment |

---

### 7. 🏆 Team Leaderboard & Gamification

**F1-Inspired Team Motivation System**

<div align="center">
<img src="assets/leaderboard.png" alt="Team Leaderboard" width="600"/>
</div>

**Achievements & Badges:**

| Badge | Requirement |
|-------|-------------|
| 🏎️ **Pole Position** | First to complete a task in sprint |
| 🏆 **Champion** | Highest velocity in sprint |
| 🎯 **Bullseye** | 100% estimation accuracy |
| 🔥 **On Fire** | 5 tasks completed in one day |
| 🤝 **Team Player** | Helped unblock 3+ teammates |
| 🧹 **Clean Code** | Zero bugs in sprint |

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ROVO SPRINT STRATEGIST                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │   Jira      │    │ Confluence  │    │   Slack     │                 │
│  │   Cloud     │    │   Cloud     │    │ (Optional)  │                 │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                 │
│         │                  │                  │                         │
│         └──────────────────┼──────────────────┘                         │
│                            │                                            │
│                            ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    ATLASSIAN FORGE RUNTIME                       │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │   │
│  │  │  Jira Panel │  │ Rovo Agent  │  │  Triggers   │              │   │
│  │  │  Dashboard  │  │  Actions    │  │  Scheduled  │              │   │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘              │   │
│  │         │                │                │                      │   │
│  │         └────────────────┼────────────────┘                      │   │
│  │                          │                                       │   │
│  │                          ▼                                       │   │
│  │  ┌─────────────────────────────────────────────────────────┐    │   │
│  │  │                   CORE SERVICES                          │    │   │
│  │  │  ┌───────────┐  ┌───────────┐  ┌───────────┐            │    │   │
│  │  │  │  Sprint   │  │    AI     │  │  Alert    │            │    │   │
│  │  │  │  Analyzer │  │  Engine   │  │  Manager  │            │    │   │
│  │  │  └───────────┘  └───────────┘  └───────────┘            │    │   │
│  │  │  ┌───────────┐  ┌───────────┐  ┌───────────┐            │    │   │
│  │  │  │ Velocity  │  │  Standup  │  │ Gamifica- │            │    │   │
│  │  │  │ Predictor │  │ Generator │  │   tion    │            │    │   │
│  │  │  └───────────┘  └───────────┘  └───────────┘            │    │   │
│  │  └─────────────────────────────────────────────────────────┘    │   │
│  │                          │                                       │   │
│  │                          ▼                                       │   │
│  │  ┌─────────────────────────────────────────────────────────┐    │   │
│  │  │                  FORGE STORAGE API                       │    │   │
│  │  │         (Sprint Data, Metrics, User Preferences)         │    │   │
│  │  └─────────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                            │                                            │
│                            ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    EXTERNAL AI SERVICE                           │   │
│  │                  (Anthropic Claude / OpenAI)                     │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Platform** | Atlassian Forge | App hosting & runtime |
| **AI Agent** | Rovo Agent & Actions | Natural language interface |
| **UI** | Forge UI Kit (React) | Dashboard & panels |
| **Storage** | Forge Storage API | Persistent data |
| **Integration** | Jira REST API | Sprint & issue data |
| **ML/AI** | Claude API / OpenAI | Predictions & analysis |
| **Scheduling** | Forge Scheduled Triggers | Background processing |

### Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        DATA FLOW                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. JIRA EVENTS                                                 │
│     Issue Created → Issue Updated → Issue Transitioned          │
│                            │                                    │
│                            ▼                                    │
│  2. FORGE TRIGGER                                              │
│     Captures event → Validates → Queues for processing          │
│                            │                                    │
│                            ▼                                    │
│  3. SPRINT ANALYZER                                            │
│     Updates metrics → Calculates health → Detects risks         │
│                            │                                    │
│                            ▼                                    │
│  4. AI ENGINE                                                  │
│     Analyzes patterns → Generates predictions → Creates alerts  │
│                            │                                    │
│                            ▼                                    │
│  5. STORAGE UPDATE                                             │
│     Persists results → Updates dashboard → Triggers UI refresh  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
rovo-sprint-strategist/
├── 📄 README.md                    # This file
├── 📄 manifest.yml                 # Forge app configuration
├── 📄 package.json                 # Dependencies
├── 📄 .env.example                 # Environment variables template
├── 📄 LICENSE                      # MIT License
│
├── 📁 src/
│   ├── 📁 agents/                  # Rovo AI Agents
│   │   ├── 📄 sprintAgent.js       # Main sprint strategist agent
│   │   ├── 📄 standupAgent.js      # Standup generator agent
│   │   └── 📄 postMortemAgent.js   # Sprint retrospective agent
│   │
│   ├── 📁 actions/                 # Rovo Actions
│   │   ├── 📄 analyzeSprintAction.js
│   │   ├── 📄 predictVelocityAction.js
│   │   ├── 📄 generateStandupAction.js
│   │   └── 📄 suggestPitStopAction.js
│   │
│   ├── 📁 triggers/                # Forge Triggers
│   │   ├── 📄 issueCreatedTrigger.js
│   │   ├── 📄 issueUpdatedTrigger.js
│   │   ├── 📄 sprintStartedTrigger.js
│   │   └── 📄 scheduledAnalysisTrigger.js
│   │
│   ├── 📁 panels/                  # Jira Panels
│   │   ├── 📄 SprintDashboard.jsx  # Main dashboard panel
│   │   ├── 📄 HealthScore.jsx      # Health score widget
│   │   ├── 📄 RiskRadar.jsx        # Risk visualization
│   │   └── 📄 Leaderboard.jsx      # Team leaderboard
│   │
│   ├── 📁 services/                # Core Services
│   │   ├── 📄 sprintAnalyzer.js    # Sprint analysis logic
│   │   ├── 📄 velocityPredictor.js # ML-based predictions
│   │   ├── 📄 alertManager.js      # Alert system
│   │   ├── 📄 gamificationService.js # Points & badges
│   │   └── 📄 aiService.js         # External AI integration
│   │
│   ├── 📁 utils/                   # Utilities
│   │   ├── 📄 jiraApi.js           # Jira API helpers
│   │   ├── 📄 storage.js           # Forge storage helpers
│   │   ├── 📄 dateUtils.js         # Date calculations
│   │   └── 📄 formatters.js        # Data formatters
│   │
│   └── 📁 styles/                  # CSS Styles
│       ├── 📄 dashboard.css        # Dashboard styles
│       ├── 📄 components.css       # Component styles
│       └── 📄 theme.css            # Williams F1 theme
│
├── 📁 static/                      # Static Assets
│   ├── 📁 icons/                   # App icons
│   └── 📁 images/                  # UI images
│
├── 📁 assets/                      # Documentation Assets
│   ├── 📄 banner.png
│   ├── 📄 dashboard-preview.png
│   ├── 📄 f1-concept.png
│   └── 📄 leaderboard.png
│
├── 📁 docs/                        # Documentation
│   ├── 📄 INSTALLATION.md
│   ├── 📄 API.md
│   ├── 📄 CONTRIBUTING.md
│   └── 📄 CHANGELOG.md
│
└── 📁 tests/                       # Test Files
    ├── 📄 sprintAnalyzer.test.js
    ├── 📄 velocityPredictor.test.js
    └── 📄 integration.test.js
```

---

## 🚀 Installation

### Prerequisites

- Node.js 18.x or higher
- Atlassian account with admin access
- Forge CLI installed globally

### Step 1: Install Forge CLI

```bash
npm install -g @forge/cli
```

### Step 2: Clone Repository

```bash
git clone https://github.com/your-username/rovo-sprint-strategist.git
cd rovo-sprint-strategist
```

### Step 3: Install Dependencies

```bash
npm install
```

### Step 4: Configure Environment

```bash
cp .env.example .env
# Edit .env with your API keys
```

### Step 5: Login to Forge

```bash
forge login
```

### Step 6: Deploy to Development

```bash
forge deploy
forge install --upgrade
```

### Step 7: Start Development Tunnel

```bash
forge tunnel
```

---

## ⚡ Quick Start (Dashboard + API)

For the **React Dashboard** and **Express API** with real Supabase data:

### 1. Database Setup

```bash
# Run supabase/schema.sql in Supabase SQL Editor
# Project: unmftusdjijgbprtzfir.supabase.co
```

### 2. Start Backend API

```bash
cd api
npm install
npm run dev
# API runs on http://localhost:3001
```

### 3. Start Frontend Dashboard

```bash
cd static/dashboard
bun install
bun dev
# Dashboard runs on http://localhost:3000
```

### 4. Verify Connection

```bash
curl http://localhost:3001/api/health
# Should return: {"status":"healthy","supabase":"connected"}
```

### Environment Variables

**API (`api/.env`):**
```env
PORT=3001
SUPABASE_URL=https://unmftusdjijgbprtzfir.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVubWZ0dXNqZGlqZ2JwcnR6ZmlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNDg0ODcsImV4cCI6MjA4MTcyNDQ4N30.kU8eoXF5voC6nn_YXFvxWM4a42gzzWtJ7I6YdZsUgaM
```

**Frontend (`static/dashboard/.env`):**
```env
VITE_API_URL=http://localhost:3001
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ANTHROPIC_API_KEY` | Claude API key for AI features | Yes |
| `OPENAI_API_KEY` | OpenAI API key (alternative) | No |
| `ALERT_THRESHOLD` | Health score threshold for alerts | No (default: 60) |
| `VELOCITY_LOOKBACK` | Sprints to consider for velocity | No (default: 3) |

### manifest.yml Configuration

```yaml
modules:
  jira:projectPage:
    - key: sprint-dashboard
      title: Sprint Strategist
      resource: dashboard
      
  rovo:agent:
    - key: sprint-agent
      name: Sprint Strategist
      description: Your AI sprint advisor
      
  trigger:
    - key: issue-updated-trigger
      function: issueUpdatedHandler
      events:
        - avi:jira:updated:issue
```

---

## 📖 API Reference

### Rovo Actions

#### `analyzeSprintAction`

Analyzes current sprint health and returns metrics.

```javascript
// Input
{
  "sprintId": "12345",
  "includeRisks": true
}

// Output
{
  "healthScore": 78,
  "velocity": {
    "current": 34,
    "predicted": 42
  },
  "risks": [
    {
      "type": "overload",
      "severity": "high",
      "affectedIssues": ["PROJ-123", "PROJ-456"]
    }
  ]
}
```

#### `predictVelocityAction`

Predicts sprint completion percentage.

```javascript
// Input
{
  "sprintId": "12345",
  "includeTrend": true
}

// Output
{
  "predictedCompletion": 85,
  "confidence": 0.92,
  "trend": "improving",
  "factors": [
    "Team velocity increasing",
    "No major blockers detected"
  ]
}
```

#### `generateStandupAction`

Generates daily standup summary.

```javascript
// Input
{
  "sprintId": "12345",
  "date": "2024-01-15"
}

// Output
{
  "completed": [...],
  "inProgress": [...],
  "blockers": [...],
  "healthScore": 72,
  "daysRemaining": 3
}
```

#### `suggestPitStopAction`

Suggests mid-sprint adjustments.

```javascript
// Input
{
  "sprintId": "12345",
  "urgency": "high"
}

// Output
{
  "recommendations": [
    {
      "type": "remove_scope",
      "issues": ["PROJ-789"],
      "impact": "+15% completion probability"
    },
    {
      "type": "reassign",
      "from": "John",
      "to": "Sarah",
      "issue": "PROJ-456"
    }
  ]
}
```

---

## 🎨 Design System

### Williams Racing Theme 🏎️

Our design is inspired by the iconic Williams Racing F1 team:

| Element | Value |
|---------|-------|
| **Primary** | `#002B5B` (Navy Blue) |
| **Secondary** | `#FFFFFF` (White) |
| **Accent** | `#E10600` (Racing Red) |
| **Background** | `#0A1628` (Dark) |
| **Success** | `#00D26A` (Green) |
| **Warning** | `#FFB800` (Yellow) |
| **Danger** | `#E10600` (Red) |

### Typography

- **Headings**: Outfit (Google Fonts)
- **Body**: Inter (Google Fonts)
- **Monospace**: JetBrains Mono

### Components

All components follow the F1 Telemetry aesthetic:

- Dark backgrounds with high-contrast data
- Smooth animations (60fps)
- Real-time data indicators
- Racing-inspired iconography

---

## 🎯 Hackathon Targets

### Prizes We're Targeting

| Prize | Amount | How We Qualify |
|-------|--------|----------------|
| 🥇 **Grand Prize** | $15,000 | Complete Forge + Rovo integration |
| 🤖 **Best Rovo Apps** | $2,000 | Full Rovo Agent + Actions |
| 🛠️ **Best Rovo Dev** | $2,000 | Built using Rovo Dev |
| ☁️ **Runs on Atlassian** | $2,000 | Following program requirements |

**Total Potential: $21,000** 🎉

### Judging Criteria Alignment

| Criteria | Our Approach |
|----------|--------------|
| **Creativity** | F1 Strategy concept is unique and memorable |
| **Implementation** | Full Forge + Rovo + AI integration |
| **Impact** | Every Jira team worldwide can benefit |
| **Design** | Premium F1-inspired dark mode UI |
| **Documentation** | Comprehensive docs and demo video |

---

## 🗓️ Development Timeline

| Day | Tasks |
|-----|-------|
| **Day 1** | Forge setup, Jira panel, basic dashboard |
| **Day 2** | Rovo Agent, AI features, alert system |
| **Day 3** | UI polish, demo video, submission |

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](docs/CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Clone the repo
git clone https://github.com/your-username/rovo-sprint-strategist.git

# Install dependencies
npm install

# Start development
forge tunnel
```

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Atlassian** for the amazing Forge platform
- **Williams Racing** for the design inspiration
- **Codegeist 2025** organizers and community

---

<div align="center">

### Built with ❤️ for Codegeist 2025

<img src="assets/forge-badge.png" alt="Built on Forge" width="200"/>

**[⬆ Back to Top](#-rovo-sprint-strategist)**

</div>
