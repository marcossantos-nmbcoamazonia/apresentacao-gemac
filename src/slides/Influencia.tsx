import type { CSSProperties } from 'react'
import type { DadosInfluencia, ItemRanking, MetricaInfluencia } from '../data/influencia'
import { formatFull, formatPercent } from '../lib/numbers'
import { Assinatura, Eyebrow, MARGEM, Nota, NumeroHeroi, Palco, TituloDisplay } from './editorial'

/**
 * Marketing de influência numa lâmina só: os seis big numbers do período em
 * cima, e embaixo as três leituras que a tabela da planilha permite — o ritmo
 * mês a mês e os dois top 5 (campanhas e influenciadores), ambos por views.
 */

const TEXTO_FRACO = 'rgb(245 240 226 / 52%)'
const FIO = '1px solid rgb(245 240 226 / 16%)'

const nf = (casas: number) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })

/**
 * Unidade fixa, escolhida pelo valor final, para a contagem não trocar de
 * escala no meio. Diferente de `formatadorFixo`, mantém uma casa em "15,8 Mi":
 * aqui os volumes são menores e "16 Mi" apagaria 200 mil views.
 */
function formatadorGrande(alvo: number): (n: number) => string {
  if (alvo >= 1e6) return (n) => `${nf(1).format(n / 1e6)} Mi`
  return (n) => nf(0).format(n)
}

/** Para textos parados (rankings, meses): 3,3 Mi · 774.946 → 775 Mil. */
function compacto(n: number | null): string {
  if (n == null) return '—'
  if (n >= 1e6) return `${nf(1).format(n / 1e6)} Mi`
  if (n >= 1e4) return `${nf(0).format(n / 1e3)} Mil`
  return nf(0).format(n)
}

// ------------------------------------------------------------ big numbers

interface DefCard {
  rotulo: string
  metrica: MetricaInfluencia | undefined
  percentual?: boolean
  /** uma linha por item: a quebra é escolhida aqui, não pelo navegador */
  detalhe?: string[]
}

function Card({ card, primeiro }: { card: DefCard; primeiro: boolean }) {
  const valor = card.metrica?.total ?? null
  const formatar = card.percentual
    ? (n: number) => formatPercent(n)
    : formatadorGrande(valor ?? 0)

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        paddingLeft: primeiro ? 0 : 22,
        borderLeft: primeiro ? undefined : FIO,
      }}
    >
      <div
        style={{
          fontSize: 11.5,
          fontWeight: 600,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--verde-neon)',
          whiteSpace: 'nowrap',
        }}
      >
        {card.rotulo}
      </div>
      <NumeroHeroi
        valor={valor}
        formatar={formatar}
        tamanho={46}
        titulo={valor == null || card.percentual ? undefined : formatFull(valor)}
        style={{ marginTop: 14 }}
      />
      {card.detalhe && (
        <div style={{ fontSize: 12.5, color: TEXTO_FRACO, marginTop: 10, lineHeight: 1.4 }}>
          {card.detalhe.map((linha) => (
            <div key={linha} style={{ whiteSpace: 'nowrap' }}>
              {linha}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------- por mês

function PorMes({ d, largura }: { d: DadosInfluencia; largura: number }) {
  const max = Math.max(...d.views.meses.map((v) => v ?? 0), 1)
  return (
    <div style={{ width: largura }}>
      <TituloColuna>Por mês</TituloColuna>
      {d.meses.map((m, i) => {
        const views = d.views.meses[i]
        return (
          <div key={`${m.nome}${m.ano}`} style={{ marginBottom: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--areia)' }}>{m.nome}</span>
              <span
                title={views == null ? undefined : `${formatFull(views)} views`}
                style={{ fontSize: 17, fontWeight: 600, color: 'var(--lima)', fontVariantNumeric: 'tabular-nums' }}
              >
                {compacto(views)} <span style={{ fontSize: 12, fontWeight: 400, color: TEXTO_FRACO }}>views</span>
              </span>
            </div>
            <div
              aria-hidden="true"
              style={{
                height: 6,
                marginTop: 7,
                width: `${((views ?? 0) / max) * 100}%`,
                minWidth: 3,
                background: 'var(--lima)',
                borderRadius: 2,
              }}
            />
            <div style={{ fontSize: 12, color: TEXTO_FRACO, marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>
              {nf(0).format(d.conteudos.meses[i] ?? 0)} conteúdos ·{' '}
              {nf(0).format(d.interacoes.meses[i] ?? 0)} interações
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ---------------------------------------------------------------- top 5

function TituloColuna({ children }: { children: string }) {
  return (
    <div
      style={{
        fontSize: 15,
        fontWeight: 500,
        color: 'var(--areia)',
        marginBottom: 16,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </div>
  )
}

function Ranking({
  titulo,
  itens,
  largura,
}: {
  titulo: string
  itens: ItemRanking[]
  largura: number
}) {
  const max = Math.max(...itens.map((i) => i.views ?? 0), 1)
  const nome: CSSProperties = {
    fontSize: 14,
    color: 'rgb(245 240 226 / 90%)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    minWidth: 0,
  }
  return (
    <div style={{ width: largura }}>
      <TituloColuna>{titulo}</TituloColuna>
      {itens.slice(0, 5).map((it, i) => (
        <div
          key={it.nome}
          title={[
            it.conteudos != null && `${it.conteudos} conteúdos`,
            it.alcance != null && `${formatFull(it.alcance)} de alcance orgânico`,
            it.interacoes != null && `${formatFull(it.interacoes)} interações`,
          ]
            .filter(Boolean)
            .join(' · ')}
          style={{ marginBottom: 13 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 14 }}>
            <span style={nome}>
              <span style={{ color: TEXTO_FRACO, marginRight: 9, fontVariantNumeric: 'tabular-nums' }}>
                {i + 1}
              </span>
              {it.nome}
            </span>
            <span style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--areia)' }}>
                {compacto(it.views)}
              </span>
              {it.participacao != null && (
                <span style={{ fontSize: 12.5, color: TEXTO_FRACO }}>
                  {' '}
                  · {formatPercent(it.participacao, 1)}
                </span>
              )}
            </span>
          </div>
          <div
            aria-hidden="true"
            style={{
              height: 4,
              marginTop: 6,
              width: `${((it.views ?? 0) / max) * 100}%`,
              minWidth: 3,
              background: i === 0 ? 'var(--lima)' : 'rgb(226 255 106 / 55%)',
              borderRadius: 2,
            }}
          />
        </div>
      ))}
    </div>
  )
}

// ---------------------------------------------------------------- slide

export function Influencia({ dados }: { dados: DadosInfluencia | null }) {
  const d = dados
  const n = (m: MetricaInfluencia | undefined) => nf(0).format(m?.total ?? 0)

  const cards: DefCard[] = [
    {
      rotulo: 'Conteúdos',
      metrica: d?.conteudos,
      detalhe: d ? [`${n(d.stories)} Stories · ${n(d.reels)} Reels`, `${n(d.outros)} outros`] : undefined,
    },
    { rotulo: 'Views totais', metrica: d?.views },
    { rotulo: 'Alcance orgânico', metrica: d?.alcance },
    {
      rotulo: 'Interações',
      metrica: d?.interacoes,
      detalhe:
        d && d.respostasStories.total
          ? [`+ ${n(d.respostasStories)} respostas a Stories`, 'contadas à parte']
          : undefined,
    },
    {
      rotulo: 'Influenciadores',
      metrica: d?.influenciadores,
      detalhe: d?.campanhas.total != null ? [`em ${n(d.campanhas)} campanhas`] : undefined,
    },
    {
      rotulo: 'Engaj. orgânico',
      metrica: d?.engajamento,
      percentual: true,
      detalhe: ['Reels', 'interações ÷ alcance'],
    },
  ]

  // colunas de baixo: 250 + 2 × 400 + 2 vãos de 31 = 1112 (largura útil)
  const VAO = 31

  return (
    <Palco veu="nenhum" textura="/assets/mosaico-3.jpg">
      <div style={{ position: 'absolute', left: MARGEM, top: 56 }}>
        <Eyebrow>Marketing de influência</Eyebrow>
        <TituloDisplay tamanho={40} style={{ marginTop: 14 }}>
          Always On com influenciadores
          {d && <span style={{ color: 'rgb(245 240 226 / 50%)' }}> · {d.periodo}</span>}
        </TituloDisplay>
      </div>

      {d && (
        <>
          <div
            style={{ position: 'absolute', left: MARGEM, right: MARGEM, top: 170, display: 'flex' }}
          >
            {cards.map((c, i) => (
              <Card key={c.rotulo} card={c} primeiro={i === 0} />
            ))}
          </div>

          <div
            style={{
              position: 'absolute',
              left: MARGEM,
              right: MARGEM,
              top: 306,
              height: 1,
              background: 'rgb(245 240 226 / 16%)',
            }}
          />

          <div
            style={{
              position: 'absolute',
              left: MARGEM,
              right: MARGEM,
              top: 332,
              display: 'flex',
              gap: VAO,
            }}
          >
            <PorMes d={d} largura={250} />
            <Ranking titulo="Top 5 campanhas · por views" itens={d.topCampanhas} largura={400} />
            <Ranking
              titulo="Top 5 influenciadores · por views"
              itens={d.topInfluenciadores}
              largura={400}
            />
          </div>
        </>
      )}

      <Nota style={{ position: 'absolute', left: MARGEM, right: MARGEM, bottom: 70 }}>
        {d?.observacoes.map((o) => o.charAt(0).toUpperCase() + o.slice(1)).join(' ')}
      </Nota>

      <Assinatura periodo={d?.periodo ?? null} secao="Marketing de influência" />
    </Palco>
  )
}
