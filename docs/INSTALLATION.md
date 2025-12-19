# Installation Guide

## Prerequisites

- **Node.js** 18.x or higher
- **Atlassian account** with admin access
- **Forge CLI** installed globally

## Quick Start

### 1. Install Forge CLI

```bash
npm install -g @forge/cli
```

### 2. Login to Forge

```bash
forge login
```

### 3. Clone & Install

```bash
git clone https://github.com/your-username/rovo-sprint-strategist.git
cd rovo-sprint-strategist
npm install
```

### 4. Configure Environment

```bash
cp .env.example .env
# Edit .env with your API keys
```

### 5. Deploy

```bash
forge deploy
forge install --site your-site.atlassian.net --product jira
```

### 6. Development Mode

```bash
forge tunnel
```

## Troubleshooting

### "Permission denied" errors
Make sure you have admin access to your Atlassian site.

### "Module not found" errors
Run `npm install` again.

### "API key invalid" errors
Check your `.env` file has correct API keys.

## Need Help?

Open an issue on GitHub or contact support.
