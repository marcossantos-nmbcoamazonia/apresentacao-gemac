/**
 * Modelo de apresentação da seção Eventos (aba "03 EVENTOS").
 * Funções puras, sem React — useEventos.ts é a casca e conferir-dados.ts
 * confere os mesmos números pelo terminal.
 *
 * Diferente de Publicidade e Digital, aqui não há série mensal por indicador:
 * cada linha é um evento e os totais da apresentação são contagem. Por isso
 * esta seção não usa kpis.ts nem resolveClosedMonth.ts.
 */
import { MESES, MESES_EXTENSO, type Mes } from '../api/parseSheet'
import type { AbaEventos, EventoRow } from '../api/parseEventos'
import { formatCompact, formatFull } from '../lib/numbers'
import {
  CLASSIFICACAO_1S26,
  normalizarTipo,
  type TipoEvento,
} from './classificacaoEventos'

export const ABA_EVENTOS = '03 EVENTOS'

/** De onde veio o tipo do evento — a planilha ou a ponte do documento COPAC. */
export type OrigemTipo = 'planilha' | 'documento' | 'regra' | 'ausente'

export interface Evento extends EventoRow {
  tipoCanonico: TipoEvento | null
  origemTipo: OrigemTipo
  /** patrocínio aprovado, ainda sem data de realização */
  ehProjeto: boolean
}

/**
 * Regra 1 (planilha manda): "Tipo" preenchido decide.
 * Regra 2 (dado): investimento preenchido sem mês = patrocínio aprovado.
 * Regra 3 (ponte): classificação transcrita do COPAC 2026 - 1S26.
 * Sem nenhuma delas, o evento fica "a classificar" e aparece sinalizado.
 */
export function classificarEvento(ev: EventoRow): Evento {
  const daPlanilha = normalizarTipo(ev.tipo)
  if (daPlanilha) {
    return { ...ev, tipoCanonico: daPlanilha, origemTipo: 'planilha', ehProjeto: false }
  }

  if (ev.investimento != null && ev.mesIndice < 0) {
    return { ...ev, tipoCanonico: null, origemTipo: 'regra', ehProjeto: true }
  }

  const doDocumento = CLASSIFICACAO_1S26[ev.id]
  if (doDocumento) {
    return { ...ev, tipoCanonico: doDocumento, origemTipo: 'documento', ehProjeto: false }
  }

  return { ...ev, tipoCanonico: null, origemTipo: 'ausente', ehProjeto: false }
}

export interface GrupoMes {
  indice: number
  nome: Mes
  extenso: string
  eventos: Evento[]
}

/** Um indicador que a planilha ainda não tem — mostrado como lacuna, nunca como zero. */
export interface Pendente {
  rotulo: string
  /** quantos eventos deveriam ter o campo preenchido */
  esperados: number
  preenchidos: number
  valor: number | null
  formatado: string
  valorCheio: string
}

export interface DadosEventos {
  titulo: string
  /** todos os eventos com nome preenchido */
  eventos: Evento[]
  /** os realizados, com mês — excluídos os patrocínios aprovados */
  realizados: Evento[]
  projetos: Evento[]

  feiras: Evento[]
  esportivos: Evento[]
  institucionais: Evento[]
  culturais: Evento[]
  /** realizados sem tipo na planilha nem no documento */
  aClassificar: Evento[]
  /** true quando algum tipo veio da ponte, e não da planilha */
  usouDocumento: boolean

  /** agenda do período, só os meses que tiveram evento */
  porMes: GrupoMes[]
  /** "Jan – Jun 2026", derivado dos meses com evento */
  periodo: string | null
  /** "Jun/2026" — último mês com evento, para a pílula de status */
  curto: string | null
  ano: number

  investimentoAprovado: number
  investimentoFormatado: string
  investimentoCheio: string

  publico: Pendente
  negocios: Pendente
  /** UFs distintas informadas na planilha */
  ufs: string[]
}

const somar = (ns: (number | null)[]): number | null => {
  const validos = ns.filter((n): n is number => n != null)
  return validos.length === 0 ? null : validos.reduce((a, b) => a + b, 0)
}

function montarPendente(rotulo: string, eventos: Evento[], campo: 'publico' | 'negocios'): Pendente {
  const valores = eventos.map((e) => e[campo])
  const preenchidos = valores.filter((v) => v != null).length
  const valor = somar(valores)
  return {
    rotulo,
    esperados: eventos.length,
    preenchidos,
    valor,
    formatado: formatCompact(valor, { moeda: campo === 'negocios' }),
    valorCheio: formatFull(valor, { moeda: campo === 'negocios' }),
  }
}

export function montarEventos(aba: AbaEventos, ano = new Date().getFullYear()): DadosEventos | null {
  if (aba.eventos.length === 0) return null

  const eventos = aba.eventos.map(classificarEvento)
  const projetos = eventos.filter((e) => e.ehProjeto)
  const realizados = eventos.filter((e) => !e.ehProjeto)

  const doTipo = (t: TipoEvento) => realizados.filter((e) => e.tipoCanonico === t)
  const feiras = doTipo('Feira')
  const esportivos = doTipo('Esportivo')
  const institucionais = doTipo('Institucional')
  const culturais = doTipo('Cultural')
  const aClassificar = realizados.filter((e) => e.tipoCanonico == null)

  // agenda: só os meses que de fato tiveram evento, na ordem do calendário
  const porMes: GrupoMes[] = []
  for (let i = 0; i < MESES.length; i++) {
    const doMes = realizados.filter((e) => e.mesIndice === i)
    if (doMes.length === 0) continue
    porMes.push({ indice: i, nome: MESES[i], extenso: MESES_EXTENSO[MESES[i]], eventos: doMes })
  }

  const periodo =
    porMes.length === 0
      ? null
      : porMes.length === 1
        ? `${porMes[0].nome} ${ano}`
        : `${porMes[0].nome} – ${porMes[porMes.length - 1].nome} ${ano}`

  const ultimo = porMes[porMes.length - 1]
  const curto = ultimo ? `${ultimo.nome}/${ano}` : null

  const investimentoAprovado = somar(projetos.map((p) => p.investimento)) ?? 0

  return {
    titulo: aba.titulo,
    eventos,
    realizados,
    projetos,
    feiras,
    esportivos,
    institucionais,
    culturais,
    aClassificar,
    usouDocumento: eventos.some((e) => e.origemTipo === 'documento'),
    porMes,
    periodo,
    curto,
    ano,
    investimentoAprovado,
    investimentoFormatado: formatCompact(investimentoAprovado, { moeda: true }),
    investimentoCheio: formatFull(investimentoAprovado, { moeda: true }),
    publico: montarPendente('Público presente', realizados, 'publico'),
    negocios: montarPendente('Negócios prospectados', realizados, 'negocios'),
    ufs: [...new Set(realizados.map((e) => e.uf).filter(Boolean))].sort(),
  }
}

/** "16 ações diversas" = esportivas + institucionais, como no documento da COPAC. */
export function totalAcoesDiversas(d: DadosEventos): number {
  return d.esportivos.length + d.institucionais.length
}
