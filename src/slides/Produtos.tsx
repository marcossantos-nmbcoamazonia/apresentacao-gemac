import type { DadosPublicidade } from '../data/publicidade'
import type { Produto } from '../data/publicidadeAnalise'
import { Assinatura, Eyebrow, MARGEM, Nota, Palco, TituloDisplay } from './editorial'

/**
 * Os produtos trabalhados, agrupados por recorrência.
 *
 * PUB-09 lista os produtos mês a mês, então dá para contar em quantos dos meses
 * fechados cada um aparece. O corpo tipográfico segue a faixa — mas a faixa
 * está escrita e a contagem aparece ao lado de cada nome: não é nuvem de
 * palavras, onde o tamanho é a única pista e não se consegue comparar nada.
 */

const FAIXAS = [
  {
    chave: 'constante' as const,
    titulo: 'Sempre em campanha',
    detalhe: 'presentes em 70% ou mais dos meses',
    fonte: 31,
    cor: 'var(--lima)',
  },
  {
    chave: 'recorrente' as const,
    titulo: 'Recorrentes',
    detalhe: 'entre 30% e 70% dos meses',
    fonte: 22,
    cor: 'var(--areia)',
  },
  {
    chave: 'pontual' as const,
    titulo: 'Pontuais',
    detalhe: 'campanhas de janela curta',
    fonte: 15,
    cor: 'rgb(245 240 226 / 72%)',
  },
]

function Faixa({
  titulo,
  detalhe,
  produtos,
  fonte,
  cor,
  totalMeses,
}: {
  titulo: string
  detalhe: string
  produtos: Produto[]
  fonte: number
  cor: string
  totalMeses: number
}) {
  if (produtos.length === 0) return null

  return (
    <section style={{ marginBottom: 30 }}>
      <header style={{ display: 'flex', alignItems: 'baseline', gap: 14, marginBottom: 14 }}>
        <h3
          style={{
            margin: 0,
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--verde-neon)',
          }}
        >
          {titulo}
        </h3>
        <span style={{ fontSize: 13, color: 'rgb(245 240 226 / 42%)' }}>
          {detalhe} · {produtos.length}
        </span>
      </header>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: `10px 28px`, alignItems: 'baseline' }}>
        {produtos.map((p) => (
          <span key={p.nome} style={{ display: 'inline-flex', alignItems: 'baseline', gap: 7 }}>
            <span
              style={{
                fontSize: fonte,
                fontWeight: fonte > 26 ? 400 : 300,
                letterSpacing: fonte > 26 ? '-0.02em' : undefined,
                color: cor,
                lineHeight: 1.15,
              }}
            >
              {p.nome}
            </span>
            <span
              style={{
                fontSize: Math.max(fonte * 0.42, 11),
                color: 'rgb(245 240 226 / 38%)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {p.meses}/{totalMeses}
            </span>
          </span>
        ))}
      </div>
    </section>
  )
}

export function Produtos({ dados }: { dados: DadosPublicidade | null }) {
  const produtos = dados?.analise.produtos ?? []
  const totalMeses = (dados?.fechado.indice ?? 0) + 1

  return (
    <Palco veu="nenhum" textura="/assets/mosaico-3.jpg">
      <div style={{ position: 'absolute', left: MARGEM, top: 58 }}>
        <Eyebrow>Produtos trabalhados</Eyebrow>
        <TituloDisplay tamanho={44} style={{ marginTop: 14 }}>
          {produtos.length} produtos em {totalMeses} meses
        </TituloDisplay>
      </div>

      <div style={{ position: 'absolute', left: MARGEM, right: MARGEM, top: 208 }}>
        {FAIXAS.map((f) => (
          <Faixa
            key={f.chave}
            titulo={f.titulo}
            detalhe={f.detalhe}
            fonte={f.fonte}
            cor={f.cor}
            totalMeses={totalMeses}
            produtos={produtos.filter((p) => p.faixa === f.chave)}
          />
        ))}
      </div>

      <Nota style={{ position: 'absolute', left: MARGEM, right: MARGEM, bottom: 70 }}>
        Recorrência contada sobre a coluna “Produtos trabalhados” (PUB-09), mês a mês. O número ao
        lado de cada produto é em quantos meses ele aparece.
      </Nota>

      <Assinatura periodo={dados?.fechado.periodo ?? null} />
    </Palco>
  )
}
