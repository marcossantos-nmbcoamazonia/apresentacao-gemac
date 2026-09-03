/**
 * Navegação da apresentação: teclado, swipe, trackpad, tela cheia, deep-link.
 * O índice é 0-based internamente e 1-based na URL (#/1 é o primeiro slide).
 */
import { useCallback, useEffect, useRef, useState } from 'react'

function lerHash(total: number): number {
  const m = /^#\/(\d+)$/.exec(window.location.hash)
  if (!m) return 0
  return Math.min(Math.max(Number(m[1]) - 1, 0), Math.max(total - 1, 0))
}

export interface DeckNav {
  indice: number
  ir: (i: number) => void
  proximo: () => void
  anterior: () => void
  overviewAberto: boolean
  alternarOverview: () => void
  fecharOverview: () => void
  telaCheia: boolean
  alternarTelaCheia: () => void
  /** false depois de alguns segundos parado — usado para esconder o chrome */
  ativo: boolean
}

export function useDeckNav(total: number, aoRecarregar: () => void): DeckNav {
  const [indice, setIndice] = useState(() => lerHash(total))
  const [overviewAberto, setOverviewAberto] = useState(false)
  const [telaCheia, setTelaCheia] = useState(false)
  const [ativo, setAtivo] = useState(true)

  const ir = useCallback(
    (i: number) => {
      const alvo = Math.min(Math.max(i, 0), total - 1)
      setIndice(alvo)
      const hash = `#/${alvo + 1}`
      if (window.location.hash !== hash) {
        window.history.replaceState(null, '', hash)
      }
    },
    [total],
  )

  const proximo = useCallback(() => setIndice((i) => Math.min(i + 1, total - 1)), [total])
  const anterior = useCallback(() => setIndice((i) => Math.max(i - 1, 0)), [])

  // mantém a URL sincronizada mesmo quando o índice muda por swipe/teclado
  useEffect(() => {
    const hash = `#/${indice + 1}`
    if (window.location.hash !== hash) window.history.replaceState(null, '', hash)
  }, [indice])

  // navegação pelo histórico do browser (voltar/avançar, link colado)
  useEffect(() => {
    const aoMudarHash = () => setIndice(lerHash(total))
    window.addEventListener('hashchange', aoMudarHash)
    return () => window.removeEventListener('hashchange', aoMudarHash)
  }, [total])

  const alternarTelaCheia = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen()
    else void document.documentElement.requestFullscreen?.().catch(() => {})
  }, [])

  useEffect(() => {
    const sincronizar = () => setTelaCheia(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', sincronizar)
    return () => document.removeEventListener('fullscreenchange', sincronizar)
  }, [])

  // ---- teclado -------------------------------------------------------------
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      // com um botão da barra em foco, espaço/Enter devem acioná-lo, não navegar
      const alvo = e.target as HTMLElement | null
      if (alvo && /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(alvo.tagName)) return

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
        case ' ':
        case 'Enter':
          e.preventDefault()
          if (overviewAberto) setOverviewAberto(false)
          else proximo()
          break
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault()
          anterior()
          break
        case 'Home':
          e.preventDefault()
          ir(0)
          break
        case 'End':
          e.preventDefault()
          ir(total - 1)
          break
        case 'Escape':
          if (overviewAberto) setOverviewAberto(false)
          break
        default:
          switch (e.key.toLowerCase()) {
            case 'f':
              e.preventDefault()
              alternarTelaCheia()
              break
            case 'o':
              e.preventDefault()
              setOverviewAberto((v) => !v)
              break
            case 'r':
              e.preventDefault()
              aoRecarregar()
              break
          }
      }
    }
    window.addEventListener('keydown', aoTeclar)
    return () => window.removeEventListener('keydown', aoTeclar)
  }, [proximo, anterior, ir, total, overviewAberto, alternarTelaCheia, aoRecarregar])

  // ---- swipe ---------------------------------------------------------------
  useEffect(() => {
    let x0 = 0
    let y0 = 0
    const inicio = (e: TouchEvent) => {
      x0 = e.changedTouches[0].clientX
      y0 = e.changedTouches[0].clientY
    }
    const fim = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - x0
      const dy = e.changedTouches[0].clientY - y0
      if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return
      if (dx < 0) proximo()
      else anterior()
    }
    window.addEventListener('touchstart', inicio, { passive: true })
    window.addEventListener('touchend', fim, { passive: true })
    return () => {
      window.removeEventListener('touchstart', inicio)
      window.removeEventListener('touchend', fim)
    }
  }, [proximo, anterior])

  // ---- trackpad / roda -----------------------------------------------------
  const travadoAte = useRef(0)
  useEffect(() => {
    const aoRolar = (e: WheelEvent) => {
      const agora = Date.now()
      if (agora < travadoAte.current) return
      const delta = Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX
      if (Math.abs(delta) < 24) return
      travadoAte.current = agora + 600
      if (delta > 0) proximo()
      else anterior()
    }
    window.addEventListener('wheel', aoRolar, { passive: true })
    return () => window.removeEventListener('wheel', aoRolar)
  }, [proximo, anterior])

  // ---- inatividade: some com o chrome durante a apresentação ---------------
  useEffect(() => {
    let t: number
    const acordar = () => {
      setAtivo(true)
      clearTimeout(t)
      t = window.setTimeout(() => setAtivo(false), 2600)
    }
    acordar()
    for (const ev of ['mousemove', 'keydown', 'touchstart', 'wheel'] as const) {
      window.addEventListener(ev, acordar, { passive: true })
    }
    return () => {
      clearTimeout(t)
      for (const ev of ['mousemove', 'keydown', 'touchstart', 'wheel'] as const) {
        window.removeEventListener(ev, acordar)
      }
    }
  }, [])

  return {
    indice,
    ir,
    proximo,
    anterior,
    overviewAberto,
    alternarOverview: () => setOverviewAberto((v) => !v),
    fecharOverview: () => setOverviewAberto(false),
    telaCheia,
    alternarTelaCheia,
    ativo,
  }
}
