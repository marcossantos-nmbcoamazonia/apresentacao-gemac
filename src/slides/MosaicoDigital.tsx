/**
 * Slide 11 do deck — colagem de publicações e colaborações com criadores.
 * Peças sobrepostas nas posições e na ordem de pintura do PPTX.
 */
import { Fundo, MarcaCanto } from './comum'

interface Peca {
  src: string
  alt: string
  x: number
  y: number
  w: number
  h: number
}

/** Ordem do array = ordem de pintura; as últimas ficam por cima. */
const PECAS: Peca[] = [
  {
    src: '/assets/digital-2.jpg',
    alt: 'Publicações do perfil @bancoamazonia no Instagram',
    x: 554,
    y: 0,
    w: 277,
    h: 493,
  },
  {
    src: '/assets/digital-6.jpg',
    alt: 'Colaboração com criadora de conteúdo em vídeo no Instagram',
    x: 980,
    y: 101,
    w: 292,
    h: 537,
  },
  {
    src: '/assets/digital-4.jpg',
    alt: 'Publicação de conteúdo regional nos canais do Banco',
    x: 761,
    y: 346,
    w: 204,
    h: 374,
  },
  {
    src: '/assets/digital-3.jpg',
    alt: 'Publicação sobre produção de café na Amazônia',
    x: 831,
    y: 0,
    w: 218,
    h: 401,
  },
  {
    src: '/assets/digital-5.jpg',
    alt: 'Publicação de campanha nos canais do Banco',
    x: 568,
    y: 377,
    w: 184,
    h: 338,
  },
  {
    src: '/assets/digital-1.jpg',
    alt: 'Mosaico de publicações do perfil @bancoamazonia',
    x: 7,
    y: 0,
    w: 544,
    h: 720,
  },
]

interface Props {
  periodo: string | null
}

export function MosaicoDigital({ periodo }: Props) {
  return (
    <Fundo cor="var(--verde-neon)">
      <MarcaCanto folha={false} />

      {PECAS.map((p) => (
        <img
          key={p.src}
          src={p.src}
          alt={p.alt}
          loading="lazy"
          style={{
            position: 'absolute',
            left: p.x,
            top: p.y,
            width: p.w,
            height: p.h,
            objectFit: 'cover',
            borderRadius: 6,
            display: 'block',
            boxShadow: '0 10px 26px rgb(0 30 19 / 26%)',
          }}
        />
      ))}

      {/* canto livre entre o fim da última peça (y 638) e a borda do slide */}
      {periodo && (
        <div style={{ position: 'absolute', left: 982, top: 656, zIndex: 2, width: 290 }}>
          <p
            style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: 'rgb(0 30 19 / 62%)',
            }}
          >
            Presença digital
          </p>
          <p
            style={{
              margin: '4px 0 0',
              fontSize: 20,
              fontWeight: 500,
              color: 'var(--verde-noite)',
            }}
          >
            {periodo}
          </p>
        </div>
      )}
    </Fundo>
  )
}
