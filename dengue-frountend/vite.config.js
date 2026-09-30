import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import process from 'node:process'

const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1]

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: repositoryName ? `/${repositoryName}/` : '/',
})
