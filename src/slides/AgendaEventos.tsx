/**
 * A agenda do período: cada evento realizado, na coluna do seu mês.
 *
 * No documento da COPAC isto ocupa três páginas de listas soltas (feiras, ações
 * diversas). Aqui vira uma grade só, ordenada pelo calendário — dá para ver de
 * relance que Maio concentrou as feiras e Março as ações institucionais.
 */
import type { DadosEventos, Evento, GrupoMes } from '../data/eventos'
import type { TipoEvento } from '../data/classificacaoEventos'
import { AvisoDados, ChipPeriodo, Esqueleto, Fundo, MarcaCanto } from './comum'
import { LegendaTipos, MarcaTipo } from './tiposEvento'

interface Props {
  dados: DadosEventos | null
  carregando: boolean
  erro: string | null
}

const COL_X = [40, 283, 526, 769, 1012]
const COL_W = 228
const TOPO = 104
/** altura útil da coluna, do topo até acima da legenda */
const ALTURA = 516

/**
 * Cinco colunas cabem confortavelmente; se a COPAC registrar eventos em mais
 * meses, a tipografia encolhe em vez de estourar a grade.
 */
function medidas(colunas: number, maiorColuna: number) {
  const largura = colunas <= 5 ? COL_W : Math.floor((1200 - (colunas - 1) * 15) / colunas)
  const arranjos = [
    { fonte: 13, linha: 16, gap: 11 },
    { fonte: 12, linha: 15, gap: 8 },
    { fonte: 11, linha: 14, gap: 6 },
  ]
  // cada item ocupa até duas linhas de texto mais o respiro
  const cabe = (a: (typeof arranjos)[number]) => maiorColuna * (a.linha * 2 + a.gap) <= ALTURA - 44
  return { largura, ...(arranjos.find(cabe) ?? arranjos[arranjos.length - 1]) }
}

function ItemEvento({
  evento,
  fonte,
  linha,
}: {
  evento: Evento
  fonte: number
  linha: number
}) {
  return (
    <li style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
      <MarcaTipo tipo={evento.tipoCanonico} tamanho={7} style={{ marginTop: (linha - 7) / 2 }} />
      <span
        title={`${evento.nome}${evento.tipoCanonico ? ` · ${evento.tipoCanonico}` : ''}`}
        style={{
          fontSize: fonte,
          lineHeight: `${linha}px`,
          color: 'rgb(255 255 255 / 88%)',
          // duas linhas no máximo: nomes como "FENETEC - FEIRA DE TECNOLOGIA DO
          // AGRONEGÓCIO EM DOM ELISEU" não podem empurrar a coluna inteira
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {evento.nome}
      </span>
    </li>
  )
}

function Coluna({
  grupo,
  x,
  largura,
  fonte,
  linha,
  gap,
}: {
  grupo: GrupoMes
  x: number
  largura: number
  fonte: number
  linha: number
  gap: number
}) {
  return (
    <div style={{ position: 'absolute', left: x, top: TOPO, width: largura, height: ALTURA }}>
      <header
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          paddingBottom: 9,
          marginBottom: 14,
          borderBottom: '1px solid rgb(226 255 106 / 28%)',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 17,
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            color: 'var(--verde-neon)',
          }}
        >
          {grupo.extenso}
        </h3>
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'rgb(255 255 255 / 52%)',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {grupo.eventos.length}
        </span>
      </header>

      <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap }}>
        {grupo.eventos.map((e) => (
          <ItemEvento key={e.id} evento={e} fonte={fonte} linha={linha} />
        ))}
      </ul>
    </div>
  )
}

export function AgendaEventos({ dados, carregando, erro }: Props) {
  const meses = dados?.porMes ?? []
  const maior = meses.reduce((m, g) => Math.max(m, g.eventos.length), 0)
  const { largura, fonte, linha, gap } = medidas(Math.max(meses.length, 1), maior)

  const presentes: TipoEvento[] = (['Feira', 'Esportivo', 'Institucional', 'Cultural'] as const)
    .filter((t) => meses.some((g) => g.eventos.some((e) => e.tipoCanonico === t)))

  return (
    <Fundo cor="var(--marrom)">
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
        AGENDA DO PERÍODO
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
        {dados
          ? `${dados.realizados.length} eventos realizados`
          : 'Eventos realizados no período'}
      </p>

      {erro ? (
        <AvisoDados mensagem={erro} style={{ left: 620, top: 22 }} />
      ) : (
        dados?.periodo && (
          // termina em 1190: a folha da marca ocupa 1223→1262 no canto
          <ChipPeriodo
            texto={dados.periodo}
            style={{ left: 950, top: 30, width: 240, justifyContent: 'center' }}
          />
        )
      )}

      {carregando
        ? COL_X.map((x, i) => (
            <div key={x} style={{ position: 'absolute', left: x, top: TOPO, width: COL_W }}>
              <Esqueleto w="60%" h={18} style={{ marginBottom: 20 }} />
              <div style={{ display: 'grid', gap: 12 }}>
                {Array.from({ length: 6 - i }, (_, k) => (
                  <Esqueleto key={k} w={`${92 - k * 6}%`} h={13} />
                ))}
              </div>
            </div>
          ))
        : meses.map((g, i) => (
            <Coluna
              key={g.indice}
              grupo={g}
              x={COL_X[i] ?? 40 + i * (largura + 15)}
              largura={largura}
              fonte={fonte}
              linha={linha}
              gap={gap}
            />
          ))}

      {!carregando && presentes.length > 0 && (
        <LegendaTipos
          style={{ position: 'absolute', left: 42, top: 648 }}
          tipos={presentes.map((tipo) => ({
            tipo,
            total: meses.reduce(
              (s, g) => s + g.eventos.filter((e) => e.tipoCanonico === tipo).length,
              0,
            ),
          }))}
        />
      )}

      {!carregando && dados && (
        <p
          style={{
            position: 'absolute',
            left: 42,
            top: 682,
            width: 1196,
            margin: 0,
            fontSize: 12,
            lineHeight: 1.4,
            color: 'rgb(255 255 255 / 46%)',
          }}
        >
          {/* as duas colunas que a própria aba marca como obrigatórias e que hoje
              estão vazias — deixar explícito é o que faz a lacuna ser preenchida */}
          Público presente: {dados.publico.preenchidos}/{dados.publico.esperados} eventos
          preenchidos · Negócios prospectados: {dados.negocios.preenchidos}/
          {dados.negocios.esperados} · UF: {dados.ufs.length || 'nenhuma'} informada(s)
          {dados.aClassificar.length > 0
            ? ` · ${dados.aClassificar.length} evento(s) sem tipo`
            : ''}
        </p>
      )}
    </Fundo>
  )
}
