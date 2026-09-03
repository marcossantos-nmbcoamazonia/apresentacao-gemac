/**
 * A automação do "até que mês os dados estão preenchidos".
 *
 * Ninguém informa o mês de fechamento ao site: ele é deduzido da própria
 * planilha. Só os indicadores numéricos entram na conta — as linhas de texto
 * (unidade "Lista") costumam ficar preenchidas à frente e adiantariam o mês.
 */
import { MESES, type IndicadorRow, type Mes } from '../api/parseSheet'

export interface MesFechado {
  /** 0 = Jan ... 11 = Dez */
  indice: number
  nome: Mes
  ano: number
  /** "Jan – Ago 2026" */
  periodo: string
  /** "Ago/2026" */
  curto: string
}

const ehNumerico = (l: IndicadorRow) => l.unidade.trim().toLowerCase() !== 'lista'
const preenchido = (v: string) => v.trim() !== '' && v.trim() !== '-'

/** Último mês (0-11) com algum valor numérico em qualquer indicador, ou -1. */
export function ultimoMesComDado(linhas: IndicadorRow[]): number {
  const numericos = linhas.filter(ehNumerico)
  for (let i = MESES.length - 1; i >= 0; i--) {
    if (numericos.some((l) => preenchido(l.meses[MESES[i]]))) return i
  }
  return -1
}

/** Último mês com dado de um indicador específico (respeita buracos na série). */
export function ultimoMesDoIndicador(linha: IndicadorRow, ate = MESES.length - 1): number {
  for (let i = Math.min(ate, MESES.length - 1); i >= 0; i--) {
    if (preenchido(linha.meses[MESES[i]])) return i
  }
  return -1
}

export function resolveClosedMonth(linhas: IndicadorRow[], ano: number): MesFechado | null {
  const indice = ultimoMesComDado(linhas)
  if (indice < 0) return null

  const nome = MESES[indice]
  return {
    indice,
    nome,
    ano,
    periodo: indice === 0 ? `${nome} ${ano}` : `${MESES[0]} – ${nome} ${ano}`,
    curto: `${nome}/${ano}`,
  }
}
