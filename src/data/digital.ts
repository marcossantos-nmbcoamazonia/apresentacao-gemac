/**
 * Modelo de apresentação da seção Digital (aba "02 DIGITAL").
 *
 * A aba traz dois blocos com os mesmos nove indicadores: o Banco (DIG-01…09) e
 * o Centro Cultural (DGC-01…09). A própria planilha avisa que "o relatorio de
 * Jan-Jun/2026 nao separava as duas entidades", então cada bloco vira um slide
 * de resultados próprio — juntar os dois esconderia justamente o que a área
 * passou a separar.
 *
 * Atenção ao DIG-05/DGC-05 (Taxa de engajamento): único indicador da seção com
 * unidade "%", agregado por média e comparado em pontos percentuais (ver
 * kpis.ts). A observação da planilha registra que o denominador ainda está por
 * definir, e ela é levada ao slide como nota de rodapé.
 */
import { porId, type AbaParseada, type IndicadorRow } from '../api/parseSheet'
import { kpiVazio, montarKpi, type DefKpi, type Kpi } from './kpis'
import { resolveClosedMonth, type MesFechado } from './resolveClosedMonth'

export const ABA_DIGITAL = '02 DIGITAL'

/** Definição relativa ao bloco: o id se completa com o prefixo da entidade. */
interface DefRelativa {
  sufixo: string
  rotulo: string
  detalhe?: string
}

interface DefCard {
  principal: DefRelativa
  /** métrica de apoio, exibida menor dentro do mesmo card */
  secundario?: DefRelativa
}

/** Os seis cards do slide 10 do deck, na ordem da grade 3x2. */
const CARDS: DefCard[] = [
  { principal: { sufixo: '01', rotulo: 'Visualizações', detalhe: 'nos canais' } },
  { principal: { sufixo: '02', rotulo: 'Pessoas Alcançadas', detalhe: '(Instagram)' } },
  { principal: { sufixo: '03', rotulo: 'Publicações no período' } },
  {
    principal: { sufixo: '04', rotulo: 'Impactos via Influenciadores' },
    secundario: { sufixo: '05', rotulo: 'Taxa de Engajamento' },
  },
  {
    principal: { sufixo: '06', rotulo: 'Visualizações', detalhe: 'no conteúdo do Blog' },
    secundario: { sufixo: '07', rotulo: 'Publicações no Blog' },
  },
  { principal: { sufixo: '08', rotulo: 'Visualizações no Site' } },
]

/** DIG-09 / DGC-09 — aparece no slide de abertura, no card "Influenciadores". */
const INFLUENCIADORES: DefRelativa = { sufixo: '09', rotulo: 'criadores ativados' }

export const BLOCOS = [
  { entidade: 'Banco', prefixo: 'DIG' },
  { entidade: 'Centro Cultural', prefixo: 'DGC' },
] as const

export interface CardDigital {
  id: string
  principal: Kpi
  secundario: Kpi | null
}

export interface BlocoDigital {
  /** "Banco" | "Centro Cultural" */
  entidade: string
  /** "DIG" | "DGC" */
  prefixo: string
  cards: CardDigital[]
  influenciadores: Kpi
}

const defDe = (prefixo: string, d: DefRelativa): DefKpi => ({
  id: `${prefixo}-${d.sufixo}`,
  rotulo: d.rotulo,
  detalhe: d.detalhe,
})

export interface DadosDigital {
  fechado: MesFechado
  blocos: BlocoDigital[]
}

export function montarDigital(aba: AbaParseada): DadosDigital | null {
  const fechado = resolveClosedMonth(aba.linhas, aba.ano)
  if (!fechado) return null

  const kpi = (prefixo: string, d: DefRelativa): Kpi => {
    const def = defDe(prefixo, d)
    const linha: IndicadorRow | undefined = porId(aba.linhas, def.id)
    return montarKpi(linha, def, fechado)
  }

  const blocos = BLOCOS.map<BlocoDigital>(({ entidade, prefixo }) => ({
    entidade,
    prefixo,
    cards: CARDS.map((c) => ({
      id: `${prefixo}-${c.principal.sufixo}`,
      principal: kpi(prefixo, c.principal),
      secundario: c.secundario ? kpi(prefixo, c.secundario) : null,
    })),
    influenciadores: kpi(prefixo, INFLUENCIADORES),
  }))

  return { fechado, blocos }
}

/**
 * Frase de fechamento do slide de resultados.
 * A do Banco é a do deck original; a do Centro Cultural é montada a partir dos
 * próprios números — o deck não trazia uma, e afirmar algo que a planilha não
 * sustenta seria inventar conclusão.
 */
export function remateDoBloco(bloco: BlocoDigital): string {
  if (bloco.prefixo === 'DIG') {
    return 'O Banco ampliou sua presença por meio de vozes reconhecidas pelos próprios públicos da Amazônia.'
  }

  const publicacoes = bloco.cards.find((c) => c.id.endsWith('-03'))?.principal
  const criadores = bloco.influenciadores
  const partes: string[] = []
  if (publicacoes?.valor != null) partes.push(`${publicacoes.formatado} publicações`)
  if (criadores.valor != null) partes.push(`${criadores.formatado} criadores ativados`)

  return partes.length > 0
    ? `${partes.join(' e ')} nos canais próprios do Centro Cultural no período.`
    : 'Canais próprios do Centro Cultural Banco da Amazônia.'
}

/**
 * Mesma estrutura, sem números — o layout já se monta com os rótulos certos
 * enquanto a planilha não responde.
 */
export const BLOCOS_VAZIOS: BlocoDigital[] = BLOCOS.map(({ entidade, prefixo }) => ({
  entidade,
  prefixo,
  cards: CARDS.map((c) => ({
    id: `${prefixo}-${c.principal.sufixo}`,
    principal: kpiVazio(defDe(prefixo, c.principal)),
    secundario: c.secundario
      ? kpiVazio(defDe(prefixo, c.secundario), c.secundario.sufixo === '05' ? 'percentual' : 'inteiro')
      : null,
  })),
  influenciadores: kpiVazio(defDe(prefixo, INFLUENCIADORES)),
}))
