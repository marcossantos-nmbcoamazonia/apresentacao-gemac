import type { DadosPublicidade } from '../data/publicidade'
import { formatCompact } from '../lib/numbers'
import { Eyebrow, Folhagem, MARGEM, Palco } from './editorial'

/**
 * Fechamento: os quatro números que a diretoria leva da sala, e a leitura que
 * os amarra. Tudo recalculado da planilha — nada digitado aqui.
 */
export function Fechamento({ dados }: { dados: DadosPublicidade | null }) {
  const a = dados?.analise

  const sintese = a
    ? [
        { valor: formatCompact(a.alcanceTotal), rotulo: 'impactos entregues' },
        {
          valor: formatCompact(a.investimentoTotal, { moeda: true }),
          rotulo: 'investidos em mídia e produção',
        },
        { valor: formatCompact(a.series.leads.total), rotulo: 'leads gerados' },
        { valor: String(a.produtos.length), rotulo: 'produtos em campanha' },
      ]
    : []

  return (
    <Palco veu="nenhum">
      <Folhagem lado="direita" largura={820} opacidade={0.45} />

      <div style={{ position: 'absolute', left: MARGEM, top: 92, width: 880 }}>
        <Eyebrow>Em resumo</Eyebrow>
        <p
          style={{
            margin: '26px 0 0',
            fontSize: 54,
            lineHeight: 1.12,
            fontWeight: 300,
            letterSpacing: '-0.03em',
            color: 'var(--areia)',
          }}
        >
          Escala nacional com{' '}
          <span style={{ color: 'var(--lima)', fontWeight: 400 }}>foco regional</span>
        </p>
      </div>

      <div
        style={{
          position: 'absolute',
          left: MARGEM,
          right: MARGEM,
          top: 330,
          display: 'flex',
          gap: 0,
        }}
      >
        {sintese.map((s, i) => (
          <div
            key={s.rotulo}
            style={{
              flex: 1,
              paddingLeft: i === 0 ? 0 : 32,
              borderLeft: i === 0 ? undefined : '1px solid rgb(245 240 226 / 16%)',
            }}
          >
            <div
              style={{
                fontSize: 46,
                fontWeight: 700,
                letterSpacing: '-0.035em',
                color: 'var(--lima)',
                lineHeight: 1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {s.valor}
            </div>
            <div
              style={{
                fontSize: 16,
                fontWeight: 300,
                color: 'rgb(245 240 226 / 72%)',
                marginTop: 12,
                maxWidth: 190,
                lineHeight: 1.3,
              }}
            >
              {s.rotulo}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          position: 'absolute',
          left: MARGEM,
          right: MARGEM,
          top: 512,
          height: 1,
          background: 'rgb(245 240 226 / 16%)',
        }}
      />

      <p
        style={{
          position: 'absolute',
          left: MARGEM,
          top: 552,
          width: 720,
          margin: 0,
          fontSize: 19,
          fontWeight: 300,
          lineHeight: 1.5,
          color: 'rgb(245 240 226 / 78%)',
        }}
      >
        {dados
          ? `Dados lidos da aba 01 PUBLICIDADE da planilha de fechamento, acumulados de ${dados.fechado.periodo}.`
          : '—'}
      </p>

      <img
        src="/assets/logo-basa-claro.png"
        alt="Banco da Amazônia"
        style={{
          position: 'absolute',
          left: MARGEM,
          bottom: 56,
          width: 250,
          height: 43,
          objectFit: 'contain',
        }}
      />
    </Palco>
  )
}
