import type { DadosPublicidade } from '../data/publicidade'
import { Eyebrow, Folhagem, MARGEM, Palco } from './editorial'

/**
 * A tese da seção, herdada do deck original, agora como declaração de página
 * inteira. Os três âncoras do rodapé saem todos da planilha.
 */
export function Tese({ dados }: { dados: DadosPublicidade | null }) {
  const ancoras = [
    { rotulo: 'Período', valor: dados?.fechado.periodo ?? '—' },
    { rotulo: 'Praças', valor: dados?.pracas ?? '—' },
    {
      rotulo: 'Produtos trabalhados',
      valor: dados ? `${dados.analise.produtos.length} no período` : '—',
    },
  ]

  return (
    <Palco
      foto="/assets/produtores.jpg"
      alt="Produtores rurais trabalhando a lavoura ao entardecer"
      posicao="center 38%"
      veu="moldura"
    >
      <Folhagem lado="esquerda" largura={620} opacidade={0.75} />

      <div style={{ position: 'absolute', left: MARGEM, top: 96, width: 940 }}>
        <Eyebrow>Publicidade</Eyebrow>
        <p
          style={{
            margin: '26px 0 0',
            fontSize: 72,
            lineHeight: 1.08,
            fontWeight: 300,
            letterSpacing: '-0.03em',
            color: 'var(--areia)',
          }}
        >
          Comunicação orientada à{' '}
          <span style={{ color: 'var(--lima)', fontWeight: 400 }}>geração de negócios</span>
        </p>
      </div>

      <div
        style={{
          position: 'absolute',
          left: MARGEM,
          right: MARGEM,
          bottom: 72,
          display: 'flex',
          gap: 0,
        }}
      >
        {ancoras.map((a, i) => (
          <div
            key={a.rotulo}
            style={{
              flex: 1,
              paddingLeft: i === 0 ? 0 : 36,
              borderLeft: i === 0 ? undefined : '1px solid rgb(245 240 226 / 18%)',
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                color: 'var(--verde-neon)',
                marginBottom: 10,
              }}
            >
              {a.rotulo}
            </div>
            <div style={{ fontSize: 22, fontWeight: 300, color: 'var(--areia)', lineHeight: 1.25 }}>
              {a.valor}
            </div>
          </div>
        ))}
      </div>
    </Palco>
  )
}
