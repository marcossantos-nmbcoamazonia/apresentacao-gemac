/**
 * Controles da apresentação. Ficam fora do canvas escalado, então continuam
 * legíveis em qualquer tamanho de tela, e somem sozinhos durante a fala.
 */
import type { FonteSlide } from './types'

export type EstadoPlanilha = FonteSlide['estado']

function haQuantoTempo(ts: number | null): string {
  if (ts == null) return ''
  const s = Math.round((Date.now() - ts) / 1000)
  if (s < 45) return 'agora'
  if (s < 5400) return `há ${Math.round(s / 60)} min`
  return `há ${Math.round(s / 3600)} h`
}

export function StatusPlanilha({ estado, mes, buscadoEm, aba }: FonteSlide) {
  const texto =
    estado === 'carregando'
      ? 'Lendo a planilha…'
      : estado === 'erro'
        ? 'Planilha indisponível'
        : `Dados até ${mes ?? '—'}`

  return (
    <span
      className="status"
      data-estado={estado}
      title={
        estado === 'ok'
          ? `Lido da aba ${aba ?? 'da planilha'} ${haQuantoTempo(buscadoEm)}. Tecle R para atualizar.`
          : undefined
      }
    >
      <span className="status__ponto" aria-hidden="true" />
      {texto}
      {estado === 'ok' && buscadoEm && (
        <span style={{ opacity: 0.55 }}>· {haQuantoTempo(buscadoEm)}</span>
      )}
    </span>
  )
}

interface ChromeProps {
  indice: number
  total: number
  oculto: boolean
  status: FonteSlide
  aoAbrirOverview: () => void
  aoAlternarTelaCheia: () => void
  telaCheia: boolean
  aoExportarPdf: () => void
  /** true enquanto as imagens da exportação carregam */
  preparandoPdf: boolean
}

export function Chrome({
  indice,
  total,
  oculto,
  status,
  aoAbrirOverview,
  aoAlternarTelaCheia,
  telaCheia,
  aoExportarPdf,
  preparandoPdf,
}: ChromeProps) {
  return (
    <div className="chrome" data-oculto={oculto}>
      <StatusPlanilha {...status} />

      <div className="chrome__barra" role="progressbar" aria-valuenow={indice + 1} aria-valuemin={1} aria-valuemax={total}>
        <div className="chrome__preenchido" style={{ width: `${((indice + 1) / total) * 100}%` }} />
      </div>

      <span className="chrome__contador">
        {indice + 1} / {total}
      </span>

      <button className="chrome__botao" onClick={aoAbrirOverview} title="Grade de slides (O)">
        Slides
      </button>
      <button
        className="chrome__botao"
        onClick={aoExportarPdf}
        disabled={preparandoPdf}
        title={`Exportar os ${total} slides em PDF (P)`}
      >
        {preparandoPdf ? 'Gerando…' : 'PDF'}
      </button>
      <button
        className="chrome__botao"
        onClick={aoAlternarTelaCheia}
        title="Tela cheia (F)"
      >
        {telaCheia ? 'Sair' : 'Tela cheia'}
      </button>
    </div>
  )
}
