import type { ReactNode } from 'react'

/** O canvas base de autoria. Toda geometria de slide é em px sobre esta grade. */
export const CANVAS_W = 1280
export const CANVAS_H = 720

export interface SlideDef {
  id: string
  /** rótulo curto, usado na grade de miniaturas e no título da aba */
  titulo: string
  render: () => ReactNode
}
