import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // During development, send every /api request to the ASP.NET Core API.
    proxy: { '/api': 'http://localhost:5080' },
  },
})
