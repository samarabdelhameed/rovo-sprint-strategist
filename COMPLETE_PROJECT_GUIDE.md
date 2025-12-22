# 🏎️ Rovo Sprint Strategist: Professional Guide & Demo Script

![Rovo Sprint Strategist Logo](https://raw.githubusercontent.com/samarabdelhameed/rovo-sprint-strategist/main/assets/logo.png)

## 📋 Project Intelligence Overview

**Rovo Sprint Strategist** is an AI-augmented Agile lifecycle management platform. Inspired by the high-precision world of **Formula 1 Race Strategy**, it transforms static Jira data into actionable intelligence. By leveraging **Atlassian Forge** and **Rovo AI**, the platform provides real-time telemetry, predictive velocity modeling, and automated remediation strategies.

### 🎯 High-Level Objectives
- **Predictive Remediation:** Identify sprint risks before they manifest as delays.
- **Conversational Intelligence:** Enable teams to query complex sprint metrics using natural language.
- **Data-Driven Optimization:** Transition from subjective "gut-feel" standups to objective, telemetry-backed decisions.

---

## 🏗️ System Architecture & Telemetry Flow

The system is built on a distributed, event-driven architecture designed for low-latency synchronization with Jira Cloud.

### Core Ecosystem
- **Cloud Interface:** Atlassian Forge (Node.js 20 Runtime)
- **AI Backend:** Rovo AI Agents & Custom Forge Actions
- **Data Orchestration:** Express.js API Gateway + SQLite/Supabase Hybrid Persistence
- **UI/UX Layer:** React 18 with Framer Motion and Three.js for 3D Telemetry Visualization

### Repository Structure
```
rovo-sprint-strategist/
├── 📁 api/                     # Mission Control (Backend API)
├── 📁 static/dashboard/       # Telemetry Center (Frontend Dashboard)
├── 📁 src/                    # Forge Logic & Rovo Integration
├── 📁 supabase/              # Global Persistence Layer
└── 📁 assets/                 # Brand Assets & Logo
```

---

## 🌐 Deployment & Access Points

### 📥 [Install the Forge App](https://developer.atlassian.com/console/install/aa31a6b3-9ec1-49a6-a8e7-35eac7f402ee?signature=AYABeIHU7LJ4VGUbhvJ0MWZix6MAAAADAAdhd3Mta21zAEthcm46YXdzOmttczp1cy13ZXN0LTI6NzA5NTg3ODM1MjQzOmtleS83MDVlZDY3MC1mNTdjLTQxYjUtOWY5Yi1lM2YyZGNjMTQ2ZTcAuAECAQB4IOp8r3eKNYw8z2v%2FEq3%2FfvrZguoGsXpNSaDveR%2FF%2Fo0BJVUkqFcqfCDwlqeLvwLt2gAAAH4wfAYJKoZIhvcNAQcGoG8wbQIBADBoBgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDFMbHNzsScl9uYzRnwIBEIA7kDx7tQSIl%2F6Wj3r%2FExkYUVOJ7wRNfh2H2KuI5fLjd7RUjgEzFe6ZchOukgJWtnbvDkcH0MEosQ4FLYcAB2F3cy1rbXMAS2Fybjphd3M6a21zOmV1LXdlc3QtMTo3MDk1ODc4MzUyNDM6a2V5LzQ2MzBjZTZiLTAwYzMtNGRlMi04NzdiLTYyN2UyMDYwZTVjYwC4AQICAHijmwVTMt6Oj3F%2B0%2B0cVrojrS8yZ9ktpdfDxqPMSIkvHAFIL7FEmRSRH2mth%2F08rQMTAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMG47Ja0RxBDpxI6mbAgEQgDuBHgNpSr2HEGGpbLcVRt2MTUvlFIgkzZY1TmUPdP4HfLg4B%2BkLgRzoiuHmn2RZHZSaXmvtiCEX8SiR5wAHYXdzLWttcwBLYXJuOmF3czprbXM6dXMtZWFzdC0xOjcwOTU4NzgzNTI0MzprZXkvNmMxMjBiYTAtNGNkNS00OTg1LWI4MmUtNDBhMDQ5NTJjYzU3ALgBAgIAeLKa7Dfn9BgbXaQmJGrkKztjV4vrreTkqr7wGwhqIYs5ATjw%2BLlX701l%2FTWF9GaQn1UAAAB%2BMHwGCSqGSIb3DQEHBqBvMG0CAQAwaAYJKoZIhvcNAQcBMB4GCWCGSAFlAwQBLjARBAxKxxTcZZZGWbIJ8kICARCAO7lgLn3rdj531PbIVeImkY1b6anSINNEpHlq76wzDl7J9hgbgosV2osg0GWkuEGNOFIkZk0io5RIdWdEAgAAAAAMAAAQAAAAAAAAAAAAAAAAACysoYKlQX6Hjqwluj05IC%2F%2F%2F%2F%2F%2FAAAAAQAAAAAAAAAAAAAAAQAAADLS%2FBCZLFVsSBdSU9d4p92P3tMvQ7q987O9UloB37rN64%2BPEWi9Q1%2BPUOB%2FWkoimBeYIegYqWohy%2FVkX5VBPzFdTTg%3D&product=jira)
> [!IMPORTANT]
> This link provides the primary integration point for Jira Cloud. Secure, authenticated, and Forge-ready.

### 📊 [Live Telemetry Dashboard (Vercel)](https://build-9aufuthni-samarabdelhameeds-projects-df99c328.vercel.app)
> [!TIP]
> Use this for a high-fidelity demonstration of the F1-inspired interface.

---

## 🎬 Technical Demo Script (Optimized for Hackathon)

### Act 1: The "Telemetry Overload" Problem (0:00 - 0:30)
*   **Visual:** Show the F1-inspired dashboard with low health marks (red indicators).
*   **Script:** "Traditional sprint management is reactive. Teams discover failure at the finish line—during the retrospective. But what if we had real-time telemetry for our sprints? Welcome to Rovo Sprint Strategist."

### Act 2: Conversational Intelligence with Rovo (0:30 - 1:15)
*   **Visual:** Open the Rovo Chat/Agent interface within Jira.
*   **Action:** Type: *"Analyze the risk for current sprint."*
*   **Script:** "By integrating with Rovo AI, we've created the **Sprint Strategist Agent**. Unlike a generic chatbot, this agent understands your Jira context. It identifies that Sarah is at 120% capacity and that PROJ-456 is a critical blocker. It doesn't just show data; it explains it."

### Act 3: The "Pit-Stop" Remediation (1:15 - 2:00)
*   **Visual:** Navigate to the Pit-Stop page.
*   **Action:** Apply an AI recommendation to reallocate tasks.
*   **Script:** "When the telemetry turns red, your AI strategist suggests a 'Pit-Stop'. Here, the system identifies specific remediations. By reassigning this blocked task to David, who has 40% availability, we instantly recover 12% of our sprint health. This is proactive course correction."

### Act 4: Gamification & Architecture (2:00 - 2:45)
*   **Visual:** Show the 3D Leaderboard and the Architecture diagram.
*   **Script:** "Built on a robust Atlassian Forge backend, we use high-speed React telemetry for the UI and a gamified leaderboard to drive developer engagement. This combines enterprise-grade analytics with a premium user experience."

### Act 5: Call to Action (2:45 - 3:00)
*   **Visual:** Return to the healthy, green Dashboard.
*   **Script:** "Empower your team with a Race Strategist. Rovo Sprint Strategist—Winning every sprint by design. Thank you."

---

## 🚀 Recording Checklist for Samar

### ✅ Visual Preparation:
- [ ] Ensure **Dark Mode** is active for maximum F1 aesthetic.
- [ ] Have the **Jira Board** open in one tab and the **Strategist Dashboard** in another.
- [ ] Clear any browser warnings or personal bookmarks from view.

### ✅ Technical Verification:
- [ ] Ensure the latest build is pushed to Vercel (Done).
- [ ] Verify the Forge app is installed and visible in Jira.
- [ ] Test the "Apply Recommendation" button once to ensure the animation works smoothly.

### ✅ Recording Software:
- [ ] Use a tool like Loom or OBS.
- [ ] Record in 1080p if possible.
- [ ] If using a microphone, ensure the background is quiet to sound professional.