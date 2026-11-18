/**
 * Marketing de influência: o consolidado "Big Numbers" da estratégia Always On.
 *
 * A fonte é outra planilha, e a aba `base` não é registro bruto: é o próprio
 * quadro-resumo, com blocos empilhados (cards, tabela métrica × mês, dois top 5
 * e observações). O parser acha cada bloco pelo RÓTULO, nunca pela posição, então
 * uma linha nova inserida na planilha não desloca nada.
 *
 * DUAS REGRAS
 *
 * 1. **O total vem da coluna TOTAL, nunca da soma dos meses.** Influenciadores e
 *    campanhas são contagens de únicos (23 + 17 + 16 meses ≠ 32 no período) e o
 *    engajamento é taxa. Somar mês a mês erraria os três.
 * 2. **O período é deduzido do cabeçalho** ("ago./26 · set./26 · out./26"), como
 *    o mês fechado do resto do deck. Ninguém digita "Agosto a Outubro" no código.
 *
 * Função pura, sem React — `scripts/conferir-dados.ts` imprime o mesmo quadro.
 */
import { MESES, type Mes } from '../api/parseSheet'
import { parseBR } from '../lib/numbers'

export const PLANILHA_INFLUENCIA =
  import.meta.env?.VITE_SHEET_ID_INFLUENCIA ?? '183NDpuIYTC0dkFNUzyIZIqcVGGOwmxnadGEKoEmRpgY'
export const ABA_INFLUENCIA = 'base'

/** Uma métrica da tabela: o valor de cada mês e o da coluna TOTAL. */
export interface MetricaInfluencia {
  meses: (number | null)[]
  total: number | null
}

export interface ItemRanking {
  nome: string
  conteudos: number | null
  views: number | null
  alcance: number | null
  interacoes: number | null
  /** participação nas views do período, em % (20,8) */
  participacao: number | null
}

export interface DadosInfluencia {
  meses: { nome: Mes; ano: number }[]
  /** "Ago – Out 2026" */
  periodo: string
  /** "Out/2026" — para a pílula de status */
  curto: string
  conteudos: MetricaInfluencia
  stories: MetricaInfluencia
  reels: MetricaInfluencia
  outros: MetricaInfluencia
  views: MetricaInfluencia
  alcance: MetricaInfluencia
  curtidas: MetricaInfluencia
  comentarios: MetricaInfluencia
  compartilhados: MetricaInfluencia
  salvos: MetricaInfluencia
  interacoes: MetricaInfluencia
  respostasStories: MetricaInfluencia
  influenciadores: MetricaInfluencia
  campanhas: MetricaInfluencia
  /** em %, só Reels: interações orgânicas ÷ alcance orgânico */
  engajamento: MetricaInfluencia
  topCampanhas: ItemRanking[]
  topInfluenciadores: ItemRanking[]
  observacoes: string[]
}

/** minúsculas, sem acento e sem pontuação: "% das Views" -> "dasviews" */
function norm(s: string | undefined): string {
  return (s ?? '')
    .normalize('NFD')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

const cel = (linha: string[] | undefined, i: number) => (linha?.[i] ?? '').trim()

/** "ago./26" -> { nome: 'Ago', ano: 2026 } */
function mesDoCabecalho(bruto: string): { nome: Mes; ano: number } | null {
  const m = bruto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .match(/^([a-z]{3})[a-z]*\.?\s*\/\s*(\d{2}|\d{4})$/)
  if (!m) return null
  const nome = MESES.find((x) => x.toLowerCase() === m[1])
  if (!nome) return null
  const ano = Number(m[2])
  return { nome, ano: ano < 100 ? 2000 + ano : ano }
}

function lerRanking(values: string[][], titulo: string): ItemRanking[] {
  const iTitulo = values.findIndex((l) => norm(l?.[0]).startsWith(titulo))
  if (iTitulo < 0) return []
  const cab = (values[iTitulo + 1] ?? []).map(norm)
  const col = (teste: (h: string) => boolean) => cab.findIndex(teste)
  const c = {
    conteudos: col((h) => h === 'conteudos'),
    views: col((h) => h.startsWith('views')),
    alcance: col((h) => h.startsWith('alcance')),
    interacoes: col((h) => h.startsWith('interacoes')),
    participacao: col((h) => h.includes('dasviews')),
  }
  const num = (l: string[], i: number) => (i >= 0 ? parseBR(cel(l, i)) : null)

  const itens: ItemRanking[] = []
  for (let i = iTitulo + 2; i < values.length; i++) {
    const l = values[i]
    const nome = cel(l, 0)
    if (!nome) break
    itens.push({
      nome,
      conteudos: num(l, c.conteudos),
      views: num(l, c.views),
      alcance: num(l, c.alcance),
      interacoes: num(l, c.interacoes),
      participacao: num(l, c.participacao),
    })
  }
  return itens
}

export function parseInfluencia(values: string[][]): DadosInfluencia {
  const iCab = values.findIndex((l) => norm(l?.[0]) === 'metrica')
  if (iCab < 0) throw new Error('Consolidado de influência: linha "MÉTRICA" não encontrada')

  const cab = values[iCab]
  const colMeses: { i: number; nome: Mes; ano: number }[] = []
  cab.forEach((h, i) => {
    const m = mesDoCabecalho((h ?? '').trim())
    if (m) colMeses.push({ i, ...m })
  })
  const iTotal = cab.findIndex((h) => norm(h) === 'total')
  if (!colMeses.length || iTotal < 0) {
    throw new Error('Consolidado de influência: cabeçalho sem meses ou sem TOTAL')
  }

  // a tabela vai do cabeçalho até o primeiro "TOP 5"
  let iFim = values.findIndex((l, i) => i > iCab && norm(l?.[0]).startsWith('top5'))
  if (iFim < 0) iFim = values.length
  const tabela = values.slice(iCab + 1, iFim)

  const metrica = (teste: (rotulo: string) => boolean): MetricaInfluencia => {
    const l = tabela.find((x) => teste(norm(x?.[0])))
    return {
      meses: colMeses.map((c) => (l ? parseBR(cel(l, c.i)) : null)),
      total: l ? parseBR(cel(l, iTotal)) : null,
    }
  }

  const primeiro = colMeses[0]
  const ultimo = colMeses[colMeses.length - 1]
  const periodo =
    colMeses.length === 1
      ? `${primeiro.nome} ${primeiro.ano}`
      : primeiro.ano === ultimo.ano
        ? `${primeiro.nome} – ${ultimo.nome} ${ultimo.ano}`
        : `${primeiro.nome}/${primeiro.ano} – ${ultimo.nome}/${ultimo.ano}`

  const iObs = values.findIndex((l) => norm(l?.[0]).startsWith('observac'))
  const observacoes =
    iObs < 0
      ? []
      : values
          .slice(iObs + 1)
          .map((l) => cel(l, 0))
          .filter(Boolean)

  return {
    meses: colMeses.map(({ nome, ano }) => ({ nome, ano })),
    periodo,
    curto: `${ultimo.nome}/${ultimo.ano}`,
    // "Total" exato: "Total de Interações" é outra linha
    conteudos: metrica((r) => r === 'total'),
    stories: metrica((r) => r === 'stories'),
    reels: metrica((r) => r === 'reels'),
    outros: metrica((r) => r.startsWith('outros')),
    views: metrica((r) => r.startsWith('viewstotais')),
    alcance: metrica((r) => r.startsWith('alcanceorganico')),
    curtidas: metrica((r) => r === 'curtidas'),
    comentarios: metrica((r) => r === 'comentarios'),
    compartilhados: metrica((r) => r.startsWith('compartilhad')),
    salvos: metrica((r) => r === 'salvos'),
    interacoes: metrica((r) => r.startsWith('totaldeinteracoes')),
    respostasStories: metrica((r) => r.startsWith('respostasastories')),
    influenciadores: metrica((r) => r.startsWith('influenciadores')),
    campanhas: metrica((r) => r.startsWith('campanhas')),
    engajamento: metrica((r) => r.startsWith('engajamento')),
    topCampanhas: lerRanking(values, 'top5campanhas'),
    topInfluenciadores: lerRanking(values, 'top5influenciadores'),
    observacoes,
  }
}
