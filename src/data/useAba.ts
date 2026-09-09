/**
 * Busca de uma aba da planilha + parse.
 *
 * `useAba` serve as abas em formato indicador × mês (01 PUBLICIDADE, 02 DIGITAL,
 * 05 IMPRENSA, 06 CENTRO CULTURAL). `useRange` é a versão genérica, para abas
 * com outro formato — 03 EVENTOS é um registro por linha e tem parser próprio.
 */
import { useCallback, useEffect, useState } from 'react'
import { fetchRange } from '../api/client'
import { parseAba, type AbaParseada } from '../api/parseSheet'

export interface EstadoRange<T> {
  dados: T | null
  carregando: boolean
  erro: string | null
  /** quando a resposta em uso foi buscada na rede */
  buscadoEm: number | null
  recarregar: () => void
}

export type EstadoAba = EstadoRange<AbaParseada>

/**
 * `parser` entra nas dependências do efeito, então precisa ser uma referência
 * estável — use uma função de módulo, não uma criada no corpo do componente.
 */
export function useRange<T>(range: string, parser: (values: string[][]) => T): EstadoRange<T> {
  const [dados, setDados] = useState<T | null>(null)
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
        setDados(parser(r.values))
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
  }, [range, gatilho, parser])

  return { dados, carregando, erro, buscadoEm, recarregar }
}

export function useAba(range: string): EstadoAba {
  return useRange(range, parseAba)
}
