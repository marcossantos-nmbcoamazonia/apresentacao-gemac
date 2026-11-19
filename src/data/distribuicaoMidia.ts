/**
 * Distribuição de mídia por meio em 2026 — investimento e entrega de cada meio.
 * Mesma lâmina e mesmas regras do deck de 2025 (apresentacao-2025-copac).
 *
 * DE ONDE VEM
 *
 * Do consolidado de veiculação por meio (tabela MEIO × Investimento ×
 * Impressões/Cliques/Impactos) enviado pelo Núcleo de Mídia em 19/11/2026. Ainda
 * não há rota da API para ela, então os valores estão transcritos aqui. Total
 * geral da tabela: R$ 11.568.107,34 — conferido por `npm run conferir`.
 *
 * TRÊS REGRAS
 *
 * 1. **Redes sociais entram em Internet.** A tabela traz as duas linhas
 *    separadas (redes com R$ 0,00); o investimento é somado em Internet.
 * 2. **A entrega de Internet vem da planilha de fechamento**, não da tabela:
 *    são as impressões digitais de PUB-02, o mesmo número dos outros slides.
 *    A tabela traz 61,0 Mi (internet) + 13,0 Mi (redes), outra base de medição.
 * 3. **Cada meio tem a sua unidade de entrega** — inserções, impressões,
 *    impactos, publicações. Somar entregas de meios diferentes não faz sentido,
 *    por isso não há "total de entrega" (o "169 Mi" da tabela mistura tudo).
 *
 * Os três DOOH (rua, aeroporto e shopping) ficam separados, como na tabela.
 */

export type UnidadeEntrega = 'inserções' | 'impressões' | 'impactos' | 'publicações'

export interface MeioDef {
  meio: string
  investimento: number
  /** null = vem da planilha de fechamento (Internet ← PUB-02) */
  entrega: number | null
  unidade: UnidadeEntrega
}

export const MEIOS_2026: MeioDef[] = [
  // Internet + Redes sociais (R$ 6.516.119,37 + R$ 0,00)
  { meio: 'Internet', investimento: 6_516_119.37 + 0, entrega: null, unidade: 'impressões' },
  { meio: 'DOOH', investimento: 1_634_125.18, entrega: 63_583_673, unidade: 'impactos' },
  { meio: 'TV aberta', investimento: 1_605_444.89, entrega: 3_558, unidade: 'inserções' },
  { meio: 'Jornal', investimento: 586_090.57, entrega: 481, unidade: 'publicações' },
  { meio: 'Rádio', investimento: 413_864.05, entrega: 3_273, unidade: 'inserções' },
  { meio: 'DOOH aeroporto', investimento: 296_842.05, entrega: 20_797_153, unidade: 'impactos' },
  { meio: 'TV fechada', investimento: 280_165.93, entrega: 505, unidade: 'inserções' },
  { meio: 'DOOH shopping', investimento: 197_178.74, entrega: 10_387_916, unidade: 'impactos' },
  { meio: 'TV segmentada', investimento: 38_276.56, entrega: 117, unidade: 'inserções' },
]

/** "Total geral" da tabela-fonte, para conferência. */
export const TOTAL_TABELA = 11_568_107.34

export interface Meio extends MeioDef {
  /** participação no investimento total, de 0 a 1 */
  participacao: number
  /** a entrega veio da planilha de fechamento, não da tabela */
  daPlanilha: boolean
}

export interface DistribuicaoMidia {
  meios: Meio[]
  total: number
}

/** Monta a distribuição, encaixando as impressões de PUB-02 em Internet. */
export function montarDistribuicao(impressoesInternet: number | null): DistribuicaoMidia {
  const total = MEIOS_2026.reduce((s, m) => s + m.investimento, 0)
  const meios = MEIOS_2026.map((m) => ({
    ...m,
    entrega: m.entrega ?? impressoesInternet,
    daPlanilha: m.entrega == null,
    participacao: total > 0 ? m.investimento / total : 0,
  })).sort((a, b) => b.investimento - a.investimento)
  return { meios, total }
}
