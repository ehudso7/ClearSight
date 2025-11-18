import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'neo-turquoise': '#2AC3B5',
        'deep-navy': '#0C1F33',
        'slate-gray': '#6C7A89',
        'soft-mint': '#E4FAF7',
        'dark-teal': '#1A6461',
      },
    },
  },
  plugins: [],
}

export default config
