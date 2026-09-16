import type { DadosPublicidade } from '../data/publicidade'
import { Assinatura, Eyebrow, Folhagem, MARGEM, Nota, Palco } from './editorial'

/**
 * Cobertura geográfica. A planilha traz uma linha de texto — "Amazônia Legal +
 * DF + SP" — e o slide a abre nas unidades da federação que ela significa.
 * A expansão é leitura da própria planilha: a aba PARAMETROS lista exatamente
 * esses onze códigos como vocabulário de UF.
 */

const NOME_UF: Record<string, string> = {
  AC: 'Acre',
  AM: 'Amazonas',
  AP: 'Amapá',
  MA: 'Maranhão',
  MT: 'Mato Grosso',
  PA: 'Pará',
  RO: 'Rondônia',
  RR: 'Roraima',
  TO: 'Tocantins',
  DF: 'Distrito Federal',
  SP: 'São Paulo',
}

export function Pracas({ dados }: { dados: DadosPublicidade | null }) {
  const ufs = dados?.analise.ufs ?? []

  return (
    <Palco
      foto="/assets/retrato-2.jpg"
      alt="Senhora amazônida de chapéu de palha, sob céu azul"
      // o rosto sai da coluna de texto; sem isto a lista de UFs cai sobre a
      // parte mais clara do retrato
      posicao="88% center"
      veu="esquerda"
      escurecer={0.32}
    >
      <Folhagem lado="esquerda" largura={540} opacidade={0.5} />

      <div style={{ position: 'absolute', left: MARGEM, top: 74, width: 700 }}>
        <Eyebrow>Praças</Eyebrow>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 22, marginTop: 24 }}>
          <span
            style={{
              fontSize: 128,
              fontWeight: 700,
              lineHeight: 0.86,
              letterSpacing: '-0.045em',
              color: 'var(--lima)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {ufs.length || '—'}
          </span>
          <span style={{ fontSize: 30, fontWeight: 300, color: 'var(--areia)' }}>
            unidades da
            <br />
            federação
          </span>
        </div>

        <p
          style={{
            margin: '32px 0 0',
            fontSize: 25,
            fontWeight: 300,
            lineHeight: 1.35,
            color: 'rgb(245 240 226 / 82%)',
          }}
        >
          {dados?.pracas ?? '—'}
        </p>

        <ul
          style={{
            margin: '34px 0 0',
            padding: 0,
            listStyle: 'none',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '13px 18px',
            maxWidth: 620,
          }}
        >
          {ufs.map((uf) => (
            <li key={uf} style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
              <span
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  color: 'var(--verde-neon)',
                  minWidth: 28,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {uf}
              </span>
              <span style={{ fontSize: 15, fontWeight: 300, color: 'rgb(245 240 226 / 72%)' }}>
                {NOME_UF[uf] ?? ''}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <Nota style={{ position: 'absolute', left: MARGEM, width: 620, bottom: 72 }}>
        Nove estados da Amazônia Legal mais Distrito Federal e São Paulo, conforme a coluna
        “Praças” (PUB-10).
      </Nota>

      <Assinatura periodo={dados?.fechado.periodo ?? null} />
    </Palco>
  )
}
