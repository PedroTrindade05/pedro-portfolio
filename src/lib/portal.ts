/**
 * Ponte entre quem pede o salto (botão "voltar ao topo") e o componente que desenha
 * o portal. `portalTo` devolve false quando não há portal (movimento reduzido, sem WebGL
 * ou destino perto), e aí quem chamou faz a rolagem normal.
 */
export type PortalOrigin = { x: number; y: number };
type Impl = (y: number, origin?: PortalOrigin) => boolean;

let impl: Impl | null = null;

export const registerPortal = (fn: Impl | null) => {
  impl = fn;
};

export const portalTo = (y: number, origin?: PortalOrigin) => impl?.(y, origin) ?? false;
