import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // FIX FOR GITHUB PAGES BLANK SCREEN ISSUE:
  // Sets the base path to relative ('./') so all assets (CSS, JS) are
  // referenced correctly from the repository subdirectory, fixing the white screen.
  base: './' 
})
