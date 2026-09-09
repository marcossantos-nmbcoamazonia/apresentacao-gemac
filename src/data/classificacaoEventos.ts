/**
 * PONTE TEMPORÁRIA — classificação dos eventos do 1S26.
 *
 * A coluna "Tipo" da aba 03 EVENTOS está inteiramente vazia hoje, mas é ela que
 * sustenta os totais que a COPAC apresenta ("21 Feiras", "16 Ações Diversas").
 * Sem nada no lugar dela, o slide mostraria só "37 eventos" e perderia o recorte
 * que a diretoria conhece.
 *
 * Então este mapa transcreve a classificação do documento oficial
 * "COPAC 2026 - 1S26.pdf", que agrupa exatamente estes eventos em FEIRAS (21) e
 * AÇÕES DIVERSAS (16). O vocabulário é o de PARAMETROS — Feira, Cultural,
 * Esportivo, Institucional — para que, no dia em que a COPAC preencher a coluna,
 * os valores coincidam e este arquivo simplesmente deixe de ser consultado.
 *
 * A planilha SEMPRE tem prioridade: ver classificarEvento() em eventos.ts.
 * Evento novo sem "Tipo" e fora deste mapa cai em "A classificar" e aparece
 * sinalizado no slide — é de propósito, para cobrar o preenchimento.
 *
 * Os IDs são estáveis: EV-001 é e continuará sendo a FEIRA NACIONAL DE MÁQUINAS.
 * Linhas novas recebem EV-047 em diante, não deslocam as existentes.
 */

export type TipoEvento = 'Feira' | 'Cultural' | 'Esportivo' | 'Institucional'

/** ID -> tipo, conforme o agrupamento do COPAC 2026 - 1S26. */
export const CLASSIFICACAO_1S26: Record<string, TipoEvento> = {
  // --- FEIRAS (21) — página "FEIRAS" do documento -----------------------------
  'EV-001': 'Feira', // FEIRA NACIONAL DE MÁQUINAS E TECNOLOGIAS
  'EV-002': 'Feira', // EXPOPIM
  'EV-003': 'Feira', // SHOW SAFRA
  'EV-004': 'Feira', // AGROCOM
  'EV-005': 'Feira', // 4ª FARM DAY DO GRUPO FAZENDÃO
  'EV-006': 'Feira', // INTERMODAL SOUTH AMERICA
  'EV-007': 'Feira', // PARECIS SUPERAGRO
  'EV-008': 'Feira', // NORTE SHOW 2026
  'EV-009': 'Feira', // 27ª EXPO CONCEIÇÃO DO ARAGUAIA
  'EV-010': 'Feira', // AGROTINS
  'EV-011': 'Feira', // AGROBALSAS
  'EV-012': 'Feira', // FEIRA DA INDÚSTRIA DO PARÁ
  'EV-013': 'Feira', // FENETEC
  'EV-014': 'Feira', // RONDONIA RURAL SHOW
  'EV-015': 'Feira', // 51ª EXPO AGRO GURUPI
  'EV-016': 'Feira', // EXPO POLO CARAJÁS
  'EV-017': 'Feira', // FEIRA AGROPECUARIA DE NHAMUNDA
  'EV-018': 'Feira', // EXPO BRASIL TOCANTINS
  'EV-019': 'Feira', // 58ª EXPOARA + CAVALGADA
  'EV-020': 'Feira', // FEIRA AGROPECUÁRIA DE JACUNDÁ
  'EV-021': 'Feira', // FESTIVAL DE CHOCOLATE DO XINGU

  // --- AÇÕES DIVERSAS (16) — página "AÇÕES DIVERSAS" -------------------------
  // O documento junta esportivo e institucional num grupo só; aqui ficam
  // separados porque é assim que a planilha vai classificá-los.
  'EV-022': 'Institucional', // FÓRUM ECONÔMICO MUNDIAL
  'EV-023': 'Institucional', // AÇÕES DE DIVULGAÇÃO DO ESTUDO SOBRE FNO
  'EV-024': 'Institucional', // ELIDE + MELHORES DA AMAZÔNIA
  'EV-025': 'Esportivo', //     CORRIDA DAS ESTAÇÕES - OUTONO – PALMAS
  'EV-026': 'Institucional', // WORKSHOP DE GESTÃO ESTRATÉGICA DAS MARCAS
  'EV-027': 'Esportivo', //     CORRIDA DAS ESTAÇÕES - OUTONO – BELÉM
  'EV-028': 'Institucional', // FÓRUM DE INTEGRAÇÃO E DESENVOLVIMENTO REGIONAL
  'EV-029': 'Institucional', // KICK OFF DE MODERNIZAÇÃO DA CONTABILIDADE
  'EV-030': 'Institucional', // WEBCONFERÊNCIA DE RESULTADOS - 4T25
  'EV-031': 'Esportivo', //     CORRIDA DAS ESTAÇÕES - OUTONO – MANAUS
  'EV-032': 'Institucional', // VI ENAM
  'EV-033': 'Institucional', // RESULTADOS - 1T26
  'EV-034': 'Esportivo', //     ECO RUN – BELÉM
  'EV-035': 'Institucional', // ENTREGA DO CARTÃO VERDINHO AOS CLIENTES INTERNOS
  'EV-036': 'Esportivo', //     CORRIDA DAS ESTAÇÕES - INVERNO – MANAUS
  'EV-037': 'Esportivo', //     CORRIDA DAS ESTAÇÕES - INVERNO - PALMAS

  // EV-038..EV-046 não entram aqui: são patrocínios aprovados, sem data de
  // realização, e eventos.ts os separa pela própria planilha (investimento
  // preenchido + mês em branco).
}

/** Normaliza o que vier digitado na coluna "Tipo" para o vocabulário canônico. */
export function normalizarTipo(bruto: string): TipoEvento | null {
  const k = bruto
    .normalize('NFD')
    .toLowerCase()
    .replace(/[^a-z]/g, '')
  if (k === '') return null
  if (k.startsWith('feira')) return 'Feira'
  if (k.startsWith('cultural')) return 'Cultural'
  if (k.startsWith('esportiv')) return 'Esportivo'
  if (k.startsWith('institucional')) return 'Institucional'
  return null
}
