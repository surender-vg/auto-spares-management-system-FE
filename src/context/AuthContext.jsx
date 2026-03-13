import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (userInfo) {
            setUser(userInfo);
        }
        setLoading(false);
    }, []);

    // Auto-logout on 401 responses (expired/invalid token)
    useEffect(() => {
        const interceptor = axios.interceptors.response.use(
            (response) => response,
            (error) => {
                const isLoginRequest = error.config?.url === '/api/users/login';
                if (error.response?.status === 401 && !isLoginRequest) {
                    localStorage.removeItem('userInfo');
                    setUser(null);
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
        return () => axios.interceptors.response.eject(interceptor);
    }, []);

    const login = async (email, password) => {
        try {
            const { data } = await axios.post('/api/users/login', { email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return data;
        } catch (error) {
            // Try to extract error message from various possible fields
            let msg = '';
            if (error.response && error.response.data) {
                if (error.response.data.error) {
                    msg = error.response.data.error;
                } else if (error.response.data.message) {
                    msg = error.response.data.message;
                } else if (typeof error.response.data === 'string') {
                    msg = error.response.data;
                }
            }
            if (!msg) msg = error.message;
            throw msg;
        }
    };

    const register = async (name, email, password) => {
        try {
            const { data } = await axios.post('/api/users', { name, email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            return data;
        } catch (error) {
            throw error.response && error.response.data.message
                ? error.response.data.message
                : error.message;
        }
    };

    const logout = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
        document.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
