# Apresentação COPAC — Marketing e Comunicação

Deck web que se comporta como uma apresentação em slides e lê os números direto
da planilha de fechamento, pela API. Substitui a montagem manual do PowerPoint:
ninguém digita indicador, e o próprio site mostra até que mês os dados estão
preenchidos.

Esta etapa cobre a **seção de Publicidade**: dez slides alimentados pela aba
`01 PUBLICIDADE`, uma lâmina de **Marketing de Influência** (outra planilha) e,
no fim, um **comparativo com o ano anterior**, que lê também a aba
`01 PUBLICIDADE - 2025`.

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

## Marketing de influência

A lâmina lê a aba `base` de uma planilha própria (`VITE_SHEET_ID_INFLUENCIA`,
com fallback no código). Essa aba não traz registro bruto: ela já é o consolidado
"Big Numbers", e o deck só reorganiza o que está lá. O parser
([influencia.ts](src/data/influencia.ts)) acha cada bloco pelo rótulo, então
inserir linhas na planilha não quebra nada.

- **O período sai do cabeçalho** (`ago./26 … out./26`). Quando a planilha
  ganhar Nov, a lâmina passa a mostrar "Ago – Nov 2026" sozinha.
- **O total vem da coluna TOTAL, nunca da soma dos meses.** Influenciadores e
  campanhas contam únicos (23 + 17 + 16 meses, mas 32 no período), e o
  engajamento é taxa.
- As observações da planilha viram a nota de rodapé.
- `npm run conferir` confere as somas internas: interações = soma das partes,
  conteúdos = Stories + Reels + outros e TOTAL = soma dos meses nas métricas
  somáveis.

## Comparativo anual

A última lâmina compara o ano corrente com o anterior no **mesmo recorte de
meses** (Jan → mês fechado nos dois anos). A aba do ano anterior é encontrada
pelo nome `<aba> - <ano - 1>`, com o ano tirado do cabeçalho `Acum. AAAA` da aba
corrente. Em 2027, o deck passa a ler `01 PUBLICIDADE - 2026` sem mudar o código.
Se o cabeçalho da aba anterior trouxer outro ano, a lâmina mostra erro em vez de
comparar.

A planilha de 2025 tem buracos grandes (leads só em Jun, nada em Jan e Mar).
Por isso:

- cada valor mostra quantos meses o sustentam (`6 de 10 meses`, `dado só em Jun`);
- a variação é sempre exibida, mesmo sobre base curta. Os leads saem como
  ▲ 3.333% sobre 2.167 leads, que é tudo o que 2025 registra em Jan–Out. Os
  74 de Dez ficam fora do recorte, como todo Nov/Dez de 2025, e a nota de
  rodapé diz isso;
- indicadores sem nenhum registro no ano anterior saem do quadro e são citados
  na nota de rodapé;
- **o fluxo aeroportuário (PUB-05) não entra no comparativo.** Em 2025 os
  valores ficam entre 150 e 436 Mi por mês; em 2026, perto de 2,7 Mi. São
  metodologias diferentes, e o quadro mostraria uma falsa queda de 99%;
- **produção (PUB-08) é a exceção.** O dashboard não tem data na aba de produção,
  então 2025 só tem o total do ano, lançado à mão na coluna `Acum. 2025`. Quando
  não há nenhum mês preenchido, esse total vira a base. A linha sai marcada como
  "total do ano 2025" e a variação compara Jan → mês fechado de 2026 com o ano
  inteiro de 2025;
- CTR e CPM usam só os meses em que numerador e denominador foram registrados.
  Em 2025 há investimento em Abr e Mai sem impressões, e somar esse investimento
  inflaria o CPM.

`npm run conferir` imprime o mesmo quadro no fim da saída.

## Estrutura

```
src/
  api/client.ts          fetch + cache de sessão (5 min) com fallback para cache vencido
  api/parseSheet.ts      parser genérico das abas de área — serve as 7 abas
  data/publicidade.ts    regra de negócio da seção (funções puras)
  data/usePublicidade.ts casca React sobre a anterior
  data/comparativo.ts    ano contra ano (funções puras) + useComparativo.ts
  data/influencia.ts     parser do consolidado de influência + useInfluencia.ts
  data/resolveClosedMonth.ts   a automação do mês fechado
  lib/numbers.ts         pt-BR: parse, formato compacto (317 Mi, 867 Mil), variação
  lib/listas.ts          normaliza os campos de texto livre (produtos, praças)
  deck/                  motor de apresentação (canvas 1280x720, atalhos, overview)
  slides/                os slides da seção
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
