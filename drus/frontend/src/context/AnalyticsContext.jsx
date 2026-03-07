import React, { createContext, useContext } from 'react';

const AnalyticsContext = createContext();

export const AnalyticsProvider = ({ children }) => {
    const value = {};

    return (
        <AnalyticsContext.Provider value={value}>
            {children}
        </AnalyticsContext.Provider>
    );
};

export const useAnalytics = () => useContext(AnalyticsContext);
