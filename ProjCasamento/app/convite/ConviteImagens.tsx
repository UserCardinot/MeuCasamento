"use client";

import Image from "next/image";
import { type ReactNode, useState } from "react";

/** Coloque seus arquivos em `ProjCasamento/public/convite/` (ou defina NEXT_PUBLIC_CONVITE_* no .env.local). */
const SRC_LOGO = process.env.NEXT_PUBLIC_CONVITE_LOGO?.trim() || "/convite/logo.png";
const SRC_CAPA = process.env.NEXT_PUBLIC_CONVITE_CAPA?.trim() || "/convite/capa.jpg";

export function ConviteLogoImagem({ alt, fallback }: { alt: string; fallback: ReactNode }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback}</>;
  return (
    <div className="relative mx-auto mb-8 flex w-full justify-center px-2 sm:px-0">
      <Image
        src={SRC_LOGO}
        alt={alt}
        width={560}
        height={200}
        className="h-[4rem] max-h-[5rem] w-auto max-w-[min(280px,88vw)] object-contain text-invite-olive sm:h-[5rem] sm:max-h-[5.5rem]"
        onError={() => setFailed(true)}
        priority
      />
    </div>
  );
}

export function ConviteCapaImagem({ alt, fallback }: { alt: string; fallback: ReactNode }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <>{fallback}</>;
  return (
    <figure className="relative mx-auto mt-10 w-[min(15rem,78vw)] sm:w-[min(17rem,70vw)]">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-sm border border-invite-olive/25 bg-invite-cream shadow-sm">
        <Image src={SRC_CAPA} alt={alt} fill className="object-cover" sizes="(max-width: 640px) 78vw, 17rem" onError={() => setFailed(true)} priority />
      </div>
    </figure>
  );
}
