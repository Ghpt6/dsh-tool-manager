import { build } from 'esbuild'
import { readFile, mkdir, writeFile } from 'node:fs/promises'

const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
await mkdir('lib', { recursive: true })
await build({
  entryPoints: ['src/index.ts'], outfile: 'lib/index.js',
  bundle: true, packages: 'external', format: 'esm', platform: 'node',
  target: 'node22', sourcemap: true,
  define: { __PLUGIN_VERSION__: JSON.stringify(pkg.version) },
})
// DSH evaluates browser modules lazily. Keep exports inside the factory so
// multiple modules and repeated loads cannot share one global exports object.
const client = await build({
  entryPoints: ['src/client/index.tsx'], write: false,
  bundle: true, packages: 'external', format: 'cjs', platform: 'browser',
  target: 'es2022', jsx: 'automatic', minify: false,
  define: { 'process.env.NODE_ENV': '"production"' },
})
await writeFile('lib/client.js',
  `window.__ModuleLoader__.load({id:${JSON.stringify(pkg.name)},factory:(require)=>{\n` +
  'const module={exports:{}};const exports=module.exports;\n' +
  client.outputFiles[0].text + '\nreturn module.exports;\n}});\n')
console.log(`Built ${pkg.name}@${pkg.version}: lib/index.js + lib/client.js`)
