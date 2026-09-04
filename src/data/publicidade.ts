/**
 * Modelo de apresentação da seção Publicidade (aba "01 PUBLICIDADE").
 * Funções puras, sem React — o hook em usePublicidade.ts é só a casca, e o
 * script scripts/conferir-dados.ts confere os mesmos números pelo terminal.
 *
 * As regras de agregação (soma vs. média, variação, mês fechado) são comuns a
 * todas as seções e vivem em kpis.ts.
 */
import { MESES, porId, type AbaParseada } from '../api/parseSheet'
import { achatarCelula, unirListas } from '../lib/listas'
import { montarKpi, type DefKpi, type Kpi } from './kpis'
import { resolveClosedMonth, ultimoMesDoIndicador, type MesFechado } from './resolveClosedMonth'

export const ABA_PUBLICIDADE = '01 PUBLICIDADE'

/** Rótulos do deck (copy de apresentação), não os rótulos técnicos da planilha. */
export const KPIS_PRINCIPAIS: DefKpi[] = [
  { id: 'PUB-01', rotulo: 'Leads Gerados' },
  { id: 'PUB-02', rotulo: 'Impressões Digitais', detalhe: '(Redes + Mídia ON)' },
  { id: 'PUB-03', rotulo: 'Cliques' },
  { id: 'PUB-04', rotulo: 'Impactos OOH', detalhe: '(DOOH + Rua)' },
  { id: 'PUB-05', rotulo: 'Fluxo Aeroportuário Impactado' },
]

export const KPIS_INVESTIMENTO: DefKpi[] = [
  { id: 'PUB-07', rotulo: 'Investimento de mídia executado' },
  { id: 'PUB-08', rotulo: 'Produção · investimento executado' },
]

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
