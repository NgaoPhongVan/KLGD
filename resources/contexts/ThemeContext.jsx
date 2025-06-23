import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        // Kiểm tra localStorage hoặc system preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            return savedTheme;
        }
        // Kiểm tra system dark mode preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });

    useEffect(() => {
        localStorage.setItem('theme', theme);
        
        // Thêm class vào html element để CSS có thể detect
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        
        // Cập nhật Ant Design theme
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const isDark = theme === 'dark';

    // Theme variables với nhiều màu sắc hơn
    const themeVars = {
        light: {
            // Background gradients
            bodyBg: 'from-slate-50 via-indigo-50/20 to-blue-50/30',
            cardBg: 'bg-white/95',
            sidebarBg: 'bg-white/95',
            modalBg: 'bg-white/98',
            overlayBg: 'bg-black/40',
            
            // Border colors
            borderColor: 'border-gray-200/50',
            borderColorHover: 'border-indigo-200/50',
            
            // Text colors
            textPrimary: 'text-gray-800',
            textSecondary: 'text-gray-600',
            textMuted: 'text-gray-500',
            textAccent: 'text-indigo-600',
            textInverse: 'text-white',
            
            // Button colors
            buttonPrimary: 'from-indigo-600 to-blue-600',
            buttonPrimaryHover: 'from-indigo-700 to-blue-700',
            buttonSecondary: 'bg-white hover:bg-gray-50',
            buttonDanger: 'bg-red-500 hover:bg-red-600',
            
            // Input colors
            inputBg: 'bg-white',
            inputBorder: 'border-gray-200',
            inputBorderFocus: 'border-indigo-500',
            
            // Shadow colors
            shadowColor: 'shadow-xl',
            shadowColorHover: 'shadow-2xl',
            
            // Specific component colors
            headerBg: 'bg-white/90',
            sidebarHeaderBg: 'from-indigo-600 via-indigo-700 to-blue-600',
            
            // Status colors
            statusSuccess: 'text-green-600 bg-green-50',
            statusWarning: 'text-yellow-600 bg-yellow-50',
            statusError: 'text-red-600 bg-red-50',
            statusInfo: 'text-blue-600 bg-blue-50',
            
            // Table colors
            tableBg: 'bg-white',
            tableHeaderBg: 'bg-gray-50',
            tableRowHover: 'hover:bg-gray-50',
            
            // Form colors
            formLabelColor: 'text-gray-700',
            formDescColor: 'text-gray-500',
            
            // Card gradient colors
            cardGradient: {
                blue: 'from-blue-50 to-indigo-50 border-blue-100/50',
                green: 'from-emerald-50 to-green-50 border-emerald-100/50',
                yellow: 'from-amber-50 to-orange-50 border-amber-100/50',
                purple: 'from-purple-50 to-violet-50 border-purple-100/50',
                red: 'from-red-50 to-rose-50 border-red-100/50'
            }
        },
        dark: {
            // Background gradients  
            bodyBg: 'from-gray-900 via-slate-900/90 to-gray-800/80',
            cardBg: 'bg-gray-800/95',
            sidebarBg: 'bg-gray-800/95',
            modalBg: 'bg-gray-800/98',
            overlayBg: 'bg-black/60',
            
            // Border colors
            borderColor: 'border-gray-700/50',
            borderColorHover: 'border-indigo-400/50',
            
            // Text colors
            textPrimary: 'text-gray-100',
            textSecondary: 'text-gray-300',
            textMuted: 'text-gray-400',
            textAccent: 'text-indigo-400',
            textInverse: 'text-gray-900',
            
            // Button colors
            buttonPrimary: 'from-indigo-500 to-blue-500',
            buttonPrimaryHover: 'from-indigo-600 to-blue-600',
            buttonSecondary: 'bg-gray-700 hover:bg-gray-600',
            buttonDanger: 'bg-red-600 hover:bg-red-700',
            
            // Input colors
            inputBg: 'bg-gray-700/80',
            inputBorder: 'border-gray-600/50',
            inputBorderFocus: 'border-indigo-400',
            
            // Shadow colors
            shadowColor: 'shadow-2xl shadow-black/30',
            shadowColorHover: 'shadow-2xl shadow-black/40',
            
            // Specific component colors
            headerBg: 'bg-gray-800/90',
            sidebarHeaderBg: 'from-gray-700 via-gray-800 to-gray-900',
            
            // Status colors
            statusSuccess: 'text-green-400 bg-green-900/30',
            statusWarning: 'text-yellow-400 bg-yellow-900/30',
            statusError: 'text-red-400 bg-red-900/30',
            statusInfo: 'text-blue-400 bg-blue-900/30',
            
            // Table colors
            tableBg: 'bg-gray-800/80',
            tableHeaderBg: 'bg-gray-700/50',
            tableRowHover: 'hover:bg-gray-700/30',
            
            // Form colors
            formLabelColor: 'text-gray-200',
            formDescColor: 'text-gray-400',
            
            // Card gradient colors
            cardGradient: {
                blue: 'from-blue-900/40 to-indigo-900/40 border-blue-800/30',
                green: 'from-emerald-900/40 to-green-900/40 border-emerald-800/30',
                yellow: 'from-amber-900/40 to-orange-900/40 border-amber-800/30',
                purple: 'from-purple-900/40 to-violet-900/40 border-purple-800/30',
                red: 'from-red-900/40 to-rose-900/40 border-red-800/30'
            }
        }
    };

    const colors = themeVars[theme];

    // Ant Design theme configuration
    const antdTheme = {
        algorithm: isDark ? 'dark' : 'default',
        token: {
            colorPrimary: '#6366f1',
            colorBgBase: isDark ? '#1f2937' : '#ffffff',
            colorTextBase: isDark ? '#f3f4f6' : '#1f2937',
            borderRadius: 8,
            colorBorder: isDark ? '#374151' : '#e5e7eb',
            colorBgContainer: isDark ? '#374151' : '#ffffff',
            colorBgElevated: isDark ? '#4b5563' : '#ffffff',
        },
        components: {
            Card: {
                colorBgContainer: isDark ? 'rgba(55, 65, 81, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                colorBorder: isDark ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.5)',
            },
            Modal: {
                colorBgElevated: isDark ? 'rgba(31, 41, 55, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                colorBorder: isDark ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.5)',
            },
            Table: {
                colorBgContainer: isDark ? 'rgba(55, 65, 81, 0.8)' : '#ffffff',
                colorBorderSecondary: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)',
            },
            Select: {
                colorBgContainer: isDark ? 'rgba(55, 65, 81, 0.8)' : '#ffffff',
                colorBorder: isDark ? 'rgba(75, 85, 99, 0.5)' : '#d1d5db',
            },
            Input: {
                colorBgContainer: isDark ? 'rgba(55, 65, 81, 0.8)' : '#ffffff',
                colorBorder: isDark ? 'rgba(75, 85, 99, 0.5)' : '#d1d5db',
            },
            Button: {
                primaryShadow: 'none',
                defaultShadow: 'none',
            }
        }
    };

    return (
        <ThemeContext.Provider value={{
            theme,
            isDark,
            toggleTheme,
            colors,
            antdTheme
        }}>
            {children}
        </ThemeContext.Provider>
    );
};
