/**
 * Slide 10 do deck — RESULTADOS DIGITAIS.
 * Grade 3x2 de cards (PPTX: 342x235 px, fundo #005240) sobre o mesmo fundo
 * marrom do slide de Publicidade. Renderizado uma vez por entidade da aba
 * "02 DIGITAL": Banco e Centro Cultural.
 */
import type { Kpi } from '../data/kpis'
import type { CardDigital } from '../data/digital'
import { AvisoDados, ChipPeriodo, Esqueleto, Fundo, MarcaCanto } from './comum'

const CARD_W = 342
const CARD_H = 235
const COLUNAS = [102, 469, 836]
/**
 * As linhas do PPTX eram [152, 412]. Subiram um pouco para abrir espaço ao
 * bloco de rodapé — remate mais a ressalva da taxa — que antes terminava a
 * 15 px da borda do slide.
 */
const LINHAS = [140, 392]

interface Props {
  entidade: string
  cards: CardDigital[]
  periodo: string | null
  mesFechado: string | null
  /** frase de fechamento do slide */
  remate: string
  carregando: boolean
  erro: string | null
}

function corDaVariacao(direcao: 'alta' | 'baixa' | 'estavel'): string {
  if (direcao === 'alta') return 'var(--lima)'
  if (direcao === 'baixa') return 'var(--verde-argila)'
  return 'rgb(255 255 255 / 62%)'
}

/** Linha de apoio do card: a métrica secundária, ou a variação mês a mês. */
function Apoio({ card, mesFechado }: { card: CardDigital; mesFechado: string | null }) {
  const { principal, secundario } = card

  if (secundario) {
    return (
      <div
        style={{
          borderTop: '1px solid rgb(255 255 255 / 14%)',
          paddingTop: 12,
          display: 'flex',
          alignItems: 'baseline',
          gap: 10,
        }}
      >
        <span
          title={secundario.valor != null ? secundario.valorCheio : undefined}
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: 'var(--lima)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {secundario.formatado}
        </span>
        <span style={{ fontSize: 14, lineHeight: 1.25, color: 'rgb(255 255 255 / 70%)' }}>
          {secundario.rotulo}
          {secundario.agregacao === 'media' && (
            <span style={{ color: 'rgb(255 255 255 / 45%)' }}> · média</span>
          )}
        </span>
      </div>
    )
  }

  if (principal.variacao && principal.variacaoTexto) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <span
          aria-hidden="true"
          style={{ width: 4, height: 30, borderRadius: 2, background: 'var(--lima)', flex: 'none' }}
        />
        <div>
          <div
            style={{
              fontSize: 18,
              fontWeight: 600,
              lineHeight: 1.15,
              color: corDaVariacao(principal.variacao.direcao),
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {principal.variacaoTexto}
          </div>
          <div style={{ fontSize: 12, color: 'rgb(255 255 255 / 52%)', lineHeight: 1.3 }}>
            {principal.comparacao}
            {principal.semDadoNoMes && mesFechado ? ` · sem dado em ${mesFechado}` : ''}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontSize: 12, color: 'rgb(255 255 255 / 42%)', lineHeight: 1.35 }}>
      {principal.valor == null
        ? 'Sem dado na planilha para o período'
        : 'Sem mês anterior para comparar'}
    </div>
  )
}

function CardResultado({
  card,
  x,
  y,
  carregando,
  mesFechado,
}: {
  card: CardDigital
  x: number
  y: number
  carregando: boolean
  mesFechado: string | null
}) {
  const k: Kpi = card.principal
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
        padding: '24px 26px 22px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <div>
        {carregando ? (
          <Esqueleto w={180} h={44} style={{ marginBottom: 12 }} />
        ) : (
          <div
            title={k.valor != null ? k.valorCheio : undefined}
            style={{
              fontSize: 44,
              fontWeight: 700,
              lineHeight: 1,
              letterSpacing: '-0.025em',
              color: 'var(--lima)',
              fontVariantNumeric: 'tabular-nums',
              marginBottom: 12,
            }}
          >
            {k.formatado}
          </div>
        )}

        <div style={{ fontSize: 19, fontWeight: 500, lineHeight: 1.2, color: 'var(--branco)' }}>
          {k.rotulo}
        </div>
        {k.detalhe && (
          <div
            style={{ fontSize: 14, fontWeight: 300, color: 'rgb(255 255 255 / 66%)', marginTop: 2 }}
          >
            {k.detalhe}
          </div>
        )}
      </div>

      {!carregando && <Apoio card={card} mesFechado={mesFechado} />}
    </div>
  )
}

export function ResultadosDigitais({
  entidade,
  cards,
  periodo,
  mesFechado,
  remate,
  carregando,
  erro,
}: Props) {
  // a planilha registra que o denominador da taxa ainda está em definição
  const notaTaxa = cards.find((c) => c.secundario?.tipo === 'percentual')?.secundario?.nota

  return (
    <Fundo cor="var(--marrom)">
      <MarcaCanto />

      <h2
        style={{
          position: 'absolute',
          left: 42,
          top: 24,
          margin: 0,
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: '0.05em',
          color: 'var(--verde-neon)',
        }}
      >
        RESULTADOS DIGITAIS
      </h2>

      <p
        style={{
          position: 'absolute',
          left: 42,
          top: 72,
          margin: 0,
          fontSize: 18,
          fontWeight: 400,
          color: '#90a89e',
        }}
      >
        <span style={{ color: 'var(--branco)', fontWeight: 600 }}>{entidade}</span> · alcance e
        engajamento nos canais próprios
      </p>

      {/* com erro, a faixa do cabeçalho troca o período pelo aviso: o número em
          tela pode não ser o de hoje, e isso pesa mais que o período */}
      {erro ? (
        <AvisoDados mensagem={erro} style={{ left: 620, top: 24 }} />
      ) : (
        periodo && (
          <ChipPeriodo
            texto={`Acumulado ${periodo}`}
            style={{ left: 899, top: 32, width: 281, justifyContent: 'center' }}
          />
        )
      )}

      {cards.map((c, i) => (
        <CardResultado
          key={c.id}
          card={c}
          x={COLUNAS[i % 3]}
          y={LINHAS[Math.floor(i / 3)]}
          carregando={carregando}
          mesFechado={mesFechado}
        />
      ))}

      <footer style={{ position: 'absolute', left: 105, top: 648, width: 1070 }}>
        <p style={{ margin: 0, fontSize: 18, fontWeight: 300, color: '#b8efc9' }}>{remate}</p>

        {notaTaxa && (
          <p
            style={{
              margin: '8px 0 0',
              fontSize: 12,
              lineHeight: 1.4,
              color: 'rgb(184 239 201 / 52%)',
            }}
          >
            Taxa de engajamento: média dos meses com dado. {notaTaxa}
          </p>
        )}
      </footer>
    </Fundo>
  )
}
