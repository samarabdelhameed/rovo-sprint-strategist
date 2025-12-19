/**
 * 🏎️ useSprintData Hook
 * Custom hook for fetching and managing sprint data
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

const REFRESH_INTERVAL = 30000; // 30 seconds

export function useSprintData() {
    const [data, setData] = useState({
        sprint: null,
        issues: [],
        metrics: null,
        team: [],
        teamMetrics: [],
        activities: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setError(null);
            const response = await api.getActiveSprint();

            if (response.success && response.data) {
                const sprintData = response.data;
                setData({
                    sprint: sprintData.sprint,
                    issues: sprintData.issues || [],
                    metrics: {
                        healthScore: sprintData.healthScore,
                        velocity: sprintData.velocity,
                        completionPercentage: sprintData.completionPercentage,
                        totalPoints: sprintData.totalPoints,
                        completedPoints: sprintData.completedPoints,
                        issuesTotal: sprintData.issuesTotal,
                        issuesCompleted: sprintData.issuesCompleted,
                        issuesInProgress: sprintData.issuesInProgress,
                        issuesTodo: sprintData.issuesTodo,
                        blockersCount: sprintData.blockersCount,
                        daysRemaining: sprintData.daysRemaining,
                        dayNumber: sprintData.dayNumber,
                        totalDays: sprintData.totalDays,
                        idealProgress: sprintData.idealProgress
                    },
                    team: sprintData.team || [],
                    teamMetrics: sprintData.teamMetrics || [],
                    activities: sprintData.activities || []
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
        fetchData();
    }, [fetchData]);

    // Auto-refresh
    useEffect(() => {
        const interval = setInterval(fetchData, REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, [fetchData]);

    const refresh = useCallback(async () => {
        setLoading(true);
        await fetchData();
    }, [fetchData]);

    return {
        ...data,
        loading,
        error,
        lastUpdated,
        refresh
    };
}

export default useSprintData;
