import { useLayoutEffect, useState } from 'react'
import { alturaChrome } from './SlideFrame'
import { CANVAS_H, CANVAS_W, type SlideDef } from './types'

const GAP = 22
/** margem em volta da grade, para a grade nunca encostar na borda da janela */
const FOLGA = 0.92

interface Props {
  slides: SlideDef[]
  indice: number
  aoEscolher: (i: number) => void
  aoFechar: () => void
}

/**
 * Quantas colunas e em que escala a grade cabe na janela.
 * O deck cresce a cada seção nova, então isso é calculado, não fixado: com 8
 * slides dá 3 colunas, com 20 dá 5 e as miniaturas encolhem junto.
 */
function arranjo(total: number, vw: number, vh: number) {
  const colunas = Math.max(1, Math.ceil(Math.sqrt(total)))
  const linhas = Math.ceil(total / colunas)
  const escala = Math.min(
    (vw * FOLGA - GAP * (colunas - 1)) / (colunas * CANVAS_W),
    (vh * FOLGA - GAP * (linhas - 1)) / (linhas * CANVAS_H),
    0.32,
  )
  return { colunas, escala: Math.max(escala, 0.08) }
}

/** Grade de miniaturas (tecla O). Renderiza os slides de verdade, em escala. */
export function OverviewGrid({ slides, indice, aoEscolher, aoFechar }: Props) {
  // a barra de controles continua visível com a grade aberta, então ela também
  // desconta a faixa reservada
  const [{ colunas, escala }, setArranjo] = useState(() =>
    arranjo(slides.length, window.innerWidth, window.innerHeight - alturaChrome()),
  )

  useLayoutEffect(() => {
    const medir = () =>
      setArranjo(arranjo(slides.length, window.innerWidth, window.innerHeight - alturaChrome()))
    medir()
    window.addEventListener('resize', medir)
    return () => window.removeEventListener('resize', medir)
  }, [slides.length])

  return (
    <div
      className="overview"
      style={{ gridTemplateColumns: `repeat(${colunas}, auto)`, gap: GAP }}
      onClick={(e) => {
        if (e.target === e.currentTarget) aoFechar()
      }}
    >
      {slides.map((s, i) => (
        <button
          key={s.id}
          className="overview__item"
          data-ativo={i === indice}
          onClick={() => {
            aoEscolher(i)
            aoFechar()
          }}
          style={{ width: CANVAS_W * escala, height: CANVAS_H * escala }}
        >
          <div className="overview__miniatura" style={{ transform: `scale(${escala})` }}>
            {s.render()}
          </div>
          <span className="overview__rotulo">
            {i + 1}. {s.titulo}
          </span>
        </button>
      ))}
    </div>
  )
}
