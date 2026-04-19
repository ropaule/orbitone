import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  // If we are building for production, use the repo name. 
  // If we are just running 'npm run dev', use the root '/'.
  base: command === 'build' ? '/orbitone/' : '/',
}))
