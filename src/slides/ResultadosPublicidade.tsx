/**
 * Slide 7 do deck — RESULTADOS DE PUBLICIDADE.
 *
 * Grade de cards do PPTX (343x251 px, fundo #005240) mantida; o original tinha
 * 5 cards com a última linha centralizada, aqui a linha fecha com um sexto card
 * secundário trazendo PUB-07/PUB-08, que existem na planilha e não estavam no
 * slide. Faixa neon no rodapé, como no original.
 */
import type { Kpi } from '../data/kpis'
import { AvisoDados, ChipPeriodo, Esqueleto, Fundo, MarcaCanto } from './comum'

const CARD_W = 343
const CARD_H = 251
const COLUNAS = [101, 469, 837]
const LINHAS = [95, 375]

interface Props {
  kpis: Kpi[]
  investimento: Kpi[]
  periodo: string | null
  mesFechado: string | null
  carregando: boolean
  erro: string | null
}

function corDaVariacao(direcao: 'alta' | 'baixa' | 'estavel'): string {
  if (direcao === 'alta') return 'var(--lima)'
  if (direcao === 'baixa') return 'var(--verde-argila)'
  return 'rgb(255 255 255 / 62%)'
}

function Rodape({ kpi, mesFechado }: { kpi: Kpi; mesFechado: string | null }) {
  if (kpi.variacao && kpi.variacaoTexto) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <span
          aria-hidden="true"
          style={{ width: 4, height: 30, borderRadius: 2, background: 'var(--lima)', flex: 'none' }}
        />
        <div>
          <div
            style={{
              fontSize: 19,
              fontWeight: 600,
              lineHeight: 1.15,
              color: corDaVariacao(kpi.variacao.direcao),
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {kpi.variacaoTexto}
          </div>
          <div style={{ fontSize: 12, color: 'rgb(255 255 255 / 52%)', lineHeight: 1.3 }}>
            {kpi.comparacao}
            {kpi.semDadoNoMes && mesFechado ? ` · sem dado em ${mesFechado}` : ''}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontSize: 12, color: 'rgb(255 255 255 / 42%)', lineHeight: 1.35 }}>
      {kpi.valor == null
        ? 'Sem dado na planilha para o período'
        : 'Sem mês anterior para comparar'}
    </div>
  )
}

function CardKpi({
  kpi,
  x,
  y,
  carregando,
  mesFechado,
}: {
  kpi: Kpi
  x: number
  y: number
  carregando: boolean
  mesFechado: string | null
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: CARD_W,
        height: CARD_H,
        background: 'var(--verde-card)',
        borderRadius: 16,
        boxShadow: '0 14px 34px rgb(0 0 0 / 32%)',
        padding: '26px 28px 24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        {carregando ? (
          <Esqueleto w={190} h={50} style={{ marginBottom: 14 }} />
        ) : (
          <div
            title={kpi.valor != null ? kpi.valorCheio : undefined}
            style={{
              fontSize: 48,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: '-0.025em',
              color: 'var(--lima)',
              fontVariantNumeric: 'tabular-nums',
              marginBottom: 14,
            }}
          >
            {kpi.formatado}
          </div>
        )}

        <div style={{ fontSize: 21, fontWeight: 500, lineHeight: 1.22, color: 'var(--branco)' }}>
          {kpi.rotulo}
        </div>
        {kpi.detalhe && (
          <div style={{ fontSize: 15, fontWeight: 300, color: 'rgb(255 255 255 / 66%)', marginTop: 3 }}>
            {kpi.detalhe}
          </div>
        )}
      </div>

      {!carregando && <Rodape kpi={kpi} mesFechado={mesFechado} />}
    </div>
  )
}

/** Card secundário: os dois indicadores de investimento, ausentes do PPTX. */
function CardInvestimento({
  itens,
  x,
  y,
  carregando,
}: {
  itens: Kpi[]
  x: number
  y: number
  carregando: boolean
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: CARD_W,
        height: CARD_H,
        background: 'rgb(0 0 0 / 16%)',
        border: '1px solid rgb(226 255 106 / 30%)',
        borderRadius: 16,
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'rgb(226 255 106 / 78%)',
        }}
      >
        Investimento executado
      </div>

      {itens.map((k, i) => (
        <div key={k.id} style={{ paddingTop: i > 0 ? 16 : 0, borderTop: i > 0 ? '1px solid rgb(255 255 255 / 12%)' : undefined }}>
          {carregando ? (
            <Esqueleto w={150} h={32} />
          ) : (
            <div
              title={k.valor != null ? k.valorCheio : undefined}
              style={{
                fontSize: 32,
                fontWeight: 600,
                lineHeight: 1.05,
                color: 'var(--branco)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {k.formatado}
            </div>
          )}
          <div style={{ fontSize: 14, fontWeight: 300, color: 'rgb(255 255 255 / 62%)', marginTop: 4 }}>
            {k.rotulo}
          </div>
        </div>
      ))}
    </div>
  )
}

export function ResultadosPublicidade({
  kpis,
  investimento,
  periodo,
  mesFechado,
  carregando,
  erro,
}: Props) {
  return (
    <Fundo cor="var(--marrom)">
      <MarcaCanto />

      <h2
        style={{
          position: 'absolute',
          left: 42,
          top: 29,
          margin: 0,
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: '0.05em',
          color: 'var(--verde-neon)',
        }}
      >
        RESULTADOS DE PUBLICIDADE
      </h2>

      {/* com erro, a faixa do cabeçalho troca o período pelo aviso: o número em
          tela pode não ser o de hoje, e isso pesa mais que o período */}
      {erro ? (
        <AvisoDados mensagem={erro} style={{ left: 620, top: 22 }} />
      ) : (
        periodo && (
          <ChipPeriodo
            texto={`Acumulado ${periodo}`}
            style={{ left: 899, top: 30, width: 281, justifyContent: 'center' }}
          />
        )
      )}

      {kpis.map((k, i) => (
        <CardKpi
          key={k.id}
          kpi={k}
          x={COLUNAS[i % 3]}
          y={LINHAS[Math.floor(i / 3)]}
          carregando={carregando}
          mesFechado={mesFechado}
        />
      ))}

      <CardInvestimento
        itens={investimento}
        x={COLUNAS[kpis.length % 3]}
        y={LINHAS[Math.floor(kpis.length / 3)]}
        carregando={carregando}
      />

      {/* faixa neon do rodapé (PPTX: 14,646 · 1224x45) */}
      <div
        style={{
          position: 'absolute',
          left: 14,
          top: 646,
          width: 1224,
          height: 45,
          background: 'var(--verde-neon)',
          borderRadius: 4,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          fontWeight: 600,
          letterSpacing: '0.01em',
          color: 'var(--verde-noite)',
        }}
      >
        Escala nacional com foco regional.
      </div>
    </Fundo>
  )
}
