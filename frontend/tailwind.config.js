/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],

  /**
   * Safelist — dynamic color classes built from the accent prop in SCard.
   * Tailwind cannot detect classes constructed via template literals at build time,
   * so we explicitly list every combination used in the app.
   */
  safelist: [
    // sky — Émetteur section
    'bg-sky-500/10', 'ring-sky-500/20', 'text-sky-400',
    'bg-sky-900/40', 'border-sky-800/30', 'text-sky-600', 'text-sky-300',
    // violet — Client section
    'bg-violet-500/10', 'ring-violet-500/20', 'text-violet-400',
    // amber — Informations section
    'bg-amber-500/10', 'ring-amber-500/20', 'text-amber-400',
    // emerald — Prestations section
    'bg-emerald-500/10', 'ring-emerald-500/20', 'text-emerald-400',
    // rose — Récapitulatif section
    'bg-rose-500/10', 'ring-rose-500/20', 'text-rose-400',
    // orange — Modalités section
    'bg-orange-500/10', 'ring-orange-500/20', 'text-orange-400',
  ],

  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      colors: {
        brand: {
          50:  '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
      },
    },
  },
  plugins: [],
};
