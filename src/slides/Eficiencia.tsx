import type { DadosPublicidade } from '../data/publicidade'
import type { Derivada } from '../data/publicidadeAnalise'
import { LinhaMes } from '../charts/graficos'
import { formatPercent } from '../lib/numbers'
import { Assinatura, Eyebrow, MARGEM, Nota, Palco, TituloDisplay } from './editorial'

/**
 * As três relações que a planilha não traz prontas. Cada uma mostra a conta que
 * a gerou logo abaixo do número — numa apresentação à diretoria, uma métrica
 * derivada sem a conta à vista é um número que ninguém consegue defender.
 */

function Cartao({ d }: { d: Derivada }) {
  return (
    <div style={{ flex: 1 }}>
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: 'var(--verde-neon)',
        }}
      >
        {d.rotulo}
      </div>
      <div
        style={{
          fontSize: 62,
          fontWeight: 700,
          letterSpacing: '-0.035em',
          color: 'var(--lima)',
          margin: '16px 0 14px',
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {d.formatado}
      </div>
      <div style={{ fontSize: 16, fontWeight: 300, color: 'var(--areia)', lineHeight: 1.4 }}>
        {d.leitura}
      </div>
      <div
        style={{
          fontSize: 12.5,
          color: 'rgb(245 240 226 / 45%)',
          marginTop: 10,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {d.conta}
      </div>
    </div>
  )
}

export function Eficiencia({ dados }: { dados: DadosPublicidade | null }) {
  const a = dados?.analise

  return (
    <Palco veu="nenhum" textura="/assets/mosaico-4.jpg">
      <div style={{ position: 'absolute', left: MARGEM, top: 60 }}>
        <Eyebrow>Eficiência</Eyebrow>
        <TituloDisplay tamanho={46} style={{ marginTop: 16 }}>
          O que cada real comprou
        </TituloDisplay>
      </div>

      {a && (
        <>
          <div
            style={{
              position: 'absolute',
              left: MARGEM,
              right: MARGEM,
              top: 214,
              display: 'flex',
              gap: 64,
            }}
          >
            <Cartao d={a.ctr} />
            <Cartao d={a.cpl} />
            <Cartao d={a.cpm} />
          </div>

          <div
            style={{
              position: 'absolute',
              left: MARGEM,
              right: MARGEM,
              top: 424,
              height: 1,
              background: 'rgb(245 240 226 / 16%)',
            }}
          />

          <div style={{ position: 'absolute', left: MARGEM, top: 446 }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 500,
                color: 'var(--areia)',
                marginBottom: 12,
              }}
            >
              CTR mês a mês
            </div>
            <LinhaMes
              pontos={a.ctrMensal}
              formatar={(n) => formatPercent(n)}
              largura={1280 - MARGEM * 2}
              altura={96}
            />
          </div>
        </>
      )}

      <Nota style={{ position: 'absolute', left: MARGEM, right: MARGEM, bottom: 62 }}>
        CPL e CPM consideram apenas o investimento de mídia (PUB-07); a produção (PUB-08) entra à
        parte no slide seguinte.
      </Nota>

      <Assinatura periodo={dados?.fechado.periodo ?? null} />
    </Palco>
  )
}
