/**
 * Slide 8 do deck — mosaico de criativos em veiculação, sobre o verde neon.
 * As cinco peças ficam nas posições exatas do PPTX; a área livre do canto
 * inferior direito recebe o rótulo da seção e a assinatura da marca.
 */
import { Fundo, Logo } from './comum'

interface Peca {
  src: string
  alt: string
  x: number
  y: number
  w: number
  h: number
}

const PECAS: Peca[] = [
  {
    src: '/assets/mosaico-1.jpg',
    alt: 'Peça da campanha Custeio Agrícola e Pecuário, versão lavoura',
    x: 16,
    y: 10,
    w: 321,
    h: 321,
  },
  {
    src: '/assets/mosaico-2.jpg',
    alt: 'Peça da campanha Custeio Agrícola e Pecuário, versão pesca e aquicultura',
    x: 384,
    y: 10,
    w: 318,
    h: 319,
  },
  {
    src: '/assets/mosaico-3.jpg',
    alt: 'Peça da campanha Custeio Agrícola e Pecuário, versão dendê',
    x: 749,
    y: 11,
    w: 321,
    h: 319,
  },
  {
    src: '/assets/mosaico-4.jpg',
    alt: 'Peças da campanha Capital de Giro em formato stories',
    x: 384,
    y: 352,
    w: 420,
    h: 355,
  },
  {
    src: '/assets/mosaico-5.jpg',
    alt: 'Peça da campanha Maquininha, com taxa zero nos dois primeiros meses',
    x: 16,
    y: 348,
    w: 210,
    h: 362,
  },
]

interface Props {
  periodo: string | null
}

export function Mosaico({ periodo }: Props) {
  return (
    <Fundo cor="var(--verde-neon)">
      <img
        src="/assets/tag-interna.png"
        alt="Documento interno"
        style={{ position: 'absolute', left: 1208, top: 12, width: 66, height: 11 }}
      />

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
            boxShadow: '0 10px 26px rgb(0 30 19 / 20%)',
          }}
        />
      ))}

      <div style={{ position: 'absolute', left: 852, top: 400, width: 388 }}>
        <p
          style={{
            margin: 0,
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'rgb(0 30 19 / 62%)',
          }}
        >
          Publicidade
        </p>
        <p
          style={{
            margin: '10px 0 0',
            fontSize: 34,
            lineHeight: 1.2,
            fontWeight: 300,
            letterSpacing: '-0.015em',
            color: 'var(--verde-noite)',
          }}
        >
          Criativos em veiculação
        </p>
        {periodo && (
          <p style={{ margin: '12px 0 0', fontSize: 17, color: 'rgb(0 30 19 / 66%)' }}>{periodo}</p>
        )}
      </div>

      <Logo style={{ position: 'absolute', left: 852, top: 620, width: 330, height: 57 }} />
    </Fundo>
  )
}
