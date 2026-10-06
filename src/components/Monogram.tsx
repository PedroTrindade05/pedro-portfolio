import { useId } from "react";

/** Monograma PT em metal escovado com o ponto de acento. */
export function Monogram({ className = "" }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6f7f9" />
          <stop offset=".42" stopColor="#9aa0a8" />
          <stop offset=".55" stopColor="#eef0f2" />
          <stop offset="1" stopColor="#6c7178" />
        </linearGradient>
        <linearGradient id={`b${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1c1c1f" />
          <stop offset="1" stopColor="#0b0b0c" />
        </linearGradient>
      </defs>
      <rect x=".5" y=".5" width="63" height="63" rx="15" fill={`url(#b${id})`} stroke="rgba(255,255,255,.14)" />
      <path
        fill={`url(#g${id})`}
        d="M14 46V18h11.5c6.2 0 10 3.3 10 8.8S31.7 35.6 25.5 35.6H20.2V46zm6.2-15.6h4.7c2.7 0 4.2-1.4 4.2-3.7s-1.5-3.6-4.2-3.6h-4.7zM38.4 46V23.4h-6.9V18h20v5.4h-6.9V46z"
      />
      <circle cx="51" cy="44" r="3" fill="var(--acc)" />
    </svg>
  );
}
