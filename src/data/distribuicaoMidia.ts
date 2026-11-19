/**
 * Distribuição de mídia por meio em 2026 — investimento e entrega de cada meio.
 * Mesma lâmina e mesmas regras do deck de 2025 (apresentacao-2025-copac).
 *
 * DE ONDE VEM
 *
 * Do consolidado de veiculação por meio (tabela MEIO × Investimento ×
 * Impressões/Cliques/Impactos) enviado pelo Núcleo de Mídia em 19/11/2026. Ainda
 * não há rota da API para ela, então os valores estão transcritos aqui. Total
 * geral da tabela: R$ 14.265.612,12 — conferido por `npm run conferir`.
 *
 * QUATRO REGRAS
 *
 * 1. **Redes sociais entram em Internet.** A tabela traz as duas linhas
 *    separadas (redes com R$ 0,00); o investimento é somado em Internet.
 * 2. **A entrega de Internet vem da planilha de fechamento**, não da tabela:
 *    são as impressões digitais de PUB-02, o mesmo número dos outros slides.
 *    A tabela traz 61,0 Mi (internet) + 13,0 Mi (redes), outra base de medição.
 * 3. **Cada meio tem a sua unidade de entrega** — inserções, impressões,
 *    impactos, publicações. Somar entregas de meios diferentes não faz sentido,
 *    por isso não há "total de entrega" (o "169 Mi" da tabela mistura tudo).
 * 4. **O total por meio fecha com o investimento de mídia executado (PUB-07).**
 *    O slide de Investimento lê o PUB-07 da planilha; os dois slides têm que
 *    mostrar o mesmo total. Quando a tabela soma menos, a diferença entra no
 *    meio TV (decisão da área, nov/2026). O ajuste é calculado na hora, a partir
 *    da planilha ao vivo — não é digitado — então acompanha o PUB-07 sozinho.
 *    Se a tabela somar MAIS que o executado, nada é ajustado e a nota avisa.
 *
 * Os três DOOH (rua, aeroporto e shopping) ficam separados, como na tabela.
 */

export type UnidadeEntrega = 'inserções' | 'impressões' | 'impactos' | 'publicações'

export interface MeioDef {
  meio: string
  investimento: number
  /** entrega da tabela; null = sem entrega registrada */
  entrega: number | null
  unidade: UnidadeEntrega
  /** a entrega vem do PUB-02 da planilha (Internet), não da tabela */
  entregaDaPlanilha?: boolean
}

/** Meio que absorve a diferença até o investimento executado (regra 4). */
export const MEIO_AJUSTE = 'TV'

export const MEIOS_2026: MeioDef[] = [
  // Internet + Redes sociais (R$ 7.460.246,04 + R$ 0,00)
  {
    meio: 'Internet',
    investimento: 7_460_246.04 + 0,
    entrega: null,
    unidade: 'impressões',
    entregaDaPlanilha: true,
  },
  { meio: 'DOOH', investimento: 2_173_626.14, entrega: 63_583_673, unidade: 'impactos' },
  { meio: 'TV aberta', investimento: 1_605_444.89, entrega: 3_558, unidade: 'inserções' },
  // a tabela traz entrega 0 para TV: sem inserções registradas, não "zero inserções"
  { meio: 'TV', investimento: 1_213_877.15, entrega: null, unidade: 'inserções' },
  { meio: 'Jornal', investimento: 586_090.57, entrega: 481, unidade: 'publicações' },
  { meio: 'Rádio', investimento: 413_864.05, entrega: 3_273, unidade: 'inserções' },
  { meio: 'DOOH aeroporto', investimento: 296_842.05, entrega: 20_797_153, unidade: 'impactos' },
  { meio: 'TV fechada', investimento: 280_165.93, entrega: 505, unidade: 'inserções' },
  { meio: 'DOOH shopping', investimento: 197_178.74, entrega: 10_387_916, unidade: 'impactos' },
  { meio: 'TV segmentada', investimento: 38_276.56, entrega: 117, unidade: 'inserções' },
]

/** "Total geral" da tabela-fonte, para conferência. */
export const TOTAL_TABELA = 14_265_612.12

export interface Meio extends MeioDef {
  /** participação no investimento total, de 0 a 1 */
  participacao: number
  /** parte do investimento que é ajuste até o PUB-07 (só no MEIO_AJUSTE) */
  ajuste: number
}

export interface DistribuicaoMidia {
  meios: Meio[]
  /** total exibido: igual ao PUB-07 quando houve ajuste */
  total: number
  /** soma da tabela, antes do ajuste */
  totalTabela: number
  /** quanto foi somado ao MEIO_AJUSTE para fechar com o PUB-07 */
  ajuste: number
  /** tabela acima do executado: não dá para fechar somando (diferença, em R$) */
  excedente: number
}

/**
 * Monta a distribuição: encaixa as impressões de PUB-02 em Internet e, se a
 * tabela somar menos que o investimento executado, completa a diferença em TV.
 */
export function montarDistribuicao(
  impressoesInternet: number | null,
  investimentoExecutado: number | null,
): DistribuicaoMidia {
  const totalTabela = MEIOS_2026.reduce((s, m) => s + m.investimento, 0)

  // centavos inteiros: somas de float deixariam o total a 0,0000001 do PUB-07
  const centavos = (n: number) => Math.round(n * 100)
  const dif =
    investimentoExecutado == null ? 0 : centavos(investimentoExecutado) - centavos(totalTabela)
  const ajuste = dif > 0 ? dif / 100 : 0
  const excedente = dif < 0 ? -dif / 100 : 0
  const total = totalTabela + ajuste

  const meios = MEIOS_2026.map((m) => {
    const extra = m.meio === MEIO_AJUSTE ? ajuste : 0
    const investimento = m.investimento + extra
    return {
      ...m,
      investimento,
      entrega: m.entregaDaPlanilha ? impressoesInternet : m.entrega,
      ajuste: extra,
      participacao: total > 0 ? investimento / total : 0,
    }
  }).sort((a, b) => b.investimento - a.investimento)

  return { meios, total, totalTabela, ajuste, excedente }
}
