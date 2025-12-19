/**
 * 🔧 usePitStop Hook
 * Custom hook for fetching and managing pit-stop recommendations
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

export function usePitStop() {
    const [recommendations, setRecommendations] = useState([]);
    const [urgencyLevel, setUrgencyLevel] = useState('normal');
    const [sprintHealth, setSprintHealth] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [applying, setApplying] = useState(null);

    const fetchRecommendations = useCallback(async () => {
        try {
            setError(null);
            const response = await api.getPitStopRecommendations();

            if (response.success && response.data) {
                setRecommendations(response.data.recommendations || []);
                setUrgencyLevel(response.data.urgencyLevel || 'normal');
                setSprintHealth(response.data.sprintHealth || 0);
            }
        } catch (err) {
            console.error('Failed to fetch pit-stop recommendations:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRecommendations();
    }, [fetchRecommendations]);

    const applyRecommendation = useCallback(async (id) => {
        try {
            setApplying(id);
            const response = await api.applyPitStopRecommendation(id);

            if (response.success) {
                // Update local state
                setRecommendations(prev =>
                    prev.map(rec =>
                        rec.id === id ? { ...rec, status: 'applied' } : rec
                    )
                );
                return true;
            }
            return false;
        } catch (err) {
            console.error('Failed to apply recommendation:', err);
            return false;
        } finally {
            setApplying(null);
        }
    }, []);

    const refresh = useCallback(async () => {
        setLoading(true);
        await fetchRecommendations();
    }, [fetchRecommendations]);

    return {
        recommendations,
        urgencyLevel,
        sprintHealth,
        loading,
        error,
        applying,
        applyRecommendation,
        refresh
    };
}

export default usePitStop;
