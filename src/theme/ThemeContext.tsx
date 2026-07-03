import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { darkColors, lightColors, ThemeColors } from './colors';

const STORAGE_KEY = '@bingo_lang_dark_mode';

type ThemeContextValue = {
  isDarkMode: boolean;
  colors: ThemeColors;
  toggleDarkMode: () => void;
  setDarkMode: (value: boolean) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value !== null) {
        setIsDarkMode(value === 'true');
      }
    });
  }, []);

  const setDarkMode = useCallback((value: boolean) => {
    setIsDarkMode(value);
    AsyncStorage.setItem(STORAGE_KEY, value ? 'true' : 'false');
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(!isDarkMode);
  }, [isDarkMode, setDarkMode]);

  const colors = isDarkMode ? darkColors : lightColors;

  const value = useMemo(
    () => ({ isDarkMode, colors, toggleDarkMode, setDarkMode }),
    [colors, isDarkMode, setDarkMode, toggleDarkMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
