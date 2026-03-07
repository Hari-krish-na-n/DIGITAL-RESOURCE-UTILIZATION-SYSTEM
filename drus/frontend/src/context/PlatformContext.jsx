import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import client from '../api/client';
import { useUser } from './UserContext';

const PlatformContext = createContext();

export const PlatformProvider = ({ children }) => {
    const { user } = useUser();
    const [platforms, setPlatforms] = useState([]);
    const [learningResources, setLearningResources] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPlatforms = useCallback(async () => {
        if (!user) {
            setPlatforms([]);
            setLearningResources([]);
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const [platformData, learningData] = await Promise.all([
                client('/platforms/me/platforms'),
                client('/learning')
            ]);
            setPlatforms(platformData);
            setLearningResources(learningData);
        } catch (error) {
            console.error("Failed to fetch platforms", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchPlatforms();
    }, [fetchPlatforms]);

    const updatePlatform = async (id, data) => {
        try {
            await client('/platforms/platforms', {
                method: 'PUT',
                body: JSON.stringify({ platforms: { [id]: data } })
            });
            await fetchPlatforms();
        } catch (error) {
            console.error("Failed to update platform", error);
            throw error;
        }
    };

    const syncPlatform = async (id) => {
        try {
            await client(`/platforms/${id}/sync`, { method: 'POST' });
            await fetchPlatforms();
        } catch (error) {
            console.error(`Failed to sync platform ${id}`, error);
            throw error;
        }
    };

    const updateLearningResource = async (platformId, profileUrl) => {
        try {
            await client(`/learning/${platformId}/connect`, {
                method: 'POST',
                body: JSON.stringify({ profileUrl })
            });
            await fetchPlatforms();
        } catch (error) {
            console.error(`Failed to connect learning resource ${platformId}`, error);
            throw error;
        }
    };

    const syncLearningResource = async (platformId) => {
        try {
            await client(`/learning/${platformId}/sync`, { method: 'POST' });
            await fetchPlatforms();
        } catch (error) {
            console.error(`Failed to sync learning resource ${platformId}`, error);
            throw error;
        }
    };

    const syncAllPlatforms = async () => {
        const connectedPlatforms = platforms.filter(p => p.connected);
        const connectedLearning = learningResources.filter(r => r.connected);

        await Promise.allSettled([
            ...connectedPlatforms.map(p => syncPlatform(p.id)),
            ...connectedLearning.map(r => syncLearningResource(r.platform_id))
        ]);
    };

    const value = {
        platforms,
        learningResources,
        loading,
        updatePlatform,
        syncPlatform,
        updateLearningResource,
        syncLearningResource,
        syncAllPlatforms,
        refreshPlatforms: fetchPlatforms
    };

    return (
        <PlatformContext.Provider value={value}>
            {children}
        </PlatformContext.Provider>
    );
};

export const usePlatforms = () => useContext(PlatformContext);
