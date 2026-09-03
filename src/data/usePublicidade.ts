import { useMemo } from 'react'
import { ABA_PUBLICIDADE, montarPublicidade, type DadosPublicidade } from './publicidade'
import { useAba } from './useAba'

export interface EstadoPublicidade {
  dados: DadosPublicidade | null
  carregando: boolean
  erro: string | null
  buscadoEm: number | null
  recarregar: () => void
}

/** Casca React sobre montarPublicidade — toda a regra vive em publicidade.ts. */
export function usePublicidade(): EstadoPublicidade {
  const { dados: aba, carregando, erro, buscadoEm, recarregar } = useAba(ABA_PUBLICIDADE)
  const dados = useMemo(() => (aba ? montarPublicidade(aba) : null), [aba])
  return { dados, carregando, erro, buscadoEm, recarregar }
}
