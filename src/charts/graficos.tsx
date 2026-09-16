/**
 * Gráficos do deck. Um módulo só porque todos compartilham o eixo de meses e a
 * mesma regra de escala.
 *
 * Duas decisões que valem para todos:
 *
 * 1. **Mês sem dado não é zero.** A planilha tem buracos reais (leads em Mar,
 *    OOH em Fev/Mar/Ago). Barra de altura zero leria como "zero impacto"; aqui
 *    o mês vazio ganha um traço tracejado na base e some da linha.
 * 2. **Rótulo direto só no pico.** Número em cima de toda barra vira ruído; o
 *    pico é o que a plateia procura.
 *
 * Paleta validada contra a superfície #002A23: lima ↔ neon com ΔE 11,1 (protan)
 * e 20,4 em visão normal. Duas ressalvas conscientes do validador — a faixa de
 * luminosidade não fecha (a paleta da marca é toda clara sobre fundo escuro) e
 * "areia" fica abaixo do piso de croma, sendo o neutro do trio de propósito.
 */
import type { PontoMes } from '../data/publicidadeAnalise'
import { formatPercent } from '../lib/numbers'

export const COR_SERIE = 'var(--lima)'
export const COR_SERIE_2 = 'var(--verde-neon)'
export const COR_SERIE_3 = 'var(--areia)'

const COR_EIXO = 'rgb(245 240 226 / 26%)'
const COR_MES = 'rgb(245 240 226 / 52%)'

// ------------------------------------------------------------- eixo de meses

function EixoMeses({
  pontos,
  largura,
  vao,
  destacar,
}: {
  pontos: PontoMes[]
  largura: number
  vao: number
  destacar?: number
}) {
  const passo = (largura + vao) / pontos.length
  return (
    <div style={{ position: 'relative', height: 18, marginTop: 10, width: largura }}>
      {pontos.map((p, i) => (
        <span
          key={p.mes}
          style={{
            position: 'absolute',
            left: i * passo,
            width: passo - vao,
            textAlign: 'center',
            fontSize: 12,
            fontWeight: p.indice === destacar ? 600 : 400,
            color: p.indice === destacar ? 'var(--lima)' : COR_MES,
          }}
        >
          {p.mes}
        </span>
      ))}
    </div>
  )
}

// ------------------------------------------------------- barras de uma série

interface BarrasMesProps {
  pontos: PontoMes[]
  /** texto do rótulo do pico */
  formatar: (n: number) => string
  largura: number
  altura: number
  cor?: string
  /** força a escala; por padrão usa o máximo da própria série */
  maximo?: number
}

export function BarrasMes({
  pontos,
  formatar,
  largura,
  altura,
  cor = COR_SERIE,
  maximo,
}: BarrasMesProps) {
  const vao = 8
  const passo = (largura + vao) / pontos.length
  const larguraBarra = passo - vao
  const teto = maximo ?? pontos.reduce((m, p) => Math.max(m, p.valor ?? 0), 0)
  const pico = pontos.reduce<PontoMes | null>(
    (a, p) => (p.valor != null && (a == null || p.valor > (a.valor ?? 0)) ? p : a),
    null,
  )

  return (
    <div style={{ width: largura }}>
      <div style={{ position: 'relative', height: altura, width: largura }}>
        {pontos.map((p, i) => {
          const x = i * passo
          if (p.valor == null) {
            // traço tracejado: a ausência precisa ser visível, não virar zero
            return (
              <div
                key={p.mes}
                title={`${p.mes}: sem dado na planilha`}
                style={{
                  position: 'absolute',
                  left: x,
                  bottom: 0,
                  width: larguraBarra,
                  height: 0,
                  borderTop: `2px dashed ${COR_EIXO}`,
                }}
              />
            )
          }
          const h = teto > 0 ? Math.max((p.valor / teto) * altura, 2) : 2
          const ehPico = pico?.indice === p.indice
          return (
            <div
              key={p.mes}
              title={`${p.mes}: ${formatar(p.valor)}`}
              style={{
                position: 'absolute',
                left: x,
                bottom: 0,
                width: larguraBarra,
                height: h,
                background: cor,
                opacity: ehPico ? 1 : 0.62,
                borderRadius: '4px 4px 1px 1px',
              }}
            />
          )
        })}

        {/* rótulo direto só no pico */}
        {pico?.valor != null && (
          <span
            style={{
              position: 'absolute',
              left: pico.indice * passo,
              width: larguraBarra,
              bottom: Math.min((pico.valor / (teto || 1)) * altura + 8, altura + 8),
              textAlign: 'center',
              fontSize: 13,
              fontWeight: 600,
              color: cor,
              whiteSpace: 'nowrap',
            }}
          >
            {formatar(pico.valor)}
          </span>
        )}
      </div>

      <div style={{ width: largura, height: 1, background: COR_EIXO }} />
      <EixoMeses pontos={pontos} largura={largura} vao={vao} destacar={pico?.indice} />
    </div>
  )
}

// ------------------------------------------------- barras empilhadas (2 séries)

export function BarrasEmpilhadasMes({
  a,
  b,
  rotuloA,
  rotuloB,
  formatar,
  largura,
  altura,
  legenda = true,
  larguraMaxBarra = 72,
}: {
  a: PontoMes[]
  b: PontoMes[]
  rotuloA: string
  rotuloB: string
  formatar: (n: number) => string
  largura: number
  altura: number
  /** desligue quando o slide já rotula as séries com valor */
  legenda?: boolean
  larguraMaxBarra?: number
}) {
  const vao = 10
  const passo = (largura + vao) / a.length
  // sem o teto a barra fica com 130px num slide largo — marca grossa demais
  const larguraBarra = Math.min(passo - vao, larguraMaxBarra)
  const recuo = (passo - vao - larguraBarra) / 2
  const totais = a.map((p, i) => (p.valor ?? 0) + (b[i]?.valor ?? 0))
  const teto = Math.max(...totais, 1)

  return (
    <div style={{ width: largura }}>
      <div style={{ position: 'relative', height: altura, width: largura }}>
        {a.map((p, i) => {
          const va = p.valor ?? 0
          const vb = b[i]?.valor ?? 0
          const ha = (va / teto) * altura
          const hb = (vb / teto) * altura
          return (
            <div
              key={p.mes}
              style={{
                position: 'absolute',
                left: i * passo + recuo,
                bottom: 0,
                width: larguraBarra,
              }}
            >
              {/* o vão de 2px entre segmentos evita que as duas séries se fundam */}
              <div
                title={`${p.mes} · ${rotuloB}: ${formatar(vb)}`}
                style={{
                  height: Math.max(hb, vb > 0 ? 2 : 0),
                  background: COR_SERIE_2,
                  borderRadius: '4px 4px 0 0',
                  marginBottom: 2,
                }}
              />
              <div
                title={`${p.mes} · ${rotuloA}: ${formatar(va)}`}
                style={{
                  height: Math.max(ha, va > 0 ? 2 : 0),
                  background: COR_SERIE,
                  borderRadius: hb > 0 ? '0 0 1px 1px' : '4px 4px 1px 1px',
                }}
              />
            </div>
          )
        })}
      </div>

      <div style={{ width: largura, height: 1, background: COR_EIXO }} />
      <EixoMeses pontos={a} largura={largura} vao={vao} />

      {legenda && (
        <Legenda
          itens={[
            { cor: COR_SERIE, rotulo: rotuloA },
            { cor: COR_SERIE_2, rotulo: rotuloB },
          ]}
          style={{ marginTop: 16 }}
        />
      )}
    </div>
  )
}

// --------------------------------------------------------------------- linha

export function LinhaMes({
  pontos,
  formatar,
  largura,
  altura,
  cor = COR_SERIE,
}: {
  pontos: PontoMes[]
  formatar: (n: number) => string
  largura: number
  altura: number
  cor?: string
}) {
  const comValor = pontos.filter((p) => p.valor != null)
  const teto = Math.max(...comValor.map((p) => p.valor!), 0.0001)
  const passo = largura / Math.max(pontos.length - 1, 1)
  const xy = (p: PontoMes) => ({
    x: p.indice * passo,
    y: altura - (p.valor! / teto) * (altura - 16) - 8,
  })

  // quebra a linha nos meses sem dado, em vez de interpolar por cima do buraco
  const trechos: PontoMes[][] = []
  let atual: PontoMes[] = []
  for (const p of pontos) {
    if (p.valor == null) {
      if (atual.length) trechos.push(atual)
      atual = []
    } else atual.push(p)
  }
  if (atual.length) trechos.push(atual)

  return (
    <div style={{ width: largura }}>
      <svg width={largura} height={altura} style={{ display: 'block', overflow: 'visible' }}>
        {trechos.map((t, i) => (
          <polyline
            key={i}
            fill="none"
            stroke={cor}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            points={t.map((p) => { const c = xy(p); return `${c.x},${c.y}` }).join(' ')}
          />
        ))}
        {comValor.map((p) => {
          const c = xy(p)
          return (
            <circle key={p.mes} cx={c.x} cy={c.y} r={4} fill={cor}>
              <title>{`${p.mes}: ${formatar(p.valor!)}`}</title>
            </circle>
          )
        })}

        {/* sem eixo Y, uma linha solta não diz magnitude nenhuma: o pico e o
            último ponto dão as duas âncoras que o leitor procura */}
        {[
          comValor.reduce<PontoMes | null>((a, p) => (a == null || p.valor! > a.valor! ? p : a), null),
          comValor[comValor.length - 1],
        ]
          .filter((p): p is PontoMes => p != null)
          .filter((p, i, arr) => arr.findIndex((o) => o.indice === p.indice) === i)
          .map((p) => {
            const c = xy(p)
            const naBorda = p.indice >= pontos.length - 1
            return (
              <text
                key={`r-${p.mes}`}
                x={c.x + (naBorda ? -8 : 0)}
                y={c.y - 13}
                textAnchor={naBorda ? 'end' : 'middle'}
                fill={cor}
                style={{ fontSize: 13, fontWeight: 600 }}
              >
                {formatar(p.valor!)}
              </text>
            )
          })}
      </svg>

      <div style={{ width: largura, height: 1, background: COR_EIXO, marginTop: 6 }} />
      <div style={{ position: 'relative', height: 18, marginTop: 8, width: largura }}>
        {pontos.map((p) => (
          <span
            key={p.mes}
            style={{
              position: 'absolute',
              left: p.indice * passo - 14,
              width: 28,
              textAlign: 'center',
              fontSize: 12,
              color: COR_MES,
            }}
          >
            {p.mes}
          </span>
        ))}
      </div>
    </div>
  )
}

// ------------------------------------------------- barra de participação (todo)

export interface ParteBarra {
  rotulo: string
  valor: number
  participacao: number
}

export function BarraParticipacao({
  partes,
  formatar,
  largura,
  altura = 54,
  cores = [COR_SERIE, COR_SERIE_2, COR_SERIE_3],
}: {
  partes: ParteBarra[]
  formatar: (n: number) => string
  largura: number
  altura?: number
  cores?: string[]
}) {
  return (
    <div style={{ width: largura }}>
      <div style={{ display: 'flex', gap: 2, width: largura, height: altura }}>
        {partes.map((p, i) => (
          <div
            key={p.rotulo}
            title={`${p.rotulo}: ${formatar(p.valor)}`}
            style={{
              width: `${p.participacao * 100}%`,
              // uma fatia de 1,9% daria 21px; abaixo disso ela some da barra
              minWidth: 10,
              background: cores[i % cores.length],
              borderRadius: i === 0 ? '4px 1px 1px 4px' : i === partes.length - 1 ? '1px 4px 4px 1px' : 2,
            }}
          />
        ))}
      </div>

      {/* a legenda NÃO acompanha a largura da fatia: com 1,9% o rótulo ficaria
          espremido em 21px e quebraria em cinco linhas */}
      <div style={{ display: 'flex', gap: 34, width: largura, marginTop: 18 }}>
        {partes.map((p, i) => (
          <div key={p.rotulo} style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
              <span
                aria-hidden="true"
                style={{
                  width: 9,
                  height: 9,
                  flex: 'none',
                  borderRadius: 2,
                  background: cores[i % cores.length],
                }}
              />
              <span style={{ fontSize: 14, color: 'var(--areia)', whiteSpace: 'nowrap' }}>
                {p.rotulo}
              </span>
            </div>
            <div
              style={{
                fontSize: 27,
                fontWeight: 600,
                color: cores[i % cores.length],
                lineHeight: 1.1,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {formatar(p.valor)}
            </div>
            <div style={{ fontSize: 13, color: 'rgb(245 240 226 / 52%)', marginTop: 3 }}>
              {formatPercent(p.participacao * 100, 1)} do total
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ------------------------------------------------------------------- legenda

export function Legenda({
  itens,
  style,
}: {
  itens: { cor: string; rotulo: string }[]
  style?: React.CSSProperties
}) {
  return (
    <div style={{ display: 'flex', gap: 26, alignItems: 'center', ...style }}>
      {itens.map((it) => (
        <span key={it.rotulo} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <span
            aria-hidden="true"
            style={{ width: 11, height: 11, borderRadius: 2, background: it.cor, flex: 'none' }}
          />
          <span style={{ fontSize: 14, color: 'rgb(245 240 226 / 78%)' }}>{it.rotulo}</span>
        </span>
      ))}
    </div>
  )
}
