import { useState, createContext, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API_GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8002/api';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        if (storedUser && storedToken) {
            setUser(JSON.parse(storedUser));
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const { data } = await axios.post(`${API_GATEWAY_URL}/auth/login`, { username, password });
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        return data;
    };

    const register = async (username, password) => {
        // Only registers Students by default
        const { data } = await axios.post(`${API_GATEWAY_URL}/auth/register`, { username, password });
        return data;
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    };

    // Admin function to create other users
    const createUser = async (username, password, role) => {
        const { data } = await axios.post(`${API_GATEWAY_URL}/auth/create-user`, { username, password, role });
        return data;
    };

    // Admin function to list users
    const getUsers = async () => {
        const { data } = await axios.get(`${API_GATEWAY_URL}/auth/users`);
        return data;
    };

    // Admin function to delete user
    const deleteUser = async (id) => {
        const { data } = await axios.delete(`${API_GATEWAY_URL}/auth/users/${id}`);
        return data;
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, createUser, getUsers, deleteUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
