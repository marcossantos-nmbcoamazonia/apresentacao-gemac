/**
 * Slide 1 do deck — capa.
 * Geometria do PPTX: logo (0,20; 1,76in), título (0,20; 2,71in),
 * linha da gerência (0,20; 4,98in), assinatura (0,20; 6,98in).
 */
import { Fundo, Logo, MarcaCanto } from './comum'

interface Props {
  /** "Jan – Ago 2026", vindo do mês fechado da planilha */
  periodo: string | null
}

export function Capa({ periodo }: Props) {
  return (
    <Fundo cor="var(--verde-profundo)">
      <MarcaCanto />

      {/* barra fina de marca na borda esquerda */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 6,
          background: 'var(--verde-neon)',
        }}
      />

      <Logo claro style={{ position: 'absolute', left: 19, top: 169 }} />

      <h1
        style={{
          position: 'absolute',
          left: 19,
          top: 290,
          width: 760,
          margin: 0,
          fontSize: 54,
          lineHeight: 1.08,
          fontWeight: 600,
          letterSpacing: '-0.02em',
          color: 'var(--verde-neon)',
        }}
      >
        Marketing e Comunicação
        <br />
        <span style={{ fontWeight: 300, color: 'var(--branco)' }}>Resultados Estratégicos</span>
      </h1>

      <p
        style={{
          position: 'absolute',
          left: 19,
          top: 452,
          margin: 0,
          fontSize: 30,
          fontWeight: 500,
          color: 'var(--lima)',
          minHeight: 36,
        }}
      >
        {periodo ?? ' '}
      </p>

      <p
        style={{
          position: 'absolute',
          left: 19,
          top: 520,
          width: 600,
          margin: 0,
          fontSize: 19,
          lineHeight: 1.45,
          fontWeight: 300,
          color: 'rgb(255 255 255 / 72%)',
        }}
      >
        Gerência Executiva de Marketing – GEMAC
        <br />
        DIREX / CONSAD
      </p>

      <p
        style={{
          position: 'absolute',
          left: 19,
          top: 664,
          width: 900,
          margin: 0,
          fontSize: 20,
          fontWeight: 300,
          color: 'rgb(255 255 255 / 80%)',
        }}
      >
        Fortalecendo negócios, reputação e presença institucional do Banco da Amazônia.
      </p>
    </Fundo>
  )
}
