/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
        mono: ['Geist Mono', 'monospace'],
      },
      colors: {
        // Backgrounds
        bg: {
          base: '#FAFAF8',
          surface: '#FFFFFF',
          muted: '#F4F4F0',
        },
        // Sidebar / dark areas
        dark: {
          base: '#18181B',
          surface: '#27272A',
          border: '#3F3F46',
        },
        // Borders
        border: {
          DEFAULT: '#E4E4E7',
          strong: '#D1D1CB',
        },
        // Text
        text: {
          primary: '#18181B',
          secondary: '#52525B',
          muted: '#A1A1AA',
          inverse: '#FAFAF8',
        },
        // Accent — amber, evoca dinero/facturación
        accent: {
          DEFAULT: '#D97706',
          hover: '#B45309',
          light: '#FEF3C7',
          muted: '#92400E',
        },
        // Status invoices
        status: {
          paid: '#059669',
          'paid-bg': '#ECFDF5',
          pending: '#D97706',
          'pending-bg': '#FFFBEB',
          overdue: '#DC2626',
          'overdue-bg': '#FEF2F2',
          active: '#2563EB',
          'active-bg': '#EFF6FF',
          expired: '#DC2626',
          cancelled: '#6B7280',
        },
        // Plan types
        plan: {
          bronze: '#92400E',
          'bronze-bg': '#FEF3C7',
          silver: '#52525B',
          'silver-bg': '#F4F4F5',
          gold: '#B45309',
          'gold-bg': '#FFFBEB',
        },
      },
      boxShadow: {
        card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
        'card-hover': '0 4px 12px 0 rgb(0 0 0 / 0.08)',
      },
      borderRadius: {
        DEFAULT: '0.5rem',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '250ms',
        slow: '400ms',
      },
      animation: {
        'fade-up': 'fadeUp 400ms cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fadeIn 250ms cubic-bezier(0.16, 1, 0.3, 1) both',
        spin: 'spin 0.8s linear infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
