/**
 * Leitura de mídia sobre a aba "01 PUBLICIDADE".
 *
 * A planilha entrega só contagens brutas. O que transforma isso em apresentação
 * de mídia são as relações entre elas — CTR, CPL, CPM, alcance somado — e a
 * série mensal, que o deck antigo descartava ao mostrar apenas o acumulado.
 *
 * Tudo aqui é função pura, sem React: `scripts/conferir-dados.ts` roda as mesmas
 * contas pelo terminal, então qualquer divergência aparece antes da reunião.
 */
import { MESES, porId, type AbaParseada, type Mes } from '../api/parseSheet'
import { parseBR } from '../lib/numbers'
import { chaveLista, itensDaCelula } from '../lib/listas'
import type { MesFechado } from './resolveClosedMonth'

/** Um ponto da série: o mês e o valor, `null` quando a célula está vazia. */
export interface PontoMes {
  mes: Mes
  indice: number
  valor: number | null
}

export interface SerieMensal {
  id: string
  rotulo: string
  pontos: PontoMes[]
  total: number
  /** maior valor da série, para escalar o gráfico */
  maximo: number
  /** mês do pico; null se a série está vazia */
  pico: PontoMes | null
  /** meses sem valor dentro do período fechado */
  lacunas: Mes[]
}

/** Série de um indicador, recortada em Jan → mês fechado. */
export function serieDoIndicador(
  aba: AbaParseada,
  id: string,
  rotulo: string,
  fechado: MesFechado,
): SerieMensal {
  const linha = porId(aba.linhas, id)
  const pontos: PontoMes[] = []

  for (let i = 0; i <= fechado.indice; i++) {
    const mes = MESES[i]
    pontos.push({ mes, indice: i, valor: linha ? parseBR(linha.meses[mes]) : null })
  }

  const comValor = pontos.filter((p) => p.valor != null) as (PontoMes & { valor: number })[]
  const total = comValor.reduce((s, p) => s + p.valor, 0)
  const maximo = comValor.reduce((m, p) => Math.max(m, p.valor), 0)
  const pico = comValor.length ? comValor.reduce((a, b) => (b.valor > a.valor ? b : a)) : null

  return {
    id,
    rotulo,
    pontos,
    total,
    maximo,
    pico,
    lacunas: pontos.filter((p) => p.valor == null).map((p) => p.mes),
  }
}

/** Uma métrica derivada, com a conta que a gerou à mostra. */
export interface Derivada {
  rotulo: string
  valor: number | null
  formatado: string
  /** "867.189 cliques ÷ 317.296.690 impressões" — a auditoria em uma linha */
  conta: string
  /** leitura curta para o slide */
  leitura: string
}

/** Recorrência de um produto ao longo dos meses do período. */
export interface Produto {
  nome: string
  /** em quantos meses do período o produto aparece */
  meses: number
  faixa: 'constante' | 'recorrente' | 'pontual'
}

export interface AnalisePublicidade {
  series: {
    leads: SerieMensal
    impressoes: SerieMensal
    cliques: SerieMensal
    ooh: SerieMensal
    aeroporto: SerieMensal
    midia: SerieMensal
    producao: SerieMensal
  }
  /** impressões digitais + impactos OOH + fluxo aeroportuário */
  alcanceTotal: number
  /** as três parcelas do alcance, já com participação */
  alcancePartes: { rotulo: string; valor: number; participacao: number }[]
  /** mídia + produção */
  investimentoTotal: number
  investimentoPartes: { rotulo: string; valor: number; participacao: number }[]
  ctr: Derivada
  cpl: Derivada
  cpm: Derivada
  /** CTR mês a mês, em % — série única, para a linha do slide de eficiência */
  ctrMensal: PontoMes[]
  produtos: Produto[]
  /** UFs cobertas, derivadas de PUB-10 */
  ufs: string[]
}

const nf = (n: number, casas = 0) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
    .format(n)

/**
 * "Amazônia Legal" são nove estados por definição legal, e a aba PARAMETROS da
 * própria planilha lista exatamente esses nove mais DF e SP como vocabulário de
 * UF — por isso a expansão abaixo é leitura da planilha, não suposição.
 */
const AMAZONIA_LEGAL = ['AC', 'AM', 'AP', 'MA', 'MT', 'PA', 'RO', 'RR', 'TO']

export function ufsDasPracas(pracas: string): string[] {
  const texto = chaveLista(pracas)
  const ufs: string[] = []
  if (texto.includes('AMAZONIA LEGAL')) ufs.push(...AMAZONIA_LEGAL)
  for (const uf of ['DF', 'SP', 'RJ', 'MG', 'BA', 'PE', 'CE']) {
    if (new RegExp(`\\b${uf}\\b`).test(texto) && !ufs.includes(uf)) ufs.push(uf)
  }
  return ufs
}

function faixaDeRecorrencia(meses: number, total: number): Produto['faixa'] {
  const proporcao = meses / Math.max(total, 1)
  if (proporcao >= 0.7) return 'constante'
  if (proporcao >= 0.3) return 'recorrente'
  return 'pontual'
}

/** Conta em quantos meses do período cada produto de PUB-09 aparece. */
export function recorrenciaDeProdutos(aba: AbaParseada, fechado: MesFechado): Produto[] {
  const linha = porId(aba.linhas, 'PUB-09')
  if (!linha) return []

  const totalMeses = fechado.indice + 1
  // chave normalizada -> { nome de exibição, meses }
  const contagem = new Map<string, { nome: string; meses: number }>()

  for (let i = 0; i <= fechado.indice; i++) {
    // um produto listado duas vezes no mesmo mês conta uma só
    const noMes = new Set<string>()
    for (const item of itensDaCelula(linha.meses[MESES[i]])) {
      const k = chaveLista(item)
      if (noMes.has(k)) continue
      noMes.add(k)
      const atual = contagem.get(k)
      if (atual) atual.meses += 1
      else contagem.set(k, { nome: item, meses: 1 })
    }
  }

  return [...contagem.values()]
    .map((p) => ({ ...p, faixa: faixaDeRecorrencia(p.meses, totalMeses) }))
    .sort((a, b) => b.meses - a.meses || a.nome.localeCompare(b.nome, 'pt-BR'))
}

export function analisarPublicidade(
  aba: AbaParseada,
  fechado: MesFechado,
  pracas: string,
): AnalisePublicidade {
  const s = (id: string, rotulo: string) => serieDoIndicador(aba, id, rotulo, fechado)

  const series = {
    leads: s('PUB-01', 'Leads gerados'),
    impressoes: s('PUB-02', 'Impressões digitais'),
    cliques: s('PUB-03', 'Cliques'),
    ooh: s('PUB-04', 'Impactos OOH'),
    aeroporto: s('PUB-05', 'Fluxo aeroportuário'),
    midia: s('PUB-07', 'Investimento de mídia'),
    producao: s('PUB-08', 'Produção'),
  }

  const alcanceTotal = series.impressoes.total + series.ooh.total + series.aeroporto.total
  const alcancePartes = [
    { rotulo: 'Impressões digitais', valor: series.impressoes.total },
    { rotulo: 'Impactos OOH', valor: series.ooh.total },
    { rotulo: 'Fluxo aeroportuário', valor: series.aeroporto.total },
  ].map((p) => ({ ...p, participacao: alcanceTotal > 0 ? p.valor / alcanceTotal : 0 }))

  const investimentoTotal = series.midia.total + series.producao.total
  const investimentoPartes = [
    { rotulo: 'Mídia', valor: series.midia.total },
    { rotulo: 'Produção', valor: series.producao.total },
  ].map((p) => ({ ...p, participacao: investimentoTotal > 0 ? p.valor / investimentoTotal : 0 }))

  const ctrValor =
    series.impressoes.total > 0 ? (series.cliques.total / series.impressoes.total) * 100 : null
  const cplValor = series.leads.total > 0 ? series.midia.total / series.leads.total : null
  const cpmValor =
    series.impressoes.total > 0 ? series.midia.total / (series.impressoes.total / 1000) : null

  const ctr: Derivada = {
    rotulo: 'CTR',
    valor: ctrValor,
    formatado: ctrValor == null ? '—' : `${nf(ctrValor, 2)}%`,
    conta: `${nf(series.cliques.total)} cliques ÷ ${nf(series.impressoes.total)} impressões`,
    leitura: 'Taxa de clique sobre a mídia digital veiculada',
  }

  const cpl: Derivada = {
    rotulo: 'Custo por lead',
    valor: cplValor,
    formatado: cplValor == null ? '—' : `R$ ${nf(cplValor, 2)}`,
    conta: `R$ ${nf(series.midia.total)} de mídia ÷ ${nf(series.leads.total)} leads`,
    leitura: 'Considera só o investimento de mídia, sem produção',
  }

  const cpm: Derivada = {
    rotulo: 'CPM',
    valor: cpmValor,
    formatado: cpmValor == null ? '—' : `R$ ${nf(cpmValor, 2)}`,
    conta: `R$ ${nf(series.midia.total)} de mídia ÷ ${nf(series.impressoes.total / 1000)} mil impressões`,
    leitura: 'Custo por mil impressões digitais',
  }

  // CTR mês a mês: só existe onde os dois indicadores têm valor no mesmo mês
  const ctrMensal: PontoMes[] = series.impressoes.pontos.map((p, i) => {
    const cliques = series.cliques.pontos[i]?.valor
    const impressoes = p.valor
    return {
      mes: p.mes,
      indice: p.indice,
      valor:
        cliques != null && impressoes != null && impressoes > 0
          ? (cliques / impressoes) * 100
          : null,
    }
  })

  return {
    series,
    alcanceTotal,
    alcancePartes,
    investimentoTotal,
    investimentoPartes,
    ctr,
    cpl,
    cpm,
    ctrMensal,
    produtos: recorrenciaDeProdutos(aba, fechado),
    ufs: ufsDasPracas(pracas),
  }
}
