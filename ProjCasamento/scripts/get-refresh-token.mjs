/**
 * Obtém GOOGLE_REFRESH_TOKEN (OAuth offline).
 *
 * Uso: npm.cmd run google:token
 *
 * Captura o código em http://127.0.0.1:3456 (fluxo oob antigo quebra com
 * "Malformed auth code").
 *
 * No Google Cloud → Credenciais → OAuth client, adicione:
 *   http://127.0.0.1:3456
 */

import { createServer } from "http";
import { exec } from "child_process";
import { google } from "googleapis";

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive",
];

const REDIRECT = "http://127.0.0.1:3456";
const PORT = 3456;

function openBrowser(url) {
  const cmd =
    process.platform === "win32"
      ? `start "" "${url}"`
      : process.platform === "darwin"
        ? `open "${url}"`
        : `xdg-open "${url}"`;
  exec(cmd);
}

async function main() {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();

  if (!clientId || !clientSecret) {
    console.error("Configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no .env.local");
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, REDIRECT);

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  const code = await new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      try {
        const url = new URL(req.url || "/", REDIRECT);
        const err = url.searchParams.get("error");
        if (err) {
          res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
          res.end(`<h1>Erro: ${err}</h1><p>Pode fechar esta aba.</p>`);
          server.close();
          reject(new Error(err));
          return;
        }
        const received = url.searchParams.get("code");
        if (!received) {
          res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
          res.end("Sem código.");
          return;
        }
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
        res.end(
          "<h1>Autorizado</h1><p>Pode fechar esta aba e voltar ao terminal.</p>"
        );
        server.close();
        resolve(received.trim());
      } catch (e) {
        reject(e);
      }
    });

    server.listen(PORT, "127.0.0.1", () => {
      console.log("\nAbrindo o navegador…\n");
      console.log("Se não abrir, use este link:\n");
      console.log(authUrl);
      console.log(
        "\nIMPORTANTE — no Google Cloud Console, no seu cliente OAuth,"
      );
      console.log("adicione o redirect URI exatamente:");
      console.log("  http://127.0.0.1:3456\n");
      openBrowser(authUrl);
    });

    server.on("error", reject);
  });

  const { tokens } = await oauth2Client.getToken(code);
  const refreshToken = tokens.refresh_token;

  if (refreshToken) {
    console.log("\nSucesso! Adicione ao .env.local e na VPS:\n");
    console.log(`GOOGLE_REFRESH_TOKEN=${refreshToken}\n`);
  } else {
    console.log("\nNão veio refresh_token.");
    console.log("Revogue em https://myaccount.google.com/permissions e rode de novo.\n");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("\nFalhou:", err?.response?.data || err.message || err);
  console.error(
    "\nConfira o redirect URI no Cloud Console: http://127.0.0.1:3456\n"
  );
  process.exit(1);
});
