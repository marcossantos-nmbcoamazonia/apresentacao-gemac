import { useCallback, useMemo } from 'react'
import { Deck } from './deck/Deck'
import type { FonteSlide, SlideDef } from './deck/types'
import { usePublicidade } from './data/usePublicidade'
import { useDigital } from './data/useDigital'
import { useEventos } from './data/useEventos'
import { ABA_PUBLICIDADE, KPIS_INVESTIMENTO, KPIS_PRINCIPAIS } from './data/publicidade'
import { ABA_DIGITAL, BLOCOS_VAZIOS, remateDoBloco } from './data/digital'
import { ABA_EVENTOS } from './data/eventos'
import { kpiVazio } from './data/kpis'
import { formatCompact } from './lib/numbers'
import type { MesFechado } from './data/resolveClosedMonth'
import { Capa } from './slides/Capa'
import { DivisorPublicidade } from './slides/DivisorPublicidade'
import { ResultadosPublicidade } from './slides/ResultadosPublicidade'
import { PresencaDigital } from './slides/PresencaDigital'
import { ResultadosDigitais } from './slides/ResultadosDigitais'
import { DivisorEventos } from './slides/DivisorEventos'
import { AgendaEventos } from './slides/AgendaEventos'
import { ProjetosAprovados } from './slides/ProjetosAprovados'

/** Enquanto a planilha não responde, o layout já se monta com os rótulos certos. */
const KPIS_VAZIOS = KPIS_PRINCIPAIS.map((d) => kpiVazio(d))
const INVESTIMENTO_VAZIO = KPIS_INVESTIMENTO.map((d) => kpiVazio(d, 'moeda'))

const estadoDe = (erro: string | null, carregando: boolean): FonteSlide['estado'] =>
  erro ? 'erro' : carregando ? 'carregando' : 'ok'

/** O período da capa cobre o relatório todo: vale o mês mais avançado entre as abas. */
function fechadoMaisRecente(...meses: (MesFechado | undefined)[]): MesFechado | null {
  return meses.filter((m): m is MesFechado => Boolean(m)).sort((a, b) => b.indice - a.indice)[0] ?? null
}

export default function App() {
  const pub = usePublicidade()
  const dig = useDigital()
  const evt = useEventos()

  const fontePub: FonteSlide = {
    estado: estadoDe(pub.erro, pub.carregando),
    mes: pub.dados?.fechado.curto ?? null,
    buscadoEm: pub.buscadoEm,
    aba: ABA_PUBLICIDADE,
  }
  const fonteDig: FonteSlide = {
    estado: estadoDe(dig.erro, dig.carregando),
    mes: dig.dados?.fechado.curto ?? null,
    buscadoEm: dig.buscadoEm,
    aba: ABA_DIGITAL,
  }
  const fonteEvt: FonteSlide = {
    estado: estadoDe(evt.erro, evt.carregando),
    mes: evt.dados?.curto ?? null,
    buscadoEm: evt.buscadoEm,
    aba: ABA_EVENTOS,
  }

  const fechadoGeral = fechadoMaisRecente(pub.dados?.fechado, dig.dados?.fechado)
  const periodoGeral = fechadoGeral?.periodo ?? null

  const periodoPub = pub.dados?.fechado.periodo ?? null
  const periodoDig = dig.dados?.fechado.periodo ?? null

  const blocosDigitais = dig.dados?.blocos ?? BLOCOS_VAZIOS

  // "criadores ativados" abre a seção somando as duas entidades da aba
  const criadores = useMemo(() => {
    if (!dig.dados) return { total: '—', detalhe: null as string | null }
    const comValor = dig.dados.blocos.filter((b) => b.influenciadores.valor != null)
    if (comValor.length === 0) return { total: '—', detalhe: null }
    const total = comValor.reduce((s, b) => s + (b.influenciadores.valor ?? 0), 0)
    return {
      total: formatCompact(total),
      detalhe: comValor
        .map((b) => `${b.entidade} ${b.influenciadores.formatado}`)
        .join(' · '),
    }
  }, [dig.dados])

  const recarregar = useCallback(() => {
    pub.recarregar()
    dig.recarregar()
    evt.recarregar()
  }, [pub, dig, evt])

  const slides = useMemo<SlideDef[]>(
    () => [
      {
        id: 'capa',
        titulo: 'Capa — Resultados Estratégicos',
        render: () => <Capa periodo={periodoGeral} />,
      },

      // ---- Publicidade -----------------------------------------------------
      {
        id: 'publicidade-abertura',
        titulo: 'Publicidade — abertura',
        fonte: fontePub,
        render: () => (
          <DivisorPublicidade
            produtos={pub.dados?.produtos ?? []}
            pracas={pub.dados?.pracas ?? ''}
            periodo={periodoPub}
            carregando={pub.carregando}
            erro={pub.erro}
          />
        ),
      },
      {
        id: 'publicidade-resultados',
        titulo: 'Resultados de Publicidade',
        fonte: fontePub,
        render: () => (
          <ResultadosPublicidade
            kpis={pub.dados?.kpis ?? KPIS_VAZIOS}
            investimento={pub.dados?.investimento ?? INVESTIMENTO_VAZIO}
            periodo={periodoPub}
            mesFechado={pub.dados?.fechado.nome ?? null}
            carregando={pub.carregando}
            erro={pub.erro}
          />
        ),
      },

      // ---- Digital ---------------------------------------------------------
      {
        id: 'digital-abertura',
        titulo: 'Presença Digital — abertura',
        fonte: fonteDig,
        render: () => (
          <PresencaDigital
            criadores={criadores.total}
            criadoresDetalhe={criadores.detalhe}
            periodo={periodoDig}
            carregando={dig.carregando}
            erro={dig.erro}
          />
        ),
      },
      ...blocosDigitais.map<SlideDef>((bloco) => ({
        id: `digital-resultados-${bloco.prefixo.toLowerCase()}`,
        titulo: `Resultados Digitais — ${bloco.entidade}`,
        fonte: fonteDig,
        render: () => (
          <ResultadosDigitais
            entidade={bloco.entidade}
            cards={bloco.cards}
            periodo={periodoDig}
            mesFechado={dig.dados?.fechado.nome ?? null}
            remate={remateDoBloco(bloco)}
            carregando={dig.carregando}
            erro={dig.erro}
          />
        ),
      })),

      // ---- Eventos ---------------------------------------------------------
      {
        id: 'eventos-abertura',
        titulo: 'Eventos e Feiras — abertura',
        fonte: fonteEvt,
        render: () => (
          <DivisorEventos dados={evt.dados} carregando={evt.carregando} erro={evt.erro} />
        ),
      },
      {
        id: 'eventos-agenda',
        titulo: 'Agenda do período',
        fonte: fonteEvt,
        render: () => (
          <AgendaEventos dados={evt.dados} carregando={evt.carregando} erro={evt.erro} />
        ),
      },
      {
        id: 'eventos-projetos',
        titulo: 'Projetos aprovados',
        fonte: fonteEvt,
        render: () => (
          <ProjetosAprovados dados={evt.dados} carregando={evt.carregando} erro={evt.erro} />
        ),
      },
    ],
    [
      pub.dados,
      pub.carregando,
      pub.erro,
      dig.dados,
      dig.carregando,
      dig.erro,
      periodoGeral,
      periodoPub,
      periodoDig,
      blocosDigitais,
      criadores,
      fontePub,
      fonteDig,
      fonteEvt,
      evt.dados,
      evt.carregando,
      evt.erro,
    ],
  )

  return (
    <Deck
      slides={slides}
      tituloDocumento={`Marketing e Comunicacao - Resultados Estrategicos${
        fechadoGeral ? ` - ${fechadoGeral.periodo.replace(/\s*–\s*/, '-')}` : ''
      }`}
      status={{
        estado:
          pub.erro || dig.erro || evt.erro
            ? 'erro'
            : pub.carregando || dig.carregando || evt.carregando
              ? 'carregando'
              : 'ok',
        mes: fechadoGeral?.curto ?? null,
        buscadoEm: pub.buscadoEm,
        aba: 'planilha de fechamento',
      }}
      aoRecarregar={recarregar}
    />
  )
}
