import { ThemeType } from '../state/themeStore';

export const themes = {
  light: {
    background: '#ffffff',
    backgroundSecondary: '#f8f9fa',
    backgroundTertiary: '#e9ecef',
    text: '#000000',
    textSecondary: '#6c757d',
    textMuted: '#adb5bd',
    primary: '#007AFF',
    border: '#dee2e6',
    borderLight: '#f1f3f4',
    card: '#ffffff',
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545',
    info: '#17a2b8',
  },
  dark: {
    background: '#000000',
    backgroundSecondary: '#1c1c1e',
    backgroundTertiary: '#2c2c2e',
    text: '#ffffff',
    textSecondary: '#a1a1a6',
    textMuted: '#8e8e93',
    primary: '#0a84ff',
    border: '#38383a',
    borderLight: '#48484a',
    card: '#1c1c1e',
    success: '#30d158',
    warning: '#ff9f0a',
    error: '#ff453a',
    info: '#64d2ff',
  },
};

export const getThemeColors = (theme: ThemeType) => themes[theme];

export const getThemedClassName = (theme: ThemeType, lightClass: string, darkClass: string) => {
  return theme === 'light' ? lightClass : darkClass;
};