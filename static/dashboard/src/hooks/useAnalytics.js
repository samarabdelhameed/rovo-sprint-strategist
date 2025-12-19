/**
 * 📊 useAnalytics Hook
 * Custom hook for fetching analytics data
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

export function useAnalytics() {
    const [analytics, setAnalytics] = useState({
        velocityTrend: [],
        teamPerformance: [],
        healthTrend: [],
        insights: null
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAnalytics = useCallback(async () => {
        try {
            setError(null);
            const response = await api.getAnalytics();

            if (response.success && response.data) {
                setAnalytics({
                    velocityTrend: response.data.velocityTrend || [],
                    teamPerformance: response.data.teamPerformance || [],
                    healthTrend: response.data.healthTrend || [],
                    insights: response.data.insights || null
                });
            }
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const refresh = useCallback(async () => {
        setLoading(true);
        await fetchAnalytics();
    }, [fetchAnalytics]);

    return {
        ...analytics,
        loading,
        error,
        refresh
    };
}

export default useAnalytics;
