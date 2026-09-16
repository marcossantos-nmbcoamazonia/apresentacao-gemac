import { useMemo } from 'react'
import { Deck } from './deck/Deck'
import type { FonteSlide, SlideDef } from './deck/types'
import { usePublicidade } from './data/usePublicidade'
import { ABA_PUBLICIDADE } from './data/publicidade'
import { ContextoErro } from './slides/editorial'
import { Capa } from './slides/Capa'
import { Tese } from './slides/Tese'
import { Numeros } from './slides/Numeros'
import { Alcance } from './slides/Alcance'
import { Evolucao } from './slides/Evolucao'
import { Eficiencia } from './slides/Eficiencia'
import { Investimento } from './slides/Investimento'
import { Produtos } from './slides/Produtos'
import { Pracas } from './slides/Pracas'
import { Fechamento } from './slides/Fechamento'

export default function App() {
  const { dados, carregando, erro, buscadoEm, recarregar } = usePublicidade()

  const fonte: FonteSlide = {
    estado: erro ? 'erro' : carregando ? 'carregando' : 'ok',
    mes: dados?.fechado.curto ?? null,
    buscadoEm,
    aba: ABA_PUBLICIDADE,
  }

  const periodo = dados?.fechado.periodo ?? null

  const slides = useMemo<SlideDef[]>(
    () => [
      { id: 'capa', titulo: 'Capa', fonte, render: () => <Capa periodo={periodo} /> },
      {
        id: 'tese',
        titulo: 'Comunicação orientada a negócios',
        fonte,
        render: () => <Tese dados={dados} />,
      },
      {
        id: 'numeros',
        titulo: 'Os números do período',
        fonte,
        render: () => <Numeros dados={dados} carregando={carregando} />,
      },
      { id: 'alcance', titulo: 'Alcance', fonte, render: () => <Alcance dados={dados} /> },
      {
        id: 'evolucao',
        titulo: 'Evolução mês a mês',
        fonte,
        render: () => <Evolucao dados={dados} />,
      },
      {
        id: 'eficiencia',
        titulo: 'Eficiência',
        fonte,
        render: () => <Eficiencia dados={dados} />,
      },
      {
        id: 'investimento',
        titulo: 'Investimento executado',
        fonte,
        render: () => <Investimento dados={dados} />,
      },
      {
        id: 'produtos',
        titulo: 'Produtos trabalhados',
        fonte,
        render: () => <Produtos dados={dados} />,
      },
      { id: 'pracas', titulo: 'Praças', fonte, render: () => <Pracas dados={dados} /> },
      {
        id: 'fechamento',
        titulo: 'Em resumo',
        fonte,
        render: () => <Fechamento dados={dados} />,
      },
    ],
    [dados, carregando, periodo, fonte],
  )

  return (
    <ContextoErro.Provider value={erro}>
      <Deck
        slides={slides}
        tituloDocumento={`Publicidade - Resultados de Midia${
          periodo ? ` - ${periodo.replace(/\s*–\s*/, '-')}` : ''
        }`}
        status={fonte}
        aoRecarregar={recarregar}
      />
    </ContextoErro.Provider>
  )
}
