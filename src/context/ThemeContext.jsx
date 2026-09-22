import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [dark, setDark] = useState(() => localStorage.getItem('yt_theme') === 'dark');

    useEffect(() => {
        document.body.classList.toggle('dark', dark);
        localStorage.setItem('yt_theme', dark ? 'dark' : 'light');
    }, [dark]);

    return (
        <ThemeContext.Provider value={{ dark, toggleTheme: () => setDark(p => !p) }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);
