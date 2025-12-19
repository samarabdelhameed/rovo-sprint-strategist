/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary Dark Theme
                dark: {
                    900: '#0a0a0f',
                    800: '#12121a',
                    700: '#1a1a24',
                    600: '#22222e',
                    500: '#2a2a38',
                },
                // Accent Orange (from image)
                accent: {
                    DEFAULT: '#f97316',
                    light: '#fb923c',
                    dark: '#ea580c',
                    glow: 'rgba(249, 115, 22, 0.5)',
                },
                // Status Colors
                success: '#22c55e',
                warning: '#eab308',
                danger: '#ef4444',
                info: '#3b82f6',
                // Text
                text: {
                    primary: '#ffffff',
                    secondary: '#a1a1aa',
                    muted: '#71717a',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                display: ['Outfit', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
                'slide-up': 'slide-up 0.5s ease-out',
                'slide-down': 'slide-down 0.3s ease-out',
                'fade-in': 'fade-in 0.3s ease-out',
                'spin-slow': 'spin 8s linear infinite',
                'bounce-soft': 'bounce-soft 2s ease-in-out infinite',
                'gradient': 'gradient 8s ease infinite',
            },
            keyframes: {
                'float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                'pulse-glow': {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(249, 115, 22, 0.3)' },
                    '50%': { boxShadow: '0 0 40px rgba(249, 115, 22, 0.6)' },
                },
                'slide-up': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'slide-down': {
                    '0%': { opacity: '0', transform: 'translateY(-10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'bounce-soft': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'gradient': {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                },
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'grid-pattern': 'linear-gradient(rgba(249, 115, 22, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(249, 115, 22, 0.03) 1px, transparent 1px)',
            },
            backgroundSize: {
                'grid': '50px 50px',
            },
            boxShadow: {
                'glow': '0 0 30px rgba(249, 115, 22, 0.3)',
                'glow-lg': '0 0 60px rgba(249, 115, 22, 0.4)',
                'inner-glow': 'inset 0 0 30px rgba(249, 115, 22, 0.1)',
            },
        },
    },
    plugins: [],
}
