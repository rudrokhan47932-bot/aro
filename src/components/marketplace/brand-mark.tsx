import type { CSSProperties } from "react";
import Image from "next/image";
import { useState } from "react";

export function BrandMark({ name, accent }: { name: string; accent: string }) {
  const [failed, setFailed] = useState(false);
  const slug = name.toLowerCase().replaceAll(" ", "-");
  return <div className="market-brand-mark" style={{ "--brand-accent": accent } as CSSProperties}>{failed ? <span>{name}</span> : <Image src={`/brands/${slug}.svg`} alt={`${name} logo`} fill sizes="180px" onError={() => setFailed(true)} />}</div>;
}
