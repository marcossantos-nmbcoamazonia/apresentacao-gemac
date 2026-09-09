/**
 * Parser da aba "03 EVENTOS".
 *
 * Esta aba NÃO segue o formato das demais. Enquanto 01 PUBLICIDADE e 02 DIGITAL
 * são matrizes indicador × mês, aqui cada linha é um evento:
 *
 *   ID | Mes | Nome do evento | Tipo | UF | Municipio | Publico presente |
 *   Negocios prospectados (R$) | Investimento (R$) | Proprietario? (S/N) |
 *   Responsavel | Evidencia (link) | Observacao
 *
 * Por isso parseAba() não serve — ela procuraria colunas Jan..Dez que não
 * existem e devolveria linhas vazias. Os totais da apresentação (21 feiras,
 * 16 ações diversas) passam a ser contagem sobre estas linhas.
 */
import { MESES, MESES_EXTENSO } from './parseSheet'

export interface EventoRow {
  id: string
  /** como veio da planilha: "Março" */
  mesTexto: string
  /** 0 = Jan … 11 = Dez; -1 quando a célula está vazia ou ilegível */
  mesIndice: number
  nome: string
  /** vocabulário de PARAMETROS: Feira | Cultural | Esportivo | Institucional */
  tipo: string
  uf: string
  municipio: string
  publico: number | null
  negocios: number | null
  investimento: number | null
  /** "S"/"N" da coluna "Proprietario? (S/N)"; null quando em branco */
  proprietario: boolean | null
  responsavel: string
  evidencia: string
  observacao: string
}

export interface AbaEventos {
  /** "EVENTOS E FEIRAS   |   area: COPAC" */
  titulo: string
  eventos: EventoRow[]
  /** linhas EV-xxx que existem na planilha mas ainda não têm nome preenchido */
  vazias: number
}

function norm(s: string): string {
  return s
    .normalize('NFD')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

const cel = (linha: string[] | undefined, i: number): string =>
  i >= 0 ? (linha?.[i] ?? '').trim() : ''

/** "R$ 1.980.000,00" -> 1980000 · "" e "-" -> null */
function valorBR(bruto: string): number | null {
  const limpo = bruto
    .replace(/ /g, ' ')
    .replace(/R\$/gi, '')
    .trim()
  if (limpo === '' || limpo === '-' || limpo === '—') return null
  const n = Number(limpo.replace(/\./g, '').replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

/**
 * Índice do mês a partir do texto da planilha. A COPAC escreve por extenso
 * ("Março"), mas a forma curta é aceita para o caso de alguém digitar "Mar".
 */
const INDICE_POR_MES = new Map<string, number>(
  MESES.flatMap((m, i) => [
    [norm(MESES_EXTENSO[m]), i] as [string, number],
    [norm(m), i] as [string, number],
  ]),
)

export function mesPorExtenso(texto: string): number {
  const k = norm(texto)
  if (k === '') return -1
  return INDICE_POR_MES.get(k) ?? -1
}

/**
 * Em EV-025 o mês vazou para dentro do nome na digitação:
 * "CORRIDA DAS ESTAÇÕES - OUTONO – PALMAS Março". Remove o sufixo só quando ele
 * repete o mês da própria linha — assim um evento que legitimamente termine com
 * nome de mês continua intacto.
 */
function limparNome(nome: string, mesTexto: string): string {
  const mes = mesTexto.trim()
  if (mes === '') return nome
  const sufixo = new RegExp(`\\s+${mes}\\s*$`, 'i')
  return nome.replace(sufixo, '').trim()
}

export function parseEventos(values: string[][]): AbaEventos {
  const iCabecalho = values.findIndex((l) => norm(l?.[0] ?? '') === 'id')
  if (iCabecalho < 0) {
    throw new Error('Cabeçalho não encontrado: nenhuma linha começa com "ID"')
  }

  const cabecalho = values[iCabecalho].map(norm)
  const acha = (teste: (h: string) => boolean) => cabecalho.findIndex(teste)

  const col = {
    id: acha((h) => h === 'id'),
    mes: acha((h) => h === 'mes'),
    nome: acha((h) => h.startsWith('nomedoevento')),
    tipo: acha((h) => h === 'tipo'),
    uf: acha((h) => h === 'uf'),
    municipio: acha((h) => h.startsWith('municipio')),
    publico: acha((h) => h.startsWith('publico')),
    negocios: acha((h) => h.startsWith('negocios')),
    investimento: acha((h) => h.startsWith('investimento')),
    proprietario: acha((h) => h.startsWith('proprietario')),
    responsavel: acha((h) => h.startsWith('responsavel')),
    evidencia: acha((h) => h.startsWith('evidencia')),
    observacao: acha((h) => h.startsWith('observacao')),
  }

  const eventos: EventoRow[] = []
  let vazias = 0

  for (let i = iCabecalho + 1; i < values.length; i++) {
    const linha = values[i]
    const id = cel(linha, col.id)
    if (!/^[A-Z]{2,4}-\d+$/.test(id)) continue

    const nome = cel(linha, col.nome)
    // a aba já vem com EV-047..EV-200 reservados e em branco
    if (nome === '') {
      vazias++
      continue
    }

    const mesTexto = cel(linha, col.mes)
    const sn = cel(linha, col.proprietario).toUpperCase()

    eventos.push({
      id,
      mesTexto,
      mesIndice: mesPorExtenso(mesTexto),
      nome: limparNome(nome, mesTexto),
      tipo: cel(linha, col.tipo),
      uf: cel(linha, col.uf).toUpperCase(),
      municipio: cel(linha, col.municipio),
      publico: valorBR(cel(linha, col.publico)),
      negocios: valorBR(cel(linha, col.negocios)),
      investimento: valorBR(cel(linha, col.investimento)),
      proprietario: sn === 'S' ? true : sn === 'N' ? false : null,
      responsavel: cel(linha, col.responsavel),
      evidencia: cel(linha, col.evidencia),
      observacao: cel(linha, col.observacao),
    })
  }

  const titulo =
    values
      .slice(0, iCabecalho)
      .flat()
      .find((c) => (c ?? '').trim().length > 0)
      ?.trim() ?? ''

  return { titulo, eventos, vazias }
}
