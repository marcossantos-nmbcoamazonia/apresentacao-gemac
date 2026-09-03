import { useMemo } from 'react'
import { Deck } from './deck/Deck'
import type { SlideDef } from './deck/types'
import { usePublicidade } from './data/usePublicidade'
import { KPIS_INVESTIMENTO, KPIS_PRINCIPAIS, kpiVazio } from './data/publicidade'
import { Capa } from './slides/Capa'
import { DivisorPublicidade } from './slides/DivisorPublicidade'
import { ResultadosPublicidade } from './slides/ResultadosPublicidade'
import { Mosaico } from './slides/Mosaico'

/** Enquanto a planilha não responde, o layout já se monta com os rótulos certos. */
const KPIS_VAZIOS = KPIS_PRINCIPAIS.map((d) => kpiVazio(d))
const INVESTIMENTO_VAZIO = KPIS_INVESTIMENTO.map((d) => kpiVazio(d, true))

export default function App() {
  const { dados, carregando, erro, buscadoEm, recarregar } = usePublicidade()

  const periodo = dados?.fechado.periodo ?? null
  const mesCurto = dados?.fechado.curto ?? null
  const mesNome = dados?.fechado.nome ?? null

  const slides = useMemo<SlideDef[]>(
    () => [
      {
        id: 'capa',
        titulo: 'Capa — Resultados Estratégicos',
        render: () => <Capa periodo={periodo} />,
      },
      {
        id: 'publicidade-abertura',
        titulo: 'Publicidade — abertura',
        render: () => (
          <DivisorPublicidade
            produtos={dados?.produtos ?? []}
            pracas={dados?.pracas ?? ''}
            periodo={periodo}
            carregando={carregando}
            erro={erro}
          />
        ),
      },
      {
        id: 'publicidade-resultados',
        titulo: 'Resultados de Publicidade',
        render: () => (
          <ResultadosPublicidade
            kpis={dados?.kpis ?? KPIS_VAZIOS}
            investimento={dados?.investimento ?? INVESTIMENTO_VAZIO}
            periodo={periodo}
            mesFechado={mesNome}
            carregando={carregando}
            erro={erro}
          />
        ),
      },
      {
        id: 'publicidade-criativos',
        titulo: 'Criativos em veiculação',
        render: () => <Mosaico periodo={periodo} />,
      },
    ],
    [dados, carregando, erro, periodo, mesNome],
  )

  return (
    <Deck
      slides={slides}
      status={{
        estado: erro ? 'erro' : carregando ? 'carregando' : 'ok',
        mes: mesCurto,
        buscadoEm,
      }}
      aoRecarregar={recarregar}
    />
  )
}
