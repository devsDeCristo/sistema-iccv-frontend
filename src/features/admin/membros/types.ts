/** Os tipos do módulo Membros — o formato do `src/membros` do backend */

export interface Pessoa {
  id: string;
  fullName: string;
  cpf: string;
  cellphone: string;
  email: string;
  profilePhotoUrl: string | null;
}

export interface Membro extends Pessoa {
  memberSince: string | null;
  family: { id: string; name: string } | null;
  /** O perfil dele nesta igreja: admin (2), tesouraria (3) ou nenhum */
  perfil: number | null;
}

export interface Familia {
  id: string;
  name: string;
  membros: number;
}

export interface Pendente extends Pessoa {
  createdAt: string;
}

export interface ListaDeMembros {
  membros: Membro[];
  familias: Familia[];
  pendentes: Pendente[];
}

/** Resultado da busca de quem colocar como membro: CPF vem pela metade */
export interface PessoaEncontrada {
  id: string;
  fullName: string;
  cpf: string;
  profilePhotoUrl: string | null;
  membroDe: { id: string; name: string } | null;
  pediuEsta: boolean;
  outraIgreja: string | null;
}
