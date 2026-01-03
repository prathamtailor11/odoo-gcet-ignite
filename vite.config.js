import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/odoo-gcet-ignite/',
  server: {
    port: 3000,
    open: true
  }
})
