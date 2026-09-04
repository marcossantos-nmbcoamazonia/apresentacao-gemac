/**
 * Construção de KPI a partir de uma linha da planilha — compartilhado por todas
 * as seções (Publicidade, Digital, e as próximas).
 *
 * Duas regras que valem para o relatório inteiro:
 *
 * 1. O acumulado é **somado aqui**, mês a mês, e não lido da coluna "Acum. 2026".
 *    Essa coluna está defasada em várias linhas — em PUB-01 traz 37.038 (soma só
 *    até Mai) e em PUB-02 traz 271.618.519 (até Jun), enquanto as séries têm
 *    dados até Ago. Somando Jan→mês fechado chegamos a 56.775 leads e 317 Mi de
 *    impressões, exatamente os números do deck original.
 *
 * 2. Taxa não se soma. Indicadores com unidade "%" são agregados por média dos
 *    meses com dado, e a variação sai em pontos percentuais.
 */
import { MESES, type IndicadorRow, type Mes } from '../api/parseSheet'
import {
  formatCompact,
  formatFull,
  formatPercent,
  formatPontos,
  formatVariacao,
  parseBR,
  variacao,
  variacaoEmPontos,
  type Variacao,
} from '../lib/numbers'
import { ultimoMesDoIndicador, type MesFechado } from './resolveClosedMonth'

export type TipoKpi = 'inteiro' | 'moeda' | 'percentual'
export type Agregacao = 'soma' | 'media'

export interface DefKpi {
  id: string
  rotulo: string
  detalhe?: string
  /** força a agregação; por padrão vem da unidade da planilha */
  agregacao?: Agregacao
}

export interface Kpi extends DefKpi {
  /** agregado de Jan → mês fechado (soma ou média, conforme o tipo) */
  valor: number | null
  /** compacto, para o número grande do card: "317 Mi" */
  formatado: string
  /** sem abreviação, para tooltip e conferência: "317.296.690" · "6,24%" */
  valorCheio: string
  tipo: TipoKpi
  /** conveniência para os slides: tipo === 'moeda' */
  moeda: boolean
  agregacao: Agregacao
  /** "Acumulado" ou "Média" — como o número deve ser lido */
  rotuloAgregacao: string
  /** variação do último mês com dado contra o mês com dado anterior a ele */
  variacao: Variacao | null
  /** "▲ 45%" ou "▲ 2,3 p.p.", conforme o tipo */
  variacaoTexto: string | null
  /** "Ago vs. Jul" — deixa explícito o que está sendo comparado */
  comparacao: string | null
  /** o indicador não tem valor no mês de fechamento do relatório */
  semDadoNoMes: boolean
  ultimoMes: Mes | null
  observacao: string
  fonte: string
  /**
   * Ressalva a exibir no slide. Na prática a área escreve as ressalvas na coluna
   * "Fonte / sistema" ("Filadelfia. Definir denominador: alcance ou impressoes")
   * e deixa "Observacao" em branco, então as duas colunas entram aqui.
   */
  nota: string
}

function tipoDaUnidade(unidade: string): TipoKpi {
  const u = unidade.trim()
  if (u === 'R$') return 'moeda'
  if (u === '%') return 'percentual'
  return 'inteiro'
}

export function formatarValor(n: number | null, tipo: TipoKpi): string {
  if (tipo === 'percentual') return formatPercent(n)
  return formatCompact(n, { moeda: tipo === 'moeda' })
}

/** Sem abreviar. Taxa mantém as casas decimais — "6" no lugar de "6,24%" enganaria. */
export function formatarValorCheio(n: number | null, tipo: TipoKpi): string {
  if (tipo === 'percentual') return formatPercent(n)
  return formatFull(n, { moeda: tipo === 'moeda' })
}

/** KPI sem dado, usado como esqueleto de layout enquanto a planilha não responde. */
export function kpiVazio(def: DefKpi, tipo: TipoKpi = 'inteiro'): Kpi {
  const agregacao = def.agregacao ?? (tipo === 'percentual' ? 'media' : 'soma')
  return {
    ...def,
    valor: null,
    formatado: '—',
    valorCheio: '—',
    tipo,
    moeda: tipo === 'moeda',
    agregacao,
    rotuloAgregacao: agregacao === 'media' ? 'Média' : 'Acumulado',
    variacao: null,
    variacaoTexto: null,
    comparacao: null,
    semDadoNoMes: true,
    ultimoMes: null,
    observacao: '',
    fonte: '',
    nota: '',
  }
}

export function montarKpi(
  linha: IndicadorRow | undefined,
  def: DefKpi,
  fechado: MesFechado,
): Kpi {
  const tipo = linha ? tipoDaUnidade(linha.unidade) : 'inteiro'
  if (!linha) return kpiVazio(def, tipo)

  const agregacao = def.agregacao ?? (tipo === 'percentual' ? 'media' : 'soma')

  // agrega os meses preenchidos até o fechamento
  let soma = 0
  let quantos = 0
  for (let i = 0; i <= fechado.indice; i++) {
    const v = parseBR(linha.meses[MESES[i]])
    if (v == null) continue
    soma += v
    quantos++
  }
  const valor = quantos === 0 ? null : agregacao === 'media' ? soma / quantos : soma

  // variação mês a mês, pulando buracos na série (PUB-04 não tem Fev/Mar)
  const iUltimo = ultimoMesDoIndicador(linha, fechado.indice)
  const iAnterior = iUltimo > 0 ? ultimoMesDoIndicador(linha, iUltimo - 1) : -1
  const atual = iUltimo >= 0 ? parseBR(linha.meses[MESES[iUltimo]]) : null
  const anterior = iAnterior >= 0 ? parseBR(linha.meses[MESES[iAnterior]]) : null

  const varMes =
    tipo === 'percentual' ? variacaoEmPontos(atual, anterior) : variacao(atual, anterior)

  return {
    ...def,
    valor,
    formatado: formatarValor(valor, tipo),
    valorCheio: formatarValorCheio(valor, tipo),
    tipo,
    moeda: tipo === 'moeda',
    agregacao,
    rotuloAgregacao: agregacao === 'media' ? 'Média' : 'Acumulado',
    variacao: varMes,
    variacaoTexto: varMes
      ? tipo === 'percentual'
        ? formatPontos(varMes)
        : formatVariacao(varMes)
      : null,
    comparacao: varMes ? `${MESES[iUltimo]} vs. ${MESES[iAnterior]}` : null,
    semDadoNoMes: iUltimo !== fechado.indice,
    ultimoMes: iUltimo >= 0 ? MESES[iUltimo] : null,
    observacao: linha.observacao,
    fonte: linha.fonte,
    nota: [linha.observacao, linha.fonte].map((s) => s.trim()).filter(Boolean).join(' · '),
  }
}
