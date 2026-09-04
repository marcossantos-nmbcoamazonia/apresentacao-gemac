import { useCallback, useEffect } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { SlideFrame } from './SlideFrame'
import { Chrome } from './Chrome'
import { OverviewGrid } from './OverviewGrid'
import { CamadaImpressao } from './CamadaImpressao'
import { usePdf } from './usePdf'
import { useDeckNav } from './useDeckNav'
import type { FonteSlide, SlideDef } from './types'

interface Props {
  slides: SlideDef[]
  /** usado nos slides que não declaram uma fonte própria (a capa, por exemplo) */
  status: FonteSlide
  /** vira o nome do arquivo PDF exportado */
  tituloDocumento: string
  aoRecarregar: () => void
}

export function Deck({ slides, status, tituloDocumento, aoRecarregar }: Props) {
  const nomeArquivo = useCallback(() => tituloDocumento, [tituloDocumento])
  const pdf = usePdf(nomeArquivo)
  const nav = useDeckNav(slides.length, aoRecarregar, pdf.exportar)
  const reduzirMovimento = useReducedMotion()
  const atual = slides[nav.indice] ?? slides[0]

  useEffect(() => {
    // durante a exportação o título é o nome do arquivo — não sobrescrever
    if (pdf.estado !== 'ocioso') return
    document.title = `${nav.indice + 1}. ${atual?.titulo ?? ''} — Banco da Amazônia`
  }, [nav.indice, atual, pdf.estado])

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
        status={atual?.fonte ?? status}
        aoAbrirOverview={nav.alternarOverview}
        aoAlternarTelaCheia={nav.alternarTelaCheia}
        telaCheia={nav.telaCheia}
        aoExportarPdf={pdf.exportar}
        preparandoPdf={pdf.estado !== 'ocioso'}
      />

      {nav.overviewAberto && (
        <OverviewGrid
          slides={slides}
          indice={nav.indice}
          aoEscolher={nav.ir}
          aoFechar={nav.fecharOverview}
        />
      )}

      {pdf.montarCamada && <CamadaImpressao slides={slides} />}
    </>
  )
}
