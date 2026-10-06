/**
 * ─────────────────────────────────────────────────────────────
 *  CONTEÚDO DO SITE
 *  Textos, contatos, serviços, habilidades e ferramentas.
 *  Projetos ficam em ./work.ts e peças gráficas em ./design.ts.
 * ─────────────────────────────────────────────────────────────
 */

const waText = "Oi, Pedro! Vi seu portfólio e quero conversar sobre um projeto.";

export const profile = {
  first: "Pedro",
  last: "Trindade",
  full: "Pedro Trindade",
  roles: ["Desenvolvedor front-end", "UI/UX designer", "Designer gráfico"],
  email: "phmtrindade5@gmail.com",
  phone: "+55 (18) 98114-7024",
  phoneHref: "tel:+5518981147024",
  whatsapp: `https://wa.me/5518981147024?text=${encodeURIComponent(waText)}`,
  location: "São Paulo, Brasil",
  timezone: "America/Sao_Paulo",
  tzLabel: "BRT",
  availability: "Disponível para projetos",
  photo: "/img/pedro.jpg",
};

export const socials = [
  { label: "Instagram", handle: "@pedro.trindade00", href: "https://www.instagram.com/pedro.trindade00/" },
  { label: "LinkedIn", handle: "in/pedro-trindade-dev", href: "https://www.linkedin.com/in/pedro-trindade-dev/" },
  { label: "WhatsApp", handle: "(18) 98114-7024", href: profile.whatsapp },
];

export const nav = [
  { id: "01", label: "Sobre", href: "#sobre" },
  { id: "02", label: "Trabalhos", href: "#trabalhos" },
  { id: "03", label: "Serviços", href: "#servicos" },
  { id: "04", label: "Habilidades", href: "#habilidades" },
  { id: "05", label: "Design", href: "#design" },
  { id: "06", label: "Contato", href: "#contato" },
];

export const hero = {
  eyebrow: "Portfólio ©2026",
  disciplines: ["Front-end", "UI/UX design", "Design gráfico"],
  pitch:
    "Desenho e desenvolvo produtos digitais com acabamento premium: interfaces claras, rápidas e cheias de detalhe, do primeiro wireframe ao último pixel no ar.",
  scroll: "Role para explorar",
};

export const about = {
  kicker: "Sobre mim",
  hello: "Oi, eu sou o Pedro.",
  paragraphs: [
    "Sou desenvolvedor front-end e UI/UX designer, e o design gráfico anda comigo desde o começo. Tenho experiência prática criando produtos digitais para o mercado de blockchain: carteiras, marketplaces, plataformas de cursos e mercados de previsão.",
    "Gosto de acompanhar o projeto de ponta a ponta. Entendo o que você precisa, desenho fluxos, wireframes e protótipos no Figma e depois transformo em código.",
  ],
  facts: [
    { k: "Base", v: "Brasil, atendo remoto" },
    { k: "Foco", v: "Produto digital e Web3" },
    { k: "Entrego", v: "Figma + código em produção" },
    { k: "Status", v: "Aberto a novos projetos" },
  ],
};

export type Service = { id: string; title: string; short: string; text: string; deliver: string[] };

/** A ordem define o glifo 3D: 0 = </>, 1 = cursor, 2 = caneta bézier. */
export const services: Service[] = [
  {
    id: "01",
    title: "Desenvolvimento front-end",
    short: "Código",
    text: "Sites, landing pages e aplicações web rápidas, responsivas e acessíveis. Quando faz sentido pra marca, entra animação, rolagem cinematográfica e 3D em tempo real.",
    deliver: ["Landing pages", "Sites institucionais", "Aplicações React", "Dashboards e painéis", "Animações e WebGL"],
  },
  {
    id: "02",
    title: "UI/UX design",
    short: "Interface",
    text: "Fluxos, wireframes e protótipos navegáveis no Figma. Interfaces pensadas pra serem entendidas no primeiro clique e entregues prontas pro código, sem retrabalho.",
    deliver: ["Fluxos de usuário", "Wireframes", "Protótipos navegáveis", "Design de interfaces", "Design systems"],
  },
  {
    id: "03",
    title: "Design gráfico",
    short: "Marca",
    text: "Identidade visual, mídia kit e peças para redes que mantêm a marca consistente da tela ao impresso. Tudo com a mesma régua de acabamento dos produtos digitais.",
    deliver: ["Identidade visual", "Mídia kit", "Campanhas para redes", "Direção de arte", "Materiais gráficos"],
  },
];

/**
 * Habilidades. `level` (0 a 100) preenche a barra segmentada: ajuste aos seus níveis reais.
 * `icon` = ícone em src/components/Icons.tsx.
 */
export type Skill = { name: string; note: string; level: number };
export type SkillGroup = { id: string; title: string; kicker: string; icon: string; skills: Skill[] };

export const skills = {
  lead: "",
  groups: [
    {
      id: "01",
      title: "Front-end",
      kicker: "Desenvolvimento",
      icon: "code",
      skills: [
        { name: "HTML", note: "Estrutura semântica e acessível", level: 95 },
        { name: "CSS", note: "Layouts responsivos e animação", level: 92 },
        { name: "JavaScript", note: "Interatividade e lógica de interface", level: 85 },
        { name: "React", note: "Componentes, hooks e SPAs", level: 85 },
        { name: "Tailwind CSS", note: "Design system direto no código", level: 90 },
      ],
    },
    {
      id: "02",
      title: "Design UI/UX",
      kicker: "Produto",
      icon: "cursor",
      skills: [
        { name: "Figma", note: "Ferramenta principal de design", level: 92 },
        { name: "Protótipos", note: "Navegáveis, pra validar cedo", level: 90 },
        { name: "Wireframes", note: "Estrutura antes da forma", level: 90 },
        { name: "Design de interfaces", note: "Telas prontas pro código", level: 92 },
      ],
    },
    {
      id: "03",
      title: "Design gráfico",
      kicker: "Marca",
      icon: "pen",
      skills: [
        { name: "Identidade visual", note: "Sistemas de marca consistentes", level: 88 },
        { name: "Mídia kit", note: "Marca aplicada do digital ao físico", level: 88 },
        { name: "Social media", note: "Feed, stories e campanhas", level: 90 },
        { name: "Direção de arte", note: "Linguagem visual de sites e peças", level: 85 },
      ],
    },
  ] satisfies SkillGroup[],
};

export type ToolCat = "front" | "motion" | "design" | "ia" | "media";
export type Tool = { name: string; cat: ToolCat; desc: string; img: string };

export const tools = {
  lead: "",
  cats: [
    { id: "front", label: "Front-end", note: "Base de todo projeto" },
    { id: "motion", label: "Motion & 3D", note: "Animação e experiências imersivas" },
    { id: "design", label: "Design & protótipo", note: "Interfaces, fluxos e peças" },
    { id: "ia", label: "Inteligência artificial", note: "Pesquisa, código e revisão" },
    { id: "media", label: "Criação com IA", note: "Imagem, vídeo e voz" },
  ] as { id: ToolCat; label: string; note: string }[],
  items: [
    { name: "HTML", cat: "front", img: "/img/tools/html.webp", desc: "Estrutura semântica" },
    { name: "CSS", cat: "front", img: "/img/tools/css.webp", desc: "Estilo e layout" },
    { name: "JavaScript", cat: "front", img: "/img/tools/js.webp", desc: "Interatividade" },
    { name: "TypeScript", cat: "front", img: "/img/tools/ts.webp", desc: "Código tipado" },
    { name: "React", cat: "front", img: "/img/tools/react.webp", desc: "Interfaces em componentes" },
    { name: "Tailwind", cat: "front", img: "/img/tools/tailwind.webp", desc: "CSS utilitário" },
    { name: "GSAP", cat: "motion", img: "/img/tools/gsap.webp", desc: "Animações" },
    { name: "Three.js", cat: "motion", img: "/img/tools/threejs.webp", desc: "3D na web" },
    { name: "Lenis", cat: "motion", img: "/img/tools/lenis.webp", desc: "Rolagem suave" },
    { name: "Figma", cat: "design", img: "/img/tools/figma.webp", desc: "Design de interfaces" },
    { name: "Canva", cat: "design", img: "/img/tools/canva.webp", desc: "Peças gráficas" },
    { name: "Gamma", cat: "design", img: "/img/tools/gamma.webp", desc: "Apresentações com IA" },
    { name: "UX Pilot", cat: "design", img: "/img/tools/uxpilot.webp", desc: "Interfaces com IA" },
    { name: "Stitch", cat: "design", img: "/img/tools/stitch.webp", desc: "Telas com IA" },
    { name: "Claude", cat: "ia", img: "/img/tools/claude.webp", desc: "Assistente de IA" },
    { name: "Codex", cat: "ia", img: "/img/tools/codex.webp", desc: "Agente de código" },
    { name: "Cursor", cat: "ia", img: "/img/tools/cursor.webp", desc: "Editor com IA" },
    { name: "Gemini", cat: "ia", img: "/img/tools/gemini.webp", desc: "IA do Google" },
    { name: "ChatGPT", cat: "ia", img: "/img/tools/gpt.webp", desc: "Assistente de IA" },
    { name: "Higgsfield", cat: "media", img: "/img/tools/higgsfield.webp", desc: "Vídeo com IA" },
    { name: "ElevenLabs", cat: "media", img: "/img/tools/elevenlabs.webp", desc: "Voz com IA" },
    { name: "Nano Banana", cat: "media", img: "/img/tools/nano.webp", desc: "Imagens com IA" },
  ] as Tool[],
};

export const contact = {
  kicker: "Contato",
  title: ["Tem um projeto", "em mente?"],
  text: "Me conta sua ideia. Eu volto com os próximos passos e uma proposta sob medida, sem enrolação.",
  cta: "Iniciar projeto",
  mailSubject: "Novo projeto pelo portfólio",
};
