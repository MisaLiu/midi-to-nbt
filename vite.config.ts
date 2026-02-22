import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    nodePolyfills({
      include: [ 'zlib', 'buffer', 'stream' ],
      globals: {
        Buffer: true,
        global: true,
      },
    }),
    preact(),
  ],
})
