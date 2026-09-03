/**
 * Baixa a Inter Tight (fonte oficial da marca) do Google Fonts para public/fonts.
 *
 *     npm run fontes
 *
 * A apresentação roda em sala de reunião, onde a rede pode faltar: com a fonte
 * servida junto com o site, o deck não cai para Arial no meio da fala. Só os
 * subsets latin e latin-ext são guardados — é o que o português usa.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'public/fonts')

const CSS_URL =
  'https://fonts.googleapis.com/css2?family=Inter+Tight:wght@300;400;500;600;700&display=swap'

// UA de browser moderno, senão o Google devolve TTF em vez de woff2
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36'

const SUBSETS_DESEJADOS = new Set(['latin', 'latin-ext'])

/**
 * A Inter Tight é fonte variável: o Google devolve o MESMO woff2 para 300, 400,
 * 500, 600 e 700 — só muda o descritor font-weight. Guardar cinco cópias iguais
 * desperdiça 400 KB e, pior, cinco faces de peso fixo impedem o browser de
 * interpolar o eixo. Por isso deduplicamos por URL e declaramos uma única face
 * por subset com a faixa "300 700".
 */
const FAIXA_PESO = '300 700'

const css = await (await fetch(CSS_URL, { headers: { 'User-Agent': UA } })).text()

mkdirSync(OUT, { recursive: true })

// o CSS vem como: /* subset */\n@font-face { ... }
const porSubset = new Map()

for (const bloco of css.split('/*').slice(1)) {
  const subset = bloco.slice(0, bloco.indexOf('*/')).trim()
  if (!SUBSETS_DESEJADOS.has(subset) || porSubset.has(subset)) continue

  const url = /url\((https:\/\/[^)]+\.woff2)\)/.exec(bloco)?.[1]
  const range = /unicode-range:\s*([^;]+);/.exec(bloco)?.[1]?.trim()
  if (!url) continue

  porSubset.set(subset, { url, range })
}

const regras = []
for (const [subset, { url, range }] of porSubset) {
  const nome = `inter-tight-${subset}.woff2`
  const bin = Buffer.from(await (await fetch(url, { headers: { 'User-Agent': UA } })).arrayBuffer())
  writeFileSync(join(OUT, nome), bin)
  console.log(`  ok  ${nome}  (${(bin.length / 1024).toFixed(0)} KB)`)

  regras.push(
    [
      '@font-face {',
      "  font-family: 'Inter Tight';",
      '  font-style: normal;',
      `  font-weight: ${FAIXA_PESO};`,
      '  font-display: swap;',
      `  src: url('./${nome}') format('woff2');`,
      range ? `  unicode-range: ${range};` : null,
      '}',
    ]
      .filter(Boolean)
      .join('\n'),
  )
}

writeFileSync(
  join(OUT, 'inter-tight.css'),
  `/* Gerado por scripts/baixar-fontes.mjs — não editar à mão. */\n\n${regras.join('\n\n')}\n`,
)

console.log(`\n${regras.length} faces gravadas em public/fonts`)
