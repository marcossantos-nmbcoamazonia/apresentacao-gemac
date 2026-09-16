/**
 * Primitivas da direção editorial cinematográfica.
 *
 * A gramática é sempre a mesma, de trás para frente: foto em sangria → véu em
 * gradiente (é ele que garante contraste do texto sobre imagem) → folhagem
 * ancorada no rodapé → tipografia. Margem de 84px em todos os slides.
 */
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react'
import { useReducedMotion } from 'framer-motion'
import { useModoEstatico } from '../deck/modoEstatico'

export const MARGEM = 84
export const LARGURA_UTIL = 1280 - MARGEM * 2

/**
 * Falha de leitura da planilha. Vem por contexto em vez de prop porque todo
 * slide precisa avisar e nenhum precisa decidir: o `Palco` desenha o aviso
 * sozinho, sempre no mesmo canto.
 */
export const ContextoErro = createContext<string | null>(null)

function AvisoDeErro({ mensagem }: { mensagem: string }) {
  return (
    <div
      role="alert"
      style={{
        position: 'absolute',
        right: MARGEM,
        bottom: 30,
        maxWidth: 520,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 16px',
        borderRadius: 999,
        background: 'rgb(255 122 89 / 16%)',
        border: '1px solid rgb(255 122 89 / 45%)',
        color: '#ffc4b4',
        fontSize: 13,
        zIndex: 5,
      }}
    >
      <span aria-hidden="true">⚠</span>
      <span>
        {mensagem} — tecle <b style={{ color: '#fff' }}>R</b> para tentar de novo.
      </span>
    </div>
  )
}

// ---------------------------------------------------------------- superfícies

type Veu = 'esquerda' | 'direita' | 'baixo' | 'moldura' | 'total' | 'nenhum'

const VEUS: Record<Veu, string> = {
  // o texto vive na metade esquerda, então o véu é mais denso ali
  esquerda:
    'linear-gradient(100deg, rgb(0 30 19 / 95%) 0%, rgb(0 30 19 / 88%) 34%, rgb(0 30 19 / 55%) 62%, rgb(0 30 19 / 20%) 100%)',
  direita:
    'linear-gradient(260deg, rgb(0 30 19 / 95%) 0%, rgb(0 30 19 / 88%) 34%, rgb(0 30 19 / 55%) 62%, rgb(0 30 19 / 20%) 100%)',
  baixo:
    'linear-gradient(to top, rgb(0 30 19 / 96%) 0%, rgb(0 30 19 / 78%) 38%, rgb(0 30 19 / 28%) 72%, rgb(0 30 19 / 10%) 100%)',
  // texto em cima E embaixo: escurece as duas pontas e deixa a foto respirar no
  // meio. Sem isto, um céu claro engole um título em areia.
  moldura:
    'linear-gradient(to bottom, rgb(0 30 19 / 94%) 0%, rgb(0 30 19 / 72%) 28%, rgb(0 30 19 / 42%) 50%, rgb(0 30 19 / 78%) 78%, rgb(0 30 19 / 95%) 100%)',
  total: 'linear-gradient(rgb(0 30 19 / 82%), rgb(0 30 19 / 82%))',
  nenhum: 'none',
}

interface PalcoProps {
  children: ReactNode
  /** foto em sangria; sem ela o fundo é verde profundo chapado */
  foto?: string
  alt?: string
  /** `object-position` da foto — decide o que sobrevive ao corte */
  posicao?: string
  veu?: Veu
  /**
   * Escurecimento plano por cima do véu, de 0 a 1. Existe porque o gradiente
   * sozinho não dá conta de toda foto: um retrato com muita área clara na
   * coluna do texto precisa de uma camada a mais.
   */
  escurecer?: number
  /** peça de campanha desfocada ao fundo, bem discreta */
  textura?: string
  cor?: string
}

export function Palco({
  children,
  foto,
  alt = '',
  posicao = 'center',
  veu = 'esquerda',
  escurecer = 0,
  textura,
  cor = 'var(--verde-profundo)',
}: PalcoProps) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: cor, overflow: 'hidden' }}>
      {textura && (
        <>
          <img
            src={textura}
            alt=""
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'blur(34px) saturate(130%)',
              transform: 'scale(1.16)',
            }}
          />
          {/* sem este escurecedor a peça desfocada domina o fundo e o verde
              profundo da marca vira um verde lavado e malhado */}
          <div
            aria-hidden="true"
            style={{ position: 'absolute', inset: 0, background: 'rgb(0 36 29 / 90%)' }}
          />
        </>
      )}

      {foto && (
        <img
          src={foto}
          alt={alt}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: posicao,
          }}
        />
      )}

      {veu !== 'nenhum' && (
        <div aria-hidden="true" style={{ position: 'absolute', inset: 0, background: VEUS[veu] }} />
      )}

      {escurecer > 0 && (
        <div
          aria-hidden="true"
          style={{ position: 'absolute', inset: 0, background: `rgb(0 30 19 / ${escurecer * 100}%)` }}
        />
      )}

      {children}

      <AvisoSeHouver />
    </div>
  )
}

function AvisoSeHouver() {
  const erro = useContext(ContextoErro)
  return erro ? <AvisoDeErro mensagem={erro} /> : null
}

/**
 * O recorte botânico do deck original (1920x821, com alfa). Sangra pela borda
 * de baixo e pelo lado, como uma assinatura — nunca centralizado.
 */
export function Folhagem({
  lado = 'direita',
  largura = 720,
  opacidade = 0.92,
  style,
}: {
  lado?: 'esquerda' | 'direita'
  largura?: number
  opacidade?: number
  style?: CSSProperties
}) {
  const altura = Math.round((largura * 821) / 1920)
  return (
    <img
      src="/assets/folhagem.png"
      alt=""
      aria-hidden="true"
      style={{
        position: 'absolute',
        bottom: -Math.round(altura * 0.28),
        [lado === 'direita' ? 'right' : 'left']: -60,
        width: largura,
        height: altura,
        objectFit: 'contain',
        opacity: opacidade,
        transform: lado === 'esquerda' ? 'scaleX(-1)' : undefined,
        pointerEvents: 'none',
        ...style,
      }}
    />
  )
}

// ---------------------------------------------------------------- tipografia

export function Eyebrow({
  children,
  cor = 'var(--verde-neon)',
  style,
}: {
  children: ReactNode
  cor?: string
  style?: CSSProperties
}) {
  return (
    <p
      style={{
        margin: 0,
        fontSize: 14,
        fontWeight: 600,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: cor,
        ...style,
      }}
    >
      {children}
    </p>
  )
}

/** Peso 300 em corpo grande — é o que dá o ar editorial, não o negrito. */
export function TituloDisplay({
  children,
  tamanho = 66,
  style,
}: {
  children: ReactNode
  tamanho?: number
  style?: CSSProperties
}) {
  return (
    <h2
      style={{
        margin: 0,
        fontSize: tamanho,
        lineHeight: 1.06,
        fontWeight: 300,
        letterSpacing: '-0.025em',
        color: 'var(--areia)',
        ...style,
      }}
    >
      {children}
    </h2>
  )
}

export function Nota({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <p
      style={{
        margin: 0,
        fontSize: 13,
        lineHeight: 1.45,
        fontWeight: 400,
        color: 'rgb(245 240 226 / 50%)',
        ...style,
      }}
    >
      {children}
    </p>
  )
}

// ------------------------------------------------------------- número herói

/** Contagem de 0 até `alvo`. Devolve o alvo direto quando animar não convém. */
function useContagem(alvo: number, duracao = 1100): number {
  const estatico = useModoEstatico()
  const reduzir = useReducedMotion()
  const pular = estatico || reduzir

  const [valor, setValor] = useState(pular ? alvo : 0)
  const quadro = useRef(0)

  useEffect(() => {
    if (pular) {
      setValor(alvo)
      return
    }
    const inicio = performance.now()
    // desaceleração no fim: o número "assenta" em vez de parar seco
    const suavizar = (t: number) => 1 - Math.pow(1 - t, 4)

    const passo = (agora: number) => {
      const t = Math.min((agora - inicio) / duracao, 1)
      setValor(alvo * suavizar(t))
      if (t < 1) quadro.current = requestAnimationFrame(passo)
    }
    quadro.current = requestAnimationFrame(passo)
    return () => cancelAnimationFrame(quadro.current)
  }, [alvo, duracao, pular])

  return valor
}

interface NumeroHeroiProps {
  valor: number | null
  /** recebe o valor corrente da contagem e devolve o texto exibido */
  formatar: (n: number) => string
  tamanho?: number
  cor?: string
  /** valor cheio, para o tooltip */
  titulo?: string
  style?: CSSProperties
}

export function NumeroHeroi({
  valor,
  formatar,
  tamanho = 190,
  cor = 'var(--lima)',
  titulo,
  style,
}: NumeroHeroiProps) {
  const corrente = useContagem(valor ?? 0)

  return (
    <span
      title={titulo}
      style={{
        display: 'block',
        fontSize: tamanho,
        lineHeight: 0.88,
        fontWeight: 700,
        letterSpacing: '-0.045em',
        color: cor,
        fontVariantNumeric: 'tabular-nums',
        ...style,
      }}
    >
      {valor == null ? '—' : formatar(corrente)}
    </span>
  )
}

/** Rótulo que acompanha um número herói. */
export function RotuloHeroi({
  children,
  detalhe,
  style,
}: {
  children: ReactNode
  detalhe?: string
  style?: CSSProperties
}) {
  return (
    <div style={style}>
      <div style={{ fontSize: 24, fontWeight: 500, color: 'var(--areia)', lineHeight: 1.2 }}>
        {children}
      </div>
      {detalhe && (
        <div
          style={{
            fontSize: 15,
            fontWeight: 300,
            color: 'rgb(245 240 226 / 58%)',
            marginTop: 5,
          }}
        >
          {detalhe}
        </div>
      )}
    </div>
  )
}

/** Assinatura discreta no rodapé, presente em todos os slides de conteúdo. */
export function Assinatura({ periodo }: { periodo: string | null }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: MARGEM,
        bottom: 34,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        fontSize: 12,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'rgb(245 240 226 / 38%)',
      }}
    >
      <img
        src="/assets/folha.png"
        alt=""
        aria-hidden="true"
        style={{ width: 16, height: 13, objectFit: 'contain' }}
      />
      Banco da Amazônia · Publicidade
      {periodo && <span style={{ color: 'rgb(226 255 106 / 55%)' }}>{periodo}</span>}
    </div>
  )
}
