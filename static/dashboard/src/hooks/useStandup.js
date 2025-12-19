/**
 * 📢 useStandup Hook
 * Custom hook for fetching and managing standup data
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

export function useStandup() {
    const [standup, setStandup] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTodayStandup = useCallback(async () => {
        try {
            setError(null);
            const response = await api.getTodayStandup();

            if (response.success && response.data) {
                setStandup(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch standup:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchHistory = useCallback(async () => {
        try {
            setHistoryLoading(true);
            const response = await api.getStandupHistory();

            if (response.success && response.data) {
                setHistory(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch standup history:', err);
        } finally {
            setHistoryLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTodayStandup();
    }, [fetchTodayStandup]);

    const refresh = useCallback(async () => {
        setLoading(true);
        await Promise.all([fetchTodayStandup(), fetchHistory()]);
    }, [fetchTodayStandup, fetchHistory]);

    return {
        standup,
        history,
        loading,
        historyLoading,
        error,
        fetchHistory,
        refresh
    };
}

export default useStandup;
