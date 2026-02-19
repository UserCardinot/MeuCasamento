// Tipos globais do projeto
// TODO: adicionar conforme necessário

export interface Presenca {
  nome: string;
  telefone: string;
  confirmado: boolean;
  data: string;
}

export interface Presente {
  nome: string;
  presente: string;
  valor?: number;
  data: string;
}

export interface Upload {
  tipo: "foto" | "audio";
  nome: string;
  arquivo: string;
  data: string;
}
