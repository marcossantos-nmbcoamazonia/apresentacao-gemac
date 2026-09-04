/**
 * Todos os slides empilhados, um por página, para a exportação em PDF.
 *
 * Fica fora da tela (não `display: none`) porque um elemento sem caixa não
 * carrega as próprias imagens — e o PDF sairia com buracos no lugar das fotos.
 * Só é montada durante a exportação; ver usePdf.ts.
 */
import type { SlideDef } from './types'

export const CLASSE_CAMADA = 'impressao'

export function CamadaImpressao({ slides }: { slides: SlideDef[] }) {
  return (
    <div className={CLASSE_CAMADA} aria-hidden="true">
      {slides.map((s) => (
        <div className="impressao__pagina" key={s.id}>
          {s.render()}
        </div>
      ))}
    </div>
  )
}
