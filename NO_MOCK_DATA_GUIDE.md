# 🔗 Real Jira Integration Guide

## ✅ No Mock Data - Real Jira Connection Only

This project is now configured to work **exclusively with real Jira data**. No mock or sample data is included.

---

## 🚀 Quick Start

### 1. Prerequisites

- Active Jira instance (Cloud or Server)
- Jira API token
- Active sprint in your Jira project

### 2. Setup Steps

#### Step 1: Start the Application

```bash
# Start API server
cd api
npm start

# Start frontend (in another terminal)
cd static/dashboard
npm run dev
```

#### Step 2: Configure Jira Connection

1. Open the application: `http://localhost:3000`
2. Navigate to **Project Setup** from the sidebar
3. Enter your Jira credentials:
   - **Jira URL**: Your Jira instance URL (e.g., `https://your-domain.atlassian.net`)
   - **Username**: Your Jira email address
   - **API Token**: Generate from [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
   - **Project Key**: Your Jira project key (e.g., `PROJ`)
   - **Board ID**: Your Scrum/Kanban board ID

4. Click **Test Connection** to verify
5. Click **Save Settings**

#### Step 3: Sync Data from Jira

1. After saving settings, click **Sync from Jira**
2. The system will fetch:
   - Active sprint details
   - All sprint issues
   - Team members
   - Sprint metrics

3. Data is cached locally for performance

---

## 🔑 Getting Your Jira API Token

### For Jira Cloud:

1. Go to [https://id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
2. Click **Create API token**
3. Give it a label (e.g., "Sprint Strategist")
4. Copy the token immediately (you won't see it again)

### Authentication Format:

```
Username: your-email@example.com
API Token: your-generated-token
```

---

## 📊 What Data is Fetched from Jira

### Sprint Information
- Sprint name, start date, end date
- Sprint goal
- Sprint state (active/closed)

### Issues
- Issue key, title, description
- Status, priority, type
- Assignee information
- Story points
- Created/updated timestamps

### Team Members
- Name, email, avatar
- Role in project
- Account ID

### Metrics (Calculated)
- Sprint health score
- Velocity
- Burndown data
- Team workload
- Completion percentage

---

## 🔄 Data Synchronization

### Automatic Sync
- Data syncs automatically when you access the dashboard
- If sync fails, cached data is used

### Manual Sync
- Go to **Project Setup**
- Click **Sync from Jira**
- Fresh data is fetched and cached

### Sync Frequency
- Dashboard: Every page load (with fallback to cache)
- Background: Every 5 minutes (configurable)

---

## 🗄️ Local Database

### Purpose
- **Cache Jira data** for performance
- **Store user settings** (alerts, preferences)
- **Track recommendations** and actions
- **Save chat history** with AI assistant

### What's NOT Stored
- No mock or sample data
- No fake sprints or issues
- Everything comes from your real Jira instance

### Database Location
```
api/data/sprint_strategist.db
```

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file in `api/` directory:

```env
# Optional: Anthropic API for enhanced AI features
ANTHROPIC_API_KEY=your_anthropic_key

# Server Configuration
PORT=3001
NODE_ENV=development
```

### Jira Configuration

Stored in database after setup via UI. No need to manually configure.

---

## 🔍 Troubleshooting

### "Jira not configured" Error

**Solution**: Complete Project Setup first
1. Go to Project Setup
2. Enter Jira credentials
3. Test connection
4. Save settings

### "No active sprint found" Error

**Solution**: Start a sprint in Jira
1. Go to your Jira board
2. Start a sprint
3. Return to Sprint Strategist
4. Click "Sync from Jira"

### "Failed to connect to Jira" Error

**Possible causes**:
- ❌ Wrong Jira URL
- ❌ Invalid API token
- ❌ Incorrect username
- ❌ Network/firewall issues
- ❌ Jira instance not accessible

**Solution**:
1. Verify your Jira URL (include https://)
2. Regenerate API token
3. Check username is your email
4. Test connection from Project Setup

### "Failed to sync from Jira" Error

**Possible causes**:
- ❌ No active sprint
- ❌ Board ID incorrect
- ❌ Insufficient permissions
- ❌ Project key wrong

**Solution**:
1. Verify board ID in Jira
2. Check project key is correct
3. Ensure you have access to the project
4. Start an active sprint

---

## 🎯 Required Jira Permissions

Your Jira account needs:
- ✅ **Browse Projects** permission
- ✅ **View Development Tools** permission
- ✅ **Administer Projects** (for full features)

---

## 📡 API Endpoints

### Project Setup
- `POST /api/project-setup` - Save Jira configuration
- `POST /api/project-setup/test-connection` - Test Jira connection
- `GET /api/project-setup/projects` - List available projects
- `GET /api/project-setup/projects/:key/boards` - List project boards
- `POST /api/project-setup/sync` - Sync data from Jira

### Sprint Data
- `GET /api/sprint` - Get active sprint (auto-syncs)
- `GET /api/issues` - Get sprint issues
- `GET /api/team` - Get team members
- `GET /api/metrics` - Get sprint metrics

---

## 🚀 Production Deployment

### Environment Setup

```bash
# Production environment variables
NODE_ENV=production
PORT=3001
JIRA_SYNC_INTERVAL=300000  # 5 minutes
```

### Deployment Checklist

- [ ] Configure Jira credentials via UI
- [ ] Test connection to Jira
- [ ] Perform initial sync
- [ ] Verify data appears correctly
- [ ] Set up alert integrations (Slack/Teams)
- [ ] Configure team capacities
- [ ] Set sprint goals

---

## 💡 Best Practices

### 1. Initial Setup
- Complete Project Setup before using other features
- Test connection before saving
- Sync data immediately after setup

### 2. Regular Usage
- Sync data at start of each day
- Update team capacities when changes occur
- Set sprint goals at sprint planning
- Review recommendations daily

### 3. Data Accuracy
- Keep Jira data up to date
- Update issue statuses promptly
- Assign story points consistently
- Use standard Jira workflows

---

## 🆘 Support

### Common Issues

**Q: Can I use this without Jira?**
A: No, this application requires a real Jira instance. It's designed specifically for Jira integration.

**Q: Does it work with Jira Server?**
A: Yes, it works with both Jira Cloud and Jira Server (v8.0+).

**Q: How often should I sync?**
A: Sync automatically happens on dashboard load. Manual sync recommended once per day or after major Jira updates.

**Q: Is my Jira data secure?**
A: Yes, credentials are stored locally in your database. API tokens are never exposed to the frontend.

---

## 📝 Next Steps

1. ✅ Complete Project Setup
2. ✅ Sync data from Jira
3. ✅ Configure alert settings
4. ✅ Set sprint goals
5. ✅ Review AI recommendations
6. ✅ Start using the dashboard!

---

**🎉 You're now ready to use Sprint Strategist with real Jira data!**