/**
 * Abertura da seção Eventos — a composição do período.
 * Mesma geometria do divisor de Publicidade: foto à esquerda (0→463px) e o
 * painel de conteúdo à direita, alimentado pela aba 03 EVENTOS.
 */
import type { DadosEventos } from '../data/eventos'
import { totalAcoesDiversas } from '../data/eventos'
import { AvisoDados, Esqueleto, Fundo, MarcaCanto } from './comum'

interface Props {
  dados: DadosEventos | null
  carregando: boolean
  erro: string | null
}

function Linha({
  numero,
  rotulo,
  detalhe,
  carregando,
}: {
  numero: string
  rotulo: string
  detalhe: string
  carregando: boolean
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 22 }}>
      {carregando ? (
        <Esqueleto w={76} h={44} />
      ) : (
        <span
          style={{
            fontSize: 46,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: '-0.03em',
            color: 'var(--lima)',
            fontVariantNumeric: 'tabular-nums',
            minWidth: 76,
            textAlign: 'right',
          }}
        >
          {numero}
        </span>
      )}
      <span>
        <span
          style={{
            display: 'block',
            fontSize: 21,
            fontWeight: 500,
            lineHeight: 1.2,
            color: 'var(--branco)',
          }}
        >
          {rotulo}
        </span>
        <span
          style={{
            display: 'block',
            fontSize: 14,
            fontWeight: 300,
            color: 'rgb(255 255 255 / 58%)',
            marginTop: 3,
          }}
        >
          {detalhe}
        </span>
      </span>
    </div>
  )
}

export function DivisorEventos({ dados, carregando, erro }: Props) {
  const feiras = dados?.feiras.length ?? 0
  const diversas = dados ? totalAcoesDiversas(dados) : 0
  const projetos = dados?.projetos.length ?? 0
  const n = (v: number) => String(v).padStart(2, '0')

  return (
    <Fundo cor="var(--verde-profundo)">
      <MarcaCanto />

      <div style={{ position: 'absolute', left: 0, top: 0, width: 463, height: 720 }}>
        <img
          src="/assets/eventos-1.jpg"
          alt="Equipe do Banco da Amazônia no estande das feiras Agrotins e Agrobalsas"
          // a foto é quase quadrada e a coluna é retrato: ancorada à esquerda, o
          // corte cai no lado direito e preserva a chamada da campanha
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'left center',
            display: 'block',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to right, rgb(0 42 35 / 30%) 0%, transparent 22%, transparent 76%, var(--verde-profundo) 100%)',
          }}
        />
      </div>

      <h2
        style={{
          position: 'absolute',
          left: 518,
          top: 36,
          margin: 0,
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: '0.06em',
          color: 'var(--verde-neon)',
        }}
      >
        EVENTOS E FEIRAS
      </h2>

      <p
        style={{
          position: 'absolute',
          left: 518,
          top: 92,
          width: 680,
          margin: 0,
          fontSize: 40,
          lineHeight: 1.16,
          fontWeight: 300,
          letterSpacing: '-0.015em',
          color: 'var(--branco)',
        }}
      >
        O Banco presente onde a <span style={{ color: 'var(--lima)' }}>Amazônia acontece</span>
      </p>

      <section
        style={{
          position: 'absolute',
          left: 518,
          top: 200,
          width: 704,
          height: 490,
          background: 'rgb(0 0 0 / 24%)',
          borderLeft: '3px solid var(--lima)',
          borderRadius: '2px 8px 8px 2px',
          padding: '24px 30px 20px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginBottom: 26,
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'var(--lima)',
            }}
          >
            Composição do período
          </h3>
          {dados && (
            <span style={{ fontSize: 13, color: 'rgb(255 255 255 / 48%)' }}>
              {dados.eventos.length} registros
              {dados.periodo ? ` · ${dados.periodo}` : ''}
            </span>
          )}
        </header>

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            gap: 34,
          }}
        >
          <Linha
            numero={n(feiras)}
            rotulo="Feiras realizadas"
            detalhe="Agronegócio, tecnologia e negócios"
            carregando={carregando}
          />
          <Linha
            numero={n(diversas)}
            rotulo="Ações diversas"
            detalhe={
              dados
                ? `${dados.esportivos.length} esportivas · ${dados.institucionais.length} institucionais`
                : '—'
            }
            carregando={carregando}
          />
          <Linha
            numero={n(projetos)}
            rotulo="Projetos aprovados"
            detalhe="Patrocínio · escolha direta e contratação"
            carregando={carregando}
          />
        </div>

        <footer
          style={{
            marginTop: 18,
            paddingTop: 16,
            borderTop: '1px solid rgb(255 255 255 / 12%)',
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'rgb(255 255 255 / 45%)',
            }}
          >
            Investimento aprovado
          </span>
          <span
            title={dados?.investimentoCheio}
            style={{
              fontSize: 26,
              fontWeight: 600,
              color: 'var(--lima)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {carregando ? '' : (dados?.investimentoFormatado ?? '—')}
          </span>
        </footer>
      </section>

      {erro && <AvisoDados mensagem={erro} style={{ left: 24, top: 632, maxWidth: 415 }} />}
    </Fundo>
  )
}
