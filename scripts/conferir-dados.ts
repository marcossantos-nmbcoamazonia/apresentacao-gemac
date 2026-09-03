/**
 * Confere, pelo terminal, o que o slide vai mostrar — sem abrir o browser.
 *
 *     npm run conferir
 *
 * Usa exatamente as mesmas funções da aplicação (src/data/publicidade.ts), então
 * qualquer mudança na planilha que quebre o parse ou desloque o mês de fechamento
 * aparece aqui. Os valores do deck original de 01/09/2026 ficam como referência.
 */
import { parseAba } from '../src/api/parseSheet'
import { montarPublicidade } from '../src/data/publicidade'
import { formatFull, formatVariacao } from '../src/lib/numbers'

const BASE = process.env.VITE_API_BASE ?? 'https://nmbcoamazonia-api.vercel.app'
const SHEET = process.env.VITE_SHEET_ID ?? '12vC5uRnSYAzqlBVKBO8AsQCNuvoVNZkRV8e-1kSAZPg'
const ABA = '01 PUBLICIDADE'

/** Números impressos no slide 7 do deck de 01/09/2026, para conferência. */
const REFERENCIA_DECK: Record<string, string> = {
  'PUB-01': '56.775',
  'PUB-02': '317 Mi',
  'PUB-03': '867 Mil',
  'PUB-04': '648 Mi',
  'PUB-05': '18 Mi',
}

const resp = await fetch(`${BASE}/google/sheets/${SHEET}/data?range=${encodeURIComponent(ABA)}`)
if (!resp.ok) {
  console.error(`API respondeu ${resp.status}`)
  process.exit(1)
}

const json = (await resp.json()) as { success: boolean; data?: { values?: string[][] } }
if (!json.success || !json.data?.values) {
  console.error('Resposta sem dados')
  process.exit(1)
}

const aba = parseAba(json.data.values)
const dados = montarPublicidade(aba)

if (!dados) {
  console.error('Nenhum mês com dado na aba — nada a apresentar')
  process.exit(1)
}

console.log(`aba .............. ${aba.titulo}`)
console.log(`ano .............. ${aba.ano}`)
console.log(`indicadores ...... ${aba.linhas.map((l) => l.id).join(', ')}`)
console.log(`MÊS FECHADO ...... ${dados.fechado.curto}   (período: ${dados.fechado.periodo})`)

let divergencias = 0

console.log('\nKPIs — acumulado Jan → mês fechado')
console.log('─'.repeat(96))
for (const k of [...dados.kpis, ...dados.investimento]) {
  const ref = REFERENCIA_DECK[k.id]
  const bate = ref ? (ref === k.formatado ? 'igual ao deck' : `DIFERE do deck (${ref})`) : ''
  if (ref && ref !== k.formatado) divergencias++

  const varTxt = k.variacao
    ? `${formatVariacao(k.variacao)} ${k.comparacao}`
    : 'sem base de comparação'

  console.log(
    `${k.id}  ${k.formatado.padEnd(13)}${formatFull(k.valor, { moeda: k.moeda }).padStart(18)}   ` +
      `${varTxt.padEnd(28)}${bate}`,
  )
  if (k.semDadoNoMes) {
    console.log(`        ↳ sem dado em ${dados.fechado.nome}; série vai até ${k.ultimoMes ?? '—'}`)
  }
}

console.log(`\nPUB-09 — produtos trabalhados (${dados.produtos.length} únicos no período)`)
console.log('─'.repeat(96))
for (const [i, p] of dados.produtos.entries()) {
  console.log(`  ${String(i + 1).padStart(2)}. ${p}`)
}

console.log('\nPUB-10 — praças')
console.log('─'.repeat(96))
console.log(`  ${dados.pracas || '(vazio)'}`)

console.log(
  divergencias === 0
    ? '\nTodos os KPIs de referência batem com o deck de 01/09/2026.'
    : `\n${divergencias} KPI(s) divergem do deck de 01/09/2026 — esperado se a planilha avançou de mês.`,
)
