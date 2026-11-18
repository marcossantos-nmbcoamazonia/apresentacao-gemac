/**
 * Confere, pelo terminal, o que os slides vão mostrar — sem abrir o browser.
 *
 *     npm run conferir
 *
 * Usa exatamente as mesmas funções da aplicação (src/data/*.ts), então qualquer
 * mudança na planilha que quebre o parse, desloque o mês de fechamento ou mova
 * uma métrica derivada aparece aqui. Os valores do deck original de 01/09/2026
 * ficam como referência.
 */
import { parseAba } from '../src/api/parseSheet'
import { ABA_PUBLICIDADE, montarPublicidade } from '../src/data/publicidade'
import type { Kpi } from '../src/data/kpis'
import type { SerieMensal } from '../src/data/publicidadeAnalise'
import { abaDoAno, montarComparativo } from '../src/data/comparativo'
import {
  ABA_INFLUENCIA,
  PLANILHA_INFLUENCIA,
  parseInfluencia,
  type MetricaInfluencia,
} from '../src/data/influencia'

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

const REGUA = '─'.repeat(92)
const br = (n: number, casas = 0) =>
  new Intl.NumberFormat('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
    .format(n)

let divergencias = 0

async function buscarAba(range: string, planilha = SHEET): Promise<string[][]> {
  const r = await fetch(`${BASE}/google/sheets/${planilha}/data?range=${encodeURIComponent(range)}`)
  if (!r.ok) throw new Error(`API respondeu ${r.status} para "${range}"`)
  const json = (await r.json()) as { success: boolean; data?: { values?: string[][] } }
  if (!json.success || !json.data?.values) throw new Error(`Resposta sem dados para "${range}"`)
  return json.data.values
}

const aba = parseAba(await buscarAba(ABA_PUBLICIDADE))
const pub = montarPublicidade(aba)
if (!pub) throw new Error('Nenhum mês com dado em 01 PUBLICIDADE')
const a = pub.analise

console.log(`\n${aba.titulo}`)
console.log(`MÊS FECHADO ...... ${pub.fechado.curto}   (período: ${pub.fechado.periodo})`)

// ------------------------------- acumulados ---------------------------------
console.log(`\nACUMULADO DO PERÍODO`)
console.log(REGUA)
for (const k of [...pub.kpis, ...pub.investimento] as Kpi[]) {
  const ref = REFERENCIA_DECK[k.id]
  const bate = ref ? (ref === k.formatado ? 'igual ao deck' : `DIFERE do deck (${ref})`) : ''
  if (ref && ref !== k.formatado) divergencias++
  console.log(
    `  ${k.id.padEnd(8)}${k.rotulo.padEnd(34)}${k.formatado.padStart(12)}` +
      `${k.valorCheio.padStart(20)}   ${bate}`,
  )
}

// --------------------------------- séries -----------------------------------
function linhaSerie(s: SerieMensal) {
  const pontos = s.pontos
    .map((p) => (p.valor == null ? `${p.mes} —` : `${p.mes} ${br(p.valor)}`))
    .join(' · ')
  console.log(`\n  ${s.rotulo}  (total ${br(s.total)})`)
  console.log(`    ${pontos}`)
  if (s.pico) console.log(`    pico: ${s.pico.mes} com ${br(s.pico.valor!)}`)
  if (s.lacunas.length) console.log(`    SEM DADO em: ${s.lacunas.join(', ')}`)
}

console.log(`\n\nSÉRIE MENSAL`)
console.log(REGUA)
for (const s of Object.values(a.series)) linhaSerie(s)

// ------------------------------- derivadas ----------------------------------
console.log(`\n\nMÉTRICAS DERIVADAS`)
console.log(REGUA)
for (const d of [a.ctr, a.cpl, a.cpm]) {
  console.log(`  ${d.rotulo.padEnd(16)}${d.formatado.padStart(14)}    ${d.conta}`)
}

console.log(`\n  Alcance total ....... ${br(a.alcanceTotal).padStart(16)}`)
for (const p of a.alcancePartes) {
  console.log(
    `      ${p.rotulo.padEnd(22)}${br(p.valor).padStart(16)}  ${(p.participacao * 100).toFixed(1)}%`,
  )
}

console.log(`\n  Investimento total .. ${('R$ ' + br(a.investimentoTotal)).padStart(16)}`)
for (const p of a.investimentoPartes) {
  console.log(
    `      ${p.rotulo.padEnd(22)}${('R$ ' + br(p.valor)).padStart(16)}  ${(p.participacao * 100).toFixed(1)}%`,
  )
}

console.log(`\n  CTR mês a mês:`)
console.log(
  '      ' +
    a.ctrMensal
      .map((p) => `${p.mes} ${p.valor == null ? '—' : p.valor.toFixed(2) + '%'}`)
      .join(' · '),
)

// -------------------------------- produtos ----------------------------------
console.log(`\n\nPRODUTOS (recorrência em ${pub.fechado.indice + 1} meses)`)
console.log(REGUA)
for (const faixa of ['constante', 'recorrente', 'pontual'] as const) {
  const doFaixa = a.produtos.filter((p) => p.faixa === faixa)
  if (!doFaixa.length) continue
  console.log(`  ${faixa.toUpperCase()} (${doFaixa.length})`)
  for (const p of doFaixa) console.log(`      ${String(p.meses).padStart(2)}/8  ${p.nome}`)
}

console.log(`\nPRAÇAS: ${pub.pracas}`)
console.log(`UFs derivadas (${a.ufs.length}): ${a.ufs.join(' · ')}`)

// -------------------------------- ressalvas ---------------------------------
console.log(`\n\nRESSALVAS A EXIBIR NO SLIDE`)
console.log(REGUA)
const ressalvas: string[] = []
for (const s of Object.values(a.series)) {
  if (s.lacunas.length) ressalvas.push(`${s.rotulo}: sem dado em ${s.lacunas.join(', ')}`)
}
// valor isolado ordens de grandeza abaixo dos vizinhos = provável erro de digitação
for (const s of Object.values(a.series)) {
  const v = s.pontos.filter((p) => p.valor != null).map((p) => p.valor!)
  if (v.length < 3) continue
  const mediana = [...v].sort((x, y) => x - y)[Math.floor(v.length / 2)]
  for (const p of s.pontos) {
    if (p.valor != null && p.valor > 0 && mediana / p.valor > 100) {
      ressalvas.push(`${s.rotulo}: ${p.mes} = ${br(p.valor)}, ${Math.round(mediana / p.valor)}x abaixo da mediana`)
    }
  }
}
for (const x of ressalvas) console.log(`  · ${x}`)

console.log(
  divergencias === 0
    ? '\nTodos os KPIs de referência batem com o deck de 01/09/2026.\n'
    : `\n${divergencias} KPI(s) divergem do deck — esperado se a planilha avançou de mês.\n`,
)

// ------------------------- base do CPL (lista chumbada) ---------------------
console.log(`\nBASE DO CPL — campanhas com meta de lead`)
console.log(REGUA)
for (const c of a.campanhasLead) {
  console.log(`  PI ${c.pi.padEnd(9)}${('R$ ' + br(c.investimento, 2)).padStart(18)}  ${c.nome} (${c.agencia})`)
}
console.log(`  ${''.padEnd(9)}${('R$ ' + br(a.investimentoLead, 2)).padStart(18)}  TOTAL`)
if (a.leadDesatualizado) {
  console.log(
    `\n  ATENÇÃO: lista conferida até ${a.leadConferidoAte}, planilha fechou ${pub.fechado.curto}.\n` +
      `  Os leads do mês novo entram no CPL mas o investimento dele não — o CPL está otimista.\n` +
      `  Confira os PIs do período e atualize src/data/campanhasLead.ts (inclusive CONFERIDO_ATE).`,
  )
}

// --------------------------- comparativo anual ------------------------------
const nomeAnterior = abaDoAno(ABA_PUBLICIDADE, aba.ano - 1)
const abaAnterior = parseAba(await buscarAba(nomeAnterior))
const comp = montarComparativo(aba, abaAnterior, pub.fechado)

console.log(`

COMPARATIVO ${comp.periodo}: ${comp.anoAtual} × ${comp.anoAnterior}   (aba "${nomeAnterior}")`)
console.log(REGUA)
if (abaAnterior.ano !== aba.ano - 1) {
  console.log(`  ATENÇÃO: a aba "${nomeAnterior}" traz o acumulado de ${abaAnterior.ano}.`)
}
for (const l of comp.linhas) {
  const base = (m: number) => (m < comp.mesesPeriodo ? ` (${m}/${comp.mesesPeriodo})` : '')
  const variacaoTxt = l.variacaoTexto ?? '—'
  const baseAnt = l.anteriorTotalAnual ? ' (ano)' : base(l.mesesAnterior)
  console.log(
    `  ${l.rotulo.padEnd(24)}${(l.anteriorFormatado + baseAnt).padStart(22)}` +
      `${(l.atualFormatado + base(l.mesesAtual)).padStart(22)}   ${variacaoTxt}`,
  )
  if (l.anteriorTotalAnual) {
    console.log(`  ${''.padEnd(24)}${comp.anoAnterior}: total do ano (coluna Acum.), sem abertura mensal`)
  } else if (l.lacunasAnterior.length) {
    console.log(`  ${''.padEnd(24)}${comp.anoAnterior} sem dado em: ${l.lacunasAnterior.join(', ')}`)
  }
}
if (comp.semRegistroAnterior.length) {
  console.log(`
  Fora do quadro (sem registro em ${comp.anoAnterior}): ${comp.semRegistroAnterior.join(', ')}`)
}
console.log('')

// ------------------------- marketing de influência --------------------------
const inf = parseInfluencia(await buscarAba(ABA_INFLUENCIA, PLANILHA_INFLUENCIA))
const cabMeses = inf.meses.map((m) => m.nome).join('   ')

console.log(`
MARKETING DE INFLUÊNCIA   (planilha ${PLANILHA_INFLUENCIA.slice(0, 8)}…, aba "${ABA_INFLUENCIA}")`)
console.log(`PERÍODO ........... ${inf.periodo}   (pílula: dados até ${inf.curto})`)
console.log(REGUA)

const fmtM = (v: number | null) => (v == null ? '—' : br(v, Number.isInteger(v) ? 0 : 2))
const linhaInf = (rotulo: string, m: MetricaInfluencia) =>
  console.log(
    `  ${rotulo.padEnd(26)}${m.meses.map((v) => fmtM(v).padStart(12)).join('')}${fmtM(m.total).padStart(14)}`,
  )
console.log(`  ${''.padEnd(26)}${inf.meses.map((m) => m.nome.padStart(12)).join('')}${'TOTAL'.padStart(14)}`)
linhaInf('Conteúdos', inf.conteudos)
linhaInf('  Stories', inf.stories)
linhaInf('  Reels', inf.reels)
linhaInf('  Outros', inf.outros)
linhaInf('Views totais', inf.views)
linhaInf('Alcance orgânico', inf.alcance)
linhaInf('Interações', inf.interacoes)
linhaInf('Respostas a Stories', inf.respostasStories)
linhaInf('Influenciadores', inf.influenciadores)
linhaInf('Campanhas', inf.campanhas)
linhaInf('Engaj. orgânico (%)', inf.engajamento)

for (const [titulo, itens] of [
  ['Top 5 campanhas', inf.topCampanhas],
  ['Top 5 influenciadores', inf.topInfluenciadores],
] as const) {
  console.log(`
  ${titulo}`)
  for (const it of itens) {
    console.log(
      `    ${it.nome.padEnd(26)}${fmtM(it.views).padStart(12)}  ${fmtM(it.participacao).padStart(6)}%`,
    )
  }
}

// a planilha é calculada por fórmula; se alguém sobrescrever uma célula,
// as somas internas deixam de fechar e aparece aqui
const avisos: string[] = []
const soma = (...xs: (number | null)[]) => xs.reduce<number>((a, b) => a + (b ?? 0), 0)
const confere = (rotulo: string, esperado: number, obtido: number | null) => {
  if (obtido == null || Math.abs(esperado - obtido) > 0.5) {
    avisos.push(`${rotulo}: esperado ${br(esperado)}, planilha traz ${fmtM(obtido)}`)
  }
}
const colunas = [...inf.meses.map((m, i) => ({ rotulo: m.nome, i })), { rotulo: 'TOTAL', i: -1 }]
const em = (m: MetricaInfluencia, i: number) => (i < 0 ? m.total : m.meses[i])
for (const { rotulo, i } of colunas) {
  confere(
    `Interações ${rotulo} = curtidas + comentários + compartilhados + salvos`,
    soma(em(inf.curtidas, i), em(inf.comentarios, i), em(inf.compartilhados, i), em(inf.salvos, i)),
    em(inf.interacoes, i),
  )
  confere(
    `Conteúdos ${rotulo} = Stories + Reels + outros`,
    soma(em(inf.stories, i), em(inf.reels, i), em(inf.outros, i)),
    em(inf.conteudos, i),
  )
}
for (const [rotulo, m] of [
  ['Conteúdos', inf.conteudos],
  ['Views', inf.views],
  ['Alcance orgânico', inf.alcance],
  ['Interações', inf.interacoes],
] as const) {
  confere(`${rotulo}: TOTAL = soma dos meses`, soma(...m.meses), m.total)
}
console.log(
  avisos.length
    ? `
  ATENÇÃO — somas que não fecham:
${avisos.map((a) => `    · ${a}`).join('\n')}`
    : `
  Somas internas conferem (${cabMeses} e TOTAL).`,
)
console.log('')
