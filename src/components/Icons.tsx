/** Ícones de linha das disciplinas (mesma linguagem dos glifos 3D). */
export function DisciplineIcon({ name, className = "" }: { name: string; className?: string }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "code")
    return (
      <svg viewBox="0 0 32 32" className={className} aria-hidden>
        <path {...common} d="M11 9 4 16l7 7M21 9l7 7-7 7M18 6l-4 20" />
      </svg>
    );
  if (name === "cursor")
    return (
      <svg viewBox="0 0 32 32" className={className} aria-hidden>
        <path {...common} d="M7 5v19l5.2-4.6 3.6 7.6 3.2-1.5-3.6-7.5H22z" />
      </svg>
    );
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <path {...common} d="M16 4.5 22 14.5H10z" />
      <circle {...common} cx="10" cy="22" r="5" />
      <rect {...common} x="17.5" y="17.5" width="9" height="9" rx="1" />
    </svg>
  );
}
