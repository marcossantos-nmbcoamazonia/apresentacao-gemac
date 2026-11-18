/**
 * Comparativo ano contra ano: a aba corrente ("01 PUBLICIDADE") contra a do ano
 * anterior ("01 PUBLICIDADE - 2025"), que tem o mesmo formato e o mesmo parser.
 *
 * TRÊS REGRAS
 *
 * 1. **Mesmo período nos dois anos.** O recorte é Jan → mês fechado do ano
 *    corrente, aplicado também ao anterior. Comparar 10 meses de 2026 com o ano
 *    inteiro de 2025 faria qualquer indicador parecer em queda.
 *
 * 2. **A base do ano anterior é exibida, não presumida.** A planilha de 2025 tem
 *    buracos grandes — leads só em Jun, nada em Jan e Mar, produção sem
 *    abertura mensal. Mês vazio não entra na soma, e cada linha leva quantos
 *    meses de fato sustentam o número. Quando o ano anterior tem menos da
 *    metade dos meses do corrente, a variação NÃO é calculada: "+3.333% de
 *    leads" sobre um único mês de 2025 seria uma manchete falsa.
 *
 * 3. **Métrica derivada só sobre meses pareados.** CTR e CPM dividem um
 *    indicador por outro; em 2025 há investimento em Abr/Mai sem impressões
 *    registradas, e somar esse investimento inflaria o CPM do ano anterior.
 *    Cada razão usa só os meses em que os dois componentes existem.
 *
 * EXCEÇÃO: PRODUÇÃO DE 2025
 *
 * A aba de produção do dashboard não tem coluna de data, então 2025 só tem o
 * total do ano, digitado na coluna "Acum. 2025" de PUB-08, com os meses vazios.
 * Para esse indicador, e só quando não há nenhum mês preenchido, o total anual
 * vira a base de comparação. É uma decisão da área: a linha sai marcada como
 * "total do ano" e a nota de rodapé explica que o recorte é diferente.
 *
 * Função pura, sem React — `scripts/conferir-dados.ts` imprime o mesmo quadro.
 */
import { MESES, porId, type AbaParseada, type Mes } from '../api/parseSheet'
import {
  formatCompact,
  formatFull,
  formatPercent,
  formatPontos,
  formatVariacao,
  parseBR,
  variacao,
  variacaoEmPontos,
  type Variacao,
} from '../lib/numbers'
import type { TipoKpi } from './kpis'
import { serieDoIndicador, type PontoMes } from './publicidadeAnalise'
import type { MesFechado } from './resolveClosedMonth'

/** Nome da aba do ano anterior. A convenção da planilha é "<aba> - <ano>". */
export function abaDoAno(aba: string, ano: number): string {
  return `${aba} - ${ano}`
}

/** Para que lado a variação é boa. Investimento é escolha, não desempenho. */
export type Sentido = 'maior-melhor' | 'menor-melhor' | 'neutro'

export interface LinhaComparativo {
  id: string
  rotulo: string
  detalhe?: string
  tipo: TipoKpi
  sentido: Sentido
  anterior: number | null
  atual: number | null
  anteriorFormatado: string
  atualFormatado: string
  anteriorCheio: string
  atualCheio: string
  /** meses com dado no período, em cada ano */
  mesesAnterior: number
  mesesAtual: number
  /** meses do período sem registro no ano anterior */
  lacunasAnterior: Mes[]
  /** ano anterior com menos da metade dos meses do corrente: sem variação */
  baseParcial: boolean
  /**
   * A base do ano anterior é o total do ano (coluna "Acum."), não a soma do
   * período — usado onde a planilha não tem abertura mensal.
   */
  anteriorTotalAnual: boolean
  variacao: Variacao | null
  /** "▲ 362%" · "▼ 0,0 p.p." */
  variacaoTexto: string | null
  /** leitura da variação conforme o sentido do indicador */
  avaliacao: 'melhor' | 'pior' | 'neutro' | null
}

export interface Comparativo {
  anoAtual: number
  anoAnterior: number
  /** "Jan – Out" */
  periodo: string
  /** quantidade de meses do período (Jan → mês fechado) */
  mesesPeriodo: number
  linhas: LinhaComparativo[]
  /** indicadores sem nenhum registro no ano anterior — ficam fora do quadro */
  semRegistroAnterior: string[]
  /** indicadores cuja base do ano anterior é o total anual (rótulos) */
  comTotalAnual: string[]
}

interface DefVolume {
  id: string
  rotulo: string
  detalhe?: string
  sentido: Sentido
  /**
   * Sem nenhum mês preenchido no ano anterior, usar a coluna "Acum." como
   * base. Só onde a área garante que o total foi lançado ali à mão.
   */
  totalAnualNoAnterior?: boolean
}

/** Na ordem do quadro: volumes de alcance, depois resultado, depois dinheiro. */
const VOLUMES: DefVolume[] = [
  { id: 'PUB-02', rotulo: 'Impressões digitais', detalhe: 'Redes + Mídia ON', sentido: 'maior-melhor' },
  { id: 'PUB-03', rotulo: 'Cliques', sentido: 'maior-melhor' },
  { id: 'PUB-04', rotulo: 'Impactos OOH', detalhe: 'DOOH + Rua', sentido: 'maior-melhor' },
  // PUB-05 (fluxo aeroportuário) fica de fora de propósito: 2025 traz 150–436 Mi
  // por mês e 2026 ~2,7 Mi — mais de 100x de diferença, metodologias distintas.
  // O quadro mostraria "▼ 99%", que não é queda real. Decisão da área (nov/2026).
  { id: 'PUB-01', rotulo: 'Leads gerados', sentido: 'maior-melhor' },
  { id: 'PUB-07', rotulo: 'Investimento de mídia', sentido: 'neutro' },
  {
    id: 'PUB-08',
    rotulo: 'Investimento de produção',
    sentido: 'neutro',
    totalAnualNoAnterior: true,
  },
]

const TIPO_DO_ID: Record<string, TipoKpi> = { 'PUB-07': 'moeda', 'PUB-08': 'moeda' }

function formatar(n: number | null, tipo: TipoKpi): string {
  if (tipo === 'percentual') return formatPercent(n)
  if (tipo === 'moeda' && n != null && Math.abs(n) < 1000) {
    // CPM: R$ 39,15 — o formato compacto arredondaria os centavos que importam
    return `R$ ${new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n)}`
  }
  return formatCompact(n, { moeda: tipo === 'moeda' })
}

function formatarCheio(n: number | null, tipo: TipoKpi): string {
  if (tipo === 'percentual') return formatPercent(n, 3)
  if (tipo === 'moeda' && n != null && Math.abs(n) < 1000) return formatar(n, tipo)
  return formatFull(n, { moeda: tipo === 'moeda' })
}

function avaliar(v: Variacao | null, sentido: Sentido): LinhaComparativo['avaliacao'] {
  if (!v) return null
  if (sentido === 'neutro' || v.direcao === 'estavel') return 'neutro'
  const subiu = v.direcao === 'alta'
  return subiu === (sentido === 'maior-melhor') ? 'melhor' : 'pior'
}

interface Base {
  valor: number | null
  meses: number
  lacunas: Mes[]
  totalAnual?: boolean
}

function montarLinha(
  def: { id: string; rotulo: string; detalhe?: string; sentido: Sentido },
  tipo: TipoKpi,
  anterior: Base,
  atual: Base,
): LinhaComparativo {
  const baseParcial = anterior.meses > 0 && anterior.meses * 2 < atual.meses
  // CTR anda na casa de 0,3%: com uma casa decimal, uma queda de 12% sairia
  // como "0,0 p.p." — por isso duas casas e limiar de 0,005 p.p.
  const v = baseParcial
    ? null
    : tipo === 'percentual'
      ? variacaoEmPontos(atual.valor, anterior.valor, 0.005)
      : variacao(atual.valor, anterior.valor)

  return {
    ...def,
    tipo,
    anterior: anterior.valor,
    atual: atual.valor,
    anteriorFormatado: formatar(anterior.valor, tipo),
    atualFormatado: formatar(atual.valor, tipo),
    anteriorCheio: formatarCheio(anterior.valor, tipo),
    atualCheio: formatarCheio(atual.valor, tipo),
    mesesAnterior: anterior.meses,
    mesesAtual: atual.meses,
    lacunasAnterior: anterior.lacunas,
    baseParcial,
    anteriorTotalAnual: anterior.totalAnual === true,
    variacao: v,
    variacaoTexto: v ? (tipo === 'percentual' ? formatPontos(v, 2) : formatVariacao(v)) : null,
    avaliacao: avaliar(v, def.sentido),
  }
}

/** Razão a/b somando só os meses em que os dois têm valor. */
function razaoPareada(
  num: PontoMes[],
  den: PontoMes[],
  escala: number,
): Base {
  let somaNum = 0
  let somaDen = 0
  const lacunas: Mes[] = []
  let meses = 0
  num.forEach((p, i) => {
    const d = den[i]?.valor
    if (p.valor == null || d == null) {
      lacunas.push(p.mes)
      return
    }
    somaNum += p.valor
    somaDen += d
    meses++
  })
  return { valor: somaDen > 0 ? (somaNum / somaDen) * escala : null, meses, lacunas }
}

export function montarComparativo(
  atual: AbaParseada,
  anterior: AbaParseada,
  fechado: MesFechado,
): Comparativo {
  // o recorte do ano corrente vale para os dois: só o índice do mês importa
  const serie = (aba: AbaParseada, id: string) => serieDoIndicador(aba, id, id, fechado)
  const base = (aba: AbaParseada, id: string): Base => {
    const s = serie(aba, id)
    const meses = s.pontos.length - s.lacunas.length
    return { valor: meses > 0 ? s.total : null, meses, lacunas: s.lacunas }
  }

  const linhas: LinhaComparativo[] = []
  const semRegistroAnterior: string[] = []
  const comTotalAnual: string[] = []

  for (const def of VOLUMES) {
    let ant = base(anterior, def.id)
    const atu = base(atual, def.id)
    if (ant.meses === 0 && def.totalAnualNoAnterior) {
      // "R$ 0,00" é o que a fórmula da coluna devolve com os meses vazios: zero
      // aqui quer dizer "não lançado", não "nada investido"
      const total = parseBR(porId(anterior.linhas, def.id)?.acumAno)
      if (total != null && total > 0) {
        ant = { valor: total, meses: 0, lacunas: [], totalAnual: true }
        comTotalAnual.push(def.rotulo)
      }
    }
    if (atu.meses === 0) continue
    if (ant.valor == null) {
      semRegistroAnterior.push(def.rotulo)
      continue
    }
    linhas.push(montarLinha(def, TIPO_DO_ID[def.id] ?? 'inteiro', ant, atu))
  }

  // derivadas, com o mesmo critério do slide de Eficiência (total ÷ total),
  // mas restritas aos meses em que numerador e denominador foram registrados
  const pontos = (aba: AbaParseada, id: string) => serie(aba, id).pontos

  const ctrAnt = razaoPareada(pontos(anterior, 'PUB-03'), pontos(anterior, 'PUB-02'), 100)
  const ctrAtu = razaoPareada(pontos(atual, 'PUB-03'), pontos(atual, 'PUB-02'), 100)
  if (ctrAnt.meses > 0 && ctrAtu.meses > 0) {
    linhas.push(
      montarLinha(
        { id: 'CTR', rotulo: 'CTR', detalhe: 'cliques ÷ impressões', sentido: 'maior-melhor' },
        'percentual',
        ctrAnt,
        ctrAtu,
      ),
    )
  }

  const cpmAnt = razaoPareada(pontos(anterior, 'PUB-07'), pontos(anterior, 'PUB-02'), 1000)
  const cpmAtu = razaoPareada(pontos(atual, 'PUB-07'), pontos(atual, 'PUB-02'), 1000)
  if (cpmAnt.meses > 0 && cpmAtu.meses > 0) {
    linhas.push(
      montarLinha(
        { id: 'CPM', rotulo: 'CPM', detalhe: 'custo por mil impressões', sentido: 'menor-melhor' },
        'moeda',
        cpmAnt,
        cpmAtu,
      ),
    )
  }

  return {
    anoAtual: atual.ano,
    anoAnterior: anterior.ano,
    periodo: fechado.indice === 0 ? MESES[0] : `${MESES[0]} – ${fechado.nome}`,
    mesesPeriodo: fechado.indice + 1,
    linhas,
    semRegistroAnterior,
    comTotalAnual,
  }
}
