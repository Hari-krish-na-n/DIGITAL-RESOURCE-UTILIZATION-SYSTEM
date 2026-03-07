import React, { createContext, useState, useContext } from 'react';

const UserContext = createContext();

const initUser = () => {
    try {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            return JSON.parse(storedUser);
        }
    } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    }
    return null;
};

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(initUser);
    const [loading] = useState(false);

    const login = (userData, token) => {
        localStorage.setItem('user', JSON.stringify(userData));
        if (token) localStorage.setItem('token', token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
    };

    const value = { user, loading, login, logout };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
