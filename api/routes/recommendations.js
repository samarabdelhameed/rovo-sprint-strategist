import express from 'express';
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const db = new Database(path.join(__dirname, '../data/sprint_strategist.db'));

// Initialize recommendations table
db.exec(`
  CREATE TABLE IF NOT EXISTS recommendations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sprint_id TEXT,
    title TEXT NOT NULL,
    description TEXT,
    problem TEXT,
    solution TEXT,
    action TEXT NOT NULL,
    priority TEXT DEFAULT 'medium',
    success_probability INTEGER DEFAULT 70,
    estimated_time TEXT,
    expected_impact TEXT,
    parameters TEXT,
    affected_tasks TEXT,
    status TEXT DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    applied_at DATETIME
  )
`);

// Get current recommendations
router.get('/', (req, res) => {
  try {
    // Generate dynamic recommendations based on current sprint data
    const sprintData = getSprintAnalysis();
    const recommendations = generateRecommendations(sprintData);

    res.json({
      success: true,
      recommendations: recommendations,
      sprintId: 'SPRINT-2024-01',
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Apply recommendation
router.post('/apply', async (req, res) => {
  try {
    const { recommendationId, action, parameters } = req.body;

    // Simulate applying the recommendation
    const result = await applyRecommendation(action, parameters);

    if (result.success) {
      // Update recommendation status
      db.prepare(`
        UPDATE recommendations 
        SET status = 'applied', applied_at = CURRENT_TIMESTAMP 
        WHERE id = ?
      `).run(recommendationId);

      res.json({
        success: true,
        message: 'Recommendation applied successfully',
        result: result
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Error applying recommendation:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

function getSprintAnalysis() {
  // Get current sprint data from database
  const issues = db.prepare(`
    SELECT * FROM issues 
    WHERE sprint_id = 'SPRINT-2024-01'
  `).all();

  const teamMembers = db.prepare(`
    SELECT * FROM team_members
  `).all();

  // Calculate metrics
  const totalTasks = issues.length;
  const completedTasks = issues.filter(t => t.status === 'Done').length;
  const inProgressTasks = issues.filter(t => t.status === 'In Progress').length;
  const blockedTasks = issues.filter(t => t.status === 'Blocked').length;
  
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const sprintProgress = 65; // Simulated - would calculate based on dates
  
  return {
    totalTasks,
    completedTasks,
    inProgressTasks,
    blockedTasks,
    completionRate,
    sprintProgress,
    teamMembers,
    issues
  };
}

function generateRecommendations(sprintData) {
  const recommendations = [];
  let idCounter = 1;

  // Check for sprint risk
  if (sprintData.completionRate < sprintData.sprintProgress - 15) {
    recommendations.push({
      id: idCounter++,
      title: 'خطر عدم إنجاز السبرينت في الوقت المحدد',
      description: 'معدل الإنجاز أقل من المتوقع بناءً على الوقت المتبقي',
      problem: `معدل الإنجاز الحالي ${sprintData.completionRate.toFixed(1)}% بينما المفروض يكون ${sprintData.sprintProgress}%`,
      solution: 'إعادة تقييم نطاق السبرينت وإزالة المهام غير الضرورية',
      action: 'reduce_scope',
      priority: 'critical',
      successProbability: 85,
      estimatedTime: '2-3 ساعات',
      expectedImpact: 'زيادة احتمالية نجاح السبرينت إلى 90%',
      parameters: {
        tasksToRemove: Math.ceil(sprintData.totalTasks * 0.2),
        priorityThreshold: 'Low'
      },
      affectedTasks: sprintData.issues
        .filter(t => t.priority === 'Low' && t.status !== 'Done')
        .slice(0, 3)
        .map(t => ({ id: t.id, key: t.key, summary: t.title }))
    });
  }

  // Check for blocked tasks
  if (sprintData.blockedTasks > 2) {
    recommendations.push({
      id: idCounter++,
      title: 'حل المهام المحجوبة العاجلة',
      description: `يوجد ${sprintData.blockedTasks} مهام محجوبة تحتاج تدخل فوري`,
      problem: 'المهام المحجوبة تؤثر على تدفق العمل وتأخر السبرينت',
      solution: 'تحديد أسباب الحجب وإيجاد حلول بديلة أو تصعيد المشكلة',
      action: 'escalate',
      priority: 'high',
      successProbability: 75,
      estimatedTime: '1-2 أيام',
      expectedImpact: 'تحرير المهام المحجوبة وتسريع التقدم',
      parameters: {
        escalationLevel: 'manager',
        urgency: 'high'
      },
      affectedTasks: sprintData.issues
        .filter(t => t.status === 'Blocked')
        .map(t => ({ id: t.id, key: t.key, summary: t.title }))
    });
  }

  // Check team workload distribution
  const workloadAnalysis = analyzeTeamWorkload(sprintData.issues, sprintData.teamMembers);
  if (workloadAnalysis.imbalanced) {
    recommendations.push({
      id: idCounter++,
      title: 'إعادة توزيع المهام على الفريق',
      description: 'توزيع المهام غير متوازن بين أعضاء الفريق',
      problem: `${workloadAnalysis.overloadedMembers.join(', ')} محملين بمهام أكثر من اللازم`,
      solution: 'إعادة توزيع المهام لتحقيق توازن أفضل في العبء',
      action: 'reassign_task',
      priority: 'medium',
      successProbability: 80,
      estimatedTime: '30 دقيقة',
      expectedImpact: 'تحسين كفاءة الفريق وتقليل الضغط',
      parameters: {
        fromMembers: workloadAnalysis.overloadedMembers,
        toMembers: workloadAnalysis.underloadedMembers,
        tasksToMove: 2
      }
    });
  }

  // Check for large tasks that should be split
  const largeTasks = sprintData.issues.filter(t => 
    t.story_points > 8 && t.status !== 'Done'
  );
  
  if (largeTasks.length > 0) {
    recommendations.push({
      id: idCounter++,
      title: 'تقسيم المهام الكبيرة',
      description: 'يوجد مهام كبيرة يمكن تقسيمها لتسهيل التتبع',
      problem: 'المهام الكبيرة صعبة التتبع وقد تسبب تأخير في آخر لحظة',
      solution: 'تقسيم المهام إلى مهام فرعية أصغر وأكثر قابلية للإدارة',
      action: 'split_task',
      priority: 'medium',
      successProbability: 90,
      estimatedTime: '1 ساعة',
      expectedImpact: 'تحسين الرؤية وتقليل المخاطر',
      parameters: {
        maxStoryPoints: 5,
        targetSubtasks: 3
      },
      affectedTasks: largeTasks.slice(0, 2).map(t => ({
        id: t.id,
        key: t.key,
        summary: t.title
      }))
    });
  }

  // Add resource recommendation if team is struggling
  if (sprintData.completionRate < 40 && sprintData.sprintProgress > 50) {
    recommendations.push({
      id: idCounter++,
      title: 'إضافة موارد إضافية للسبرينت',
      description: 'الفريق يحتاج مساعدة إضافية لإنجاز السبرينت',
      problem: 'التقدم بطيء جداً مقارنة بالوقت المتبقي',
      solution: 'إضافة مطور إضافي أو تمديد ساعات العمل',
      action: 'add_resources',
      priority: 'high',
      successProbability: 70,
      estimatedTime: 'فوري',
      expectedImpact: 'زيادة سرعة الإنجاز بنسبة 30-40%',
      parameters: {
        resourceType: 'developer',
        duration: 'remainder_of_sprint',
        skills: ['React', 'Node.js']
      }
    });
  }

  return recommendations;
}

function analyzeTeamWorkload(issues, teamMembers) {
  const workload = {};
  
  // Initialize workload for each member
  teamMembers.forEach(member => {
    workload[member.name] = {
      tasks: 0,
      storyPoints: 0
    };
  });

  // Calculate current workload
  issues.filter(t => t.status !== 'Done').forEach(task => {
    if (task.assignee_id && workload[task.assignee_id]) {
      workload[task.assignee_id].tasks++;
      workload[task.assignee_id].storyPoints += task.story_points || 0;
    }
  });

  // Analyze balance
  const avgTasks = Object.values(workload).reduce((sum, w) => sum + w.tasks, 0) / teamMembers.length;
  const avgStoryPoints = Object.values(workload).reduce((sum, w) => sum + w.storyPoints, 0) / teamMembers.length;

  const overloadedMembers = [];
  const underloadedMembers = [];

  Object.entries(workload).forEach(([member, load]) => {
    if (load.tasks > avgTasks * 1.5 || load.storyPoints > avgStoryPoints * 1.5) {
      overloadedMembers.push(member);
    } else if (load.tasks < avgTasks * 0.5 || load.storyPoints < avgStoryPoints * 0.5) {
      underloadedMembers.push(member);
    }
  });

  return {
    imbalanced: overloadedMembers.length > 0 && underloadedMembers.length > 0,
    overloadedMembers,
    underloadedMembers,
    workload
  };
}

async function applyRecommendation(action, parameters) {
  // Simulate applying different types of recommendations
  switch (action) {
    case 'reduce_scope':
      return {
        success: true,
        message: `تم إزالة ${parameters.tasksToRemove} مهام من السبرينت`,
        details: 'تم تحديث نطاق السبرينت بنجاح'
      };

    case 'reassign_task':
      return {
        success: true,
        message: `تم إعادة توزيع ${parameters.tasksToMove} مهام`,
        details: 'تم تحسين توزيع العبء على الفريق'
      };

    case 'escalate':
      return {
        success: true,
        message: 'تم تصعيد المهام المحجوبة للإدارة',
        details: 'سيتم متابعة حل المشاكل خلال 24 ساعة'
      };

    case 'split_task':
      return {
        success: true,
        message: 'تم تقسيم المهام الكبيرة إلى مهام فرعية',
        details: 'تحسنت قابلية التتبع والإدارة'
      };

    case 'add_resources':
      return {
        success: true,
        message: 'تم طلب موارد إضافية للسبرينت',
        details: 'سيتم توفير مطور إضافي خلال يومين'
      };

    case 'extend_sprint':
      return {
        success: true,
        message: 'تم تمديد السبرينت لمدة يومين إضافيين',
        details: 'تم تحديث الجدول الزمني للمشروع'
      };

    default:
      return {
        success: false,
        error: 'نوع التوصية غير مدعوم'
      };
  }
}

export default router;