/**
 * 🏆 useLeaderboard Hook
 * Custom hook for fetching leaderboard and achievements
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

export function useLeaderboard() {
    const [leaderboard, setLeaderboard] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [sprintName, setSprintName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLeaderboard = useCallback(async () => {
        try {
            setError(null);
            const response = await api.getLeaderboard();

            if (response.success && response.data) {
                setLeaderboard(response.data.leaderboard || []);
                setAchievements(response.data.achievements || []);
                setSprintName(response.data.sprintName || '');
            }
        } catch (err) {
            console.error('Failed to fetch leaderboard:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    const refresh = useCallback(async () => {
        setLoading(true);
        await fetchLeaderboard();
    }, [fetchLeaderboard]);

    return {
        leaderboard,
        achievements,
        sprintName,
        loading,
        error,
        refresh
    };
}

export default useLeaderboard;
