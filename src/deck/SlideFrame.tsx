import { useLayoutEffect, useState, type ReactNode } from 'react'
import { CANVAS_H, CANVAS_W } from './types'

/**
 * O palco: mantém o canvas de autoria em 1280x720 e o escala para caber na
 * janela. Assim cada slide posiciona seus elementos em px absolutos — os
 * mesmos do PPTX (1 polegada = 96 px) — e ainda assim serve qualquer tela.
 */
/**
 * Altura reservada à barra de controles, lida do token `--altura-chrome`.
 * Vem do CSS porque o valor muda por media query (no celular a barra é menor) —
 * ler daqui evita duas fontes de verdade que saem de sincronia.
 */
export function alturaChrome(): number {
  const bruto = getComputedStyle(document.documentElement).getPropertyValue('--altura-chrome')
  const n = Number.parseFloat(bruto)
  return Number.isFinite(n) ? n : 0
}

export function useEscalaCanvas(): number {
  const [escala, setEscala] = useState(1)

  useLayoutEffect(() => {
    const medir = () => {
      const vv = window.visualViewport
      const w = vv?.width ?? window.innerWidth
      const h = (vv?.height ?? window.innerHeight) - alturaChrome()
      setEscala(Math.min(w / CANVAS_W, Math.max(h, 1) / CANVAS_H))
    }
    medir()
    window.addEventListener('resize', medir)
    window.visualViewport?.addEventListener('resize', medir)
    return () => {
      window.removeEventListener('resize', medir)
      window.visualViewport?.removeEventListener('resize', medir)
    }
  }, [])

  return escala
}

/**
 * O wrapper existe para que o LAYOUT tenha o tamanho já escalado. Sem ele, a
 * caixa de 1280px transborda qualquer viewport mais estreita e o navegador
 * ancora o excesso à esquerda em vez de centralizar — o slide saía da tela em
 * telas abaixo de 1280px (no celular sumia por completo). Com o wrapper do
 * tamanho final e transform-origin no canto, a centralização volta a ser exata.
 */
export function SlideFrame({ children }: { children: ReactNode }) {
  const escala = useEscalaCanvas()
  return (
    <div
      className="canvas-wrap"
      style={{ width: CANVAS_W * escala, height: CANVAS_H * escala }}
    >
      <div className="canvas" style={{ transform: `scale(${escala})` }}>
        {children}
      </div>
    </div>
  )
}
