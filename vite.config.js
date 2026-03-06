import { defineConfig } from 'vite'

export default defineConfig({
  base: '/tetris/',
  server: {
    port: 3001,
    host: true
  }
})