/**
 * ─────────────────────────────────────────────────────────────
 *  PROJETOS (desenvolvimento e UI/UX)
 *  A ordem do array é a ordem da vitrine. Imagens em public/work/<slug>/.
 *  `url`: link do projeto no ar (deixe null para esconder o botão).
 * ─────────────────────────────────────────────────────────────
 */

export type Category = "Plataforma" | "Landing page" | "Aplicativo" | "Sistema" | "Campanha interativa";
export type Sector = "Web3" | "Automotivo" | "Varejo" | "Educação";
export type Shot = { src: string; caption: string; device: "desktop" | "mobile" };

export type Project = {
  slug: string;
  title: string;
  client: string;
  category: Category;
  type: string;
  year: string;
  sector: Sector;
  roles: string[];
  stack: string[];
  tagline: string;
  summary: string;
  overview: string;
  highlights: string[];
  cover: string;
  thumb: string;
  shots: Shot[];
  url: string | null;
  /** cor da marca do projeto (detalhes na página do case) */
  accent: string;
};

type Screen = [file: string, caption: string];

/** Monta caminhos e separa telas desktop e mobile a partir dos nomes dos arquivos. */
function build(p: Omit<Project, "cover" | "thumb" | "shots"> & { screens: Screen[] }): Project {
  const base = `/work/${p.slug}`;
  const { screens, ...rest } = p;
  return {
    ...rest,
    cover: `${base}/cover.webp`,
    thumb: `${base}/thumb.webp`,
    shots: screens.map(([file, caption]) => ({
      src: `${base}/${file}`,
      caption,
      device: file.startsWith("mobile") ? "mobile" : "desktop",
    })),
  };
}

export const projects: Project[] = [
  build({
    slug: "weprediction",
    title: "WePrediction Landing",
    client: "WePrediction",
    category: "Landing page",
    type: "Landing page · WebGL e 3D",
    year: "2026",
    sector: "Web3",
    roles: ["UI/UX Design", "Front-end", "Motion", "3D / WebGL"],
    stack: ["React", "TypeScript", "Three.js", "GSAP", "Lenis", "Tailwind CSS"],
    tagline: "Vote no futuro, em 3D",
    summary:
      "Landing do WePrediction, um mercado de previsões, com logo 3D cromado, rolagem cinematográfica e uma rodada de Sobe ou Cai que dá pra jogar ali mesmo.",
    overview:
      "A ideia era apresentar um produto cheio de números (odds, rodadas, preços ao vivo) sem virar uma planilha. A identidade ficou em grafite e prata, com amarelo neon só nos detalhes, e cada seção ganhou uma peça visual própria: o logo extrudado em 3D no hero, uma galeria curva de mercados, um celular que mostra a aposta passo a passo, um globo de pontos para o clima e moedas 3D de Pix e cripto. Tudo amarrado por rolagem suave, títulos que entram linha a linha e uma transição em WebGL entre as seções.",
    highlights: [
      "Logo WP extrudado do SVG oficial em three.js, com material cromado e shader de seda no fundo",
      "Rodada demo de Sobe ou Cai de 20 segundos com o preço do BTC ao vivo",
      "Seção Como funciona presa à rolagem: um celular percorre escolher, votar e receber",
      "Globo 3D de pontos que gira até a cidade de cada mercado de clima",
      "Transição de portal em WebGL no menu, rolagem com Lenis e títulos com GSAP SplitText",
      "Quatro idiomas e páginas de Suporte e Termos com um @ cromado em 3D",
    ],
    screens: [
      ["cover.webp", "Hero com o logo WP em 3D e cards de mercado ao vivo"],
      ["shot-1.webp", "Galeria curva de mercados"],
      ["shot-2.webp", "Rodada demo de Sobe ou Cai com resultado"],
      ["shot-3.webp", "Globo de pontos dos mercados de clima"],
      ["shot-4.webp", "Moedas 3D de Pix e cripto na seção de pagamentos"],
      ["mobile-1.webp", "Hero no celular"],
      ["mobile-2.webp", "Mercados no celular"],
    ],
    url: null,
    accent: "#FFE600",
  }),
  build({
    slug: "hubib-prediction",
    title: "WePrediction",
    client: "WePrediction",
    category: "Plataforma",
    type: "Plataforma web · Mercado de previsões",
    year: "2026",
    sector: "Web3",
    roles: ["UI/UX Design", "Front-end"],
    stack: ["React", "TypeScript", "Tailwind CSS", "TanStack Query", "PixiJS", "i18next"],
    tagline: "Previsões ao vivo, rodada a rodada",
    summary:
      "Plataforma de mercado de previsões: a pessoa aposta Sim ou Não em eventos reais e joga rodadas rápidas de Sobe ou Cai com o preço das criptos em tempo real.",
    overview:
      "O WePrediction junta dois jeitos de jogar: mercados de longo prazo (esportes, cripto, tecnologia, clima) e rodadas relâmpago de poucos minutos sobre o preço de BTC, ETH, SOL e DOGE. O desafio era deixar tudo legível numa interface escura e densa, com preço mudando a cada instante, chat rolando ao lado e dinheiro de verdade em jogo. O front-end inteiro foi construído em cima de duas APIs, com gráfico ao vivo em WebGL, atualização por SSE e carteira integrada, em quatro idiomas.",
    highlights: [
      "Rodadas Sobe ou Cai com gráfico ao vivo em PixiJS, preço via WebSocket e troca de rodada por SSE",
      "Mercados Sim/Não e de múltiplas opções com histórico de probabilidade e retorno estimado antes de confirmar",
      "Cashout de posição com cotação que se renova enquanto o modal está aberto",
      "Chat global em tempo real, comentários e atividade em cada mercado",
      "Aba Clima com mapa-múndi por continente e ranking com pódio",
      "Carteira com depósito em cripto ou Pix, saque, extrato e KYC, em quatro idiomas",
    ],
    screens: [
      ["cover.webp", "Home com as ordens ativas e a rodada de BTC ao vivo"],
      ["shot-1.webp", "Vitrine de mercados com destaque, gráfico e novidades"],
      ["shot-2.webp", "Mercado de múltiplas opções com painel de aposta e retorno estimado"],
      ["shot-3.webp", "Categoria Clima com mapa-múndi e mercados por continente"],
      ["shot-4.webp", "Ranking com pódio e classificação geral"],
      ["mobile-1.webp", "Mercados rápidos no celular"],
      ["mobile-2.webp", "Detalhe de mercado no celular"],
    ],
    url: "https://app.weprediction.com",
    accent: "#FFE600",
  }),
  build({
    slug: "hubib-app",
    title: "Hubib App",
    client: "Hubib",
    category: "Aplicativo",
    type: "Conta digital · Cripto e previsões",
    year: "2026",
    sector: "Web3",
    roles: ["UI/UX Design", "Front-end"],
    stack: ["React", "TypeScript", "Tailwind CSS", "TanStack Query", "Framer Motion", "i18next"],
    tagline: "Conta cripto que paga você",
    summary:
      "App que junta conta digital, carteira cripto, cartões e mercados de previsão num só lugar. Dá pra depositar via Pix ou cripto, converter moedas, pagar com QR Code e ainda acumular pontos no caminho.",
    overview:
      "A Hubib precisava de um app que fosse ao mesmo tempo banco digital, carteira de criptomoedas e porta de entrada para os mercados de previsão. Ele nasce mobile-first, roda dentro do aplicativo nativo via WebView e ganha um layout próprio no desktop, com menu lateral, dashboard e evolução do saldo. Por cima da parte financeira entra uma camada de engajamento com Hub Points, check-in diário, missões e programa de afiliados, tudo em quatro idiomas.",
    highlights: [
      "Carteira multi-conta com saldos em BTC, ETH, SOL, USDT, USDC e BRL",
      "Depósito e saque via Pix ou cripto, conversão entre moedas e transferências internas",
      "Pagamentos e cobranças com QR Code",
      "Mercados de previsão com carteira própria, categorias, favoritos e mercados rápidos",
      "Cartões com loja própria e verificação de identidade integrada",
      "Gamificação com check-in diário, missões, assista e ganhe e árvore de afiliados",
    ],
    screens: [
      ["cover.webp", "Início no desktop: saldo, evolução dos últimos 30 dias, cartão e ações rápidas"],
      ["shot-1.webp", "Previsões: mercados por categoria com chances e multiplicadores"],
      ["shot-2.webp", "Meus cartões: cartão Imperial vinculado à conta principal"],
      ["shot-3.webp", "Gamificação: sequência de check-in, rendimento do mês e missões"],
      ["shot-4.webp", "Meu saldo: fiat e cripto somando todas as contas"],
      ["mobile-1.webp", "Início no celular"],
      ["mobile-2.webp", "Previsões no celular"],
      ["mobile-3.webp", "Extrato com Pix, conversões e QR Code"],
      ["mobile-4.webp", "Hub Points: disponíveis, bloqueados e histórico"],
    ],
    url: "https://app.hubib.com",
    accent: "#FFB600",
  }),
  build({
    slug: "gsmotors-landing",
    title: "GS Motors",
    client: "GS Motors Multimarcas · Assis/SP",
    category: "Landing page",
    type: "Landing page · 3D interativo",
    year: "2026",
    sector: "Automotivo",
    roles: ["UI/UX Design", "Front-end", "Motion", "3D / WebGL"],
    stack: ["React", "TypeScript", "Three.js", "React Three Fiber", "GSAP", "Lenis"],
    tagline: "Seminovos com cara de cinema",
    summary:
      "Landing da GS Motors, loja de seminovos em Assis/SP, com uma rodovia noturna em WebGL no topo, rolagem cinematográfica e o estoque real da loja com filtros, galeria e simulador de financiamento.",
    overview:
      "A loja já tinha um site em WordPress, mas precisava de uma vitrine à altura do Instagram, no preto, branco e vermelho do logotipo. O desafio foi juntar impacto visual (cena 3D, animações presas à rolagem) com uma página leve e útil pra quem quer comprar carro. O estoque vem da loja virtual no momento do build, então cada deploy reflete os anúncios do site, e toda conversa termina no WhatsApp com a mensagem pronta.",
    highlights: [
      "Hero com rodovia procedural em shaders próprios: segure o clique e o velocímetro sobe até 280 km/h",
      "Vitrine horizontal fixada na rolagem com os seis carros de maior valor do estoque",
      "Estoque com filtros animados com GSAP Flip e galeria por setas, teclado e swipe",
      "Simulador de financiamento pela tabela Price que envia a simulação pelo WhatsApp",
      "Showroom 3D com o símbolo GS extrudado em pintura automotiva",
      "Avaliação do usado validada com zod que monta a mensagem e abre o WhatsApp",
    ],
    screens: [
      ["cover.webp", "Hero com a rodovia noturna em WebGL"],
      ["shot-1.webp", "Destaques em vitrine horizontal fixada"],
      ["shot-2.webp", "Estoque completo com filtros"],
      ["shot-3.webp", "Simulador de financiamento"],
      ["shot-4.webp", "Showroom 3D com o símbolo GS"],
      ["mobile-1.webp", "Hero no celular"],
      ["mobile-2.webp", "Destaques no celular"],
    ],
    url: null,
    accent: "#CF2720",
  }),
  build({
    slug: "landing-hubib",
    title: "Hubib",
    client: "Hubib",
    category: "Landing page",
    type: "Landing page · Web3",
    year: "2026",
    sector: "Web3",
    roles: ["UI/UX Design", "Front-end", "Motion"],
    stack: ["React", "TypeScript", "Tailwind CSS", "Framer Motion", "i18next", "Vite"],
    tagline: "Um super app, uma história",
    summary:
      "Landing do super app financeiro Hubib, que junta carteira cripto, cartões, Academy, Shop e mercado de previsões. Tem página própria dos cartões e uma FAQ com assistente de IA que responde em streaming.",
    overview:
      "A Hubib tem muitos produtos debaixo do mesmo teto, e a landing precisava apresentar tudo sem virar catálogo. A solução foi uma narrativa guiada pela rolagem: o cartão sai do hero, trava no centro da tela e abre a coleção de sete cartões, seguido de um passo a passo, uma pilha de produtos e a seção de previsões. Depois vieram a página Hubib Cards, a versão mobile com componentes próprios, quatro idiomas e uma FAQ com busca e o botão Perguntar à IA.",
    highlights: [
      "Cartão que acompanha a rolagem do hero até a coleção, onde trava no centro e troca de visual",
      "Seletor da coleção de sete cartões com fundo que muda a cada escolha",
      "Pilha de produtos em que cada cartão sobe e encolhe o anterior conforme a rolagem",
      "FAQ com categorias, busca e Perguntar à IA com resposta em streaming",
      "Página Hubib Cards com hero próprio, benefícios e coleção em acordeão",
      "Quatro idiomas e layout mobile dedicado",
    ],
    screens: [
      ["cover.webp", "Hero com o cartão Universe flutuando sobre o planeta"],
      ["shot-1.webp", "Coleção de cartões com o Universe em destaque"],
      ["shot-2.webp", "Seção de previsões com categorias"],
      ["shot-3.webp", "Página Hubib Cards"],
      ["shot-4.webp", "FAQ com a IA respondendo em streaming"],
      ["mobile-1.webp", "Hero mobile com os produtos girando sobre o globo"],
      ["mobile-2.webp", "Perguntar à IA no celular"],
    ],
    url: null,
    accent: "#FFB800",
  }),
  build({
    slug: "hubib-academy",
    title: "Hubib Academy",
    client: "Hubib",
    category: "Plataforma",
    type: "Plataforma de cursos · Web3",
    year: "2026",
    sector: "Educação",
    roles: ["UI/UX Design", "Front-end", "Motion"],
    stack: ["React", "TypeScript", "Tailwind CSS", "GSAP", "TanStack Query", "i18next"],
    tagline: "Aprender dentro do ecossistema",
    summary:
      "Plataforma de cursos onde o aluno compra, assiste e conclui cursos usando o saldo e os pontos da carteira Hubib. Tem marketplace, player de aulas, sequência de estudos e certificados.",
    overview:
      "A Academy é o braço educacional do ecossistema: cursos próprios e de criadores parceiros, num marketplace integrado à carteira. O desafio era manter a estética premium e escura da marca numa plataforma grande, com área do aluno, área do criador e checkout com saldo, pontos ou cripto. Na área do aluno entraram a home com carrossel de originais e continuar assistindo, o player com módulos e materiais, o calendário de sequência de estudos e todo o fluxo de conclusão, do popup animado ao certificado em PDF.",
    highlights: [
      "Player de aulas com módulos, materiais de apoio, comentários e progresso por aula",
      "Sequência de estudos com calendário mensal de atividades",
      "Popup de conclusão de curso com entrada coreografada em GSAP",
      "Página do certificado com animação de entrada e exportação em PDF",
      "Marketplace com lançamentos em contagem regressiva e checkout com saldo, pontos ou cripto",
      "Quatro idiomas e login integrado à carteira",
    ],
    screens: [
      ["cover.webp", "Home do aluno com originais e continuar assistindo"],
      ["shot-1.webp", "Marketplace com próximos lançamentos e produtos populares"],
      ["shot-2.webp", "Player de aula com trilha de módulos"],
      ["shot-3.webp", "Mural de certificados conquistados"],
      ["shot-4.webp", "Certificado de conclusão pronto para resgatar"],
      ["mobile-1.webp", "Home no celular"],
      ["mobile-2.webp", "Calendário de sequência de estudos no celular"],
    ],
    url: null,
    accent: "#FFB700",
  }),
  build({
    slug: "hubib-marketplace",
    title: "Hubib Shop",
    client: "Hubib",
    category: "Plataforma",
    type: "Marketplace · Pontos e cripto",
    year: "2026",
    sector: "Web3",
    roles: ["Front-end", "UI/UX Design"],
    stack: ["React", "TypeScript", "Tailwind CSS", "shadcn/ui", "TanStack Query", "i18next"],
    tagline: "Pontos e cripto viram compras",
    summary:
      "Loja do ecossistema Hubib onde o usuário troca pontos e saldo da carteira cripto por produtos. Abre dentro do app e tem telas próprias para desktop e celular.",
    overview:
      "A Shop roda dentro do app, recebe a sessão do usuário por SSO e já mostra na entrada o saldo de pontos e da carteira. O desafio era deixar simples uma compra que pode ser paga com duas moedas ao mesmo tempo e sair de fornecedores diferentes. O resultado é um checkout em quatro etapas, com frete separado por entrega e uma barra que divide o total entre pontos e cripto, além de pedidos, devoluções e suporte por tickets.",
    highlights: [
      "Pagamento combinado: uma barra divide o total entre pontos e cripto",
      "Checkout em quatro etapas: endereço, frete, pagamento e confirmação",
      "Frete cotado por entrega, agrupando os itens de cada fornecedor",
      "Cupom de desconto aplicado direto no resumo",
      "Pedidos com rastreio, cancelamento e devolução com foto ou vídeo",
      "Suporte por tickets e interface em quatro idiomas",
    ],
    screens: [
      ["cover.webp", "Início com saldo de pontos e carteira, banner e mais vendidos"],
      ["shot-1.webp", "Categoria com busca, faixa de preço e ordenação"],
      ["shot-2.webp", "Página do produto com preço em pontos ou dólar"],
      ["shot-3.webp", "Carrinho lateral com quantidades e total"],
      ["shot-4.webp", "Checkout dividindo o pagamento entre pontos e USDT"],
      ["mobile-1.webp", "Início no celular"],
      ["mobile-2.webp", "Produto no celular"],
    ],
    url: null,
    accent: "#C57A44",
  }),
  build({
    slug: "ama-token",
    title: "AMA Token",
    client: "AMA Token",
    category: "Plataforma",
    type: "Área do investidor · Web3",
    year: "2025",
    sector: "Web3",
    roles: ["UI/UX Design", "Front-end"],
    stack: ["React", "TypeScript", "Tailwind CSS", "shadcn/ui", "Framer Motion", "i18next"],
    tagline: "Token verde, carteira completa",
    summary:
      "Painel do AMA Token, um token cripto com pegada de sustentabilidade. O usuário compra AMA, deposita e saca em cripto ou PIX, acompanha suas carteiras e indica amigos.",
    overview:
      "O AMA Token precisava de uma área do investidor que juntasse compra do token, movimentação de saldo e programa de indicação num lugar só. A interface segue a identidade da marca, com verde de floresta, detalhes em dourado e fotos da natureza no login. Foram construídas as telas de visão geral, compra em etapas, depósito e saque em cripto ou PIX, carteiras por rede, histórico com filtros e árvore de afiliados, todas com versão mobile própria e três idiomas.",
    highlights: [
      "Compra de AMA em etapas: valor, confirmação, processamento e resultado",
      "Depósito e saque por cripto (moeda e rede) ou PIX com QR Code",
      "Calculadora que converte ETH, BTC ou BRL em AMA",
      "Histórico com filtros e comprovante em PDF para baixar ou compartilhar",
      "Árvore de afiliados navegável por níveis com link de indicação",
      "Português, inglês e espanhol, com layout mobile dedicado",
    ],
    screens: [
      ["cover.webp", "Visão geral com saldo, cotação e calculadora de token"],
      ["shot-1.webp", "Compra de AMA com conversão em tempo real"],
      ["shot-2.webp", "Carteiras por rede e lista de ativos"],
      ["shot-3.webp", "Histórico de transações com filtros"],
      ["shot-4.webp", "Login com a identidade de sustentabilidade da marca"],
      ["mobile-1.webp", "Visão geral no celular"],
      ["mobile-2.webp", "Carteiras vinculadas no celular"],
    ],
    url: null,
    accent: "#238806",
  }),
  build({
    slug: "pdv-card",
    title: "W3 Pay PDV",
    client: "W3 Build",
    category: "Aplicativo",
    type: "App mobile · Maquininha cripto",
    year: "2026",
    sector: "Varejo",
    roles: ["UI/UX Design", "Front-end", "App mobile"],
    stack: ["Expo", "React Native", "TypeScript", "expo-router", "Reanimated", "i18n"],
    tagline: "Maquininha que recebe em USDT",
    summary:
      "App de maquininha Android que cobra em USDT: o lojista digita o valor, o app gera o QR e o cliente paga pela carteira.",
    overview:
      "A maquininha Gertec GPOS760 precisava de um PDV que funcionasse no balcão, com tela pequena, teclas físicas e operação rápida. O app guia a venda em poucos passos: valor, rede, QR e comprovante, com PIN para proteger histórico e resumo. O visual segue a marca do lojista, em tema claro e escuro, e a interface fala português, inglês e espanhol.",
    highlights: [
      "Teclado numérico grande para digitar o valor e escolher a moeda",
      "QR de cobrança com escolha de rede e contador de validade",
      "Detecção do pagamento por polling, com tela de aprovado animada e som",
      "Comprovante impresso na maquininha ou em PDF, com envio por WhatsApp",
      "Resumo do dia e histórico de vendas protegidos por PIN",
      "White-label: cor e logo do lojista por tema, claro e escuro",
    ],
    screens: [
      ["cover.webp", "Valor, QR de cobrança e pagamento aprovado"],
      ["comp-1.webp", "PIN, histórico de vendas e comprovante"],
      ["comp-2.webp", "Tema claro e escuro: venda, resumo e histórico"],
      ["mobile-1.webp", "Teclado para digitar o valor da venda"],
      ["mobile-2.webp", "QR de cobrança aguardando o pagamento"],
      ["mobile-3.webp", "Pagamento aprovado e resumo da venda"],
      ["mobile-4.webp", "Histórico de vendas no tema claro"],
      ["mobile-5.webp", "Resumo do dia com total recebido"],
      ["mobile-6.webp", "Acesso protegido por PIN"],
    ],
    url: null,
    accent: "#9EE072",
  }),
  build({
    slug: "garage-control",
    title: "GarageControl",
    client: "Projeto autoral",
    category: "Sistema",
    type: "Sistema web · Gestão de frota e garagens",
    year: "2026",
    sector: "Automotivo",
    roles: ["UI/UX Design", "Front-end"],
    stack: ["React", "TypeScript", "Vite", "Tailwind CSS", "shadcn/ui", "Recharts"],
    tagline: "Sua garagem num só painel",
    summary:
      "Sistema para quem cuida de uma coleção ou frota de carros: veículos, garagens, manutenções, documentos, despesas, agenda e tarefas num painel escuro com cara de central multimídia.",
    overview:
      "O GarageControl tira de planilha e de grupo de conversa a rotina de quem administra vários carros espalhados entre garagem, oficina, showroom e residência. O desafio era organizar muita informação (ficha técnica, IPVA, seguro, revisões, parcelas, vagas) sem perder o clima premium, então o login imita a central multimídia de um carro e, ao entrar, a interface dá um zoom para dentro do painel. Tudo em React e TypeScript, com versões próprias para desktop e celular.",
    highlights: [
      "Login com vídeo de abertura no formato de central multimídia e zoom de entrada no painel",
      "Início com alertas de atenção e vitrine de veículos com cards que expandem",
      "Ficha do veículo com galeria, valores e abas de financeiro, documentos e manutenções",
      "Financeiro com extrato mensal, gráfico de evolução, categorias e marcar como pago",
      "Tarefas em lista ou kanban com arrastar e soltar, e agenda mensal por categoria",
      "Gestão de acessos com matriz de permissões e documentos com controle de validade",
    ],
    screens: [
      ["cover.webp", "Início com alertas, vitrine de veículos e indicadores"],
      ["shot-1.webp", "Login no formato de central multimídia"],
      ["shot-2.webp", "Ficha do veículo com galeria e valores"],
      ["shot-3.webp", "Financeiro com extrato do mês, evolução e categorias"],
      ["shot-4.webp", "Agenda mensal com eventos por categoria"],
      ["mobile-1.webp", "Início no celular"],
      ["mobile-2.webp", "Ficha do veículo no celular"],
    ],
    url: null,
    accent: "#E50914",
  }),
  build({
    slug: "gsmotors-roleta",
    title: "Roleta do Feirão",
    client: "GS Motors Multimarcas",
    category: "Campanha interativa",
    type: "Totem touchscreen · Roleta de prêmios",
    year: "2026",
    sector: "Automotivo",
    roles: ["UI/UX Design", "Front-end", "Motion"],
    stack: ["React", "TypeScript", "Tailwind CSS", "Framer Motion", "Zustand", "Supabase"],
    tagline: "Teste sua sorte no feirão",
    summary:
      "Roleta de prêmios para o totem da GS Motors nos feirões: o participante escolhe o perfil, deixa nome e WhatsApp e gira uma esteira de prêmios que para no brinde sorteado pelo servidor.",
    overview:
      "O totem pode ficar deitado ou em pé, então a interface tem layouts próprios para paisagem e retrato. O sorteio acontece no servidor, que valida o participante, sorteia pelo percentual do público, baixa o estoque e grava o lead numa transação só; a esteira só encena o resultado. Pro estande nunca travar por causa de rede, o catálogo cai do servidor para o cache e depois para um catálogo embutido, e existe um modo de emergência que funciona offline.",
    highlights: [
      "Esteira de prêmios com desaceleração longa que vira vertical no totem em pé",
      "Dois públicos, comprador e visitante, com esteiras e catálogos próprios",
      "Resultado com versões para perda, prêmio padrão e prêmio raro",
      "Modo emergência com sorteio local, sem depender de rede",
      "Catálogo sincronizado com o painel e travado durante o giro",
      "Painel admin com prêmios, upload de imagem, resgates e exportação CSV",
    ],
    screens: [
      ["cover.webp", "Tela de repouso do totem"],
      ["shot-1.webp", "Roleta parada, pronta para girar"],
      ["shot-2.webp", "Esteira no meio do giro"],
      ["shot-3.webp", "Resultado de prêmio raro"],
      ["shot-4.webp", "Painel admin com participações e resgates"],
      ["mobile-1.webp", "Layout em pé, para o totem vertical"],
      ["mobile-2.webp", "Esteira vertical girando"],
    ],
    url: null,
    accent: "#E92027",
  }),
  build({
    slug: "gsmotors-raspadinha",
    title: "Raspadinha Premiada",
    client: "GS Motors Multimarcas",
    category: "Campanha interativa",
    type: "Totem touchscreen · Campanha de prêmios",
    year: "2026",
    sector: "Automotivo",
    roles: ["UI/UX Design", "Front-end", "Motion"],
    stack: ["React", "TypeScript", "Tailwind CSS", "Framer Motion", "Web Audio API", "Supabase"],
    tagline: "Raspe, concorra e acelere",
    summary:
      "Raspadinha digital para o totem da GS Motors nos feirões: o participante escolhe o perfil, digita o código do estande, nome e WhatsApp e raspa com o dedo uma cartela 3x3 até achar a trinca do prêmio.",
    overview:
      "Feita para rodar em tela cheia num totem touchscreen, com teclados virtuais próprios e um fluxo linear que volta ao início a cada participante. O prêmio e a cartela são decididos no servidor, então a tela só revela o que foi sorteado e nenhum sorteio acontece no navegador. Para a equipe do estande, um painel controla o catálogo de prêmios por público, a regra de telefone repetido e o resgate dos brindes.",
    highlights: [
      "Raspagem de verdade em canvas: a casa se revela com 40% raspado",
      "Destaque de quase lá quando duas casas iguais aparecem e brilho na trinca vencedora",
      "Som de atrito sintetizado na Web Audio API, que acompanha a velocidade do dedo",
      "Código de acesso de 6 dígitos validado no servidor",
      "Teclado QWERTY com acentos por toque longo e teclado numérico com máscara",
      "Painel admin com participações, resgate, exportação CSV e catálogo por público",
    ],
    screens: [
      ["cover.webp", "Tela de repouso do totem"],
      ["shot-1.webp", "Escolha do perfil do participante"],
      ["shot-2.webp", "Cartela sendo raspada, com o destaque de quase lá"],
      ["shot-3.webp", "Resultado com o tema dourado de prêmio raro"],
      ["shot-4.webp", "Painel admin com o catálogo de prêmios"],
      ["mobile-1.webp", "Cartela em tela vertical"],
      ["mobile-2.webp", "Painel admin no celular"],
    ],
    url: null,
    accent: "#E92027",
  }),
];

export const categories = ["Todos", "Plataforma", "Landing page", "Aplicativo", "Sistema", "Campanha interativa"] as const;

export const categoryPlural: Record<string, string> = {
  Todos: "Todos",
  Plataforma: "Plataformas",
  "Landing page": "Landing pages",
  Aplicativo: "Aplicativos",
  Sistema: "Sistemas",
  "Campanha interativa": "Campanhas",
};

export const getProject = (slug: string) => projects.find((p) => p.slug === slug);
export const nextProject = (slug: string) => {
  const i = projects.findIndex((p) => p.slug === slug);
  return projects[(i + 1) % projects.length];
};
