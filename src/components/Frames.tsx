import clsx from "clsx";

/** Moldura de navegador minimalista em grafite, com barra e "endereço". */
export function BrowserFrame({ src, alt, host, className = "", eager = false }: { src: string; alt: string; host: string; className?: string; eager?: boolean }) {
  return (
    <figure className={clsx("overflow-hidden rounded-[14px] border border-white/10 bg-ink-3 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.8)]", className)}>
      <div className="flex h-9 items-center gap-3 border-b border-white/[0.07] bg-[#141416] px-4">
        <span className="flex gap-1.5">
          <i className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <i className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <i className="h-2.5 w-2.5 rounded-full bg-white/15" />
        </span>
        <span className="mx-auto truncate rounded-full bg-white/[0.06] px-4 py-1 font-mono text-[10.5px] tracking-[0.02em] text-silver-2">{host}</span>
        <span className="w-[42px]" />
      </div>
      <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} decoding="async" className="block aspect-[16/10] w-full object-cover object-top" />
    </figure>
  );
}

/** Moldura de celular com bordas metálicas. */
export function PhoneFrame({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <figure
      className={clsx("relative rounded-[42px] p-[7px] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.55)]", className)}
      style={{ background: "linear-gradient(140deg,#e9ebee 0%,#8d9299 30%,#f4f5f7 52%,#6c7178 78%,#c9ccd1 100%)" }}
    >
      <div className="relative overflow-hidden rounded-[36px] bg-black">
        <img src={src} alt={alt} loading="lazy" decoding="async" className="block aspect-[390/844] w-full object-cover object-top" />
        <span className="absolute left-1/2 top-2.5 h-[22px] w-[30%] -translate-x-1/2 rounded-full bg-black" />
      </div>
    </figure>
  );
}
