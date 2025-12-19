/**
 * Free AI Service - Local AI Implementation
 * Provides AI-like functionality without external API keys
 */

class FreeAiService {
    constructor() {
        this.initialized = true;
        this.templates = {
            recommendations: this.getRecommendationTemplates(),
            riskAnalysis: this.getRiskAnalysisTemplates(),
            chatResponses: this.getChatResponseTemplates()
        };
    }

    /**
     * Generate AI-powered recommendations based on sprint data
     */
    async generateRecommendations(sprintData) {
        try {
            const analysis = this.analyzeSprintData(sprintData);
            const recommendations = [];

            // Performance Analysis
            if (analysis.completionRate < 70) {
                recommendations.push({
                    type: 'performance',
                    priority: 'high',
                    title: 'تحسين معدل إنجاز المهام',
                    description: `معدل الإنجاز الحالي ${analysis.completionRate}%. يُنصح بتقليل عدد المهام أو زيادة وقت السبرينت.`,
                    action: 'reduce_scope',
                    impact: 'high'
                });
            }

            // Velocity Analysis
            if (analysis.velocityTrend === 'declining') {
                recommendations.push({
                    type: 'velocity',
                    priority: 'medium',
                    title: 'تحسين سرعة الفريق',
                    description: 'سرعة الفريق في انخفاض. يُنصح بمراجعة العوائق وتحسين العمليات.',
                    action: 'improve_process',
                    impact: 'medium'
                });
            }

            // Workload Distribution
            if (analysis.workloadImbalance > 0.3) {
                recommendations.push({
                    type: 'workload',
                    priority: 'medium',
                    title: 'توزيع أفضل للمهام',
                    description: 'يوجد عدم توازن في توزيع المهام بين أعضاء الفريق.',
                    action: 'redistribute_tasks',
                    impact: 'medium'
                });
            }

            // Risk Analysis
            const risks = this.identifyRisks(sprintData);
            risks.forEach(risk => {
                recommendations.push({
                    type: 'risk',
                    priority: risk.severity,
                    title: `إدارة المخاطر: ${risk.title}`,
                    description: risk.description,
                    action: risk.mitigation,
                    impact: risk.severity
                });
            });

            return {
                success: true,
                recommendations,
                analysis,
                generatedAt: new Date().toISOString()
            };

        } catch (error) {
            console.error('Error generating recommendations:', error);
            return {
                success: false,
                error: 'فشل في توليد التوصيات',
                recommendations: []
            };
        }
    }

    /**
     * AI Chat functionality
     */
    async processChat(message, context = {}) {
        try {
            const intent = this.detectIntent(message);
            const response = this.generateChatResponse(intent, message, context);

            return {
                success: true,
                response,
                intent,
                timestamp: new Date().toISOString()
            };

        } catch (error) {
            console.error('Error processing chat:', error);
            return {
                success: false,
                response: 'عذراً، حدث خطأ في معالجة رسالتك. يرجى المحاولة مرة أخرى.',
                error: error.message
            };
        }
    }

    /**
     * Risk Analysis
     */
    async analyzeRisks(sprintData) {
        try {
            const risks = this.identifyRisks(sprintData);
            const riskScore = this.calculateRiskScore(risks);

            return {
                success: true,
                riskScore,
                risks,
                recommendations: this.getRiskMitigationStrategies(risks),
                analysis: {
                    totalRisks: risks.length,
                    highRisks: risks.filter(r => r.severity === 'high').length,
                    mediumRisks: risks.filter(r => r.severity === 'medium').length,
                    lowRisks: risks.filter(r => r.severity === 'low').length
                }
            };

        } catch (error) {
            console.error('Error analyzing risks:', error);
            return {
                success: false,
                error: 'فشل في تحليل المخاطر',
                risks: []
            };
        }
    }

    // Helper Methods
    analyzeSprintData(sprintData) {
        const totalTasks = sprintData.issues?.length || 0;
        const completedTasks = sprintData.issues?.filter(issue => 
            issue.fields?.status?.name === 'Done' || 
            issue.fields?.status?.statusCategory?.key === 'done'
        ).length || 0;

        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Calculate velocity trend (simplified)
        const velocityTrend = this.calculateVelocityTrend(sprintData);
        
        // Calculate workload imbalance
        const workloadImbalance = this.calculateWorkloadImbalance(sprintData);

        return {
            totalTasks,
            completedTasks,
            completionRate,
            velocityTrend,
            workloadImbalance
        };
    }

    calculateVelocityTrend(sprintData) {
        // Simplified velocity calculation
        const currentVelocity = sprintData.issues?.length || 0;
        const avgVelocity = 15; // Assumed average
        
        if (currentVelocity < avgVelocity * 0.8) return 'declining';
        if (currentVelocity > avgVelocity * 1.2) return 'improving';
        return 'stable';
    }

    calculateWorkloadImbalance(sprintData) {
        // Simplified workload calculation
        const assignees = {};
        sprintData.issues?.forEach(issue => {
            const assignee = issue.fields?.assignee?.displayName || 'Unassigned';
            assignees[assignee] = (assignees[assignee] || 0) + 1;
        });

        const taskCounts = Object.values(assignees);
        if (taskCounts.length === 0) return 0;

        const avg = taskCounts.reduce((a, b) => a + b, 0) / taskCounts.length;
        const variance = taskCounts.reduce((acc, count) => acc + Math.pow(count - avg, 2), 0) / taskCounts.length;
        
        return Math.sqrt(variance) / avg; // Coefficient of variation
    }

    identifyRisks(sprintData) {
        const risks = [];
        const analysis = this.analyzeSprintData(sprintData);

        // Time-based risks
        const daysLeft = this.calculateDaysLeft(sprintData);
        if (daysLeft < 3 && analysis.completionRate < 80) {
            risks.push({
                id: 'time_pressure',
                title: 'ضغط الوقت',
                description: `باقي ${daysLeft} أيام فقط ومعدل الإنجاز ${analysis.completionRate}%`,
                severity: 'high',
                mitigation: 'prioritize_critical_tasks'
            });
        }

        // Scope risks
        if (analysis.totalTasks > 20) {
            risks.push({
                id: 'scope_overload',
                title: 'زيادة في النطاق',
                description: `عدد المهام (${analysis.totalTasks}) قد يكون كثير للسبرينت`,
                severity: 'medium',
                mitigation: 'reduce_scope'
            });
        }

        // Team capacity risks
        if (analysis.workloadImbalance > 0.4) {
            risks.push({
                id: 'workload_imbalance',
                title: 'عدم توازن الأحمال',
                description: 'توزيع غير متوازن للمهام بين أعضاء الفريق',
                severity: 'medium',
                mitigation: 'redistribute_workload'
            });
        }

        return risks;
    }

    calculateDaysLeft(sprintData) {
        // Simplified calculation - assume 2 weeks sprint
        const sprintStart = new Date(sprintData.startDate || Date.now() - 7 * 24 * 60 * 60 * 1000);
        const sprintEnd = new Date(sprintStart.getTime() + 14 * 24 * 60 * 60 * 1000);
        const now = new Date();
        
        return Math.max(0, Math.ceil((sprintEnd - now) / (24 * 60 * 60 * 1000)));
    }

    calculateRiskScore(risks) {
        const weights = { high: 3, medium: 2, low: 1 };
        const totalScore = risks.reduce((sum, risk) => sum + weights[risk.severity], 0);
        const maxScore = risks.length * 3;
        
        return maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    }

    getRiskMitigationStrategies(risks) {
        const strategies = [];
        
        risks.forEach(risk => {
            switch (risk.mitigation) {
                case 'prioritize_critical_tasks':
                    strategies.push('ركز على المهام الحرجة أولاً');
                    break;
                case 'reduce_scope':
                    strategies.push('قلل من نطاق السبرينت');
                    break;
                case 'redistribute_workload':
                    strategies.push('أعد توزيع المهام بين الفريق');
                    break;
                default:
                    strategies.push('راجع العمليات وحسن الأداء');
            }
        });

        return [...new Set(strategies)]; // Remove duplicates
    }

    detectIntent(message) {
        const msg = message.toLowerCase();
        
        if (msg.includes('توصية') || msg.includes('نصيحة') || msg.includes('اقتراح')) {
            return 'recommendation';
        }
        if (msg.includes('مخاطر') || msg.includes('خطر') || msg.includes('مشكلة')) {
            return 'risk_analysis';
        }
        if (msg.includes('أداء') || msg.includes('سرعة') || msg.includes('إنجاز')) {
            return 'performance';
        }
        if (msg.includes('فريق') || msg.includes('عضو') || msg.includes('توزيع')) {
            return 'team_management';
        }
        
        return 'general';
    }

    generateChatResponse(intent, message, context) {
        const responses = this.templates.chatResponses[intent] || this.templates.chatResponses.general;
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        // Add context-specific information if available
        if (context.sprintData) {
            const analysis = this.analyzeSprintData(context.sprintData);
            return randomResponse.replace('{completion_rate}', analysis.completionRate)
                               .replace('{total_tasks}', analysis.totalTasks);
        }
        
        return randomResponse;
    }

    // Template Methods
    getRecommendationTemplates() {
        return {
            performance: [
                'لتحسين الأداء، يُنصح بمراجعة العمليات الحالية',
                'ركز على المهام ذات الأولوية العالية',
                'قم بتحليل العوائق وإزالتها'
            ],
            velocity: [
                'لزيادة سرعة الفريق، حسن التواصل',
                'استخدم أدوات أتمتة أكثر',
                'قلل من الاجتماعات غير الضرورية'
            ]
        };
    }

    getRiskAnalysisTemplates() {
        return {
            high: 'خطر عالي - يتطلب تدخل فوري',
            medium: 'خطر متوسط - يحتاج متابعة',
            low: 'خطر منخفض - للمراقبة'
        };
    }

    getChatResponseTemplates() {
        return {
            recommendation: [
                'بناءً على تحليل البيانات، أنصح بالتركيز على المهام الحرجة أولاً.',
                'يمكنني مساعدتك في تحسين أداء الفريق من خلال تحليل البيانات الحالية.',
                'معدل الإنجاز الحالي {completion_rate}% من أصل {total_tasks} مهمة.'
            ],
            risk_analysis: [
                'دعني أحلل المخاطر المحتملة في السبرينت الحالي.',
                'المخاطر الرئيسية تشمل ضغط الوقت وتوزيع المهام.',
                'يمكنني تقديم استراتيجيات لتقليل المخاطر.'
            ],
            performance: [
                'أداء الفريق يمكن تحسينه من خلال تحليل البيانات.',
                'السرعة الحالية جيدة، لكن يمكن تحسينها أكثر.',
                'معدل الإنجاز يشير إلى أداء {completion_rate}%.'
            ],
            team_management: [
                'إدارة الفريق تتطلب توزيع متوازن للمهام.',
                'التواصل الفعال مفتاح نجاح الفريق.',
                'يمكنني مساعدتك في تحليل أداء كل عضو في الفريق.'
            ],
            general: [
                'كيف يمكنني مساعدتك في تحسين إدارة السبرينت؟',
                'أنا هنا لمساعدتك في تحليل البيانات وتقديم التوصيات.',
                'ما الذي تريد معرفته عن أداء فريقك؟'
            ]
        };
    }

    // Health check
    isHealthy() {
        return this.initialized;
    }

    getStatus() {
        return {
            service: 'Free AI Service',
            status: 'active',
            features: [
                'Smart Recommendations',
                'Risk Analysis', 
                'AI Chat',
                'Performance Analytics'
            ],
            cost: 'Free',
            provider: 'Local Algorithm'
        };
    }
}

export default FreeAiService;