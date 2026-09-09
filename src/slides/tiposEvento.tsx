/**
 * Como cada tipo de evento aparece: cor + forma.
 *
 * A marca de tipo carrega identidade, e a marca é o Banco da Amazônia — uma
 * paleta inteiramente verde, onde três verdes ficam perto demais para daltonismo.
 * Por isso cada tipo tem também uma FORMA própria: a cor deixa de ser o único
 * canal e o marcador continua legível em deuteranopia, em preto e branco e no PDF.
 *
 * Trio validado (superfície #4A170D): separação CVD ΔE 11,1 (protan) e visão
 * normal ΔE 20,4 — ambos acima do piso. Duas ressalvas conscientes do validador:
 * a faixa de luminosidade não fecha (a paleta da marca é toda clara sobre fundo
 * escuro) e "areia" fica abaixo do piso de croma — ela é o neutro do trio de
 * propósito, e a forma em anel a distingue.
 */
import type { CSSProperties } from 'react'
import type { TipoEvento } from '../data/classificacaoEventos'

type Forma = 'disco' | 'losango' | 'anel' | 'quadrado'

export interface EstiloTipo {
  cor: string
  forma: Forma
  /** plural, para legenda e contadores */
  rotulo: string
}

export const ESTILO_TIPO: Record<TipoEvento, EstiloTipo> = {
  Feira: { cor: 'var(--lima)', forma: 'disco', rotulo: 'Feiras' },
  Esportivo: { cor: 'var(--verde-neon)', forma: 'losango', rotulo: 'Esportivos' },
  Institucional: { cor: 'var(--areia)', forma: 'anel', rotulo: 'Institucionais' },
  Cultural: { cor: 'var(--verde-argila)', forma: 'quadrado', rotulo: 'Culturais' },
}

/** Cinza discreto para o evento que a planilha ainda não classificou. */
const SEM_TIPO: EstiloTipo = {
  cor: 'rgb(255 255 255 / 34%)',
  forma: 'anel',
  rotulo: 'A classificar',
}

export const estiloDoTipo = (t: TipoEvento | null): EstiloTipo => (t ? ESTILO_TIPO[t] : SEM_TIPO)

export function MarcaTipo({
  tipo,
  tamanho = 8,
  style,
}: {
  tipo: TipoEvento | null
  tamanho?: number
  style?: CSSProperties
}) {
  const { cor, forma } = estiloDoTipo(tipo)

  const base: CSSProperties = {
    width: tamanho,
    height: tamanho,
    flex: 'none',
    display: 'inline-block',
    ...style,
  }

  const porForma: Record<Forma, CSSProperties> = {
    disco: { background: cor, borderRadius: '50%' },
    losango: { background: cor, transform: 'rotate(45deg)', borderRadius: 1 },
    anel: { border: `2px solid ${cor}`, borderRadius: '50%', background: 'transparent' },
    quadrado: { background: cor, borderRadius: 1 },
  }

  return <span aria-hidden="true" style={{ ...base, ...porForma[forma] }} />
}

/** Legenda: forma + cor + nome, para que a identidade nunca dependa só da cor. */
export function LegendaTipos({
  tipos,
  style,
}: {
  tipos: { tipo: TipoEvento; total: number }[]
  style?: CSSProperties
}) {
  return (
    <div style={{ display: 'flex', gap: 26, alignItems: 'center', ...style }}>
      {tipos.map(({ tipo, total }) => (
        <span key={tipo} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <MarcaTipo tipo={tipo} tamanho={9} />
          <span style={{ fontSize: 14, color: 'rgb(255 255 255 / 72%)' }}>
            {ESTILO_TIPO[tipo].rotulo}
            <span style={{ color: 'rgb(255 255 255 / 45%)' }}> · {total}</span>
          </span>
        </span>
      ))}
    </div>
  )
}
