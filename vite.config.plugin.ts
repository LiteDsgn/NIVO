import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  build: {
    target: 'es2017',
    lib: {
      entry: path.resolve(__dirname, './src/plugin/controller.ts'),
      name: 'code',
      fileName: () => 'code.js',
      formats: ['es'],
    },
    outDir: './dist',
    emptyOutDir: false,
  },
})