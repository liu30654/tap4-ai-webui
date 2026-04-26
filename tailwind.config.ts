import type { Config } from 'tailwindcss';

const config = {
  content: ['./components/**/*.{ts,tsx}', './app/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#f7f3ec',
        ink: '#1a1a1a',
        muted: '#6b6258',
        rule: '#d9d2c4',
        accent: '#7a2e1f',
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', '"Source Han Serif SC"', '"Noto Serif SC"', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      maxWidth: {
        prose: '38rem',
        page: '64rem',
      },
      typography: () => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': '#1a1a1a',
            '--tw-prose-headings': '#1a1a1a',
            '--tw-prose-lead': '#1a1a1a',
            '--tw-prose-links': '#7a2e1f',
            '--tw-prose-bold': '#1a1a1a',
            '--tw-prose-quotes': '#3a342d',
            '--tw-prose-quote-borders': '#d9d2c4',
            '--tw-prose-bullets': '#a89e8e',
            '--tw-prose-hr': '#d9d2c4',
            fontFamily: 'var(--font-serif), Georgia, serif',
            fontSize: '1.0625rem',
            lineHeight: '1.85',
            a: { textDecoration: 'underline', textUnderlineOffset: '3px' },
            'h1, h2, h3, h4': { fontWeight: '500' },
            blockquote: { fontStyle: 'italic', fontWeight: '400' },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
} satisfies Config;

export default config;
