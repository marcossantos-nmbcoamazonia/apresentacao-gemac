/**
 * Campanhas com objetivo de geração de lead — base do CPL.
 *
 * POR QUE ISTO EXISTE
 *
 * PUB-01 (leads) tem na própria planilha a ressalva "So Capital de Giro e
 * Custeio Agricola": só essas campanhas geram lead. O CPL vinha dividindo o
 * investimento de mídia INTEIRO (PUB-07, R$ 11,8 Mi — institucional, always on,
 * patrocínios e tudo mais) por esses leads, o que inflava o custo em mais de
 * quatro vezes. O numerador tem que cobrir as mesmas campanhas que o
 * denominador.
 *
 * DE ONDE VEM
 *
 * A planilha de fechamento não tem investimento por campanha — ela só tem o
 * total mensal. Os valores abaixo foram transcritos da planilha de PIs
 * aprovados, coluna de valor autorizado (a primeira, verde), que é a única
 * preenchida nas três linhas: no Custeio a coluna de executado está em branco.
 *
 * COMO ATUALIZAR
 *
 * Campanha nova com meta de lead entra aqui, com o número do PI. No dia em que
 * a COPAC criar uma linha de "investimento em campanhas de lead" na aba
 * 01 PUBLICIDADE, este arquivo sai e o cálculo passa a ler a planilha.
 */

export interface CampanhaLead {
  /** número do PI, para auditoria contra a planilha de aprovados */
  pi: string
  nome: string
  /** meios contratados, como constam no PI */
  meios: string
  /** valor autorizado, em reais */
  investimento: number
  agencia: string
}

/**
 * Até que mês de fechamento esta lista foi conferida.
 *
 * É o contrapeso de ter o numerador chumbado e o denominador vivo: os leads
 * vêm da planilha e avançam sozinhos a cada mês, enquanto a lista abaixo só
 * anda quando alguém a edita. Sem esta marca, um mês novo entraria com leads a
 * mais e investimento de menos, e o CPL cairia por um motivo falso.
 *
 * `analisarPublicidade` compara isto com o mês fechado e avisa no slide quando
 * a planilha passa à frente. Ao conferir campanhas novas, suba o índice.
 */
export const CONFERIDO_ATE = { indice: 7, nome: 'Ago', ano: 2026 } // 0 = Jan

/** Conferido em 14/10/2026 contra a planilha de PIs aprovados. */
export const CAMPANHAS_LEAD: CampanhaLead[] = [
  {
    pi: '2026/16',
    nome: 'Campanha Capital de Giro 2026',
    meios: 'TV, internet e mídia exterior',
    investimento: 1_066_482.16,
    agencia: 'Cálix',
  },
  {
    pi: '2026/18',
    nome: 'Google · Campanha Capital de Giro 2026',
    meios: 'Internet',
    investimento: 107_811.0,
    agencia: 'Cálix',
  },
  {
    pi: '2026/15',
    nome: 'Campanha Custeio',
    meios: 'TV, rádio e internet',
    investimento: 1_612_899.03,
    agencia: 'Escala',
  },
]

export const INVESTIMENTO_LEAD = CAMPANHAS_LEAD.reduce((s, c) => s + c.investimento, 0)

/** "2026/15, 2026/16 e 2026/18" — para a nota de rodapé do slide. */
export function pisDasCampanhas(): string {
  const pis = CAMPANHAS_LEAD.map((c) => c.pi).sort()
  if (pis.length <= 1) return pis.join('')
  return `${pis.slice(0, -1).join(', ')} e ${pis[pis.length - 1]}`
}
