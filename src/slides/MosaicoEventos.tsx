/**
 * Registro visual da seção Eventos, sobre o verde neon — mesmo papel dos
 * mosaicos de Publicidade e Digital. As quatro peças são as de eventos do deck
 * original; a foto do estande em Agrotins não se repete aqui porque já abre a
 * seção.
 */
import { Fundo, Logo, MarcaCanto } from './comum'

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
    src: '/assets/eventos-3.jpg',
    alt: 'Peça de divulgação da 13ª Rondônia Rural Show Internacional, de 25 a 30 de maio',
    x: 16,
    y: 10,
    w: 300,
    h: 414,
  },
  {
    src: '/assets/eventos-5.jpg',
    alt: 'Peça de divulgação da Eco Run 2026 em Belém, com largada em 31 de maio',
    x: 332,
    y: 10,
    w: 300,
    h: 414,
  },
  {
    src: '/assets/eventos-2.jpg',
    alt: 'Estande do Banco da Amazônia iluminado à noite, em feira agropecuária',
    x: 16,
    y: 440,
    w: 300,
    h: 268,
  },
  {
    src: '/assets/eventos-4.jpg',
    alt: 'Pódio feminino e masculino de uma etapa da Eco Run, com atletas premiados',
    x: 332,
    y: 440,
    w: 300,
    h: 268,
  },
]

interface Props {
  periodo: string | null
  /** contagens para o resumo à direita */
  feiras: number
  diversas: number
  projetos: number
}

function Contador({ valor, rotulo }: { valor: number; rotulo: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 14 }}>
      <span
        style={{
          fontSize: 40,
          fontWeight: 700,
          lineHeight: 1,
          letterSpacing: '-0.03em',
          color: 'var(--verde-noite)',
          fontVariantNumeric: 'tabular-nums',
          minWidth: 62,
          textAlign: 'right',
        }}
      >
        {String(valor).padStart(2, '0')}
      </span>
      <span style={{ fontSize: 19, fontWeight: 500, color: 'rgb(0 30 19 / 78%)' }}>{rotulo}</span>
    </div>
  )
}

export function MosaicoEventos({ periodo, feiras, diversas, projetos }: Props) {
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
            boxShadow: '0 10px 26px rgb(0 30 19 / 20%)',
          }}
        />
      ))}

      <div style={{ position: 'absolute', left: 692, top: 96, width: 520 }}>
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
          Eventos e feiras
        </p>
        <p
          style={{
            margin: '12px 0 0',
            fontSize: 44,
            lineHeight: 1.14,
            fontWeight: 300,
            letterSpacing: '-0.02em',
            color: 'var(--verde-noite)',
          }}
        >
          Onde a Amazônia
          <br />
          faz negócio
        </p>

        <div
          style={{
            marginTop: 44,
            paddingTop: 30,
            borderTop: '1px solid rgb(0 30 19 / 22%)',
            display: 'grid',
            gap: 24,
          }}
        >
          <Contador valor={feiras} rotulo="Feiras realizadas" />
          <Contador valor={diversas} rotulo="Ações diversas" />
          <Contador valor={projetos} rotulo="Projetos aprovados" />
        </div>

        {periodo && (
          <p style={{ margin: '34px 0 0', fontSize: 16, color: 'rgb(0 30 19 / 62%)' }}>{periodo}</p>
        )}
      </div>

      <Logo style={{ position: 'absolute', left: 692, top: 626, width: 330, height: 57 }} />
    </Fundo>
  )
}
