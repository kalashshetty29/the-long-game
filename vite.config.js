import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// IMPORTANT: If deploying to GitHub Pages at username.github.io/repo-name,
// set base to '/repo-name/'. If deploying to root or custom domain, leave as '/'
export default defineConfig({
  plugins: [react()],
  base: '/the-long-game/',
})
