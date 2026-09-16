import type { DadosPublicidade } from '../data/publicidade'
import { BarraParticipacao } from '../charts/graficos'
import { formatCompact, formatadorFixo, formatFull } from '../lib/numbers'
import { Assinatura, Eyebrow, Folhagem, MARGEM, Nota, NumeroHeroi, Palco } from './editorial'

/**
 * O slide do quase-bilhão. O número herói é a soma das três frentes de
 * veiculação, e a barra logo abaixo mostra de onde ele vem — sem isso, "984
 * milhões" seria um número sem endereço.
 */
export function Alcance({ dados }: { dados: DadosPublicidade | null }) {
  const a = dados?.analise
  const total = a?.alcanceTotal ?? null

  return (
    <Palco veu="nenhum">
      <Folhagem lado="direita" largura={560} opacidade={0.34} />

      <div style={{ position: 'absolute', left: MARGEM, top: 68 }}>
        <Eyebrow>Alcance do período</Eyebrow>
      </div>

      <div style={{ position: 'absolute', left: MARGEM, top: 148 }}>
        <NumeroHeroi
          valor={total}
          formatar={formatadorFixo(total ?? 0)}
          tamanho={196}
          titulo={total == null ? undefined : formatFull(total)}
        />
        <div
          style={{
            marginTop: 18,
            fontSize: 30,
            fontWeight: 300,
            color: 'var(--areia)',
            letterSpacing: '-0.015em',
          }}
        >
          impactos entregues em três frentes de veiculação
        </div>
      </div>

      {a && (
        <div style={{ position: 'absolute', left: MARGEM, top: 402 }}>
          <BarraParticipacao
            partes={a.alcancePartes}
            formatar={(n) => formatCompact(n)}
            largura={1280 - MARGEM * 2}
          />
        </div>
      )}

      <Nota style={{ position: 'absolute', left: MARGEM, right: MARGEM, bottom: 72 }}>
        Soma de impressões digitais, impactos de OOH e fluxo aeroportuário. São metodologias de
        medição distintas e o total não é deduplicado — uma mesma pessoa pode ser contada em mais
        de uma frente.
      </Nota>

      <Assinatura periodo={dados?.fechado.periodo ?? null} />
    </Palco>
  )
}
