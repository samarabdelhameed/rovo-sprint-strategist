/**
 * 📊 Sprint Context Provider
 * Global state management for sprint data
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const SprintContext = createContext(null);

export function SprintProvider({ children }) {
    const [sprint, setSprint] = useState(null);
    const [metrics, setMetrics] = useState(null);
    const [issues, setIssues] = useState([]);
    const [team, setTeam] = useState([]);
    const [teamMetrics, setTeamMetrics] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    // Fetch all sprint data
    const fetchSprintData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await api.getActiveSprint();

            if (response.success && response.data) {
                const data = response.data;

                setSprint(data.sprint);
                setIssues(data.issues || []);
                setTeam(data.team || []);
                setTeamMetrics(data.teamMetrics || []);
                setActivities(data.activities || []);

                setMetrics({
                    healthScore: data.healthScore,
                    velocity: data.velocity,
                    completionPercentage: data.completionPercentage,
                    totalPoints: data.totalPoints,
                    completedPoints: data.completedPoints,
                    issuesTotal: data.issuesTotal,
                    issuesCompleted: data.issuesCompleted,
                    issuesInProgress: data.issuesInProgress,
                    issuesTodo: data.issuesTodo,
                    blockersCount: data.blockersCount,
                    daysRemaining: data.daysRemaining,
                    dayNumber: data.dayNumber,
                    totalDays: data.totalDays,
                    idealProgress: data.idealProgress
                });

                setLastUpdated(new Date());
            }
        } catch (err) {
            console.error('Failed to fetch sprint data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchSprintData();
    }, [fetchSprintData]);

    // Auto-refresh every 30 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchSprintData();
        }, 30000);

        return () => clearInterval(interval);
    }, [fetchSprintData]);

    // Refresh function for manual refresh
    const refresh = useCallback(() => {
        fetchSprintData();
    }, [fetchSprintData]);

    // Update issue
    const updateIssue = useCallback(async (issueId, updates) => {
        try {
            const response = await api.updateIssue(issueId, updates);
            if (response.success) {
                // Refresh data after update
                await fetchSprintData();
                return true;
            }
            return false;
        } catch (err) {
            console.error('Failed to update issue:', err);
            return false;
        }
    }, [fetchSprintData]);

    const value = {
        sprint,
        metrics,
        issues,
        team,
        teamMetrics,
        activities,
        loading,
        error,
        lastUpdated,
        refresh,
        updateIssue
    };

    return (
        <SprintContext.Provider value={value}>
            {children}
        </SprintContext.Provider>
    );
}

export function useSprint() {
    const context = useContext(SprintContext);
    if (!context) {
        throw new Error('useSprint must be used within a SprintProvider');
    }
    return context;
}

export default SprintContext;
