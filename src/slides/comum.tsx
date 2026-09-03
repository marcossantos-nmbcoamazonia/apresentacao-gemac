/**
 * Elementos que se repetem nos slides, com a geometria do deck original.
 * Todas as medidas são px sobre o canvas 1280x720 (PPTX: 1 polegada = 96 px).
 */
import type { CSSProperties, ReactNode } from 'react'

/** Marcador de classificação + folha, canto superior direito (como no PPTX). */
export function MarcaCanto() {
  return (
    <>
      <img
        src="/assets/tag-interna.png"
        alt="Documento interno"
        style={{ position: 'absolute', left: 1208, top: 12, width: 66, height: 11 }}
      />
      <img
        src="/assets/folha.png"
        alt=""
        aria-hidden="true"
        style={{ position: 'absolute', left: 1223, top: 26, width: 39, height: 32 }}
      />
    </>
  )
}

/** Lockup "banco da amazônia". `claro` = versão branca, para fundo escuro. */
export function Logo({
  claro = false,
  style,
}: {
  claro?: boolean
  style?: CSSProperties
}) {
  return (
    <img
      src={claro ? '/assets/logo-basa-claro.png' : '/assets/logo-basa.png'}
      alt="Banco da Amazônia"
      style={{ width: 441, height: 76, objectFit: 'contain', ...style }}
    />
  )
}

/** Pílula do período coberto — a automação do mês fechado, visível no slide. */
export function ChipPeriodo({
  texto,
  style,
}: {
  texto: string
  style?: CSSProperties
}) {
  return (
    <span
      style={{
        position: 'absolute',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 9,
        padding: '7px 16px',
        borderRadius: 99,
        border: '1px solid rgb(226 255 106 / 40%)',
        color: 'var(--lima)',
        fontSize: 15,
        fontWeight: 500,
        letterSpacing: '0.01em',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'var(--verde-neon)',
          flex: 'none',
        }}
      />
      {texto}
    </span>
  )
}

/** Bloco cinza pulsante enquanto a planilha não respondeu. */
export function Esqueleto({
  w,
  h,
  style,
}: {
  w: number | string
  h: number
  style?: CSSProperties
}) {
  return <span className="esqueleto" style={{ display: 'block', width: w, height: h, ...style }} />
}

/** Faixa de erro — o apresentador precisa saber que o número não é o de hoje. */
export function AvisoDados({ mensagem, style }: { mensagem: string; style?: CSSProperties }) {
  return (
    <div
      role="alert"
      style={{
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 18px',
        borderRadius: 8,
        background: 'rgb(255 122 89 / 14%)',
        border: '1px solid rgb(255 122 89 / 45%)',
        color: '#ffb9a6',
        fontSize: 14,
        maxWidth: 560,
        ...style,
      }}
    >
      <span aria-hidden="true">⚠</span>
      <span>
        {mensagem} — tecle <b style={{ color: '#fff' }}>R</b> para tentar de novo.
      </span>
    </div>
  )
}

/** Wrapper de slide com cor de fundo cheia. */
export function Fundo({ cor, children }: { cor: string; children: ReactNode }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: cor, overflow: 'hidden' }}>
      {children}
    </div>
  )
}
