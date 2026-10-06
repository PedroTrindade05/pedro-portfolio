# Portfólio v5 · Pedro Trindade

SPA em React + TypeScript + Vite + Tailwind, com Three.js (WebGL puro), GSAP e Lenis.

```bash
npm install
npm run dev      # http://localhost:5520
npm run build    # gera dist/ (deploy na Vercel: vercel.json já tem o rewrite de SPA)
```

## Onde mexer

| O que | Arquivo |
| --- | --- |
| Textos, contatos, serviços, habilidades e ferramentas | `src/content/site.ts` |
| Projetos de desenvolvimento e UI/UX (ordem = ordem da vitrine) | `src/content/work.ts` |
| Peças de design gráfico | `src/content/design.ts` |
| Cor de acento | `DEFAULT_ACCENT` em `src/lib/accent.ts` |
| Foto do Sobre | `public/img/pedro.jpg` |

**Testar outra cor de acento sem mexer no código:** abra o site com `?accent=lime`, `?accent=red`, `?accent=yellow` ou `?accent=cyan`. A cor vale para botões, detalhes e até o reflexo do metal 3D.

**Link do projeto no ar:** preencha `url` no projeto em `work.ts` e o botão "Ver no ar" aparece no case.

**Níveis das habilidades:** o `level` (0 a 100) de cada item em `site.ts` preenche o medidor segmentado.

## Estrutura

```
src/
  gl/        stage.ts (um canvas WebGL para tudo), chrome*.ts (metal líquido em raymarching), preview.ts (prévia dos projetos)
  sections/  Hero, About, Work, Services, Skills, Design, Contact, Footer
  pages/     Home, CaseStudy (/trabalhos/:slug), DesignCase (/design/:slug)
  components/ Header, Cursor, Preloader, Transition, Lightbox, Frames, ui
  lib/       gsap, scroll (Lenis), pointer, accent, reveal, hooks
public/
  work/<slug>/   cover, thumb, shot-1..4, mobile-1..n (capturas reais dos projetos)
  design/<slug>/ peças originais + versões -sm para as grades
```

## Imagens

- `node scripts/thumbs.mjs` refaz as miniaturas `thumb.webp` (960x600) a partir de cada `cover.webp`.
- `node scripts/design-sm.mjs` refaz as versões `-sm.webp` das peças gráficas.

## Desempenho

- Um único canvas WebGL desenha o hero, os glifos de serviço, o contato e a prévia dos projetos, cada um no retângulo do seu elemento. Nada é desenhado fora da tela.
- Resolução adaptativa: se o quadro passar de ~24 ms a resolução cai sozinha e volta quando sobra folga.
- O metal líquido descarta cedo os pixels fora de uma esfera envolvente.
- As páginas de case são carregadas sob demanda e pré-buscadas depois que a home abre.
- `prefers-reduced-motion` desliga as animações pesadas.
