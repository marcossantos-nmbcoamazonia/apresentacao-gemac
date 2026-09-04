/**
 * Exportação em PDF pelo motor de impressão do próprio navegador.
 *
 * Rasterizar os slides (html2canvas e afins) reimplementaria a renderização e
 * erraria em sombras, gradientes e variáveis CSS — justamente o que sustenta o
 * visual do deck. Imprimindo o mesmo DOM, o PDF sai idêntico à tela, com texto
 * vetorial e pesquisável, e as fontes locais embutidas.
 *
 * A sequência importa: montar a camada, forçar o carregamento das imagens
 * (várias são `loading="lazy"` e nunca estiveram em tela), esperar as fontes, e
 * só então abrir o diálogo — senão o PDF sai com imagens faltando.
 */
import { useCallback, useEffect, useRef, useState } from 'react'
import { CLASSE_CAMADA } from './CamadaImpressao'

/**
 * Só dois estados de propósito. Uma etapa 'imprimindo' separada faria o efeito
 * abaixo re-rodar no meio do preparo, e a limpeza cancelaria a continuação que
 * chama `window.print()` — o diálogo simplesmente não abria.
 */
export type EstadoPdf = 'ocioso' | 'preparando'

export interface Pdf {
  estado: EstadoPdf
  /** true enquanto a camada de impressão precisa estar montada */
  montarCamada: boolean
  exportar: () => void
}

const proximoQuadro = () =>
  new Promise<void>((ok) => requestAnimationFrame(() => requestAnimationFrame(() => ok())))

/** Rede de segurança: se `afterprint` não vier, a camada não fica montada para sempre. */
const LIMITE_MS = 120_000

export function usePdf(titulo: () => string): Pdf {
  const [estado, setEstado] = useState<EstadoPdf>('ocioso')
  const tituloAnterior = useRef<string | null>(null)

  const restaurar = useCallback(() => {
    if (tituloAnterior.current !== null) {
      document.title = tituloAnterior.current
      tituloAnterior.current = null
    }
    setEstado('ocioso')
  }, [])

  const exportar = useCallback(() => {
    setEstado((e) => (e === 'ocioso' ? 'preparando' : e))
  }, [])

  // o diálogo fechou (imprimiu ou cancelou): desmonta a camada
  useEffect(() => {
    window.addEventListener('afterprint', restaurar)
    return () => window.removeEventListener('afterprint', restaurar)
  }, [restaurar])

  useEffect(() => {
    if (estado !== 'preparando') return

    let cancelado = false
    const seguranca = window.setTimeout(restaurar, LIMITE_MS)

    const rodar = async () => {
      // dois quadros: garante que o React já comitou a camada no DOM
      await proximoQuadro()
      if (cancelado) return

      const camada = document.querySelector(`.${CLASSE_CAMADA}`)
      if (camada) {
        const imagens = Array.from(camada.querySelectorAll('img'))
        // fora da viewport o navegador adia as `lazy`; aqui todas são necessárias
        for (const img of imagens) img.loading = 'eager'
        await Promise.all(
          imagens.map((img) =>
            img.complete && img.naturalWidth > 0
              ? Promise.resolve()
              : img.decode().catch(() => undefined),
          ),
        )
      }

      await document.fonts?.ready.catch(() => undefined)
      if (cancelado) return

      // o navegador usa o título do documento como nome do arquivo
      tituloAnterior.current = document.title
      document.title = titulo()

      window.print()

      // em alguns navegadores print() retorna antes de `afterprint`; o timeout
      // curto cobre os que não disparam o evento
      window.setTimeout(() => {
        if (!cancelado) restaurar()
      }, 500)
    }

    void rodar()

    return () => {
      cancelado = true
      window.clearTimeout(seguranca)
    }
  }, [estado, titulo, restaurar])

  return { estado, montarCamada: estado !== 'ocioso', exportar }
}
