/**
 * Números no formato da planilha (pt-BR) e no formato do deck.
 *
 * A planilha entrega tudo como texto: "88.629.963", "R$ 1.583.141", "24,53%",
 * "-" ou vazio. Nada aqui pode devolver 0 para célula vazia — zero é um valor
 * legítimo de fechamento e precisa ser distinguível de "não enviado".
 */

/** "R$ 1.583.141" -> 1583141 · "24,53%" -> 24.53 · "" e "-" -> null */
export function parseBR(bruto: string | undefined | null): number | null {
  if (bruto == null) return null

  const limpo = String(bruto)
    .replace(/ /g, ' ') // espaço não-quebrável do Sheets
    .replace(/R\$/gi, '')
    .replace(/%/g, '')
    .trim()

  if (limpo === '' || limpo === '-' || limpo === '—') return null

  // pt-BR: "." separa milhar, "," separa decimal
  const normalizado = limpo.replace(/\./g, '').replace(',', '.')
  if (!/^-?\d+(\.\d+)?$/.test(normalizado)) return null

  const n = Number(normalizado)
  return Number.isFinite(n) ? n : null
}

const nf = (casas: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })

/**
 * Formato compacto do deck: 1,7 Bi · 317 Mi · 867 Mil · 56.775
 *
 * Uma casa decimal quando o valor é pequeno na unidade (abaixo de 10) ou quando
 * é dinheiro — arredondar R$ 11.843.702 para "R$ 12 Mi" apagaria precisão que
 * importa em orçamento, enquanto 18.472.258 impactos como "18 Mi" é o próprio
 * arredondamento que o deck original usa.
 */
export function formatCompact(n: number | null, opts: { moeda?: boolean } = {}): string {
  if (n == null) return '—'
  const prefixo = opts.moeda ? 'R$ ' : ''
  const abs = Math.abs(n)

  const escala = (divisor: number, sufixo: string) => {
    const v = n / divisor
    const casas = opts.moeda || Math.abs(v) < 10 ? 1 : 0
    return `${prefixo}${nf(casas).format(v)} ${sufixo}`
  }

  if (abs >= 1e9) return escala(1e9, 'Bi')
  if (abs >= 1e6) return escala(1e6, 'Mi')
  if (abs >= 1e5) return `${prefixo}${nf(0).format(Math.round(n / 1e3))} Mil`
  return `${prefixo}${nf(0).format(n)}`
}

/** Valor cheio, para legendas e tooltips: "317.296.690" */
export function formatFull(n: number | null, opts: { moeda?: boolean } = {}): string {
  if (n == null) return '—'
  return `${opts.moeda ? 'R$ ' : ''}${nf(0).format(n)}`
}

/** Taxa: "3,14%". Percentual não escala em Mi/Mil — sempre uma ou duas casas. */
export function formatPercent(n: number | null, casas = 2): string {
  if (n == null) return '—'
  return `${nf(casas).format(n)}%`
}

export interface Variacao {
  pct: number
  direcao: 'alta' | 'baixa' | 'estavel'
}

/** Variação percentual entre dois períodos. null quando não há base de comparação. */
export function variacao(atual: number | null, anterior: number | null): Variacao | null {
  if (atual == null || anterior == null || anterior === 0) return null
  const pct = ((atual - anterior) / Math.abs(anterior)) * 100
  if (!Number.isFinite(pct)) return null
  return {
    pct,
    direcao: Math.abs(pct) < 0.5 ? 'estavel' : pct > 0 ? 'alta' : 'baixa',
  }
}

const seta = (d: Variacao['direcao']) => (d === 'alta' ? '▲' : d === 'baixa' ? '▼' : '◆')

/** "▲ 45%" — o sinal já vai embutido na seta, então o número sai sem sinal. */
export function formatVariacao(v: Variacao): string {
  return `${seta(v.direcao)} ${nf(0).format(Math.abs(v.pct))}%`
}

/**
 * Diferença entre dois indicadores que já são percentuais.
 * A variação relativa de uma taxa ("de 3,14% para 5,42% = +73%") se lê errado
 * com facilidade; em pontos percentuais — "▲ 2,3 p.p." — não há ambiguidade.
 */
export function variacaoEmPontos(atual: number | null, anterior: number | null): Variacao | null {
  if (atual == null || anterior == null) return null
  const pontos = atual - anterior
  if (!Number.isFinite(pontos)) return null
  return {
    pct: pontos,
    direcao: Math.abs(pontos) < 0.05 ? 'estavel' : pontos > 0 ? 'alta' : 'baixa',
  }
}

/** "▲ 2,3 p.p." */
export function formatPontos(v: Variacao): string {
  return `${seta(v.direcao)} ${nf(1).format(Math.abs(v.pct))} p.p.`
}
