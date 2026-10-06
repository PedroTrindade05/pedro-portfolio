import { useEffect, useState } from "react";
import { profile } from "@/content/site";

const fmt = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: profile.timezone });

/** Hora local de São Paulo, atualizada a cada 10 s. */
export function Clock({ className = "" }: { className?: string }) {
  const [now, setNow] = useState(() => fmt.format(new Date()));
  useEffect(() => {
    const id = setInterval(() => setNow(fmt.format(new Date())), 10_000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className={`tabular-nums ${className}`}>
      {now} {profile.tzLabel}
    </span>
  );
}
