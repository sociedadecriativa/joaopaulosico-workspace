/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#0a0a0a',
        'bg-secondary': '#111111',
        'bg-card': '#161616',
        'bg-hover': '#1e1e1e',
        'border-default': '#2a2a2a',
        'border-active': '#c9a84c',
        'gold-primary': '#c9a84c',
        'gold-light': '#e2c97e',
        'gold-dark': '#8a6f28',
        'text-primary': '#f0ece0',
        'text-secondary': '#8a8478',
        'text-muted': '#4a4640',
        'pillar-voltagem': '#e8a838',
        'pillar-materia': '#3d9970',
        'pillar-metodo': '#2980b9',
        'pillar-sinal': '#c9a84c',
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'gold': '0 0 20px rgba(201,168,76,0.15)',
        'gold-strong': '0 0 30px rgba(201,168,76,0.25)',
      },
      borderRadius: {
        DEFAULT: '4px',
        'sm': '3px',
        'md': '5px',
        'lg': '6px',
      },
    },
  },
  plugins: [],
}
