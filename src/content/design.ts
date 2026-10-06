/**
 * ─────────────────────────────────────────────────────────────
 *  DESIGN GRÁFICO
 *  Peças em public/design/<slug>/.
 * ─────────────────────────────────────────────────────────────
 */

/** `sm` = versão reduzida para grades; `src` = original para o visualizador. */
export type Piece = { src: string; sm: string; caption: string; format: "feed" | "story" | "page" };

const piece = (src: string, caption: string, format: Piece["format"]): Piece => ({ src, sm: src.replace(".webp", "-sm.webp"), caption, format });

export type DesignProject = {
  slug: string;
  title: string;
  client: string;
  category: string;
  year: string;
  roles: string[];
  tools: string[];
  tagline: string;
  summary: string;
  overview: string;
  highlights: string[];
  cover: string;
  thumb: string;
  palette: string[];
  /** grupos de peças exibidos na página do projeto */
  groups: { title: string; note: string; pieces: Piece[] }[];
};

const g10 = "/design/feirao-g10";
const themes = [
  "Condições especiais",
  "Por que comprar no Feirão G10?",
  "Condições imbatíveis",
  "Seu momento é agora",
  "Seu carro vale muito",
  "Aprovação de crédito na hora",
  "O seu próximo carro está aqui",
  "Não perca essa chance",
  "Negocie do seu jeito",
];
const countdown: [string, string][] = [
  ["5d", "Faltam 5 dias"],
  ["4d", "Faltam 4 dias"],
  ["3d", "Faltam 3 dias"],
  ["2d", "Faltam 2 dias"],
  ["1d", "É amanhã"],
  ["0d", "É hoje"],
];

const adrenaPages = [
  "Capa",
  "Fachada do showroom",
  "Polo preta bordada",
  "Camisa social branca",
  "Camiseta preta",
  "Boné preto",
  "Boné branco",
  "Caneca preta",
  "Caneca branca",
  "Porta-placa",
];

export const designProjects: DesignProject[] = [
  {
    slug: "feirao-g10",
    title: "Feirão G10",
    client: "Feirão G10 · 10 lojas de veículos de Assis/SP",
    category: "Campanha para redes sociais",
    year: "2026",
    roles: ["Design gráfico", "Direção de arte", "Social media", "Tratamento de imagem"],
    tools: [],
    tagline: "Quatro dias, dez lojas",
    summary:
      "Campanha de Instagram do Feirão G10, que reuniu 10 lojas de veículos no Recinto da FICAR, em Assis/SP. São 9 temas em feed e story, mais uma contagem regressiva até o dia do evento.",
    overview:
      "O Feirão juntou lojas de carros novos, seminovos e usados num só lugar por quatro dias, com financiamento facilitado. A missão da campanha era levar gente ao recinto, então cada arte bate num argumento: condições especiais, taxas reduzidas, carência de até 60 dias, avaliação do usado e crédito na hora. No visual, fotos de pátio ao entardecer e vistas aéreas, títulos condensados com degradê azul e cartões de vidro fosco. Na contagem regressiva o texto vira pintura no asfalto de uma vista aérea do pátio.",
    highlights: [
      "9 temas com versão feed (4:5) e story (9:16), com layout readaptado para cada formato",
      "Contagem regressiva de 'Faltam 5 dias' até 'É hoje', com o texto pintado no asfalto",
      "Sistema fixo de assinatura: logo no topo, selo de data e local e parceiro de financiamento no rodapé",
      "Títulos condensados com degradê azul-celeste e cartões de vidro fosco para os benefícios",
    ],
    cover: `${g10}/cover.webp`,
    thumb: `${g10}/thumb.webp`,
    palette: ["#091628", "#539bfa", "#89dcfe", "#fbfbfb", "#050707"],
    groups: [
      {
        title: "Feed",
        note: "9 artes em 4:5",
        pieces: themes.map((c, i) => piece(`${g10}/feed-0${i + 1}.webp`, c, "feed")),
      },
      {
        title: "Stories",
        note: "9 artes em 9:16, readaptadas do feed",
        pieces: themes.map((c, i) => piece(`${g10}/story-0${i + 1}.webp`, c, "story")),
      },
      {
        title: "Contagem regressiva",
        note: "Feed e story, de 5 dias até o dia do evento",
        pieces: [
          ...countdown.map(([k, c]) => piece(`${g10}/count-feed-${k}.webp`, c, "feed")),
          ...countdown.map(([k, c]) => piece(`${g10}/count-story-${k}.webp`, c, "story")),
        ],
      },
    ],
  },
  {
    slug: "adrena",
    title: "Adrena",
    client: "Adrena · Luxury & Sports Cars",
    category: "Mídia kit",
    year: "2026",
    roles: ["Design gráfico", "Direção de arte", "Mockups de aplicação"],
    tools: ["Canva"],
    tagline: "Esportivos de luxo, marca afiada",
    summary:
      "Mídia kit da Adrena, loja de carros de luxo e esportivos. A marca aparece numa capa conceitual e em nove aplicações, da fachada do showroom ao uniforme.",
    overview:
      "O mídia kit mostra como a marca se comporta fora da tela. Abre com uma capa de clima automotivo: fibra de carbono, linhas de luz vermelhas, o símbolo em 3D metálico e um superesportivo em primeiro plano. Depois vêm páginas inteiras de aplicação, uma por peça: fachada, uniformes, bonés, canecas e porta-placa. Tudo em preto, vermelho e prata, com respiro de sobra para o logo trabalhar sozinho.",
    highlights: [
      "Capa com o símbolo em 3D metálico, fibra de carbono e linhas de luz vermelhas",
      "Fachada do showroom com o símbolo em letra-caixa vermelha e o logotipo em prata",
      "Uniformes em versão clara e escura com o logo bordado",
      "Brindes e acessórios: bonés, canecas e porta-placa em metal escovado",
    ],
    cover: "/design/adrena/cover.webp",
    thumb: "/design/adrena/thumb.webp",
    palette: ["#060505", "#171516", "#c20d0d", "#bfc0c0"],
    groups: [
      {
        title: "Páginas",
        note: "10 páginas, da capa às aplicações",
        pieces: adrenaPages.map((c, i) => piece(`/design/adrena/page-${String(i + 1).padStart(2, "0")}.webp`, c, "page")),
      },
    ],
  },
];

export const getDesign = (slug: string) => designProjects.find((d) => d.slug === slug);
