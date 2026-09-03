/**
 * As colunas de "Lista" da planilha (produtos trabalhados, praças) são texto
 * livre digitado mês a mês: vêm com quebras de linha, caixa inconsistente
 * ("Capital de Giro" e "CAPITAL DE GIRO" na mesma série) e espaçamento
 * irregular em torno de hífens ("PROJETO PARINTINS- BASA").
 */

/** Siglas que devem permanecer em caixa alta ao normalizar. */
const SIGLAS = new Set([
  'CCBA',
  'BASA',
  'UOL',
  'OOH',
  'DOOH',
  'DF',
  'SP',
  'PA',
  'AM',
  'TV',
  'B2B',
  'II',
  'III',
])

/** Preposições que ficam em minúscula quando não são a primeira palavra. */
const CONECTIVOS = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'para', 'com', 'no', 'na'])

const semAcento = (s: string) => s.normalize('NFD').replace(/[^\w\s-]/g, '')

/** Chave de deduplicação: ignora caixa, acento e espaçamento. */
export function chaveLista(s: string): string {
  return semAcento(s).toUpperCase().replace(/\s+/g, ' ').trim()
}

/** "CAPITAL DE GIRO - INFOMONEY" -> "Capital de Giro - Infomoney" */
export function normalizarItem(bruto: string): string {
  const limpo = bruto
    .replace(/\s*-\s*/g, ' - ') // espaçamento uniforme em torno do hífen
    .replace(/\s+/g, ' ')
    .trim()

  return limpo
    .split(' ')
    .map((palavra, i) => {
      const nu = palavra.replace(/[^\p{L}\p{N}]/gu, '')
      if (nu === '') return palavra
      if (SIGLAS.has(nu.toUpperCase())) return palavra.toUpperCase()
      if (/^\d/.test(nu)) return palavra // "2026"
      const minuscula = palavra.toLocaleLowerCase('pt-BR')
      if (i > 0 && CONECTIVOS.has(minuscula)) return minuscula
      return minuscula.charAt(0).toLocaleUpperCase('pt-BR') + minuscula.slice(1)
    })
    .join(' ')
}

/** Quebra uma célula multi-linha em itens limpos. */
export function itensDaCelula(celula: string): string[] {
  return celula
    .split(/[\r\n]+/)
    .map((l) => l.trim())
    .filter((l) => l !== '' && l !== '-')
    .map(normalizarItem)
}

/** União ordenada e deduplicada de várias células (Jan → mês fechado). */
export function unirListas(celulas: string[]): string[] {
  const vistos = new Set<string>()
  const saida: string[] = []
  for (const celula of celulas) {
    for (const item of itensDaCelula(celula)) {
      const k = chaveLista(item)
      if (vistos.has(k)) continue
      vistos.add(k)
      saida.push(item)
    }
  }
  return saida
}

/** "Amazônia Legal\n+ DF + SP" -> "Amazônia Legal + DF + SP" */
export function achatarCelula(celula: string): string {
  return celula.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim()
}
