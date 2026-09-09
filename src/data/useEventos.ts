import { useMemo } from 'react'
import { parseEventos } from '../api/parseEventos'
import { ABA_EVENTOS, montarEventos, type DadosEventos } from './eventos'
import { useRange, type EstadoRange } from './useAba'

export type EstadoEventos = EstadoRange<DadosEventos> & { dados: DadosEventos | null }

/** Casca React sobre montarEventos — toda a regra vive em eventos.ts. */
export function useEventos(): EstadoEventos {
  const { dados: aba, carregando, erro, buscadoEm, recarregar } = useRange(
    ABA_EVENTOS,
    parseEventos,
  )
  const dados = useMemo(() => (aba ? montarEventos(aba) : null), [aba])
  return { dados, carregando, erro, buscadoEm, recarregar }
}
