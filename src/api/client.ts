/**
 * Cliente da API de planilhas.
 *
 * GET {BASE}/google/sheets/{ID}/data?range={aba}
 *   -> { success: true, data: { range, majorDimension, values: string[][] } }
 *
 * A API reflete o Origin da requisição (Access-Control-Allow-Origin + Vary),
 * então o fetch roda direto do browser — não há proxy no meio.
 */

const BASE = import.meta.env.VITE_API_BASE ?? 'https://nmbcoamazonia-api.vercel.app'
const SHEET_ID = import.meta.env.VITE_SHEET_ID ?? ''

/** Janela em que a resposta em cache é servida sem ir à rede. */
const TTL_MS = 5 * 60 * 1000
const CACHE_PREFIX = 'copac:range:'

interface RespostaApi {
  success: boolean
  data?: { range: string; values?: string[][] }
  error?: string
}

export interface ResultadoRange {
  values: string[][]
  /** quando esses dados foram buscados na rede */
  buscadoEm: number
  /** veio do cache de sessão, sem tocar a rede */
  doCache: boolean
}

function lerCache(range: string): ResultadoRange | null {
  try {
    const cru = sessionStorage.getItem(CACHE_PREFIX + range)
    if (!cru) return null
    const { values, buscadoEm } = JSON.parse(cru) as ResultadoRange
    if (!Array.isArray(values)) return null
    return { values, buscadoEm, doCache: true }
  } catch {
    // sessionStorage pode lançar (aba privada, storage bloqueado) — cache é opcional
    return null
  }
}

function gravarCache(range: string, r: ResultadoRange): void {
  try {
    sessionStorage.setItem(
      CACHE_PREFIX + range,
      JSON.stringify({ values: r.values, buscadoEm: r.buscadoEm }),
    )
  } catch {
    /* sem cache é degradação aceitável */
  }
}

export async function fetchRange(
  range: string,
  opts: { signal?: AbortSignal; forcar?: boolean } = {},
): Promise<ResultadoRange> {
  if (!opts.forcar) {
    const cache = lerCache(range)
    if (cache && Date.now() - cache.buscadoEm < TTL_MS) return cache
  }

  const url = `${BASE}/google/sheets/${SHEET_ID}/data?range=${encodeURIComponent(range)}`

  let resp: Response
  try {
    resp = await fetch(url, { signal: opts.signal, headers: { Accept: 'application/json' } })
  } catch (e) {
    // rede fora: um cache vencido ainda é melhor do que slide vazio na reunião
    const antigo = lerCache(range)
    if (antigo) return antigo
    throw new Error(`Não foi possível falar com a API (${(e as Error).message})`)
  }

  if (!resp.ok) {
    const antigo = lerCache(range)
    if (antigo) return antigo
    throw new Error(`A API respondeu ${resp.status} para a aba "${range}"`)
  }

  const json = (await resp.json()) as RespostaApi
  if (!json.success || !json.data?.values) {
    throw new Error(json.error ?? `Resposta sem dados para a aba "${range}"`)
  }

  const resultado: ResultadoRange = {
    values: json.data.values,
    buscadoEm: Date.now(),
    doCache: false,
  }
  gravarCache(range, resultado)
  return resultado
}
