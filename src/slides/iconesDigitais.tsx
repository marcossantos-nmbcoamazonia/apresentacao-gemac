/**
 * Ícones dos quatro pilares da presença digital.
 *
 * O PPTX usa clip-art 3D em roxo e laranja (emoji de celular, microfone, mão
 * escrevendo e antena) que destoa da identidade do Banco. Estes são traços em
 * verde neon, na mesma linguagem do resto do deck — se a área preferir os
 * originais, eles estão em ppt/media/image25|26|29|30.png.
 */
interface Props {
  tamanho?: number
}

const base = (tamanho: number) => ({
  width: tamanho,
  height: tamanho,
  fill: 'none' as const,
  stroke: 'var(--verde-neon)',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
})

/** Redes sociais: balões de conversa sobrepostos. */
export function IconeRedes({ tamanho = 44 }: Props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base(tamanho)}>
      <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h8A2.5 2.5 0 0 1 16 6.5v4A2.5 2.5 0 0 1 13.5 13H8l-3.5 3v-3H5.5A2.5 2.5 0 0 1 3 10.5z" />
      <path d="M18 9h.5A2.5 2.5 0 0 1 21 11.5v4A2.5 2.5 0 0 1 18.5 18H18v3l-3.5-3h-3" />
    </svg>
  )
}

/** Influenciadores: microfone. */
export function IconeInfluenciadores({ tamanho = 44 }: Props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base(tamanho)}>
      <rect x="9" y="2.5" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0" />
      <path d="M12 17.5V21M8.5 21h7" />
    </svg>
  )
}

/** Conteúdo: página com texto e lápis. */
export function IconeConteudo({ tamanho = 44 }: Props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base(tamanho)}>
      <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-6" />
      <path d="M7.5 8h6M7.5 12h4M7.5 16h3" />
      <path d="m16.5 3.8 3.7 3.7-4.6 4.6-3.7.9.9-3.7z" />
    </svg>
  )
}

/** Mídia digital: sinal irradiando. */
export function IconeMidia({ tamanho = 44 }: Props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...base(tamanho)}>
      <circle cx="12" cy="12" r="2.4" />
      <path d="M8.4 15.6a5.1 5.1 0 0 1 0-7.2M15.6 8.4a5.1 5.1 0 0 1 0 7.2" />
      <path d="M5.6 18.4a9.1 9.1 0 0 1 0-12.8M18.4 5.6a9.1 9.1 0 0 1 0 12.8" />
    </svg>
  )
}
