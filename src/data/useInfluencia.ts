import { ABA_INFLUENCIA, PLANILHA_INFLUENCIA, parseInfluencia, type DadosInfluencia } from './influencia'
import { useRange, type EstadoRange } from './useAba'

/** Casca React sobre parseInfluencia — a regra toda vive em influencia.ts. */
export function useInfluencia(): EstadoRange<DadosInfluencia> {
  return useRange(ABA_INFLUENCIA, parseInfluencia, PLANILHA_INFLUENCIA)
}
