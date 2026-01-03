/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: 'var(--color-gold)',
        charcoal: 'var(--color-charcoal)',
        cream: 'var(--color-cream)',
      },
      fontFamily: {
        serif: ['var(--font-noto-serif)', 'serif'],
        playfair: ['var(--font-playfair)', 'serif'],
        pretendard: ['Pretendard', 'sans-serif'],
        paperlogy: ['Paperlogy', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

