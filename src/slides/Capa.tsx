import { Eyebrow, Folhagem, MARGEM, Palco } from './editorial'

/**
 * Capa. O retrato ocupa a tela inteira e o véu abre espaço de leitura à
 * esquerda — nenhum bloco opaco por cima da foto.
 */
export function Capa({ periodo }: { periodo: string | null }) {
  return (
    <Palco
      foto="/assets/retrato-1.jpg"
      alt="Mulher amazônida em luz de fim de tarde, olhando para cima"
      posicao="62% 26%"
      veu="esquerda"
    >
      <Folhagem lado="direita" largura={760} opacidade={0.9} />

      <img
        src="/assets/logo-basa-claro.png"
        alt="Banco da Amazônia"
        style={{ position: 'absolute', left: MARGEM, top: 62, width: 300, height: 52, objectFit: 'contain' }}
      />

      <div style={{ position: 'absolute', left: MARGEM, top: 232, width: 660 }}>
        <Eyebrow>Gerência Executiva de Marketing · GEMAC</Eyebrow>

        <h1
          style={{
            margin: '22px 0 0',
            fontSize: 104,
            lineHeight: 0.94,
            fontWeight: 300,
            letterSpacing: '-0.04em',
            color: 'var(--areia)',
          }}
        >
          Publicidade
        </h1>

        <div
          style={{
            width: 96,
            height: 3,
            background: 'var(--verde-neon)',
            margin: '34px 0 26px',
          }}
        />

        <p style={{ margin: 0, fontSize: 27, fontWeight: 300, color: 'rgb(245 240 226 / 78%)' }}>
          Resultados de mídia
        </p>
        <p
          style={{
            margin: '10px 0 0',
            fontSize: 34,
            fontWeight: 500,
            letterSpacing: '-0.01em',
            color: 'var(--lima)',
            minHeight: 42,
          }}
        >
          {periodo ?? ' '}
        </p>
      </div>

      <p
        style={{
          position: 'absolute',
          left: MARGEM,
          bottom: 56,
          margin: 0,
          fontSize: 14,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'rgb(245 240 226 / 52%)',
        }}
      >
        DIREX / CONSAD · Documento interno
      </p>
    </Palco>
  )
}
