/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // refined, editorial light theme
        ink: {
          900: '#1a1a1a',
          700: '#3d3d3d',
          500: '#737373',
          300: '#bcbcbc',
        },
        paper: {
          50:  '#fafaf7',
          100: '#f5f4ef',
          200: '#e8e6df',
        },
        accent: {
          red: '#c2410c',     // burnt orange for danger / loans
          green: '#15803d',   // forest green for success / saved
          amber: '#b45309',   // muted amber for warnings
          blue: '#1e40af',    // deep blue for highlights
        }
      },
    },
  },
  plugins: [],
}
