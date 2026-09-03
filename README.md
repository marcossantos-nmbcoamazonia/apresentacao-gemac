# Apresentação COPAC — Marketing e Comunicação

Deck web que se comporta como uma apresentação em slides e lê os números direto
da planilha de fechamento, pela API. Substitui a montagem manual do PowerPoint:
ninguém digita indicador, e o próprio site mostra até que mês os dados estão
preenchidos.

Esta etapa cobre a **capa** e a **seção de Publicidade** (slides 1, 6, 7 e 8 do
deck `Publicidade 3tri26 01.09 - V2.pptx`), alimentados pela aba `01 PUBLICIDADE`.

## Rodando

```bash
npm install
npm run dev          # http://localhost:5173
```

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` | build de produção em `dist/` |
| `npm run preview` | serve o build |
| `npm run conferir` | **imprime no terminal os números que o slide vai mostrar** |
| `npm run fontes` | rebaixa a Inter Tight para `public/fonts` |
| `npm run extract-assets` | reextrai as imagens do `.pptx` para `public/assets` |

`npm run conferir` é a ferramenta do dia a dia: usa as mesmas funções da
aplicação, então se a planilha mudar de formato ou avançar de mês, aparece ali
antes de virar problema na reunião.

## Apresentando

| Tecla | Ação |
|---|---|
| `→` `←` `espaço` `PgUp/PgDn` | navegar |
| `Home` `End` | primeiro / último slide |
| `F` | tela cheia |
| `O` | grade de miniaturas |
| `R` | recarregar os dados da planilha |

Também funciona por swipe no celular e por trackpad. Cada slide tem link direto:
`#/3` abre o terceiro. A barra inferior some sozinha durante a fala e volta ao
primeiro movimento do mouse.

A pílula à esquerda da barra é o indicador da automação: mostra
**"Dados até Ago/2026"** e há quanto tempo a planilha foi lida. Fica amarela
enquanto carrega e laranja se a API não responder — nunca se apresenta um número
velho sem aviso.

## Como os números são calculados

**O acumulado é somado aqui, mês a mês — não vem da coluna `Acum. 2026`.**
Essa coluna da planilha está defasada: em PUB-01 ela traz 37.038 (soma só até
Mai) e em PUB-02 traz 271.618.519 (só até Jun), enquanto a série já tem dados
até Ago. Somando Jan → mês fechado chega-se a 56.775 leads e 317 Mi de
impressões — exatamente os números do deck original, o que confirma que a soma
é o critério certo. `npm run conferir` verifica isso a cada execução.

**O mês de fechamento é deduzido dos dados**, não configurado: é o último mês
com valor em qualquer indicador numérico. A aba `PARAMETROS` não é consultada
porque está desatualizada (aponta Jun enquanto há dados até Ago).

**Buracos na série são respeitados.** PUB-04 não tem Fev/Mar e nem PUB-04 nem
PUB-05 têm Ago. Nesses casos o card mostra a nota `sem dado em Ago` e compara
`Jul vs. Jun` — em vez de somar zero e mentir sobre o mês.

**A variação é mês contra mês**, sempre rotulada com os meses comparados
(`Ago vs. Jul`), para não ser lida como variação do acumulado.

## Estrutura

```
src/
  api/client.ts          fetch + cache de sessão (5 min) com fallback para cache vencido
  api/parseSheet.ts      parser genérico das abas de área — serve as 7 abas
  data/publicidade.ts    regra de negócio da seção (funções puras)
  data/usePublicidade.ts casca React sobre a anterior
  data/resolveClosedMonth.ts   a automação do mês fechado
  lib/numbers.ts         pt-BR: parse, formato compacto (317 Mi, 867 Mil), variação
  lib/listas.ts          normaliza os campos de texto livre (produtos, praças)
  deck/                  motor de apresentação (canvas 1280x720, atalhos, overview)
  slides/                os quatro slides
scripts/                 extração de assets, download de fonte, conferência de dados
```

O canvas de autoria é **1280×720**, que é o slide do PPTX na escala exata
(13,333 pol × 96 dpi). Por isso a geometria dos slides usa os mesmos números do
arquivo original, e o `SlideFrame` só escala o conjunto para caber na tela.

## Marca

Cores e tipografia do
[brandcenter](https://brandcenter.bancoamazonia.com.br/expressao-visual/cores/):
verde escuro `#003C2D`, verde claro `#00E12D`, verde neon `#E6FF55`, areia
`#F5F5C8`. Os tons de aplicação (`#002A23`, `#005240`, `#4A170D`) são os valores
reais medidos no deck-fonte.

A fonte oficial é a **Inter Tight** (fallback Arial, como define a marca). Ela é
servida junto com o site, e não pelo Google Fonts: a apresentação roda em sala de
reunião e não pode cair para Arial se a rede oscilar.

Logo, símbolo, marcador `#INTERNA` e as fotos vêm do próprio `.pptx`, extraídos
por `npm run extract-assets`.

## Próximas seções

O parser e o motor já estão prontos para o resto do deck: cada seção nova é um
componente de slide mais o `range` correspondente (`02 DIGITAL`, `03 EVENTOS`,
`04 EVENTOS PROPRIET`, `05 IMPRENSA`, `06 CENTRO CULTURAL`, `07 CCBA DIGITAL`).
