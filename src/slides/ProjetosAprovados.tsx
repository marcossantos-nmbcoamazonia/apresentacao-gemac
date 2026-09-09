/**
 * Patrocínios aprovados no período, ordenados por valor.
 *
 * É uma série só — o valor aprovado — então todas as barras usam a mesma cor:
 * pintar cada projeto de um tom diferente daria à cor um significado que ela não
 * tem. A barra existe para mostrar a concentração que a lista de números esconde
 * (a Corrida das Estações sozinha responde por mais de 60% do total).
 */
import type { DadosEventos, Evento } from '../data/eventos'
import { formatCompact, formatFull } from '../lib/numbers'
import { AvisoDados, ChipPeriodo, Esqueleto, Fundo, MarcaCanto } from './comum'

interface Props {
  dados: DadosEventos | null
  carregando: boolean
  erro: string | null
}

const TOPO = 126
const ALTURA_LINHA = 52
const X_NOME = 42
const W_NOME = 396
const X_BARRA = 462
const W_BARRA = 566
const X_VALOR = 1044

/**
 * "FÓRUM BRASIL ÁFRICA - SECOM" -> nome + selo de origem. A origem do
 * patrocínio (SECOM, GECOR, contratação) vem grudada no nome na planilha;
 * separada, encurta a linha e vira informação em vez de ruído.
 */
/**
 * Numa lista comparativa a unidade não pode variar por linha: formatCompact
 * devolveria "R$ 50.000" para o menor projeto no meio de oito valores em "Mil".
 * Aqui o piso desce para mil, e só o topo da lista sobe para "Mi".
 */
function valorDoProjeto(v: number): string {
  if (v >= 1e6) return formatCompact(v, { moeda: true })
  return `R$ ${new Intl.NumberFormat('pt-BR').format(Math.round(v / 1000))} Mil`
}

function separarOrigem(nome: string): { nome: string; origem: string | null } {
  const m = /\s[-–]\s*(SECOM.*|GECOR.*|contrata[çc][ãa]o.*)$/i.exec(nome)
  if (!m) return { nome: nome.trim(), origem: null }
  return { nome: nome.slice(0, m.index).trim(), origem: m[1].trim() }
}

function LinhaProjeto({
  projeto,
  maximo,
  y,
}: {
  projeto: Evento
  maximo: number
  y: number
}) {
  const valor = projeto.investimento ?? 0
  const proporcao = maximo > 0 ? valor / maximo : 0
  const { nome, origem } = separarOrigem(projeto.nome)

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: y,
        width: '100%',
        height: ALTURA_LINHA,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div style={{ position: 'absolute', left: X_NOME, width: W_NOME }}>
        <span
          title={projeto.nome}
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            fontSize: 15,
            lineHeight: '18px',
            color: 'var(--branco)',
          }}
        >
          {nome}
        </span>
        {origem && (
          <span
            style={{
              display: 'inline-block',
              marginTop: 4,
              padding: '1px 7px',
              borderRadius: 3,
              border: '1px solid rgb(255 255 255 / 18%)',
              fontSize: 10,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'rgb(255 255 255 / 52%)',
            }}
          >
            {origem}
          </span>
        )}
      </div>

      {/* trilho recessivo + barra: extremidade arredondada, ancorada na base */}
      <div
        style={{
          position: 'absolute',
          left: X_BARRA,
          width: W_BARRA,
          height: 12,
          background: 'rgb(255 255 255 / 7%)',
          borderRadius: 2,
        }}
      >
        <div
          style={{
            width: `${Math.max(proporcao * 100, 1.2)}%`,
            height: '100%',
            background: 'var(--lima)',
            borderRadius: '2px 4px 4px 2px',
          }}
        />
      </div>

      <span
        title={formatFull(valor, { moeda: true })}
        style={{
          position: 'absolute',
          left: X_VALOR,
          width: 194,
          textAlign: 'right',
          fontSize: 19,
          fontWeight: 600,
          color: 'var(--lima)',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {valorDoProjeto(valor)}
      </span>
    </div>
  )
}

export function ProjetosAprovados({ dados, carregando, erro }: Props) {
  const projetos = [...(dados?.projetos ?? [])].sort(
    (a, b) => (b.investimento ?? 0) - (a.investimento ?? 0),
  )
  const maximo = projetos.reduce((m, p) => Math.max(m, p.investimento ?? 0), 0)

  return (
    <Fundo cor="var(--verde-profundo)">
      <MarcaCanto />

      <h2
        style={{
          position: 'absolute',
          left: 42,
          top: 29,
          margin: 0,
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: '0.05em',
          color: 'var(--verde-neon)',
        }}
      >
        PROJETOS APROVADOS
      </h2>

      <p
        style={{
          position: 'absolute',
          left: 42,
          top: 72,
          margin: 0,
          fontSize: 16,
          fontWeight: 300,
          color: 'rgb(255 255 255 / 62%)',
        }}
      >
        Patrocínios por escolha direta e contratação · valor aprovado
      </p>

      {erro ? (
        <AvisoDados mensagem={erro} style={{ left: 620, top: 22 }} />
      ) : (
        dados && (
          // termina em 1190: a folha da marca ocupa 1223→1262 no canto
          <ChipPeriodo
            texto={`${projetos.length} projetos`}
            style={{ left: 996, top: 30, width: 194, justifyContent: 'center' }}
          />
        )
      )}

      {carregando
        ? Array.from({ length: 9 }, (_, i) => (
            <div
              key={i}
              style={{ position: 'absolute', left: X_NOME, top: TOPO + i * ALTURA_LINHA + 14 }}
            >
              <Esqueleto w={W_NOME} h={16} />
            </div>
          ))
        : projetos.map((p, i) => (
            <LinhaProjeto key={p.id} projeto={p} maximo={maximo} y={TOPO + i * ALTURA_LINHA} />
          ))}

      {/* total */}
      <div
        style={{
          position: 'absolute',
          left: 42,
          top: 606,
          width: 1196,
          paddingTop: 16,
          borderTop: '1px solid rgb(255 255 255 / 14%)',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgb(255 255 255 / 52%)',
          }}
        >
          Total aprovado
        </span>
        <span
          title={dados?.investimentoCheio}
          style={{
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: 'var(--lima)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {carregando ? '' : (dados?.investimentoFormatado ?? '—')}
        </span>
      </div>

      {!carregando && dados && dados.projetos.length > 0 && (
        <p
          style={{
            position: 'absolute',
            left: 42,
            top: 674,
            margin: 0,
            fontSize: 12,
            color: 'rgb(255 255 255 / 42%)',
          }}
        >
          Valores da coluna “Investimento (R$)” da aba 03 EVENTOS · soma{' '}
          {formatFull(dados.investimentoAprovado, { moeda: true })}
        </p>
      )}
    </Fundo>
  )
}
