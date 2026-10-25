
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import AuthContext from './auth-context.js';
import authService from '../services/authservice.js';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const response = await authService.getCurrentUser();
            const currentUser = response?.data?.user ?? null;

            setUser(currentUser);
            return currentUser;
        } catch {
            setUser(null);
            return null;
        }
    }, []);

    useEffect(() => {
        let active = true;

        async function loadCurrentUser() {
            try {
                const response = await authService.getCurrentUser();

                if (active) {
                    setUser(response?.data?.user ?? null);
                }
            } catch {
                if (active) {
                    setUser(null);
                }
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadCurrentUser();

        return () => {
            active = false;
        };
    }, []);

    const login = useCallback(async (credentials) => {
        const response = await authService.login(credentials);
        let authenticatedUser = response?.data?.user ?? null;

        if (!authenticatedUser) {
            authenticatedUser = await refreshUser();
        }

        if (!authenticatedUser) {
            throw new Error(
                'Login succeeded, but the user session could not be loaded.'
            );
        }

        setUser(authenticatedUser);
        return authenticatedUser;
    }, [refreshUser]);

    const logout = useCallback(async () => {
        try {
            await authService.logout();
        } finally {
            setUser(null);
        }
    }, []);

    const value = useMemo(
        () => ({
            user,
            loading,
            isAuthenticated: Boolean(user),
            login,
            logout,
            refreshUser,
        }),
        [user, loading, login, logout, refreshUser]
    );

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
