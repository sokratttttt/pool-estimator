/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'navy-deep': 'var(--color-navy-deep)',
        'navy-medium': 'var(--color-navy-medium)',
        'navy-light': 'var(--color-navy-light)',
        'cyan-bright': 'var(--color-cyan-bright)',
        'cyan-medium': 'var(--color-cyan-medium)',
        'blue-electric': 'var(--color-blue-electric)',
        'gold': 'var(--color-gold)',
        'gold-dark': 'var(--color-gold-dark)',
        'emerald': 'var(--color-emerald)',
        'coral': 'var(--color-coral)',
        'purple': 'var(--color-purple)',
        // Semantic colors mapped to variables
        'bg-primary': 'var(--color-bg-primary)',
        'bg-secondary': 'var(--color-bg-secondary)',
        'bg-tertiary': 'var(--color-bg-tertiary)',
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary': 'var(--color-text-tertiary)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      screens: {
        'xs': '480px',
        '3xl': '1920px',
        'uwide': '2560px', // Ultra-wide monitors
      },
      container: {
        center: true,
        padding: '1rem',
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1600px', // Increased from 1536px
          '3xl': '1800px', // New for 1920x1080
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-primary": "linear-gradient(135deg, #00D9FF 0%, #0099FF 100%)",
        "gradient-gold": "linear-gradient(135deg, #FFB800 0%, #E6A600 100%)",
      },
      boxShadow: {
        'glow': '0 0 20px rgba(0, 217, 255, 0.3)',
        'glow-gold': '0 0 20px rgba(255, 184, 0, 0.3)',
      },
    },
  },
  plugins: [],
};
