import { useCallback, useMemo } from 'react'
import { Deck } from './deck/Deck'
import type { FonteSlide, SlideDef } from './deck/types'
import { usePublicidade } from './data/usePublicidade'
import { useComparativo } from './data/useComparativo'
import { useInfluencia } from './data/useInfluencia'
import { ABA_PUBLICIDADE } from './data/publicidade'
import { ContextoErro } from './slides/editorial'
import { Capa } from './slides/Capa'
import { Tese } from './slides/Tese'
import { Numeros } from './slides/Numeros'
import { Distribuicao } from './slides/Distribuicao'
import { Alcance } from './slides/Alcance'
import { Evolucao } from './slides/Evolucao'
import { Eficiencia } from './slides/Eficiencia'
import { Investimento } from './slides/Investimento'
import { Produtos } from './slides/Produtos'
import { Pracas } from './slides/Pracas'
import { Fechamento } from './slides/Fechamento'
import { Comparativo } from './slides/Comparativo'
import { Influencia } from './slides/Influencia'

export default function App() {
  const { dados, aba, carregando, erro, buscadoEm, recarregar } = usePublicidade()
  const comparativo = useComparativo(aba, dados?.fechado ?? null)
  const influencia = useInfluencia()

  const fonte: FonteSlide = {
    estado: erro ? 'erro' : carregando ? 'carregando' : 'ok',
    mes: dados?.fechado.curto ?? null,
    buscadoEm,
    aba: ABA_PUBLICIDADE,
  }

  // o comparativo depende das duas abas: qualquer uma fora do ar é erro na pílula
  const erroComparativo = erro ?? comparativo.erro
  const fonteComparativo: FonteSlide = {
    estado: erroComparativo
      ? 'erro'
      : carregando || comparativo.carregando
        ? 'carregando'
        : 'ok',
    mes: dados?.fechado.curto ?? null,
    buscadoEm:
      buscadoEm != null && comparativo.buscadoEm != null
        ? Math.min(buscadoEm, comparativo.buscadoEm)
        : null,
    aba: comparativo.aba ? `${ABA_PUBLICIDADE} e ${comparativo.aba}` : ABA_PUBLICIDADE,
  }

  // outra planilha, outro ritmo: o consolidado de influência fecha no seu mês
  const fonteInfluencia: FonteSlide = {
    estado: influencia.erro ? 'erro' : influencia.carregando ? 'carregando' : 'ok',
    mes: influencia.dados?.curto ?? null,
    buscadoEm: influencia.buscadoEm,
    aba: 'base (Marketing de Influência)',
  }

  const recarregarComparativo = comparativo.recarregar
  const recarregarInfluencia = influencia.recarregar
  const recarregarTudo = useCallback(() => {
    recarregar()
    recarregarComparativo()
    recarregarInfluencia()
  }, [recarregar, recarregarComparativo, recarregarInfluencia])

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
      {
        id: 'distribuicao',
        titulo: 'Distribuição de mídia',
        fonte,
        render: () => <Distribuicao dados={dados} />,
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
      {
        id: 'influencia',
        titulo: 'Marketing de influência',
        fonte: fonteInfluencia,
        render: () => (
          <ContextoErro.Provider value={influencia.erro}>
            <Influencia dados={influencia.dados} />
          </ContextoErro.Provider>
        ),
      },
      {
        id: 'comparativo',
        titulo: 'Comparativo anual',
        fonte: fonteComparativo,
        render: () => (
          <ContextoErro.Provider value={erroComparativo}>
            <Comparativo dados={comparativo.dados} periodo={periodo} />
          </ContextoErro.Provider>
        ),
      },
    ],
    [
      dados,
      carregando,
      periodo,
      fonte,
      fonteComparativo,
      comparativo.dados,
      erroComparativo,
      fonteInfluencia,
      influencia.dados,
      influencia.erro,
    ],
  )

  return (
    <ContextoErro.Provider value={erro}>
      <Deck
        slides={slides}
        tituloDocumento={`Publicidade - Resultados de Midia${
          periodo ? ` - ${periodo.replace(/\s*–\s*/, '-')}` : ''
        }`}
        status={fonte}
        aoRecarregar={recarregarTudo}
      />
    </ContextoErro.Provider>
  )
}
