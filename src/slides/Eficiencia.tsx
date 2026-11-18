import type { DadosPublicidade } from '../data/publicidade'
import type { Derivada } from '../data/publicidadeAnalise'
import { LinhaMes } from '../charts/graficos'
import { formatCompact, formatFull, formatPercent } from '../lib/numbers'
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
              top: 420,
              height: 1,
              background: 'rgb(245 240 226 / 16%)',
            }}
          />

          <div style={{ position: 'absolute', left: MARGEM, top: 442, width: 620 }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--areia)', marginBottom: 12 }}>
              CTR mês a mês
            </div>
            <LinhaMes
              pontos={a.ctrMensal}
              formatar={(n) => formatPercent(n)}
              largura={620}
              altura={92}
            />
          </div>

          {/* o CPL mudou de base: as campanhas que o sustentam ficam à vista,
              com o PI, para a diretoria poder conferir linha a linha */}
          <div style={{ position: 'absolute', left: 760, top: 442, width: 436 }}>
            <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--areia)', marginBottom: 14 }}>
              Campanhas com meta de lead
            </div>

            {a.campanhasLead.map((c) => (
              <div
                key={c.pi}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                  gap: 16,
                  marginBottom: 9,
                }}
              >
                <span style={{ minWidth: 0 }}>
                  <span
                    style={{
                      display: 'block',
                      fontSize: 14,
                      fontWeight: 300,
                      color: 'rgb(245 240 226 / 88%)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {c.nome}
                  </span>
                  <span style={{ fontSize: 11, color: 'rgb(245 240 226 / 42%)' }}>
                    PI {c.pi} · {c.agencia}
                  </span>
                </span>
                <span
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: 'var(--areia)',
                    whiteSpace: 'nowrap',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatCompact(c.investimento, { moeda: true })}
                </span>
              </div>
            ))}

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginTop: 12,
                paddingTop: 11,
                borderTop: '1px solid rgb(245 240 226 / 18%)',
              }}
            >
              <span style={{ fontSize: 13, color: 'rgb(245 240 226 / 58%)' }}>
                Base do CPL
                {a.leadDesatualizado && (
                  <span style={{ display: 'block', fontSize: 11, color: '#ffc4b4', marginTop: 3 }}>
                    conferida até {a.leadConferidoAte} · planilha fechou {dados?.fechado.curto}
                  </span>
                )}
              </span>
              <span
                title={formatFull(a.investimentoLead, { moeda: true })}
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: 'var(--lima)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {formatCompact(a.investimentoLead, { moeda: true })}
              </span>
            </div>
          </div>
        </>
      )}

      {/* a nota fica na largura da coluna da esquerda: em largura cheia ela
          passaria por baixo do bloco de campanhas */}
      <Nota style={{ position: 'absolute', left: MARGEM, width: 620, bottom: 54 }}>
        CTR e CPM usam toda a mídia veiculada{' '}
        {a ? `(${formatCompact(a.series.midia.total, { moeda: true })})` : ''} — impressões e
        cliques vêm de todas as campanhas, não só das de lead.
      </Nota>

      <Assinatura periodo={dados?.fechado.periodo ?? null} />
    </Palco>
  )
}
