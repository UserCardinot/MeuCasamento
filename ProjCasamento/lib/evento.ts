/**
 * Configuração do evento (data, local, mapa)
 * Edite aqui para personalizar seu casamento
 */
export const EVENTO = {
  data: "2026-09-26",
  hora: "08:30",
  dataFormatada: "Sábado, 26 de Setembro de 2026",
  horaFormatada: "08h30",
  local: {
    nome: "Bosque de Agriões",
    endereco: "R. Juruena, 262 - Agriões, Teresópolis - RJ, 25963-040",
    cidade: "Teresópolis",
    mapUrl: "https://www.google.com/maps/place/Bosque+de+Agri%C3%B5es/@-22.4167594,-42.9768461,3a,68.3y,122.03h,78.94t/data=!3m7!1e1!3m5!1sYp0cumThtSm73VGLGRMlcw!2e0!6shttps:%2F%2Fstreetviewpixels-pa.googleapis.com%2Fv1%2Fthumbnail%3Fcb_client%3Dmaps_sv.tactile%26w%3D900%26h%3D600%26pitch%3D11.058348091225682%26panoid%3DYp0cumThtSm73VGLGRMlcw%26yaw%3D122.02907173963493!7i16384!8i8192!4m6!3m5!1s0x984cd48c5b8319:0xf7b6114c2482d912!8m2!3d-22.4167718!4d-42.97677!16s%2Fg%2F11c37jmz5r?entry=ttu&g_ep=EgoyMDI2MDIxOC4wIKXMDSoASAFQAw%3D%3D", // URL do Google Maps
  },
} as const;

/** Data do casamento em ms (para contagem regressiva) */
export function getEventoTimestamp(): number {
  return new Date(EVENTO.data + "T" + EVENTO.hora).getTime();
}
