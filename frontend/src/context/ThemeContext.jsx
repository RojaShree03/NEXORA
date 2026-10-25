
import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import ThemeContext from './theme-context.js';

const THEME_STORAGE_KEY = 'nexora-theme';

function getInitialTheme() {
    try {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

        return savedTheme === 'light' || savedTheme === 'dark'
            ? savedTheme
            : 'dark';
    } catch {
        return 'dark';
    }
}

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        document.documentElement.dataset.theme = theme;

        try {
            localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch {
            // The app still works if browser storage is unavailable.
        }
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme((currentTheme) =>
            currentTheme === 'dark' ? 'light' : 'dark'
        );
    }, []);

    const value = useMemo(
        () => ({
            theme,
            setTheme,
            toggleTheme,
            isDark: theme === 'dark',
        }),
        [theme, toggleTheme]
    );

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}
