import { build } from 'esbuild'

build({
  entryPoints: ['./src/index.tsx'],
  outfile: './dist/index.js',
  sourcemap: 'external',
  minify: true,
  bundle: true,
  format: "esm",
  define: {
    'process.env.NODE_DEBUG': 'false',
    'global': 'globalThis'
  }
})
  .catch(() => process.exit(1))