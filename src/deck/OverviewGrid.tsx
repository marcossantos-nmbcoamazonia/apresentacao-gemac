import { CANVAS_H, CANVAS_W, type SlideDef } from './types'

const ESCALA = 0.27

interface Props {
  slides: SlideDef[]
  indice: number
  aoEscolher: (i: number) => void
  aoFechar: () => void
}

/** Grade de miniaturas (tecla O). Renderiza os slides de verdade, em escala. */
export function OverviewGrid({ slides, indice, aoEscolher, aoFechar }: Props) {
  return (
    <div
      className="overview"
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
          style={{ width: CANVAS_W * ESCALA, height: CANVAS_H * ESCALA }}
        >
          <div className="overview__miniatura" style={{ transform: `scale(${ESCALA})` }}>
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
