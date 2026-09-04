import type { ReactNode } from 'react'

/** O canvas base de autoria. Toda geometria de slide é em px sobre esta grade. */
export const CANVAS_W = 1280
export const CANVAS_H = 720

export interface SlideDef {
  id: string
  /** rótulo curto, usado na grade de miniaturas e no título da aba */
  titulo: string
  /**
   * Estado da aba que alimenta este slide. Cada seção fecha o mês no seu
   * próprio ritmo — em Publicidade a série vai até Ago e em Digital até Jul —
   * então a pílula de status segue o slide em tela, não o deck inteiro.
   */
  fonte?: FonteSlide
  render: () => ReactNode
}

export interface FonteSlide {
  estado: 'ok' | 'carregando' | 'erro'
  /** "Ago/2026" */
  mes: string | null
  buscadoEm: number | null
  /** nome da aba, para o tooltip: "01 PUBLICIDADE" */
  aba?: string
}
