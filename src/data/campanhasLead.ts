/**
 * Campanhas com objetivo de geração de lead — base do CPL.
 *
 * POR QUE ISTO EXISTE
 *
 * PUB-01 (leads) tem na própria planilha a ressalva "So Capital de Giro e
 * Custeio Agricola": só essas campanhas geram lead. Mas nem todo o dinheiro
 * dessas campanhas compra lead — elas também têm TV, rádio e DOOH, que fazem
 * alcance e não convertem em formulário. O CPL honesto divide SÓ a verba de
 * compra por lead pelos leads que ela gerou.
 *
 * Histórico: o CPL já dividiu a mídia inteira (PUB-07) pelos leads, depois o
 * valor integral dos PIs (com TV e DOOH, R$ 37,47). Os dois inflavam o custo.
 *
 * DE ONDE VEM
 *
 * Do dashboard de performance de cada campanha (consolidado por veículo:
 * Google Ads, Facebook, Instagram, LinkedIn…). Investimento e leads vêm da MESMA
 * tela, então numerador e denominador cobrem exatamente as mesmas compras.
 * Por isso o denominador aqui NÃO é o PUB-01 da planilha: misturar os leads de
 * uma fonte com o investimento de outra é o erro que este arquivo existe para
 * evitar.
 *
 * COMO ATUALIZAR
 *
 * Copie investimento e leads do dashboard para cada campanha, acrescente as
 * etapas novas e suba ATUALIZADO_EM. O CPL do slide se recalcula sozinho.
 */

export interface CampanhaLead {
  nome: string
  /** etapa da campanha, quando ela roda em fases */
  etapa?: string
  /** verba de compra por lead (mídia de performance), em reais */
  investimento: number
  /** leads gerados por essa verba, no mesmo dashboard */
  leads: number
}

/** Data em que os números abaixo foram copiados do dashboard. */
export const ATUALIZADO_EM = '18/11/2026'

export const CAMPANHAS_LEAD: CampanhaLead[] = [
  { nome: 'Capital de Giro', etapa: 'etapa 1', investimento: 190_314.87, leads: 40_546 },
  { nome: 'Capital de Giro', etapa: 'etapa 2', investimento: 124_450.83, leads: 13_922 },
  { nome: 'Custeio Agrícola', investimento: 429_220.55, leads: 28_255 },
]

export const INVESTIMENTO_LEAD = CAMPANHAS_LEAD.reduce((s, c) => s + c.investimento, 0)
export const LEADS_CAMPANHAS = CAMPANHAS_LEAD.reduce((s, c) => s + c.leads, 0)

/** CPL de uma campanha; null se ela ainda não gerou lead. */
export function cplDa(c: CampanhaLead): number | null {
  return c.leads > 0 ? c.investimento / c.leads : null
}
