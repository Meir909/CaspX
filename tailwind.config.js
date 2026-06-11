/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2563EB',
        'primary-hover': '#3B82F6',
        accent: '#7C3AED',
        success: '#22C55E',
        warning: '#FACC15',
        error: '#F43F5E',
        'bg-primary': '#030712',
        'bg-secondary': '#081221',
        'bg-card': '#0A1728',
        'text-primary': '#F8FAFC',
        'text-secondary': '#94A3B8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 20px 60px rgba(2, 8, 23, 0.35)',
      },
    },
  },
  plugins: [],
}
