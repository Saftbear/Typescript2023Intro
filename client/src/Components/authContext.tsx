import React, { useState, useEffect } from 'react';
import axios,  {AxiosError, AxiosResponse} from 'axios';

import { useNavigate } from 'react-router-dom';
import { response } from 'express';

interface AuthProps {
    children: React.ReactNode;
}

interface User {
    id: number;
    username: string;
    email: string;
}

interface AuthContextInterface {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string, email: string) => Promise<void>;
    logout: () => void;
    loadingUser: boolean;
    createPlaylist: (playlistName: string) => Promise<void>;

}

const AuthContext = React.createContext<AuthContextInterface | undefined>(undefined);

export const AuthProvider: React.FC<AuthProps> = ({ children }: AuthProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);
    let navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoadingUser(false);
    }, []);
    useEffect(() => {
        axios.interceptors.response.use(function (response: AxiosResponse) {
            // If the request succeeds, we don't have to do anything and just return the response
            return response;
          }, function (error: AxiosError) {
            // Any status codes that falls outside the range of 2xx cause this function to trigger
            // If you get a 401 (Unauthorized), which would be returned if the token is expired, log the user out
            if (error.response && error.response.status === 401) {
                logout();
            }
            return Promise.reject(error);
          });

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoadingUser(false);
    }, []); // empty dependency array means this effect runs once on mount
    const createPlaylist = async (playlistName: string) => {
        if (!user) return
        const userId = user.id;


        const response = await axios.post('http://localhost:3001/api/playlists/create',
        { playlistName },
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}`, userId: userId } }
        )
    
        if (!response.data.success) {
            throw new Error(response.data.message);
        }


    };

    const login = async (username: string, password: string) => {
        const response = await axios.post('http://localhost:3001/api/auth/login', { username, password });
        if (response.data.success) {
            localStorage.setItem('authToken', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setUser(response.data.user);
        } else {
            throw new Error(response.data.message);
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        navigate(0);
    };

    const register = async (username: string, password: string, email: string) => {
        const response = await axios.post('http://localhost:3001/api/auth/register', { username, password, email });
        if (response.data.success) {
            setUser(response.data.user);
        } else {
            throw new Error(response.data.message);
        }
    };

    if (loadingUser) return <div>Loading...</div>;

    return (
        <AuthContext.Provider value={{ user, setUser, login, register, logout, loadingUser, createPlaylist  }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within a AuthProvider');
    }
    return context;
}
