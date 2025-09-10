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
        'olympay-dark': '#1A1F2E',
        'olympay-cyan': '#00FFFF',
        'olympay-green': '#00FF88',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        dark: {
          ...require('daisyui/src/theming/themes')['dark'],
          primary: '#00FF88',
          secondary: '#00FFFF',
          accent: '#00FF88',
          neutral: '#1A1F2E',
          'base-100': '#1A1F2E',
          'base-200': '#2A2F3E',
          'base-300': '#3A3F4E',
        },
      },
    ],
    darkTheme: 'dark',
  },
}
