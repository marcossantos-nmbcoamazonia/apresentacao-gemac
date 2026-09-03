/**
 * Parser genérico das abas de área da planilha de fechamento.
 *
 * Todas as abas (01 PUBLICIDADE, 02 DIGITAL, 03 EVENTOS, 05 IMPRENSA, ...)
 * compartilham o mesmo formato: linhas de cabeçalho livres no topo, depois uma
 * linha que começa com "ID" e define as colunas:
 *
 *   ID | Entidade | Indicador | Un. | Jan..Dez | Acum. AAAA | Acum. AAAA-1 |
 *   Var. % | Fonte / sistema | Evidencia (link) | Observacao
 *
 * Por isso este arquivo não sabe nada sobre publicidade — serve as próximas
 * seções sem alteração.
 */

export const MESES = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
] as const

export type Mes = (typeof MESES)[number]

export const MESES_EXTENSO: Record<Mes, string> = {
  Jan: 'Janeiro',
  Fev: 'Fevereiro',
  Mar: 'Março',
  Abr: 'Abril',
  Mai: 'Maio',
  Jun: 'Junho',
  Jul: 'Julho',
  Ago: 'Agosto',
  Set: 'Setembro',
  Out: 'Outubro',
  Nov: 'Novembro',
  Dez: 'Dezembro',
}

export interface IndicadorRow {
  id: string
  entidade: string
  indicador: string
  /** "Inteiro" | "R$" | "%" | "Lista" */
  unidade: string
  meses: Record<Mes, string>
  /** coluna calculada da planilha — hoje desatualizada em várias linhas, ver usePublicidade */
  acumAno: string
  acumAnoAnterior: string
  varPct: string
  fonte: string
  evidencia: string
  observacao: string
}

export interface AbaParseada {
  /** título da aba, da primeira linha ("PUBLICIDADE   |   area: Nucleo de Midia") */
  titulo: string
  /** ano de referência, deduzido do cabeçalho "Acum. 2026" */
  ano: number
  linhas: IndicadorRow[]
}

/**
 * minúsculas, sem acento e sem pontuação — para casar cabeçalhos de forma tolerante.
 * NFD separa o acento em marca combinante, que o filtro final descarta junto com
 * espaços e pontos: "Acum. 2026" -> "acum2026", "Evidencia" e "Evidência" -> "evidencia".
 */
function norm(s: string): string {
  return s
    .normalize('NFD')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

const cel = (linha: string[] | undefined, i: number): string => (linha?.[i] ?? '').trim()

export function parseAba(values: string[][]): AbaParseada {
  const iCabecalho = values.findIndex((l) => norm(l?.[0] ?? '') === 'id')
  if (iCabecalho < 0) {
    throw new Error('Cabeçalho não encontrado: nenhuma linha começa com "ID"')
  }

  const cabecalho = values[iCabecalho].map(norm)
  const acha = (teste: (h: string) => boolean) => cabecalho.findIndex(teste)

  const col = {
    id: acha((h) => h === 'id'),
    entidade: acha((h) => h === 'entidade'),
    indicador: acha((h) => h === 'indicador'),
    unidade: acha((h) => h === 'un'),
    varPct: acha((h) => h.startsWith('var')),
    fonte: acha((h) => h.startsWith('fonte')),
    evidencia: acha((h) => h.startsWith('evidencia')),
    observacao: acha((h) => h.startsWith('observacao')),
  }

  const colsMes = MESES.map((m) => acha((h) => h === norm(m)))

  // "Acum. 2026" e "Acum. 2025" — o maior ano é o corrente
  const acumulados = cabecalho
    .map((h, i) => ({ i, ano: h.startsWith('acum') ? Number(h.replace(/\D/g, '')) : NaN }))
    .filter((c) => Number.isFinite(c.ano))
    .sort((a, b) => b.ano - a.ano)

  const ano = acumulados[0]?.ano ?? new Date().getFullYear()

  const linhas: IndicadorRow[] = []
  for (let i = iCabecalho + 1; i < values.length; i++) {
    const linha = values[i]
    const id = cel(linha, col.id)
    // linhas de dado têm id no padrão PUB-01 / DIG-05 / EVE-02
    if (!/^[A-Z]{3,4}-\d+$/.test(id)) continue

    const meses = Object.fromEntries(
      MESES.map((m, k) => [m, colsMes[k] >= 0 ? cel(linha, colsMes[k]) : '']),
    ) as Record<Mes, string>

    linhas.push({
      id,
      entidade: cel(linha, col.entidade),
      indicador: cel(linha, col.indicador),
      unidade: cel(linha, col.unidade),
      meses,
      acumAno: acumulados[0] ? cel(linha, acumulados[0].i) : '',
      acumAnoAnterior: acumulados[1] ? cel(linha, acumulados[1].i) : '',
      varPct: col.varPct >= 0 ? cel(linha, col.varPct) : '',
      fonte: col.fonte >= 0 ? cel(linha, col.fonte) : '',
      evidencia: col.evidencia >= 0 ? cel(linha, col.evidencia) : '',
      observacao: col.observacao >= 0 ? cel(linha, col.observacao) : '',
    })
  }

  // o título da aba fica na primeira célula preenchida do topo
  const titulo =
    values.slice(0, iCabecalho).flat().find((c) => (c ?? '').trim().length > 0)?.trim() ?? ''

  return { titulo, ano, linhas }
}

/** Acha a linha por ID ("PUB-01"). */
export function porId(linhas: IndicadorRow[], id: string): IndicadorRow | undefined {
  return linhas.find((l) => l.id === id)
}
