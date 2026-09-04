/**
 * Slide 9 do deck — abertura da seção Digital.
 * Fundo neon, quatro cards verde-escuro em 2x2 (PPTX: 363x196 px) e, à direita,
 * a coluna de imagem que no original ficava vazia.
 *
 * O único número da tela — "criadores ativados" — vem de DIG-09 + DGC-09.
 */
import type { ReactNode } from 'react'
import { AvisoDados, ChipPeriodo, Esqueleto, Fundo, MarcaCanto } from './comum'
import {
  IconeConteudo,
  IconeInfluenciadores,
  IconeMidia,
  IconeRedes,
} from './iconesDigitais'

const CARD_W = 363
const CARD_H = 196
const POS = [
  { x: 34, y: 229 },
  { x: 421, y: 229 },
  { x: 34, y: 452 },
  { x: 421, y: 452 },
]

interface Props {
  /** total de criadores ativados no período (Banco + Centro Cultural) */
  criadores: string
  /** "73 no Banco · 16 no Centro Cultural" */
  criadoresDetalhe: string | null
  periodo: string | null
  carregando: boolean
  erro: string | null
}

function Card({
  icone,
  titulo,
  children,
  x,
  y,
}: {
  icone: ReactNode
  titulo: string
  children: ReactNode
  x: number
  y: number
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: CARD_W,
        height: CARD_H,
        background: 'var(--verde-card)',
        borderRadius: 16,
        boxShadow: '0 14px 34px rgb(0 30 19 / 22%)',
        padding: '22px 26px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <div style={{ height: 44, display: 'flex', alignItems: 'center' }}>{icone}</div>
      <h3 style={{ margin: 0, fontSize: 23, fontWeight: 600, color: 'var(--lima)' }}>{titulo}</h3>
      <div style={{ fontSize: 17, lineHeight: 1.4, fontWeight: 300, color: 'var(--branco)' }}>
        {children}
      </div>
    </div>
  )
}

export function PresencaDigital({
  criadores,
  criadoresDetalhe,
  periodo,
  carregando,
  erro,
}: Props) {
  return (
    <Fundo cor="var(--verde-neon)">
      <MarcaCanto folha={false} />

      <h2
        style={{
          position: 'absolute',
          left: 42,
          top: 22,
          margin: 0,
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: '0.06em',
          color: 'var(--verde-profundo)',
        }}
      >
        PRESENÇA DIGITAL
      </h2>

      <p
        style={{
          position: 'absolute',
          left: 42,
          top: 74,
          width: 700,
          margin: 0,
          fontSize: 44,
          lineHeight: 1.12,
          fontWeight: 300,
          letterSpacing: '-0.02em',
          color: 'var(--verde-noite)',
        }}
      >
        Influência com credibilidade
      </p>

      <p
        style={{
          position: 'absolute',
          left: 42,
          top: 136,
          width: 700,
          margin: 0,
          fontSize: 20,
          fontWeight: 400,
          color: 'rgb(0 30 19 / 70%)',
        }}
      >
        Amazônia falando com a Amazônia e com o Brasil
      </p>

      {periodo && <ChipPeriodo texto={periodo} tom="escuro" style={{ left: 42, top: 180 }} />}

      <Card icone={<IconeRedes />} titulo="Redes Sociais" {...POS[0]}>
        Instagram · Facebook · LinkedIn
        <br />
        Google Ads · TikTok
      </Card>

      <Card icone={<IconeInfluenciadores />} titulo="Influenciadores" {...POS[1]}>
        {carregando ? (
          <Esqueleto w={170} h={22} />
        ) : (
          <>
            <span style={{ fontSize: 28, fontWeight: 700, color: 'var(--lima)' }}>{criadores}</span>{' '}
            criadores ativados
            {criadoresDetalhe && (
              <span
                style={{
                  display: 'block',
                  fontSize: 14,
                  marginTop: 4,
                  color: 'rgb(255 255 255 / 60%)',
                }}
              >
                {criadoresDetalhe}
              </span>
            )}
          </>
        )}
      </Card>

      <Card icone={<IconeConteudo />} titulo="Conteúdo" {...POS[2]}>
        Blog + E-mail + Site
      </Card>

      <Card icone={<IconeMidia />} titulo="Mídia Digital" {...POS[3]}>
        Programática + Display
      </Card>

      {/* coluna de imagem: no PPTX esta faixa ficava vazia.
          Começa abaixo do marcador #INTERNA para não cobri-lo. */}
      <img
        src="/assets/digital-1.jpg"
        alt="Mosaico de publicações do perfil @bancoamazonia nas redes sociais"
        style={{
          position: 'absolute',
          left: 830,
          top: 70,
          width: 416,
          height: 578,
          objectFit: 'cover',
          borderRadius: 16,
          boxShadow: '0 16px 40px rgb(0 30 19 / 28%)',
        }}
      />

      {erro && <AvisoDados mensagem={erro} style={{ left: 34, top: 664 }} />}
    </Fundo>
  )
}
