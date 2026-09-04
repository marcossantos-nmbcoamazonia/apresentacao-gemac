import { useMemo } from 'react'
import { ABA_DIGITAL, montarDigital, type DadosDigital } from './digital'
import { useAba } from './useAba'

export interface EstadoDigital {
  dados: DadosDigital | null
  carregando: boolean
  erro: string | null
  buscadoEm: number | null
  recarregar: () => void
}

/** Casca React sobre montarDigital — toda a regra vive em digital.ts. */
export function useDigital(): EstadoDigital {
  const { dados: aba, carregando, erro, buscadoEm, recarregar } = useAba(ABA_DIGITAL)
  const dados = useMemo(() => (aba ? montarDigital(aba) : null), [aba])
  return { dados, carregando, erro, buscadoEm, recarregar }
}
