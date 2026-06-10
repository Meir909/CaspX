/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0D6EFD',
        'primary-hover': '#3B82F6',
        accent: '#4F46E5',
        success: '#22C55E',
        warning: '#EAB308',
        error: '#EF4444',
        'bg-primary': '#041B36',
        'bg-secondary': '#06274E',
        'bg-card': '#0A2F5D',
        'text-primary': '#FFFFFF',
        'text-secondary': '#CBD5E1'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
