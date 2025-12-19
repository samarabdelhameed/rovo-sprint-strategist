/**
 * 👥 useTeam Hook
 * Custom hook for fetching and managing team data
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../api/client';

export function useTeam() {
    const [team, setTeam] = useState([]);
    const [workload, setWorkload] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTeam = useCallback(async () => {
        try {
            setError(null);
            const [teamResponse, workloadResponse] = await Promise.all([
                api.getTeamMembers(),
                api.getTeamWorkload()
            ]);

            if (teamResponse.success) {
                setTeam(teamResponse.data || []);
            }

            if (workloadResponse.success) {
                setWorkload(workloadResponse.data || []);
            }
        } catch (err) {
            console.error('Failed to fetch team data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTeam();
    }, [fetchTeam]);

    const refresh = useCallback(async () => {
        setLoading(true);
        await fetchTeam();
    }, [fetchTeam]);

    return {
        team,
        workload,
        loading,
        error,
        refresh
    };
}

export default useTeam;
