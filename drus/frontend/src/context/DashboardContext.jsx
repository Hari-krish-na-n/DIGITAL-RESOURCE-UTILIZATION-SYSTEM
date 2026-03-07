import React, { createContext, useContext } from 'react';

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
    const value = {};

    return (
        <DashboardContext.Provider value={value}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = () => useContext(DashboardContext);
