import { useEffect } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { SlideFrame } from './SlideFrame'
import { Chrome, type EstadoPlanilha } from './Chrome'
import { OverviewGrid } from './OverviewGrid'
import { useDeckNav } from './useDeckNav'
import type { SlideDef } from './types'

interface Props {
  slides: SlideDef[]
  status: { estado: EstadoPlanilha; mes: string | null; buscadoEm: number | null }
  aoRecarregar: () => void
}

export function Deck({ slides, status, aoRecarregar }: Props) {
  const nav = useDeckNav(slides.length, aoRecarregar)
  const reduzirMovimento = useReducedMotion()
  const atual = slides[nav.indice] ?? slides[0]

  useEffect(() => {
    document.title = `${nav.indice + 1}. ${atual?.titulo ?? ''} — Banco da Amazônia`
  }, [nav.indice, atual])

  const duracao = reduzirMovimento ? 0 : 0.36
  const desloca = reduzirMovimento ? 0 : 14

  return (
    <>
      <div className="palco">
        <SlideFrame>
          <AnimatePresence initial={false}>
            <motion.div
              key={atual?.id ?? nav.indice}
              className="slide"
              initial={{ opacity: 0, y: desloca }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -desloca }}
              transition={{ duration: duracao, ease: [0.4, 0, 0.2, 1] }}
            >
              {atual?.render()}
            </motion.div>
          </AnimatePresence>
        </SlideFrame>
      </div>

      <p className="dica-girar">
        <span aria-hidden="true">⟳</span> Gire o aparelho para ver os slides maiores
      </p>

      <Chrome
        indice={nav.indice}
        total={slides.length}
        oculto={!nav.ativo && !nav.overviewAberto}
        status={status}
        aoAbrirOverview={nav.alternarOverview}
        aoAlternarTelaCheia={nav.alternarTelaCheia}
        telaCheia={nav.telaCheia}
      />

      {nav.overviewAberto && (
        <OverviewGrid
          slides={slides}
          indice={nav.indice}
          aoEscolher={nav.ir}
          aoFechar={nav.fecharOverview}
        />
      )}
    </>
  )
}
