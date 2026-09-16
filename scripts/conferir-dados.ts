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

const r = await fetch(
  `${BASE}/google/sheets/${SHEET}/data?range=${encodeURIComponent(ABA_PUBLICIDADE)}`,
)
if (!r.ok) throw new Error(`API respondeu ${r.status} para "${ABA_PUBLICIDADE}"`)
const json = (await r.json()) as { success: boolean; data?: { values?: string[][] } }
if (!json.success || !json.data?.values) throw new Error('Resposta sem dados')

const aba = parseAba(json.data.values)
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
