import type { CSSProperties } from 'react'
import { MESES } from '../api/parseSheet'
import type { Comparativo as DadosComparativo, LinhaComparativo } from '../data/comparativo'
import { Assinatura, Eyebrow, LARGURA_UTIL, MARGEM, Nota, Palco, TituloDisplay } from './editorial'

/**
 * Ano contra ano, no mesmo recorte de meses. Um quadro em vez de cartões
 * porque a leitura é horizontal — antes, depois, quanto mudou — e as duas
 * barras finas dão a escala da mudança sem pedir que a plateia faça conta.
 *
 * A planilha do ano anterior tem buracos, então a base de cada número fica à
 * vista (quantos meses o sustentam) e a variação some quando a base não aguenta.
 */

interface Props {
  dados: DadosComparativo | null
  periodo: string | null
}

const COLUNAS = '1fr 150px 160px 220px 130px'
const VAO = 24
const COR_ANTERIOR = 'rgb(245 240 226 / 38%)'
const COR_PIOR = '#ffb59e'
const TEXTO_FRACO = 'rgb(245 240 226 / 48%)'

const COR_AVALIACAO: Record<NonNullable<LinhaComparativo['avaliacao']>, string> = {
  melhor: 'var(--lima)',
  pior: COR_PIOR,
  neutro: 'var(--areia)',
}

const numero: CSSProperties = {
  textAlign: 'right',
  fontVariantNumeric: 'tabular-nums',
  lineHeight: 1.05,
  whiteSpace: 'nowrap',
}

/** "só Jun" para base de até 3 meses; "6 de 10 meses" acima disso. */
function descreverBase(meses: number, total: number, lacunas: string[]): string | null {
  if (meses >= total) return null
  if (meses <= 3) {
    const comDado = MESES.slice(0, total).filter((m) => !lacunas.includes(m))
    return `só ${comDado.join(', ')}`
  }
  return `${meses} de ${total} meses`
}

function Barras({ linha }: { linha: LinhaComparativo }) {
  const max = Math.max(linha.anterior ?? 0, linha.atual ?? 0)
  const pct = (v: number | null) => (max > 0 && v != null ? `${(v / max) * 100}%` : '0%')
  const barra = (largura: string, cor: string): CSSProperties => ({
    height: 7,
    width: largura,
    minWidth: 3,
    background: cor,
    borderRadius: 2,
  })
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }} aria-hidden="true">
      <div style={barra(pct(linha.anterior), COR_ANTERIOR)} />
      <div style={barra(pct(linha.atual), 'var(--lima)')} />
    </div>
  )
}

function Linha({
  linha,
  totalMeses,
  altura,
  anoAnterior,
}: {
  linha: LinhaComparativo
  totalMeses: number
  altura: number
  anoAnterior: number
}) {
  const baseAnterior = linha.anteriorTotalAnual
    ? `total do ano ${anoAnterior}`
    : descreverBase(linha.mesesAnterior, totalMeses, linha.lacunasAnterior)
  const baseAtual = descreverBase(linha.mesesAtual, totalMeses, [])

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: COLUNAS,
        columnGap: VAO,
        alignItems: 'center',
        height: altura,
        borderTop: '1px solid rgb(245 240 226 / 12%)',
      }}
    >
      <div style={{ minWidth: 0 }}>
        <span style={{ fontSize: 18, fontWeight: 500, color: 'var(--areia)' }}>{linha.rotulo}</span>
        {linha.detalhe && (
          <span style={{ fontSize: 13, fontWeight: 300, color: TEXTO_FRACO, marginLeft: 10 }}>
            {linha.detalhe}
          </span>
        )}
      </div>

      <div title={linha.anteriorCheio} style={numero}>
        <div style={{ fontSize: 21, fontWeight: 500, color: 'rgb(245 240 226 / 70%)' }}>
          {linha.anteriorFormatado}
        </div>
        {baseAnterior && (
          <div style={{ fontSize: 11, color: 'rgb(226 255 106 / 62%)', marginTop: 4 }}>
            {baseAnterior}
          </div>
        )}
      </div>

      <div title={linha.atualCheio} style={numero}>
        <div
          style={{ fontSize: 24, fontWeight: 700, color: 'var(--lima)', letterSpacing: '-0.02em' }}
        >
          {linha.atualFormatado}
        </div>
        {baseAtual && (
          <div style={{ fontSize: 11, color: 'rgb(226 255 106 / 62%)', marginTop: 4 }}>
            {baseAtual}
          </div>
        )}
      </div>

      <Barras linha={linha} />

      <div style={numero}>
        {linha.baseParcial ? (
          <span
            title={`${anoAnterior} tem dado em ${linha.mesesAnterior} de ${linha.mesesAtual} meses — base insuficiente para variação`}
            style={{ fontSize: 13, color: TEXTO_FRACO }}
          >
            base {anoAnterior}
            <br />
            insuficiente
          </span>
        ) : (
          <span
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: linha.avaliacao ? COR_AVALIACAO[linha.avaliacao] : TEXTO_FRACO,
            }}
          >
            {linha.variacaoTexto ?? '—'}
          </span>
        )}
      </div>
    </div>
  )
}

export function Comparativo({ dados, periodo }: Props) {
  const linhas = dados?.linhas ?? []
  // o quadro ocupa de 196 a 604 px; com menos linhas, cada uma respira mais
  const altura = linhas.length ? Math.min(60, Math.floor(408 / linhas.length)) : 56

  const rotuloAno = (ano: number) => (dados ? `${dados.periodo} ${ano}` : String(ano))

  const ressalvas = dados
    ? [
        `Soma de ${dados.periodo} nos dois anos; mês sem registro fica fora da soma (contagem sob o valor).`,
        `Sem variação quando ${dados.anoAnterior} tem menos da metade dos meses. CTR e CPM só em meses com os dois componentes.`,
        dados.comTotalAnual.length
          ? `${dados.comTotalAnual.join(' e ')}: ${dados.anoAnterior} só tem o total do ano, sem abertura mensal.`
          : '',
        dados.semRegistroAnterior.length
          ? `Sem registro em ${dados.anoAnterior}: ${dados.semRegistroAnterior.join(' e ')}.`
          : '',
      ]
        .filter(Boolean)
        .join(' ')
    : ''

  return (
    <Palco veu="nenhum" textura="/assets/mosaico-2.jpg">
      <div style={{ position: 'absolute', left: MARGEM, top: 56 }}>
        <Eyebrow>
          {dados ? `${dados.anoAtual} × ${dados.anoAnterior}` : 'Comparativo anual'}
        </Eyebrow>
        <TituloDisplay tamanho={40} style={{ marginTop: 14 }}>
          O mesmo período, ano contra ano
        </TituloDisplay>
      </div>

      {dados && (
        <div style={{ position: 'absolute', left: MARGEM, top: 166, width: LARGURA_UTIL }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: COLUNAS,
              columnGap: VAO,
              height: 30,
              alignItems: 'end',
              paddingBottom: 8,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: TEXTO_FRACO,
            }}
          >
            <span>Indicador</span>
            <span style={{ textAlign: 'right' }}>{rotuloAno(dados.anoAnterior)}</span>
            <span style={{ textAlign: 'right', color: 'var(--verde-neon)' }}>
              {rotuloAno(dados.anoAtual)}
            </span>
            <span />
            <span style={{ textAlign: 'right' }}>Variação</span>
          </div>

          {linhas.map((l) => (
            <Linha
              key={l.id}
              linha={l}
              totalMeses={dados.mesesPeriodo}
              altura={altura}
              anoAnterior={dados.anoAnterior}
            />
          ))}
        </div>
      )}

      <Nota style={{ position: 'absolute', left: MARGEM, right: MARGEM, bottom: 70 }}>
        {ressalvas}
      </Nota>

      <Assinatura periodo={periodo} />
    </Palco>
  )
}
