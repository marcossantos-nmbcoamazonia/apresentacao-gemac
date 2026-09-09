/**
 * Confere, pelo terminal, o que os slides vão mostrar — sem abrir o browser.
 *
 *     npm run conferir
 *
 * Usa exatamente as mesmas funções da aplicação (src/data/*.ts), então qualquer
 * mudança na planilha que quebre o parse ou desloque o mês de fechamento aparece
 * aqui. Os valores do deck original de 01/09/2026 ficam como referência.
 */
import { parseAba } from '../src/api/parseSheet'
import { parseEventos } from '../src/api/parseEventos'
import { ABA_PUBLICIDADE, montarPublicidade } from '../src/data/publicidade'
import { ABA_DIGITAL, montarDigital, remateDoBloco } from '../src/data/digital'
import { ABA_EVENTOS, montarEventos, totalAcoesDiversas } from '../src/data/eventos'
import type { Kpi } from '../src/data/kpis'

const BASE = process.env.VITE_API_BASE ?? 'https://nmbcoamazonia-api.vercel.app'
const SHEET = process.env.VITE_SHEET_ID ?? '12vC5uRnSYAzqlBVKBO8AsQCNuvoVNZkRV8e-1kSAZPg'

/** Números impressos no deck de 01/09/2026, para conferência. */
const REFERENCIA_DECK: Record<string, string> = {
  'PUB-01': '56.775',
  'PUB-02': '317 Mi',
  'PUB-03': '867 Mil',
  'PUB-04': '648 Mi',
  'PUB-05': '18 Mi',
}

const REGUA = '─'.repeat(100)
let divergencias = 0

async function valores(aba: string): Promise<string[][]> {
  const r = await fetch(`${BASE}/google/sheets/${SHEET}/data?range=${encodeURIComponent(aba)}`)
  if (!r.ok) throw new Error(`API respondeu ${r.status} para "${aba}"`)
  const json = (await r.json()) as { success: boolean; data?: { values?: string[][] } }
  if (!json.success || !json.data?.values) throw new Error(`Resposta sem dados para "${aba}"`)
  return json.data.values
}

async function buscar(aba: string) {
  return parseAba(await valores(aba))
}

function linhaKpi(k: Kpi, indent = ''): void {
  const ref = REFERENCIA_DECK[k.id]
  const bate = ref ? (ref === k.formatado ? 'igual ao deck' : `DIFERE do deck (${ref})`) : ''
  if (ref && ref !== k.formatado) divergencias++

  const agregado = k.agregacao === 'media' ? 'média ' : ''
  const varTxt = k.variacaoTexto ? `${k.variacaoTexto} ${k.comparacao}` : 'sem base de comparação'

  console.log(
    `${indent}${k.id.padEnd(8)}${k.formatado.padEnd(13)}` +
      `${(agregado + k.valorCheio).padStart(22)}   ` +
      `${varTxt.padEnd(26)}${bate}`,
  )
}

// ============================ 01 PUBLICIDADE ================================
const abaPub = await buscar(ABA_PUBLICIDADE)
const pub = montarPublicidade(abaPub)
if (!pub) throw new Error('Nenhum mês com dado em 01 PUBLICIDADE')

console.log(`\n${abaPub.titulo}`)
console.log(`MÊS FECHADO ...... ${pub.fechado.curto}   (período: ${pub.fechado.periodo})`)
console.log(`indicadores ...... ${abaPub.linhas.map((l) => l.id).join(', ')}`)
console.log(REGUA)
for (const k of [...pub.kpis, ...pub.investimento]) {
  linhaKpi(k)
  if (k.semDadoNoMes) {
    console.log(`        ↳ sem dado em ${pub.fechado.nome}; série vai até ${k.ultimoMes ?? '—'}`)
  }
}
console.log(`\nPUB-09 · ${pub.produtos.length} produtos únicos no período`)
console.log(`PUB-10 · praças: ${pub.pracas || '(vazio)'}`)

// ============================== 02 DIGITAL ==================================
const abaDig = await buscar(ABA_DIGITAL)
const dig = montarDigital(abaDig)
if (!dig) throw new Error('Nenhum mês com dado em 02 DIGITAL')

console.log(`\n\n${abaDig.titulo}`)
console.log(`MÊS FECHADO ...... ${dig.fechado.curto}   (período: ${dig.fechado.periodo})`)
console.log(`indicadores ...... ${abaDig.linhas.map((l) => l.id).join(', ')}`)

for (const bloco of dig.blocos) {
  console.log(`\n  ${bloco.entidade.toUpperCase()}  (${bloco.prefixo}-*)`)
  console.log(`  ${REGUA.slice(0, 98)}`)
  for (const card of bloco.cards) {
    linhaKpi(card.principal, '  ')
    if (card.secundario) linhaKpi(card.secundario, '    apoio ')
    if (card.principal.semDadoNoMes && card.principal.ultimoMes) {
      console.log(
        `          ↳ sem dado em ${dig.fechado.nome}; série vai até ${card.principal.ultimoMes}`,
      )
    }
  }
  linhaKpi(bloco.influenciadores, '  ')
  console.log(`  remate: ${remateDoBloco(bloco)}`)
}

// ============================== 03 EVENTOS ==================================
const abaEvt = parseEventos(await valores(ABA_EVENTOS))
const evt = montarEventos(abaEvt, pub.fechado.ano)
if (!evt) throw new Error('Nenhum evento com nome em 03 EVENTOS')

console.log(`\n\n${abaEvt.titulo}`)
console.log(`PERÍODO .......... ${evt.periodo}`)
console.log(
  `registros ........ ${abaEvt.eventos.length} com nome · ${abaEvt.vazias} linhas reservadas em branco`,
)
console.log(REGUA)
console.log(`  Feiras realizadas ....... ${String(evt.feiras.length).padStart(3)}`)
console.log(
  `  Ações diversas .......... ${String(totalAcoesDiversas(evt)).padStart(3)}` +
    `   (${evt.esportivos.length} esportivas · ${evt.institucionais.length} institucionais)`,
)
if (evt.culturais.length) console.log(`  Culturais ............... ${evt.culturais.length}`)
console.log(`  Projetos aprovados ...... ${String(evt.projetos.length).padStart(3)}`)
console.log(`  Investimento aprovado ... ${evt.investimentoCheio}`)

if (evt.usouDocumento) {
  console.log(
    '\n  AVISO: a coluna "Tipo" está vazia — a classificação veio da ponte transcrita\n' +
      '  do COPAC 2026 - 1S26 (src/data/classificacaoEventos.ts). Preencher "Tipo" na\n' +
      '  planilha faz a ponte deixar de ser usada.',
  )
}
if (evt.aClassificar.length) {
  console.log(`  ${evt.aClassificar.length} evento(s) sem tipo e fora da ponte:`)
  for (const e of evt.aClassificar) console.log(`      ${e.id} ${e.nome}`)
}

console.log('\n  Lacunas obrigatórias da própria aba:')
for (const p of [evt.publico, evt.negocios]) {
  console.log(`    ${p.rotulo.padEnd(24)} ${p.preenchidos}/${p.esperados} preenchidos → ${p.formatado}`)
}
console.log(`    ${'UF'.padEnd(24)} ${evt.ufs.length} informada(s)`)

console.log('\n  Agenda:')
for (const g of evt.porMes) {
  console.log(`    ${g.extenso.padEnd(10)} ${String(g.eventos.length).padStart(2)} eventos`)
}

if (pub.fechado.indice !== dig.fechado.indice) {
  console.log(
    `\nATENÇÃO: as abas fecharam em meses diferentes — Publicidade até ${pub.fechado.nome}, ` +
      `Digital até ${dig.fechado.nome}. A pílula de status acompanha o slide em tela.`,
  )
}

console.log(
  divergencias === 0
    ? '\nTodos os KPIs de referência batem com o deck de 01/09/2026.'
    : `\n${divergencias} KPI(s) divergem do deck de 01/09/2026 — esperado se a planilha avançou de mês.`,
)
