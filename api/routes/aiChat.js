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
    
    // Use the new AI service
    const aiResponse = await aiService.processAIChat(message, { 
      sprintData, 
      context 
    });
    
    if (aiResponse.success) {
      // Save to chat history
      db.prepare(`
        INSERT INTO chat_history (message, response, context)
        VALUES (?, ?, ?)
      `).run(message, aiResponse.response, context || 'general');

      res.json({
        success: true,
        response: aiResponse.response,
        intent: aiResponse.intent,
        suggestions: getSuggestions(aiResponse.intent)
      });
    } else {
      // Fallback to old system
      const response = await generateAIResponse(message, sprintData, context);
      
      db.prepare(`
        INSERT INTO chat_history (message, response, context)
        VALUES (?, ?, ?)
      `).run(message, response.content, context || 'general');

      res.json({
        success: true,
        response: response.content,
        suggestions: response.suggestions || []
      });
    }
  } catch (error) {
    console.error('Error in AI chat:', error);
    res.status(500).json({ 
      success: false, 
      error: 'حدث خطأ في الاتصال بالذكاء الاصطناعي' 
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
      'كيف أطبق هذه التوصيات؟',
      'ما هي الأولوية في التطبيق؟',
      'اقترح المزيد من الحلول'
    ],
    risk_analysis: [
      'كيف نقلل هذه المخاطر؟',
      'ما هي الإجراءات العاجلة؟',
      'تحليل تأثير المخاطر'
    ],
    performance: [
      'كيف نحسن الأداء؟',
      'ما هي معوقات الأداء؟',
      'مقارنة مع السبرينتات السابقة'
    ],
    team_management: [
      'كيف نحسن توزيع المهام؟',
      'من يحتاج مساعدة في الفريق؟',
      'اقتراحات لتحسين التعاون'
    ],
    general: [
      'كيف يبدو أداء السبرينت؟',
      'ما هي المخاطر الحالية؟',
      'اقترح توصيات للتحسين',
      'هل سننجح في الموعد المحدد؟'
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
  
  // Sprint status queries
  if (lowerMessage.includes('وضع السبرينت') || lowerMessage.includes('حالة السبرينت') || lowerMessage.includes('كيف يبدو')) {
    return generateSprintStatusResponse(sprintData);
  }
  
  // Risk analysis queries
  if (lowerMessage.includes('مخاطر') || lowerMessage.includes('مشاكل') || lowerMessage.includes('تحديات')) {
    return generateRiskAnalysisResponse(sprintData);
  }
  
  // Recommendations queries
  if (lowerMessage.includes('توصيات') || lowerMessage.includes('اقتراحات') || lowerMessage.includes('حلول')) {
    return generateRecommendationsResponse(sprintData);
  }
  
  // Velocity and performance queries
  if (lowerMessage.includes('سرعة') || lowerMessage.includes('أداء') || lowerMessage.includes('velocity')) {
    return generateVelocityResponse(sprintData);
  }
  
  // Team queries
  if (lowerMessage.includes('فريق') || lowerMessage.includes('team') || lowerMessage.includes('أعضاء')) {
    return generateTeamResponse(sprintData);
  }
  
  // Prediction queries
  if (lowerMessage.includes('توقع') || lowerMessage.includes('هل سننجح') || lowerMessage.includes('prediction')) {
    return generatePredictionResponse(sprintData);
  }
  
  // Default response
  return generateDefaultResponse(sprintData);
}

function generateSprintStatusResponse(data) {
  if (!data) {
    return {
      content: 'عذراً، لا أستطيع الوصول لبيانات السبرينت حالياً. يرجى المحاولة لاحقاً.',
      suggestions: []
    };
  }

  const { tasks, storyPoints, metrics } = data;
  
  let status = '';
  let emoji = '';
  
  if (metrics.completionRate >= 80) {
    status = 'ممتاز';
    emoji = '🎉';
  } else if (metrics.completionRate >= 60) {
    status = 'جيد';
    emoji = '👍';
  } else if (metrics.completionRate >= 40) {
    status = 'يحتاج تحسين';
    emoji = '⚠️';
  } else {
    status = 'يحتاج تدخل عاجل';
    emoji = '🚨';
  }

  const content = `${emoji} **وضع السبرينت الحالي: ${status}**

📊 **الإحصائيات:**
• المهام المكتملة: ${tasks.completed}/${tasks.total} (${metrics.completionRate.toFixed(1)}%)
• النقاط المكتملة: ${storyPoints.completed}/${storyPoints.total}
• المهام قيد التنفيذ: ${tasks.inProgress}
• المهام المحجوبة: ${tasks.blocked}

⏰ **الوقت المتبقي:** ${data.sprint.daysRemaining} أيام

📈 **الاتجاه:** ${
    metrics.burndownTrend === 'improving' ? 'تحسن مستمر 📈' :
    metrics.burndownTrend === 'declining' ? 'تراجع في الأداء 📉' :
    'مستقر 📊'
  }`;

  return {
    content,
    suggestions: [
      'ما هي أكبر المخاطر؟',
      'اقترح حلول للتحسين',
      'تحليل أداء الفريق',
      'هل سننجح في الموعد؟'
    ]
  };
}

function generateRiskAnalysisResponse(data) {
  if (!data) {
    return {
      content: 'لا يمكنني تحليل المخاطر بدون بيانات السبرينت.',
      suggestions: []
    };
  }

  const risks = [];
  
  if (data.metrics.completionRate < 50) {
    risks.push('🚨 **معدل الإنجاز منخفض**: ' + data.metrics.completionRate.toFixed(1) + '% فقط مكتمل');
  }
  
  if (data.tasks.blocked > 2) {
    risks.push('🚫 **مهام محجوبة كثيرة**: ' + data.tasks.blocked + ' مهام تحتاج حل عاجل');
  }
  
  if (data.sprint.daysRemaining < 3 && data.metrics.completionRate < 70) {
    risks.push('⏰ **ضغط الوقت**: وقت قليل متبقي مع إنجاز غير كافي');
  }
  
  const largeTasks = data.tasks.total - data.tasks.completed - data.tasks.inProgress - data.tasks.blocked;
  if (largeTasks > 5) {
    risks.push('📋 **مهام كثيرة لم تبدأ**: ' + largeTasks + ' مهام لم تبدأ بعد');
  }

  let content = '';
  
  if (risks.length === 0) {
    content = '✅ **ممتاز! لا توجد مخاطر كبيرة حالياً**\n\nالسبرينت يسير بشكل جيد. استمروا على نفس الوتيرة!';
  } else {
    content = `⚠️ **تحليل المخاطر - تم اكتشاف ${risks.length} مخاطر:**\n\n` + risks.join('\n\n');
    content += '\n\n💡 **التوصية:** يُنصح بمراجعة هذه المخاطر مع الفريق واتخاذ إجراءات فورية.';
  }

  return {
    content,
    suggestions: [
      'اقترح حلول لهذه المخاطر',
      'كيف نحسن معدل الإنجاز؟',
      'ما هي الأولويات العاجلة؟',
      'تحليل أداء الفريق'
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
  return {
    content: `مرحباً! أنا Rovo، مساعدك الذكي في إدارة السبرينت. 

يمكنني مساعدتك في:
🔍 **تحليل وضع السبرينت الحالي**
📊 **فهم المقاييس والبيانات** 
⚠️ **تحديد المخاطر والمشاكل**
💡 **اقتراح حلول وتوصيات**
🎯 **توقع نتائج السبرينت**
👥 **تحليل أداء الفريق**

ما الذي تريد معرفته عن سبرينتك؟`,
    suggestions: [
      'كيف يبدو أداء السبرينت؟',
      'ما هي المخاطر الحالية؟',
      'اقترح توصيات للتحسين',
      'هل سننجح في الموعد المحدد؟'
    ]
  };
}

export default router;