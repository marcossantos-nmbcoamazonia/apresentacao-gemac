/**
 * Modelo de apresentação da seção Publicidade (aba "01 PUBLICIDADE").
 * Funções puras, sem React — o hook em usePublicidade.ts é só a casca, e o
 * script scripts/conferir-dados.ts confere os mesmos números pelo terminal.
 *
 * Decisão importante: o acumulado é **somado aqui**, mês a mês, e não lido da
 * coluna "Acum. 2026" da planilha. Essa coluna está defasada — em PUB-01 ela
 * traz 37.038 (soma só até Mai) e em PUB-02 traz 271.618.519 (só até Jun),
 * enquanto a série tem dados até Ago. Somando Jan→mês fechado chegamos a
 * 56.775 leads e 317 Mi de impressões, exatamente os números do deck original.
 */
import { MESES, porId, type AbaParseada, type IndicadorRow, type Mes } from '../api/parseSheet'
import { formatCompact, parseBR, variacao, type Variacao } from '../lib/numbers'
import { achatarCelula, unirListas } from '../lib/listas'
import { resolveClosedMonth, ultimoMesDoIndicador, type MesFechado } from './resolveClosedMonth'

export const ABA_PUBLICIDADE = '01 PUBLICIDADE'

/** Rótulos do deck (copy de apresentação), não os rótulos técnicos da planilha. */
export const KPIS_PRINCIPAIS = [
  { id: 'PUB-01', rotulo: 'Leads Gerados' },
  { id: 'PUB-02', rotulo: 'Impressões Digitais', detalhe: '(Redes + Mídia ON)' },
  { id: 'PUB-03', rotulo: 'Cliques' },
  { id: 'PUB-04', rotulo: 'Impactos OOH', detalhe: '(DOOH + Rua)' },
  { id: 'PUB-05', rotulo: 'Fluxo Aeroportuário Impactado' },
] as const

export const KPIS_INVESTIMENTO = [
  { id: 'PUB-07', rotulo: 'Investimento de mídia executado' },
  { id: 'PUB-08', rotulo: 'Produção · investimento executado' },
] as const

export interface DefKpi {
  id: string
  rotulo: string
  detalhe?: string
}

export interface Kpi extends DefKpi {
  /** acumulado Jan → mês fechado */
  valor: number | null
  formatado: string
  moeda: boolean
  /** variação do último mês com dado contra o mês com dado anterior a ele */
  variacao: Variacao | null
  /** "Ago vs. Jul" — deixa explícito o que está sendo comparado */
  comparacao: string | null
  /** o indicador não tem valor no mês de fechamento do relatório */
  semDadoNoMes: boolean
  ultimoMes: Mes | null
  observacao: string
}

/** KPI sem dado, usado como esqueleto de layout enquanto a planilha não responde. */
export function kpiVazio(def: DefKpi, moeda = false): Kpi {
  return {
    ...def,
    valor: null,
    formatado: '—',
    moeda,
    variacao: null,
    comparacao: null,
    semDadoNoMes: true,
    ultimoMes: null,
    observacao: '',
  }
}

export function montarKpi(
  linha: IndicadorRow | undefined,
  def: DefKpi,
  fechado: MesFechado,
): Kpi {
  if (!linha) return kpiVazio(def)

  const moeda = linha.unidade.trim() === 'R$'

  // acumulado do período: soma dos meses preenchidos até o fechamento
  let soma = 0
  let temAlgum = false
  for (let i = 0; i <= fechado.indice; i++) {
    const v = parseBR(linha.meses[MESES[i]])
    if (v == null) continue
    soma += v
    temAlgum = true
  }

  // variação mês a mês, pulando buracos na série (PUB-04 não tem Fev/Mar)
  const iUltimo = ultimoMesDoIndicador(linha, fechado.indice)
  const iAnterior = iUltimo > 0 ? ultimoMesDoIndicador(linha, iUltimo - 1) : -1
  const varMes =
    iUltimo >= 0 && iAnterior >= 0
      ? variacao(parseBR(linha.meses[MESES[iUltimo]]), parseBR(linha.meses[MESES[iAnterior]]))
      : null

  return {
    ...def,
    valor: temAlgum ? soma : null,
    formatado: formatCompact(temAlgum ? soma : null, { moeda }),
    moeda,
    variacao: varMes,
    comparacao: varMes ? `${MESES[iUltimo]} vs. ${MESES[iAnterior]}` : null,
    semDadoNoMes: iUltimo !== fechado.indice,
    ultimoMes: iUltimo >= 0 ? MESES[iUltimo] : null,
    observacao: linha.observacao,
  }
}

export interface DadosPublicidade {
  fechado: MesFechado
  kpis: Kpi[]
  investimento: Kpi[]
  /** PUB-09, união Jan → mês fechado */
  produtos: string[]
  /** PUB-10, valor do mês fechado (ou do último mês com dado) */
  pracas: string
}

export function montarPublicidade(aba: AbaParseada): DadosPublicidade | null {
  const fechado = resolveClosedMonth(aba.linhas, aba.ano)
  if (!fechado) return null

  const kpis = KPIS_PRINCIPAIS.map((d) => montarKpi(porId(aba.linhas, d.id), d, fechado))
  const investimento = KPIS_INVESTIMENTO.map((d) =>
    montarKpi(porId(aba.linhas, d.id), d, fechado),
  )

  const linhaProdutos = porId(aba.linhas, 'PUB-09')
  const produtos = linhaProdutos
    ? unirListas(MESES.slice(0, fechado.indice + 1).map((m) => linhaProdutos.meses[m]))
    : []

  const linhaPracas = porId(aba.linhas, 'PUB-10')
  let pracas = ''
  if (linhaPracas) {
    const i = ultimoMesDoIndicador(linhaPracas, fechado.indice)
    pracas = i >= 0 ? achatarCelula(linhaPracas.meses[MESES[i]]) : ''
  }

  return { fechado, kpis, investimento, produtos, pracas }
}
