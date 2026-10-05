// Fails when UI code bypasses the design tokens (Docs/plans/2026-10-05-mobile-ui-refresh.md).
//
//   npm run check:design
//
// Colours belong in src/lib/theme.ts (read through useTheme()) and fonts in the theme's type scale (<Txt variant>).
// Flags raw font names anywhere in src, and raw hex colours in .tsx files. Map styling (lib/mapStyle.ts) is exempt.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'src')
const EXEMPT = new Set(['src/lib/theme.ts', 'src/lib/mapStyle.ts', 'src/app/_layout.tsx'])
const FONT = /\b(Inter|SchibstedGrotesk)_\d{3}[A-Za-z]+\b/
const HEX = /['"]#[0-9A-Fa-f]{3,8}['"]/

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : /\.(ts|tsx)$/.test(name) ? [path] : []
  })
}

const problems = []
for (const file of walk(SRC)) {
  const rel = relative(ROOT, file).split('\\').join('/')
  if (EXEMPT.has(rel)) continue
  readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .forEach((line, i) => {
      if (FONT.test(line)) problems.push(`${rel}:${i + 1}  raw font name, use <Txt variant> or fonts.*`)
      if (file.endsWith('.tsx') && HEX.test(line)) problems.push(`${rel}:${i + 1}  raw colour, use useTheme()`)
    })
}

if (problems.length) {
  console.error(problems.join('\n'))
  console.error(`\n${problems.length} design token problem${problems.length === 1 ? '' : 's'}`)
  process.exit(1)
}
console.log('Design tokens: OK')
