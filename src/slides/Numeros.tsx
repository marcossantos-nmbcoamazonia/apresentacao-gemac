import type { DadosPublicidade } from '../data/publicidade'
import type { Kpi } from '../data/kpis'
import { formatadorFixo } from '../lib/numbers'
import { Assinatura, Eyebrow, MARGEM, NumeroHeroi, Palco } from './editorial'

/**
 * Os cinco indicadores do período numa grade editorial: dois grandes em cima,
 * três menores embaixo, separados por fios em vez de cards. O peso tipográfico
 * segue a narrativa (alcance primeiro), não a ordem da planilha.
 */

interface Props {
  dados: DadosPublicidade | null
  carregando: boolean
}

function Celula({
  kpi,
  tamanho,
  largura,
}: {
  kpi: Kpi | undefined
  tamanho: number
  largura: number
}) {
  const alvo = kpi?.valor ?? null
  const formatar = formatadorFixo(alvo ?? 0, { moeda: kpi?.moeda })

  return (
    <div style={{ width: largura }}>
      <NumeroHeroi valor={alvo} formatar={formatar} tamanho={tamanho} titulo={kpi?.valorCheio} />
      <div
        style={{
          marginTop: tamanho > 90 ? 20 : 14,
          fontSize: tamanho > 90 ? 22 : 17,
          fontWeight: 500,
          color: 'var(--areia)',
          lineHeight: 1.25,
        }}
      >
        {kpi?.rotulo ?? '—'}
      </div>
      {kpi?.detalhe && (
        <div
          style={{
            fontSize: tamanho > 90 ? 15 : 13,
            fontWeight: 300,
            color: 'rgb(245 240 226 / 55%)',
            marginTop: 4,
          }}
        >
          {kpi.detalhe}
        </div>
      )}
      {kpi?.semDadoNoMes && kpi.ultimoMes && (
        <div style={{ fontSize: 12, color: 'rgb(226 255 106 / 62%)', marginTop: 7 }}>
          série até {kpi.ultimoMes}
        </div>
      )}
    </div>
  )
}

export function Numeros({ dados, carregando }: Props) {
  const por = (id: string) => dados?.kpis.find((k) => k.id === id)

  return (
    <Palco veu="nenhum" textura="/assets/mosaico-1.jpg">
      <div style={{ position: 'absolute', left: MARGEM, top: 68 }}>
        <Eyebrow>Os números do período</Eyebrow>
      </div>

      {!carregando && (
        <>
          {/* linha de cima: os dois maiores volumes */}
          <div
            style={{
              position: 'absolute',
              left: MARGEM,
              top: 150,
              display: 'flex',
              gap: 96,
            }}
          >
            <Celula kpi={por('PUB-04')} tamanho={128} largura={440} />
            <Celula kpi={por('PUB-02')} tamanho={128} largura={470} />
          </div>

          <div
            style={{
              position: 'absolute',
              left: MARGEM,
              right: MARGEM,
              top: 404,
              height: 1,
              background: 'rgb(245 240 226 / 16%)',
            }}
          />

          {/* linha de baixo: cliques, leads e o fluxo aeroportuário */}
          <div
            style={{
              position: 'absolute',
              left: MARGEM,
              top: 450,
              display: 'flex',
              gap: 72,
            }}
          >
            <Celula kpi={por('PUB-03')} tamanho={74} largura={300} />
            <Celula kpi={por('PUB-01')} tamanho={74} largura={300} />
            <Celula kpi={por('PUB-05')} tamanho={74} largura={340} />
          </div>
        </>
      )}

      <Assinatura periodo={dados?.fechado.periodo ?? null} />
    </Palco>
  )
}
