import express from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import aiService from '../services/aiService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const db = new Database(path.join(__dirname, '../data/sprint_strategist.db'));

// Initialize chat history table
db.exec(`
  CREATE TABLE IF NOT EXISTS chat_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT DEFAULT 'default',
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    context TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// AI Chat endpoint
router.post('/', async (req, res) => {
  try {
    const { message, context } = req.body;
    
    // Get current sprint data for context
    const sprintData = getSprintContext();
    
    // Generate AI response based on message and context
    const response = await generateAIResponse(message, sprintData, context);
    
    // Save to chat history
    db.prepare(`
      INSERT INTO chat_history (message, response, context)
      VALUES (?, ?, ?)
    `).run(message, response.content, context || 'general');

    res.json({
      success: true,
      response: response.content,
      suggestions: response.suggestions || []
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Error connecting to AI service' 
    });
  }
});

// Get AI Service Status
router.get('/status', (req, res) => {
  try {
    const status = aiService.getAIServiceStatus();
    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    console.error('Error getting AI status:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

function getSuggestions(intent) {
  const suggestions = {
    recommendation: [
      'How do I apply these recommendations?',
      'What is the priority for implementation?',
      'Suggest more solutions'
    ],
    risk_analysis: [
      'How do we reduce these risks?',
      'What are the urgent actions?',
      'Analyze risk impact'
    ],
    performance: [
      'How do we improve performance?',
      'What are the performance blockers?',
      'Compare with previous sprints'
    ],
    team_management: [
      'How do we improve task distribution?',
      'Who needs help in the team?',
      'Suggestions for improving collaboration'
    ],
    general: [
      'How is the sprint performing?',
      'What are the current risks?',
      'Suggest recommendations for improvement',
      'Will we succeed on time?'
    ]
  };
  
  return suggestions[intent] || suggestions.general;
}

// Get chat history
router.get('/history', (req, res) => {
  try {
    const history = db.prepare(`
      SELECT * FROM chat_history 
      WHERE user_id = 'default' 
      ORDER BY created_at DESC 
      LIMIT 50
    `).all();

    res.json({
      success: true,
      history: history
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

function getSprintContext() {
  try {
    // Get current sprint data
    const issues = db.prepare(`
      SELECT * FROM issues 
      WHERE sprint_id = 'SPRINT-2024-01'
    `).all();

    const teamMembers = db.prepare(`
      SELECT * FROM team_members
    `).all();

    const sprintMetrics = db.prepare(`
      SELECT * FROM sprint_metrics 
      WHERE sprint_id = 'SPRINT-2024-01'
      ORDER BY recorded_at DESC 
      LIMIT 7
    `).all();

    // Get sprint goals
    const sprintGoals = db.prepare(`
      SELECT * FROM sprint_goals 
      WHERE sprint_id = 'SPRINT-2024-01'
      ORDER BY created_at DESC
    `).all();

    // Calculate current metrics
    const totalTasks = issues.length;
    const completedTasks = issues.filter(t => t.status === 'Done').length;
    const inProgressTasks = issues.filter(t => t.status === 'In Progress').length;
    const blockedTasks = issues.filter(t => t.status === 'Blocked').length;
    const todoTasks = issues.filter(t => t.status === 'To Do').length;

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const totalStoryPoints = issues.reduce((sum, task) => sum + (task.story_points || 0), 0);
    const completedStoryPoints = issues
      .filter(t => t.status === 'Done')
      .reduce((sum, task) => sum + (task.story_points || 0), 0);

    return {
      sprint: {
        id: 'SPRINT-2024-01',
        name: 'Sprint 1 - Q1 2024',
        startDate: '2024-01-01',
        endDate: '2024-01-14',
        daysRemaining: 3
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        blocked: blockedTasks,
        todo: todoTasks
      },
      storyPoints: {
        total: totalStoryPoints,
        completed: completedStoryPoints,
        remaining: totalStoryPoints - completedStoryPoints
      },
      metrics: {
        completionRate: completionRate,
        velocity: completedStoryPoints,
        burndownTrend: sprintMetrics.length > 1 ? 
          calculateTrend(sprintMetrics) : 'stable'
      },
      goals: sprintGoals,
      team: teamMembers,
      risks: identifyRisks(issues, completionRate)
    };
  } catch (error) {
    console.error('Error getting sprint context:', error);
    return null;
  }
}

function calculateTrend(metrics) {
  if (metrics.length < 2) return 'stable';
  
  const latest = metrics[0];
  const previous = metrics[1];
  
  const change = latest.completed_story_points - previous.completed_story_points;
  
  if (change > 5) return 'improving';
  if (change < -2) return 'declining';
  return 'stable';
}

function identifyRisks(issues, completionRate) {
  const risks = [];
  
  if (completionRate < 50) {
    risks.push('low_completion_rate');
  }
  
  const blockedTasks = issues.filter(t => t.status === 'Blocked').length;
  if (blockedTasks > 2) {
    risks.push('too_many_blocked_tasks');
  }
  
  const largeTasks = issues.filter(t => t.story_points > 8 && t.status !== 'Done').length;
  if (largeTasks > 0) {
    risks.push('large_unfinished_tasks');
  }
  
  return risks;
}

async function generateAIResponse(message, sprintData, context) {
  // Simulate AI processing - in real implementation, this would call OpenAI/Rovo API
  const lowerMessage = message.toLowerCase();
  
  // Sprint goals queries
  if (lowerMessage.includes('goals') || lowerMessage.includes('objective') || lowerMessage.includes('target')) {
    return generateGoalsResponse(sprintData);
  }
  
  // Sprint status queries
  if (lowerMessage.includes('status') || lowerMessage.includes('how') || lowerMessage.includes('performing')) {
    return generateSprintStatusResponse(sprintData);
  }
  
  // Risk analysis queries
  if (lowerMessage.includes('risk') || lowerMessage.includes('problem') || lowerMessage.includes('challenge')) {
    return generateRiskAnalysisResponse(sprintData);
  }
  
  // Recommendations queries
  if (lowerMessage.includes('recommend') || lowerMessage.includes('suggest') || lowerMessage.includes('solution')) {
    return generateRecommendationsResponse(sprintData);
  }
  
  // Velocity and performance queries
  if (lowerMessage.includes('velocity') || lowerMessage.includes('performance') || lowerMessage.includes('speed')) {
    return generateVelocityResponse(sprintData);
  }
  
  // Team queries
  if (lowerMessage.includes('team') || lowerMessage.includes('member') || lowerMessage.includes('assign')) {
    return generateTeamResponse(sprintData);
  }
  
  // Prediction queries
  if (lowerMessage.includes('predict') || lowerMessage.includes('will we succeed') || lowerMessage.includes('finish')) {
    return generatePredictionResponse(sprintData);
  }
  
  // Default response
  return generateDefaultResponse(sprintData);
}

function generateGoalsResponse(data) {
  if (!data || !data.goals) {
    return {
      content: 'لا يمكنني الوصول لبيانات أهداف السبرينت حالياً.',
      suggestions: []
    };
  }

  if (data.goals.length === 0) {
    return {
      content: '📋 **لا توجد أهداف محددة للسبرينت الحالي**\n\nيُنصح بإضافة أهداف واضحة لتحسين التركيز والإنتاجية.',
      suggestions: [
        'كيف أضيف أهداف للسبرينت؟',
        'ما هي أفضل الممارسات للأهداف؟',
        'تحليل أداء السبرينت',
        'اقتراحات لتحسين التخطيط'
      ]
    };
  }

  const goalsText = data.goals.map((goal, index) => {
    const progress = goal.current_value && goal.target_value 
      ? Math.round((goal.current_value / goal.target_value) * 100) 
      : 0;
    
    const statusEmoji = goal.status === 'completed' ? '✅' : 
                       goal.status === 'in_progress' ? '🔄' : '⏳';
    
    const priorityEmoji = goal.priority === 'high' ? '🔴' : 
                         goal.priority === 'medium' ? '🟡' : '🟢';
    
    return `${index + 1}. ${statusEmoji} **${goal.title}** ${priorityEmoji}\n   📝 ${goal.description || 'لا يوجد وصف'}\n   📊 التقدم: ${progress}% (${goal.current_value || 0}/${goal.target_value} ${goal.unit})`;
  }).join('\n\n');

  const completedGoals = data.goals.filter(g => g.status === 'completed').length;
  const totalGoals = data.goals.length;
  const overallProgress = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  const content = `🎯 **أهداف السبرينت الحالية:**

${goalsText}

📈 **الملخص العام:**
• إجمالي الأهداف: ${totalGoals}
• المكتملة: ${completedGoals}
• التقدم الإجمالي: ${overallProgress}%

💡 **التوصية:** ${overallProgress >= 70 ? 'أداء ممتاز! استمر على نفس الوتيرة' : 
  overallProgress >= 40 ? 'تقدم جيد، ركز على الأهداف عالية الأولوية' : 
  'يحتاج تركيز أكبر على تحقيق الأهداف'}`;

  return {
    content,
    suggestions: [
      'كيف أحسن تحقيق الأهداف؟',
      'ما هي الأهداف المتأخرة؟',
      'اقترح خطة لتسريع التقدم',
      'تحليل أداء السبرينت العام'
    ]
  };
}

function generateSprintStatusResponse(data) {
  if (!data) {
    return {
      content: 'Sorry, I cannot access sprint data at the moment. Please try again later.',
      suggestions: []
    };
  }

  const { tasks, storyPoints, metrics } = data;
  
  let status = '';
  let emoji = '';
  
  if (metrics.completionRate >= 80) {
    status = 'Excellent';
    emoji = '🎉';
  } else if (metrics.completionRate >= 60) {
    status = 'Good';
    emoji = '👍';
  } else if (metrics.completionRate >= 40) {
    status = 'Needs Improvement';
    emoji = '⚠️';
  } else {
    status = 'Needs Urgent Attention';
    emoji = '🚨';
  }

  const content = `${emoji} **Current Sprint Status: ${status}**

📊 **Statistics:**
• Completed Tasks: ${tasks.completed}/${tasks.total} (${metrics.completionRate.toFixed(1)}%)
• Completed Story Points: ${storyPoints.completed}/${storyPoints.total}
• Tasks In Progress: ${tasks.inProgress}
• Blocked Tasks: ${tasks.blocked}

⏰ **Time Remaining:** ${data.sprint.daysRemaining} days

📈 **Trend:** ${
    metrics.burndownTrend === 'improving' ? 'Continuous Improvement 📈' :
    metrics.burndownTrend === 'declining' ? 'Performance Decline 📉' :
    'Stable 📊'
  }`;

  return {
    content,
    suggestions: [
      'What are the biggest risks?',
      'Suggest solutions for improvement',
      'Analyze team performance',
      'Will we succeed on time?'
    ]
  };
}

function generateRiskAnalysisResponse(data) {
  if (!data) {
    return {
      content: 'I cannot analyze risks without sprint data.',
      suggestions: []
    };
  }

  const risks = [];
  
  if (data.metrics.completionRate < 50) {
    risks.push('🚨 **Low Completion Rate**: Only ' + data.metrics.completionRate.toFixed(1) + '% completed');
  }
  
  if (data.tasks.blocked > 2) {
    risks.push('🚫 **Too Many Blocked Tasks**: ' + data.tasks.blocked + ' tasks need urgent resolution');
  }
  
  if (data.sprint.daysRemaining < 3 && data.metrics.completionRate < 70) {
    risks.push('⏰ **Time Pressure**: Little time remaining with insufficient completion');
  }
  
  const largeTasks = data.tasks.total - data.tasks.completed - data.tasks.inProgress - data.tasks.blocked;
  if (largeTasks > 5) {
    risks.push('📋 **Too Many Unstarted Tasks**: ' + largeTasks + ' tasks haven\'t started yet');
  }

  let content = '';
  
  if (risks.length === 0) {
    content = '✅ **Excellent! No major risks detected**\n\nThe sprint is going well. Keep up the good work!';
  } else {
    content = `⚠️ **Risk Analysis - ${risks.length} risks detected:**\n\n` + risks.join('\n\n');
    content += '\n\n💡 **Recommendation:** Review these risks with the team and take immediate action.';
  }

  return {
    content,
    suggestions: [
      'Suggest solutions for these risks',
      'How do we improve completion rate?',
      'What are the urgent priorities?',
      'Analyze team performance'
    ]
  };
}

function generateRecommendationsResponse(data) {
  const recommendations = [];
  
  if (data.metrics.completionRate < 60) {
    recommendations.push('🎯 **تقليل النطاق**: إزالة المهام غير الضرورية لضمان إنجاز الأساسيات');
  }
  
  if (data.tasks.blocked > 1) {
    recommendations.push('🚫 **حل المهام المحجوبة**: تصعيد المشاكل للإدارة أو إيجاد حلول بديلة');
  }
  
  if (data.tasks.inProgress > data.team.length * 2) {
    recommendations.push('⚡ **تركيز الجهود**: تقليل المهام المتوازية والتركيز على الإنهاء');
  }
  
  recommendations.push('📊 **مراجعة يومية**: زيادة تكرار المتابعة لاكتشاف المشاكل مبكراً');
  recommendations.push('👥 **توزيع العبء**: التأكد من توزيع المهام بشكل متوازن على الفريق');

  const content = `💡 **التوصيات الذكية للسبرينت:**\n\n` + 
    recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n\n');

  return {
    content,
    suggestions: [
      'كيف أطبق هذه التوصيات؟',
      'ما هي الأولوية في التطبيق؟',
      'تحليل تأثير كل توصية',
      'بدائل أخرى للحلول'
    ]
  };
}

function generateVelocityResponse(data) {
  const velocity = data.storyPoints.completed;
  const expectedVelocity = data.storyPoints.total / 2; // Assuming 2-week sprint
  
  let performance = '';
  if (velocity >= expectedVelocity * 1.2) {
    performance = 'ممتاز - أعلى من المتوقع! 🚀';
  } else if (velocity >= expectedVelocity * 0.8) {
    performance = 'جيد - ضمن المعدل المتوقع 👍';
  } else {
    performance = 'أقل من المتوقع - يحتاج تحسين ⚠️';
  }

  const content = `📈 **تحليل سرعة الفريق (Velocity):**

🎯 **الأداء الحالي:** ${performance}
• النقاط المكتملة: ${velocity}
• النقاط المتوقعة: ${expectedVelocity.toFixed(1)}
• معدل الإنجاز: ${((velocity / expectedVelocity) * 100).toFixed(1)}%

📊 **الاتجاه:** ${data.metrics.burndownTrend === 'improving' ? 'تحسن مستمر' : 
  data.metrics.burndownTrend === 'declining' ? 'تراجع في الأداء' : 'مستقر'}

💡 **نصائح لتحسين السرعة:**
• تقليل المهام المتوازية
• حل المعوقات بسرعة
• تحسين التعاون بين الفريق
• تقسيم المهام الكبيرة`;

  return {
    content,
    suggestions: [
      'كيف نحسن السرعة؟',
      'ما هي معوقات الأداء؟',
      'مقارنة مع السبرينتات السابقة',
      'تحليل أداء كل عضو'
    ]
  };
}

function generateTeamResponse(data) {
  const teamSize = data.team.length;
  const tasksPerMember = (data.tasks.total / teamSize).toFixed(1);
  
  const content = `👥 **تحليل الفريق:**

📊 **إحصائيات عامة:**
• عدد الأعضاء: ${teamSize}
• متوسط المهام لكل عضو: ${tasksPerMember}
• إجمالي المهام: ${data.tasks.total}

⚖️ **توزيع العبء:**
${data.team.map(member => {
  const memberTasks = Math.floor(Math.random() * 5) + 2; // Simulated
  return `• ${member.name}: ${memberTasks} مهام`;
}).join('\n')}

💡 **ملاحظات:**
• يُنصح بمراجعة توزيع المهام
• التأكد من عدم تحميل عضو واحد أكثر من اللازم
• تشجيع التعاون والمساعدة المتبادلة`;

  return {
    content,
    suggestions: [
      'كيف نحسن توزيع المهام؟',
      'من يحتاج مساعدة في الفريق؟',
      'تحليل مهارات الفريق',
      'اقتراحات لتحسين التعاون'
    ]
  };
}

function generatePredictionResponse(data) {
  const completionRate = data.metrics.completionRate;
  const daysRemaining = data.sprint.daysRemaining;
  
  let successProbability = 0;
  let prediction = '';
  
  if (completionRate >= 80) {
    successProbability = 95;
    prediction = 'نعم، بكل تأكيد! 🎉';
  } else if (completionRate >= 60) {
    successProbability = 80;
    prediction = 'على الأرجح نعم 👍';
  } else if (completionRate >= 40) {
    successProbability = 60;
    prediction = 'ممكن مع بعض التعديلات ⚠️';
  } else {
    successProbability = 30;
    prediction = 'صعب بدون تدخل عاجل 🚨';
  }

  const content = `🔮 **توقع نجاح السبرينت:**

${prediction}

📊 **احتمالية النجاح:** ${successProbability}%

📈 **التحليل:**
• معدل الإنجاز الحالي: ${completionRate.toFixed(1)}%
• الوقت المتبقي: ${daysRemaining} أيام
• المهام المتبقية: ${data.tasks.total - data.tasks.completed}

${successProbability < 70 ? `
⚡ **إجراءات مطلوبة للنجاح:**
• تقليل نطاق السبرينت
• حل المهام المحجوبة فوراً
• زيادة التركيز على المهام الأساسية
• مراجعة يومية مكثفة` : `
✅ **للحفاظ على النجاح:**
• استمرار على نفس الوتيرة
• مراقبة المخاطر الجديدة
• دعم أعضاء الفريق`}`;

  return {
    content,
    suggestions: [
      'كيف نضمن النجاح؟',
      'ما هي أكبر التحديات؟',
      'خطة الطوارئ إذا تأخرنا',
      'مراجعة الأولويات'
    ]
  };
}

function generateDefaultResponse(data) {
  const goalsInfo = data.goals && data.goals.length > 0 
    ? `\n\n🎯 **Current Sprint Goals:**\n${data.goals.map(g => `• ${g.title} (${g.priority})`).join('\n')}`
    : '';

  return {
    content: `Hello! I'm Rovo, your smart sprint management assistant. 

I can help you with:
🔍 **Analyze current sprint status**
📊 **Understand metrics and data** 
⚠️ **Identify risks and problems**
💡 **Suggest solutions and recommendations**
🎯 **Predict sprint outcomes**
👥 **Analyze team performance**${goalsInfo}

What would you like to know about your sprint?`,
    suggestions: [
      'How is the sprint performing?',
      'What are the current risks?',
      'Suggest recommendations for improvement',
      'Will we succeed on time?'
    ]
  };
}

export default router;