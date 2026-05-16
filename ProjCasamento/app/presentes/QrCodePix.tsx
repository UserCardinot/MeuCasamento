import QRCode from "qrcode";
import CopiarChave from "./CopiarChave";
import { presentesCard } from "./presentesTheme";

export default async function QrCodePix() {
  const pixCopiaCola = process.env.PIX_COPIA_COLA;
  const pixChave = process.env.PIX_CHAVE;

  if (!pixCopiaCola) {
    return (
      <div className={`${presentesCard} p-5 font-sans text-sm text-invite-olive/85`}>
        <p className="font-invite-caps text-[0.68rem] font-medium uppercase tracking-[0.14em] text-invite-olive">
          Configure o Pix
        </p>
        <p className="mt-2 leading-relaxed">
          Adicione <code className="text-xs">PIX_COPIA_COLA</code> no .env.local para exibir o QR Code.
        </p>
      </div>
    );
  }

  const qrDataUrl = await QRCode.toDataURL(pixCopiaCola, { width: 200, margin: 2 });

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
      <div className={`${presentesCard} shrink-0 p-4`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt="QR Code Pix" className="h-48 w-48" />
      </div>
      <div className="min-w-0 flex-1 space-y-3">
        <p className="font-sans text-sm leading-relaxed text-invite-olive/80">
          Escaneie o QR Code pelo app do seu banco.
        </p>
        {pixChave && (
          <>
            <p className="font-invite-caps text-[0.65rem] font-medium uppercase tracking-[0.14em] text-invite-olive/70">
              Ou copie a chave
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-stretch">
              <code className="flex-1 break-all border border-invite-olive/20 bg-white/80 px-3 py-2.5 font-sans text-xs text-invite-olive">
                {pixChave}
              </code>
              <CopiarChave chave={pixChave} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
