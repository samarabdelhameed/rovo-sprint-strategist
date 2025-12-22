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
                    title: 'Improve Task Completion Rate',
                    description: `Current completion rate is ${analysis.completionRate}%. Consider reducing scope or extending sprint duration.`,
                    action: 'reduce_scope',
                    impact: 'high'
                });
            }

            // Velocity Analysis
            if (analysis.velocityTrend === 'declining') {
                recommendations.push({
                    type: 'velocity',
                    priority: 'medium',
                    title: 'Improve Team Velocity',
                    description: 'Team velocity is declining. Review blockers and improve processes.',
                    action: 'improve_process',
                    impact: 'medium'
                });
            }

            // Workload Distribution
            if (analysis.workloadImbalance > 0.3) {
                recommendations.push({
                    type: 'workload',
                    priority: 'medium',
                    title: 'Better Task Distribution',
                    description: 'There is workload imbalance among team members.',
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
                    title: `Risk Management: ${risk.title}`,
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
                error: 'Failed to generate recommendations',
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
                response: 'Sorry, there was an error processing your message. Please try again.',
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
                error: 'Failed to analyze risks',
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
                title: 'Time Pressure',
                description: `Only ${daysLeft} days left with ${analysis.completionRate}% completion rate`,
                severity: 'high',
                mitigation: 'prioritize_critical_tasks'
            });
        }

        // Scope risks
        if (analysis.totalTasks > 20) {
            risks.push({
                id: 'scope_overload',
                title: 'Scope Overload',
                description: `Task count (${analysis.totalTasks}) may be too high for this sprint`,
                severity: 'medium',
                mitigation: 'reduce_scope'
            });
        }

        // Team capacity risks
        if (analysis.workloadImbalance > 0.4) {
            risks.push({
                id: 'workload_imbalance',
                title: 'Workload Imbalance',
                description: 'Uneven task distribution among team members',
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
                    strategies.push('Focus on critical tasks first');
                    break;
                case 'reduce_scope':
                    strategies.push('Reduce sprint scope');
                    break;
                case 'redistribute_workload':
                    strategies.push('Redistribute tasks among team members');
                    break;
                default:
                    strategies.push('Review processes and improve performance');
            }
        });

        return [...new Set(strategies)]; // Remove duplicates
    }

    detectIntent(message) {
        const msg = message.toLowerCase();
        
        if (msg.includes('recommend') || msg.includes('suggest') || msg.includes('advice')) {
            return 'recommendation';
        }
        if (msg.includes('risk') || msg.includes('problem') || msg.includes('issue')) {
            return 'risk_analysis';
        }
        if (msg.includes('performance') || msg.includes('velocity') || msg.includes('progress')) {
            return 'performance';
        }
        if (msg.includes('team') || msg.includes('member') || msg.includes('assign')) {
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
                'To improve performance, I recommend reviewing current processes',
                'Focus on high-priority tasks first',
                'Analyze and remove blockers'
            ],
            velocity: [
                'To increase team velocity, improve communication',
                'Use more automation tools',
                'Reduce unnecessary meetings'
            ]
        };
    }

    getRiskAnalysisTemplates() {
        return {
            high: 'High risk - requires immediate intervention',
            medium: 'Medium risk - needs monitoring',
            low: 'Low risk - for observation'
        };
    }

    getChatResponseTemplates() {
        return {
            recommendation: [
                'Based on data analysis, I recommend focusing on critical tasks first.',
                'I can help improve team performance through current data analysis.',
                'Current completion rate is {completion_rate}% out of {total_tasks} tasks.'
            ],
            risk_analysis: [
                'Let me analyze potential risks in the current sprint.',
                'Main risks include time pressure and task distribution.',
                'I can provide strategies to mitigate risks.'
            ],
            performance: [
                'Team performance can be improved through data analysis.',
                'Current velocity is good, but can be improved further.',
                'Completion rate indicates {completion_rate}% performance.'
            ],
            team_management: [
                'Team management requires balanced task distribution.',
                'Effective communication is key to team success.',
                'I can help analyze each team member\'s performance.'
            ],
            general: [
                'How can I help you improve sprint management?',
                'I\'m here to help analyze data and provide recommendations.',
                'What would you like to know about your team\'s performance?'
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