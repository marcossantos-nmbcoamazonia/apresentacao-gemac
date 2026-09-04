/**
 * Slide 6 do deck — abertura da seção Publicidade.
 * Foto à esquerda (0→463px), título e o painel de produtos trabalhados,
 * que é alimentado por PUB-09 (união Jan → mês fechado) e PUB-10 (praças).
 */
import { AvisoDados, Esqueleto, Fundo, MarcaCanto } from './comum'

interface Props {
  produtos: string[]
  pracas: string
  periodo: string | null
  carregando: boolean
  erro: string | null
}

/** Altura útil da lista dentro do painel (px), descontados header e rodapé. */
const ALTURA_LISTA = 346

/**
 * A lista cresce conforme a área preenche a planilha ao longo do ano — em Jan
 * são 14 produtos, em Ago já são 26. A tipografia acompanha: escolhe o primeiro
 * arranjo que cabe na altura útil, do mais confortável ao mais compacto.
 */
function medidasDaLista(
  total: number,
  altura = ALTURA_LISTA,
): { colunas: number; fonte: number; linha: number } {
  const arranjos = [
    { colunas: 1, fonte: 23, linha: 40 },
    { colunas: 2, fonte: 19, linha: 32 },
    { colunas: 2, fonte: 16, linha: 26 },
    { colunas: 3, fonte: 15, linha: 24 },
    { colunas: 3, fonte: 13, linha: 21 },
  ]
  return (
    arranjos.find((a) => Math.ceil(total / a.colunas) * a.linha <= altura) ??
    arranjos[arranjos.length - 1]
  )
}

export function DivisorPublicidade({ produtos, pracas, periodo, carregando, erro }: Props) {
  const { colunas, fonte, linha } = medidasDaLista(produtos.length)

  return (
    <Fundo cor="var(--verde-profundo)">
      <MarcaCanto />

      {/* foto lateral */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 463, height: 720 }}>
        <img
          src="/assets/publicidade-lateral.jpg"
          alt="Produtores rurais em campo, apoiados pelo crédito do Banco da Amazônia"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
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
        PUBLICIDADE
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
        Comunicação orientada à <span style={{ color: 'var(--lima)' }}>geração de negócios</span>
      </p>

      {/* painel de produtos */}
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
          padding: '22px 26px 20px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <header
          style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
            marginBottom: 14,
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
            Produtos trabalhados
          </h3>
          {!carregando && produtos.length > 0 && (
            <span style={{ fontSize: 13, color: 'rgb(255 255 255 / 48%)' }}>
              {produtos.length} produtos{periodo ? ` · acumulado ${periodo}` : ''}
            </span>
          )}
        </header>

        {/* overflow:hidden é a rede de segurança caso a lista cresça além do previsto */}
        <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
          {carregando ? (
            <div style={{ display: 'grid', gap: 12 }}>
              {Array.from({ length: 8 }, (_, i) => (
                <Esqueleto key={i} w={`${88 - i * 4}%`} h={16} />
              ))}
            </div>
          ) : produtos.length === 0 ? (
            <p style={{ margin: 0, fontSize: 17, color: 'rgb(255 255 255 / 50%)' }}>
              A planilha ainda não registra produtos para este período.
            </p>
          ) : (
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: 'none',
                columnCount: colunas,
                columnGap: 34,
              }}
            >
              {produtos.map((p) => (
                <li
                  key={p}
                  style={{
                    breakInside: 'avoid',
                    fontSize: fonte,
                    lineHeight: `${linha}px`,
                    fontWeight: 400,
                    color: 'var(--branco)',
                    paddingLeft: 16,
                    position: 'relative',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  title={p}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: linha / 2 - 2,
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      background: 'var(--verde-neon)',
                    }}
                  />
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>

        {pracas && (
          <footer
            style={{
              marginTop: 16,
              paddingTop: 14,
              borderTop: '1px solid rgb(255 255 255 / 12%)',
              display: 'flex',
              alignItems: 'baseline',
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
              Praças
            </span>
            <span style={{ fontSize: 21, fontWeight: 500, color: 'var(--lima)' }}>{pracas}</span>
          </footer>
        )}
      </section>

      {/* sobre a foto: é a única área livre do slide, e o painel de produtos
          já ocupa a coluna da direita inteira */}
      {erro && <AvisoDados mensagem={erro} style={{ left: 24, top: 632, maxWidth: 415 }} />}
    </Fundo>
  )
}
