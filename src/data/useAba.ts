/**
 * Busca + parse de uma aba da planilha. Genérico: serve 01 PUBLICIDADE,
 * 02 DIGITAL, 03 EVENTOS, 05 IMPRENSA... sem alteração.
 */
import { useCallback, useEffect, useState } from 'react'
import { fetchRange } from '../api/client'
import { parseAba, type AbaParseada } from '../api/parseSheet'

export interface EstadoAba {
  dados: AbaParseada | null
  carregando: boolean
  erro: string | null
  /** quando a resposta em uso foi buscada na rede */
  buscadoEm: number | null
  recarregar: () => void
}

export function useAba(range: string): EstadoAba {
  const [dados, setDados] = useState<AbaParseada | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [buscadoEm, setBuscadoEm] = useState<number | null>(null)
  const [gatilho, setGatilho] = useState(0)

  const recarregar = useCallback(() => setGatilho((n) => n + 1), [])

  useEffect(() => {
    const ac = new AbortController()
    let vivo = true

    setCarregando(true)
    setErro(null)

    fetchRange(range, { signal: ac.signal, forcar: gatilho > 0 })
      .then((r) => {
        if (!vivo) return
        setDados(parseAba(r.values))
        setBuscadoEm(r.buscadoEm)
        setErro(null)
      })
      .catch((e: unknown) => {
        if (!vivo || ac.signal.aborted) return
        setErro(e instanceof Error ? e.message : 'Falha ao carregar a planilha')
      })
      .finally(() => {
        if (vivo) setCarregando(false)
      })

    return () => {
      vivo = false
      ac.abort()
    }
  }, [range, gatilho])

  return { dados, carregando, erro, buscadoEm, recarregar }
}
