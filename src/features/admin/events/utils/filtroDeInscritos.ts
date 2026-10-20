import { calculateAge } from '../../../../utils';
import { User } from '../../../../types/user';
import { filterUsers } from '../types';

/**
 * Só a parte da data ("2009-03-14"), sem hora nem fuso: o nascimento vem como
 * meia-noite UTC, e lido no horário de Brasília cairia no dia anterior — a
 * idade sairia um ano a menos justo no dia do aniversário.
 */
export const diaLocal = (valor?: string | Date | null) => {
  if (!valor) return null;
  const [ano, mes, dia] = String(
    valor instanceof Date ? valor.toISOString() : valor
  )
    .slice(0, 10)
    .split('-')
    .map(Number);
  return ano && mes && dia ? new Date(ano, mes - 1, dia) : null;
};

/** Idade no primeiro dia do evento (ou hoje, se o evento não chegou) */
export const idadeNoEvento = (
  nascimento?: string | Date | null,
  inicioDoEvento?: string | Date | null
) => {
  const nasceu = diaLocal(nascimento);
  if (!nasceu) return null;
  return calculateAge(nasceu, diaLocal(inicioDoEvento) ?? new Date());
};

export const FILTROS_VAZIOS: filterUsers = {
  aniversariantes: false,
  idadeMin: null,
  idadeMax: null,
  liberacao: '',
  saude: [],
  city: '',
  neighborhood: '',
};

/** Quantos filtros estão de pé — o número no botão "Filtros" */
export const quantosFiltros = (f: filterUsers) =>
  [
    f.aniversariantes,
    f.idadeMin != null || f.idadeMax != null,
    f.liberacao,
    f.saude.length,
    // cidade e bairro são um filtro só: a localidade
    f.city || f.neighborhood,
  ].filter(Boolean).length;

const normalizar = (texto?: string | null) =>
  (texto ?? '').trim().normalize('NFC').toLowerCase();

/** "MMDD" como número, para comparar aniversários sem o ano */
const diaDoAno = (data: Date) => data.getMonth() * 100 + data.getDate();

/**
 * Faz aniversário entre o primeiro e o último dia do evento, ano à parte. Um
 * evento de 30/12 a 02/01 atravessa o ano: vale do 30/12 ao 31/12 e do 01/01
 * ao 02/01.
 */
export const fazAniversarioNoEvento = (
  nascimento?: string | Date | null,
  inicio?: string | Date | null,
  fim?: string | Date | null
) => {
  const [nasceu, de, ate] = [
    diaLocal(nascimento),
    diaLocal(inicio),
    diaLocal(fim),
  ];
  if (!nasceu || !de || !ate) return false;
  const [dia, a, b] = [diaDoAno(nasceu), diaDoAno(de), diaDoAno(ate)];
  return a <= b ? dia >= a && dia <= b : dia >= a || dia <= b;
};

/**
 * Os inscritos que passam no filtro. A idade é a da coluna da lista (no
 * primeiro dia do evento), para o filtro e a tela não discordarem.
 */
export function filtrarInscritos(
  inscritos: User[],
  f: filterUsers,
  evento?: { startDate?: string | Date; endDate?: string | Date } | null
) {
  return inscritos.filter((u) => {
    if (
      f.aniversariantes &&
      !fazAniversarioNoEvento(u.birthday, evento?.startDate, evento?.endDate)
    ) {
      return false;
    }
    if (f.idadeMin != null || f.idadeMax != null) {
      const idade = idadeNoEvento(u.birthday, evento?.startDate);
      if (idade === null) return false;
      if (f.idadeMin != null && idade < f.idadeMin) return false;
      if (f.idadeMax != null && idade > f.idadeMax) return false;
    }
    if (
      f.liberacao &&
      (u.minorApprovalStatus || 'NOT_REQUIRED') !== f.liberacao
    ) {
      return false;
    }
    if (f.saude.includes('hipertenso') && u.hypertensive !== true) {
      return false;
    }
    if (f.saude.includes('diabetico') && u.diabetes !== true) return false;
    if (f.city && normalizar(u.city) !== normalizar(f.city)) return false;
    if (
      f.neighborhood &&
      normalizar(u.neighborhood) !== normalizar(f.neighborhood)
    ) {
      return false;
    }
    return true;
  });
}
