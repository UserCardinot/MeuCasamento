import QRCode from "qrcode";
import CopiarChave from "./CopiarChave";

export default async function QrCodePix() {
  const pixCopiaCola = process.env.PIX_COPIA_COLA;
  const pixChave = process.env.PIX_CHAVE;

  if (!pixCopiaCola) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4 text-stone-700 text-sm">
        <p className="font-medium">Configure o Pix</p>
        <p className="mt-1">
          Adicione PIX_COPIA_COLA no .env.local (código copia e cola do seu banco) para exibir o QR Code.
        </p>
        <p className="mt-2 text-xs">
          Opcional: PIX_CHAVE para exibir chave para copiar (CPF, e-mail ou chave aleatória).
        </p>
      </div>
    );
  }

  const qrDataUrl = await QRCode.toDataURL(pixCopiaCola, { width: 200, margin: 2 });

  return (
    <div className="flex flex-col sm:flex-row gap-6 items-start">
      <div className="bg-white p-6 rounded-2xl shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt="QR Code Pix" className="w-48 h-48" />
      </div>
      <div className="flex-1 space-y-2">
        <p className="text-stone-600 text-sm">
          Escaneie o QR Code pelo app do seu banco para pagar.
        </p>
        {pixChave && (
          <>
            <p className="text-sm font-medium text-stone-700">Ou copie a chave Pix:</p>
            <div className="flex gap-2">
              <code className="flex-1 bg-stone-100 px-3 py-2 rounded text-sm break-all">
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

