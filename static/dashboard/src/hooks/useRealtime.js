/**
 * 🔄 useRealtime Hook
 * Custom hook for real-time updates via polling or WebSocket
 * Currently uses polling, can be upgraded to Supabase Realtime
 */
import { useState, useEffect, useCallback, useRef } from 'react';

const DEFAULT_INTERVAL = 30000; // 30 seconds

export function useRealtime(fetchFn, options = {}) {
    const {
        interval = DEFAULT_INTERVAL,
        enabled = true,
        onUpdate = null
    } = options;

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const intervalRef = useRef(null);

    const fetch = useCallback(async () => {
        try {
            setError(null);
            const result = await fetchFn();
            setData(result);
            setIsConnected(true);

            if (onUpdate) {
                onUpdate(result);
            }
        } catch (err) {
            console.error('Realtime fetch error:', err);
            setError(err.message);
            setIsConnected(false);
        } finally {
            setLoading(false);
        }
    }, [fetchFn, onUpdate]);

    // Start polling
    useEffect(() => {
        if (!enabled) return;

        // Initial fetch
        fetch();

        // Set up polling
        intervalRef.current = setInterval(fetch, interval);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [fetch, interval, enabled]);

    // Manual refresh
    const refresh = useCallback(async () => {
        setLoading(true);
        await fetch();
    }, [fetch]);

    // Pause/Resume
    const pause = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    const resume = useCallback(() => {
        if (!intervalRef.current && enabled) {
            intervalRef.current = setInterval(fetch, interval);
        }
    }, [fetch, interval, enabled]);

    return {
        data,
        loading,
        error,
        isConnected,
        refresh,
        pause,
        resume
    };
}

export default useRealtime;
