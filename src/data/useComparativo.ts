import { useMemo } from 'react'
import type { AbaParseada } from '../api/parseSheet'
import { abaDoAno, montarComparativo, type Comparativo } from './comparativo'
import { ABA_PUBLICIDADE } from './publicidade'
import type { MesFechado } from './resolveClosedMonth'
import { useAba } from './useAba'

export interface EstadoComparativo {
  dados: Comparativo | null
  /** "01 PUBLICIDADE - 2025", ou null enquanto o ano corrente não é conhecido */
  aba: string | null
  carregando: boolean
  erro: string | null
  buscadoEm: number | null
  recarregar: () => void
}

/**
 * Casca React sobre montarComparativo. O nome da aba anterior sai do ano da
 * aba corrente — em 2027 o deck passa a ler "01 PUBLICIDADE - 2026" sozinho —
 * por isso a busca só começa depois que a aba corrente chega.
 */
export function useComparativo(
  atual: AbaParseada | null,
  fechado: MesFechado | null,
): EstadoComparativo {
  const range = atual ? abaDoAno(ABA_PUBLICIDADE, atual.ano - 1) : null
  const { dados: anterior, carregando, erro, buscadoEm, recarregar } = useAba(range)

  const resultado = useMemo(() => {
    if (!atual || !anterior || !fechado) return { dados: null, erro: null }
    // a aba se identifica pelo cabeçalho "Acum. AAAA" — se o nome e o conteúdo
    // discordarem, alguém copiou a aba sem trocar o ano
    if (anterior.ano !== atual.ano - 1) {
      return {
        dados: null,
        erro: `A aba "${range}" traz o acumulado de ${anterior.ano}, não de ${atual.ano - 1}`,
      }
    }
    return { dados: montarComparativo(atual, anterior, fechado), erro: null }
  }, [atual, anterior, fechado, range])

  return {
    dados: resultado.dados,
    aba: range,
    carregando,
    erro: erro ?? resultado.erro,
    buscadoEm,
    recarregar,
  }
}
