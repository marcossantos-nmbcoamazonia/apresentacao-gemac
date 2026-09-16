import type { DadosPublicidade } from '../data/publicidade'
import { BarrasEmpilhadasMes, COR_SERIE, COR_SERIE_2 } from '../charts/graficos'
import { formatCompact, formatadorFixo, formatFull } from '../lib/numbers'
import { Assinatura, Eyebrow, MARGEM, Nota, NumeroHeroi, Palco } from './editorial'

/**
 * Investimento executado. Mídia e produção são a mesma unidade e somam um todo,
 * então empilham na mesma barra — o total do mês é a altura da coluna, e o
 * desenho revela o que a soma esconde: Jun é pico por produção, não por mídia.
 */
export function Investimento({ dados }: { dados: DadosPublicidade | null }) {
  const a = dados?.analise
  const total = a?.investimentoTotal ?? null

  return (
    <Palco veu="nenhum">
      <div style={{ position: 'absolute', left: MARGEM, top: 60 }}>
        <Eyebrow>Investimento executado</Eyebrow>
      </div>

      <div style={{ position: 'absolute', left: MARGEM, top: 132 }}>
        <NumeroHeroi
          valor={total}
          formatar={formatadorFixo(total ?? 0, { moeda: true })}
          tamanho={118}
          titulo={total == null ? undefined : formatFull(total, { moeda: true })}
        />

        {a && (
          <div style={{ marginTop: 26, display: 'flex', gap: 46 }}>
            {a.investimentoPartes.map((p, i) => (
              <div key={p.rotulo} style={{ display: 'flex', alignItems: 'baseline', gap: 11 }}>
                <span
                  aria-hidden="true"
                  style={{
                    width: 11,
                    height: 11,
                    borderRadius: 2,
                    background: i === 0 ? COR_SERIE : COR_SERIE_2,
                  }}
                />
                <span style={{ fontSize: 18, color: 'var(--areia)' }}>
                  {p.rotulo}{' '}
                  <b style={{ fontWeight: 600 }}>{formatCompact(p.valor, { moeda: true })}</b>
                  <span style={{ color: 'rgb(245 240 226 / 52%)' }}>
                    {' '}
                    · {(p.participacao * 100).toFixed(0)}%
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {a && (
        <div style={{ position: 'absolute', left: MARGEM, top: 356 }}>
          <BarrasEmpilhadasMes
            a={a.series.midia.pontos}
            b={a.series.producao.pontos}
            rotuloA="Mídia"
            rotuloB="Produção"
            formatar={(n) => formatCompact(n, { moeda: true })}
            largura={1280 - MARGEM * 2}
            altura={188}
            // as duas séries já aparecem rotuladas com valor logo acima
            legenda={false}
          />
        </div>
      )}

      <Nota style={{ position: 'absolute', left: MARGEM, right: MARGEM, bottom: 70 }}>
        Colunas somam mídia (PUB-07) e produção (PUB-08) de cada mês.
        {a?.series.producao.pico &&
          ` O pico de ${a.series.producao.pico.mes} vem da produção, não da veiculação.`}
      </Nota>

      <Assinatura periodo={dados?.fechado.periodo ?? null} />
    </Palco>
  )
}
