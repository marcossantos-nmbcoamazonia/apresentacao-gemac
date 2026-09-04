/**
 * Extrai as imagens do deck-fonte (.pptx) para public/assets.
 *
 * Um .pptx é um zip. Os nomes de origem abaixo foram levantados lendo os rels
 * de cada slide de "Publicidade 3tri26 01.09 - V2.pptx". Se o deck-fonte for
 * atualizado e os índices mudarem, ajuste o mapa MEDIA e rode:
 *
 *     npm run extract-assets
 *
 * Sem dependências: lê o diretório central do zip e infla cada entrada com zlib.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { inflateRawSync } from 'node:zlib'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PPTX = resolve(ROOT, 'Publicidade 3tri26 01.09 - V2.pptx')
const OUT = resolve(ROOT, 'public/assets')

/** origem em ppt/media  ->  nome de destino em public/assets */
const MEDIA = {
  // marca
  'image8.png': 'logo-basa.png', // lockup verde escuro (sobre fundo claro)
  'image1.png': 'logo-basa-claro.png', // variante usada na capa (fundo escuro)
  'image2.png': 'folha.png', // símbolo isolado
  'image3.png': 'tag-interna.png', // marcador #INTERNA
  // slide 6 — divisor Publicidade
  'image20.jpg': 'publicidade-lateral.jpg',
  // slide 8 — mosaico de criativos
  'image11.jpg': 'mosaico-1.jpg',
  'image17.jpg': 'mosaico-2.jpg',
  'image19.jpg': 'mosaico-3.jpg',
  'image23.jpg': 'mosaico-4.jpg',
  'image22.jpg': 'mosaico-5.jpg',
  // slide 11 — mosaico digital (capturas de redes sociais)
  'image46.jpg': 'digital-1.jpg',
  'image32.jpg': 'digital-2.jpg',
  'image37.jpg': 'digital-3.jpg',
  'image36.jpg': 'digital-4.jpg',
  'image39.jpg': 'digital-5.jpg',
  'image38.jpg': 'digital-6.jpg',
}

/** Lê o diretório central do zip e devolve { caminho -> Buffer } das entradas pedidas. */
function readZipEntries(buf, wanted) {
  // End of Central Directory: assinatura 0x06054b50, procurada do fim para o início.
  let eocd = -1
  for (let i = buf.length - 22; i >= 0 && i > buf.length - 22 - 0xffff; i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i
      break
    }
  }
  if (eocd < 0) throw new Error('EOCD não encontrado — arquivo não parece um zip válido')

  const total = buf.readUInt16LE(eocd + 10)
  let p = buf.readUInt32LE(eocd + 16)
  const out = new Map()

  for (let n = 0; n < total; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error('cabeçalho central inválido')
    const method = buf.readUInt16LE(p + 10)
    const compressedSize = buf.readUInt32LE(p + 20)
    const nameLen = buf.readUInt16LE(p + 28)
    const extraLen = buf.readUInt16LE(p + 30)
    const commentLen = buf.readUInt16LE(p + 32)
    const localOffset = buf.readUInt32LE(p + 42)
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen)

    if (wanted.has(name)) {
      // O cabeçalho local repete os tamanhos de nome/extra, que podem diferir do central.
      const lNameLen = buf.readUInt16LE(localOffset + 26)
      const lExtraLen = buf.readUInt16LE(localOffset + 28)
      const start = localOffset + 30 + lNameLen + lExtraLen
      const raw = buf.subarray(start, start + compressedSize)
      out.set(name, method === 0 ? raw : inflateRawSync(raw))
    }

    p += 46 + nameLen + extraLen + commentLen
  }
  return out
}

const wanted = new Set(Object.keys(MEDIA).map((f) => `ppt/media/${f}`))
const entries = readZipEntries(readFileSync(PPTX), wanted)

mkdirSync(OUT, { recursive: true })

let written = 0
for (const [src, dest] of Object.entries(MEDIA)) {
  const data = entries.get(`ppt/media/${src}`)
  if (!data) {
    console.warn(`  ! ${src} não encontrado no pptx — pulando`)
    continue
  }
  writeFileSync(join(OUT, dest), data)
  console.log(`  ok  ${src} -> assets/${dest}  (${(data.length / 1024).toFixed(0)} KB)`)
  written++
}

console.log(`\n${written}/${Object.keys(MEDIA).length} assets extraídos em public/assets`)
