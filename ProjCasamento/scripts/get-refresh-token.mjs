/**
 * Script para obter o REFRESH_TOKEN do Google OAuth2
 * Rode: node scripts/get-refresh-token.mjs
 *
 * Antes: configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no .env.local
 * ou passe como variáveis de ambiente.
 */

import { google } from "googleapis";
import readline from "readline";

const SCOPES = [
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/drive.file",
];

async function main() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.error("Configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no .env.local");
    console.error("Ou: set GOOGLE_CLIENT_ID=xxx && set GOOGLE_CLIENT_SECRET=yyy && node scripts/get-refresh-token.mjs");
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    "urn:ietf:wg:oauth:2.0:oob"
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: SCOPES,
    prompt: "consent",
  });

  console.log("\n1. Abra este link no navegador:\n");
  console.log(authUrl);
  console.log("\n2. Autorize o acesso e copie o código que aparecer na tela.");
  console.log("3. Cole o código abaixo:\n");

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const code = await new Promise((resolve) => rl.question("Código: ", resolve));
  rl.close();

  const { tokens } = await oauth2Client.getToken(code);
  const refreshToken = tokens.refresh_token;

  if (refreshToken) {
    console.log("\n✅ Sucesso! Adicione ao seu .env.local:\n");
    console.log(`GOOGLE_REFRESH_TOKEN=${refreshToken}\n`);
  } else {
    console.log("\n❌ Não foi possível obter o refresh token.");
    console.log("Se já autorizou antes, revogue o acesso em:");
    console.log("https://myaccount.google.com/permissions\n");
    process.exit(1);
  }
}

main().catch(console.error);
