/**
 * 🏎️ Sprint Strategist Agent
 * 
 * The main Rovo AI Agent that acts as your team's
 * personal F1-style race strategist for sprints.
 */

import Resolver from '@forge/resolver';
import { getSprintData, getCurrentSprint } from '../services/sprintAnalyzer';
import { predictVelocity } from '../services/velocityPredictor';
import { identifyRisks, identifyBlockers } from '../services/riskDetector';
import { generateRecommendations } from '../services/aiService';

const resolver = new Resolver();

/**
 * Main agent context provider
 * Provides sprint context for AI conversations
 */
resolver.define('getAgentContext', async ({ context }) => {
  const { accountId, cloudId } = context;
  
  try {
    // Get current sprint data
    const currentSprint = await getCurrentSprint(cloudId);
    
    if (!currentSprint) {
      return {
        hasActiveSprint: false,
        message: "No active sprint found. Start a sprint to get insights!"
      };
    }

    // Gather comprehensive sprint data
    const [sprintData, velocity, risks, blockers] = await Promise.all([
      getSprintData(currentSprint.id),
      predictVelocity(currentSprint.id),
      identifyRisks(currentSprint.id),
      identifyBlockers(currentSprint.id)
    ]);

    return {
      hasActiveSprint: true,
      sprint: {
        id: currentSprint.id,
        name: currentSprint.name,
        goal: currentSprint.goal,
        startDate: currentSprint.startDate,
        endDate: currentSprint.endDate,
        daysRemaining: calculateDaysRemaining(currentSprint.endDate)
      },
      health: {
        score: sprintData.healthScore,
        status: getHealthStatus(sprintData.healthScore),
        trend: sprintData.healthTrend
      },
      velocity: {
        current: velocity.current,
        predicted: velocity.predicted,
        confidence: velocity.confidence,
        completionPercentage: velocity.completionPercentage
      },
      issues: {
        total: sprintData.totalIssues,
        completed: sprintData.completedIssues,
        inProgress: sprintData.inProgressIssues,
        todo: sprintData.todoIssues,
        blocked: blockers.length
      },
      risks: risks.map(r => ({
        type: r.type,
        severity: r.severity,
        description: r.description
      })),
      blockers: blockers.map(b => ({
        issueKey: b.key,
        summary: b.summary,
        blockedDays: b.blockedDays,
        assignee: b.assignee
      })),
      team: sprintData.teamMetrics
    };
  } catch (error) {
    console.error('Error getting agent context:', error);
    return {
      hasActiveSprint: false,
      error: error.message
    };
  }
});

/**
 * Handle natural language queries about sprint
 */
resolver.define('handleQuery', async ({ payload, context }) => {
  const { query } = payload;
  const { cloudId } = context;

  try {
    // Get sprint context
    const sprintContext = await resolver.getDefinitions()
      .find(d => d.name === 'getAgentContext')
      .handler({ context });

    if (!sprintContext.hasActiveSprint) {
      return {
        response: "🏁 No active sprint found. Start a new sprint to get AI-powered insights!",
        suggestions: [
          "How to start a sprint?",
          "Show me sprint planning tips"
        ]
      };
    }

    // Classify query intent
    const intent = classifyIntent(query);
    
    // Route to appropriate handler
    switch (intent) {
      case 'health':
        return handleHealthQuery(sprintContext);
      case 'blockers':
        return handleBlockersQuery(sprintContext);
      case 'prediction':
        return handlePredictionQuery(sprintContext);
      case 'pitstop':
        return handlePitStopQuery(sprintContext);
      case 'standup':
        return handleStandupQuery(sprintContext);
      case 'team':
        return handleTeamQuery(sprintContext);
      default:
        return handleGeneralQuery(query, sprintContext);
    }
  } catch (error) {
    console.error('Error handling query:', error);
    return {
      response: "I encountered an issue processing your request. Please try again.",
      error: error.message
    };
  }
});

/**
 * Query intent classification
 */
function classifyIntent(query) {
  const lowercaseQuery = query.toLowerCase();
  
  const intentPatterns = {
    health: ['health', 'status', 'how are we', 'sprint score', 'doing'],
    blockers: ['block', 'stuck', 'issue', 'problem', 'impediment'],
    prediction: ['predict', 'finish', 'complete', 'velocity', 'will we'],
    pitstop: ['pit', 'recommend', 'suggest', 'adjust', 'change', 'pivot'],
    standup: ['standup', 'stand-up', 'daily', 'summary', 'update'],
    team: ['team', 'workload', 'capacity', 'who', 'developer']
  };

  for (const [intent, patterns] of Object.entries(intentPatterns)) {
    if (patterns.some(pattern => lowercaseQuery.includes(pattern))) {
      return intent;
    }
  }

  return 'general';
}

/**
 * Handle health-related queries
 */
function handleHealthQuery(ctx) {
  const { health, sprint, issues } = ctx;
  const emoji = getHealthEmoji(health.score);
  
  return {
    response: `${emoji} **Sprint Health: ${health.score}/100**

📊 **${sprint.name}** - ${health.status}

**Progress Overview:**
- ✅ Completed: ${issues.completed}/${issues.total} issues
- 🔄 In Progress: ${issues.inProgress} issues
- 📋 To Do: ${issues.todo} issues
- 🚫 Blocked: ${issues.blocked} issues

**Days Remaining:** ${sprint.daysRemaining}

${health.trend === 'improving' ? '📈 Trend: Improving!' : health.trend === 'declining' ? '📉 Trend: Declining - action needed' : '➡️ Trend: Stable'}`,
    data: health,
    suggestions: [
      "What are the blockers?",
      "Will we finish on time?",
      "Suggest a pit-stop strategy"
    ]
  };
}

/**
 * Handle blocker-related queries
 */
function handleBlockersQuery(ctx) {
  const { blockers, risks } = ctx;
  
  if (blockers.length === 0) {
    return {
      response: `✅ **No Blockers Detected!**

Great news - all issues are moving smoothly. Keep up the momentum! 🏎️`,
      suggestions: ["Show sprint health", "Predict completion"]
    };
  }

  const blockerList = blockers.map(b => 
    `- **${b.issueKey}**: ${b.summary}\n  👤 ${b.assignee || 'Unassigned'} | ⏱️ Blocked for ${b.blockedDays} days`
  ).join('\n\n');

  const riskList = risks.filter(r => r.severity === 'high')
    .map(r => `- ⚠️ ${r.description}`)
    .join('\n');

  return {
    response: `🚫 **${blockers.length} Blocker(s) Detected**

${blockerList}

${riskList ? `\n**🔥 High-Priority Risks:**\n${riskList}` : ''}

💡 **Recommendation:** Schedule a quick sync to address these blockers today.`,
    data: { blockers, risks },
    suggestions: [
      "Suggest a pit-stop strategy",
      "Who can help with blockers?",
      "Show team workload"
    ]
  };
}

/**
 * Handle prediction queries
 */
function handlePredictionQuery(ctx) {
  const { velocity, sprint, issues } = ctx;
  const confidenceEmoji = velocity.confidence > 0.8 ? '🎯' : velocity.confidence > 0.6 ? '📊' : '⚠️';
  
  let prediction;
  if (velocity.completionPercentage >= 95) {
    prediction = '🏆 **Excellent!** You\'re on track to complete all sprint goals!';
  } else if (velocity.completionPercentage >= 80) {
    prediction = '👍 **Good progress!** Most goals will be achieved with current velocity.';
  } else if (velocity.completionPercentage >= 60) {
    prediction = '⚠️ **At Risk.** Consider a pit-stop to re-prioritize.';
  } else {
    prediction = '🚨 **Critical!** Major adjustments needed to meet sprint goals.';
  }

  return {
    response: `${confidenceEmoji} **Sprint Completion Prediction**

**Predicted Completion:** ${velocity.completionPercentage}%
**Current Velocity:** ${velocity.current} points
**Predicted Final:** ${velocity.predicted} points
**Confidence:** ${Math.round(velocity.confidence * 100)}%

${prediction}

**${sprint.daysRemaining} days remaining** to complete ${issues.total - issues.completed} issues.`,
    data: velocity,
    suggestions: [
      "Suggest a pit-stop strategy",
      "What's blocking us?",
      "Show team capacity"
    ]
  };
}

/**
 * Handle pit-stop recommendation queries
 */
async function handlePitStopQuery(ctx) {
  const recommendations = await generateRecommendations(ctx);
  
  if (recommendations.length === 0) {
    return {
      response: `✅ **No Pit-Stop Needed!**

Your sprint is running smoothly. Keep the momentum going! 🏎️`,
      suggestions: ["Show sprint health", "Predict completion"]
    };
  }

  const recList = recommendations.map((r, i) => 
    `**${i + 1}. ${r.title}**\n   ${r.description}\n   📈 Expected Impact: ${r.impact}`
  ).join('\n\n');

  return {
    response: `🏁 **Pit-Stop Recommendations**

${recList}

💡 Apply these changes to improve your sprint outcome!`,
    data: recommendations,
    actions: recommendations.map(r => ({
      type: r.actionType,
      label: r.title,
      payload: r.payload
    })),
    suggestions: [
      "Apply first recommendation",
      "Show more details",
      "Ignore suggestions"
    ]
  };
}

/**
 * Handle standup generation queries
 */
function handleStandupQuery(ctx) {
  const { sprint, issues, blockers } = ctx;
  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'short', 
    day: 'numeric' 
  });

  return {
    response: `📋 **Daily Standup Summary**
*${today} - ${sprint.name}*

---

### ✅ Completed Recently
${issues.completed > 0 ? `${issues.completed} issues completed` : 'No issues completed yet'}

### 🔄 In Progress Today
${issues.inProgress} issues currently being worked on

### 🚫 Blockers
${blockers.length > 0 
  ? blockers.map(b => `- ${b.issueKey}: ${b.summary}`).join('\n')
  : 'No blockers! 🎉'}

---

**Sprint Health:** ${ctx.health.score}/100 | **Days Left:** ${sprint.daysRemaining}`,
    suggestions: [
      "Show detailed progress",
      "Who's working on what?",
      "Email this summary"
    ]
  };
}

/**
 * Handle team-related queries
 */
function handleTeamQuery(ctx) {
  const { team } = ctx;
  
  if (!team || !team.members) {
    return {
      response: "Team data is not available. Make sure issues are assigned to team members.",
      suggestions: ["Show sprint health"]
    };
  }

  const memberList = team.members.map(m => {
    const loadEmoji = m.load > 100 ? '🔴' : m.load > 80 ? '🟡' : '🟢';
    return `${loadEmoji} **${m.name}**\n   Capacity: ${m.load}% | Tasks: ${m.taskCount}`;
  }).join('\n\n');

  return {
    response: `👥 **Team Workload**

${memberList}

**Legend:** 🟢 Healthy | 🟡 High Load | 🔴 Overloaded`,
    data: team,
    suggestions: [
      "Suggest rebalancing",
      "Who can take more work?",
      "Show blockers"
    ]
  };
}

/**
 * Handle general queries using AI
 */
async function handleGeneralQuery(query, ctx) {
  // Use AI service for complex queries
  const aiResponse = await generateRecommendations({
    query,
    context: ctx
  });

  return {
    response: aiResponse.message || "I'm here to help with your sprint! Try asking about health, blockers, predictions, or recommendations.",
    suggestions: [
      "What's our sprint health?",
      "Any blockers?",
      "Will we finish on time?"
    ]
  };
}

// Helper functions
function calculateDaysRemaining(endDate) {
  const end = new Date(endDate);
  const today = new Date();
  const diffTime = end - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function getHealthStatus(score) {
  if (score >= 80) return 'Excellent 🏆';
  if (score >= 60) return 'Good 👍';
  if (score >= 40) return 'At Risk ⚠️';
  return 'Critical 🚨';
}

function getHealthEmoji(score) {
  if (score >= 80) return '🟢';
  if (score >= 60) return '🟡';
  if (score >= 40) return '🟠';
  return '🔴';
}

export const handler = resolver.getDefinitions();
