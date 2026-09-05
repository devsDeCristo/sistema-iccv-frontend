import { RegisterUsersFormType, User } from '../../../types/user';
import { formatCPF, formatPhoneNumber, removeMask } from '../../../utils';
import { ENUM_OPTION_LEADERSHIP_POSITION } from './constants';

/** Papel de quem não tem cargo administrativo — o participante comum. */
export const DEFAULT_USER_ROLE = 5;

/**
 * Usuário do servidor -> valores do formulário: aqui entram as máscaras e o
 * 0/1 dos selects de sim/não. Fica junto do caminho inverso porque quem mexe
 * em um quase sempre precisa mexer no outro.
 */
export function userToFormValues(user?: User | null): RegisterUsersFormType {
  return {
    fullName: user?.fullName || '',
    cpf: user?.cpf ? formatCPF(user.cpf) : '',
    birthday: user?.birthday ? new Date(user.birthday) : null,
    cellphone: user?.cellphone ? formatPhoneNumber(user.cellphone) : '',
    emergencyContact: user?.emergencyContact
      ? formatPhoneNumber(user.emergencyContact)
      : '',
    email: user?.email || '',
    worker: user?.worker ? 1 : 0,
    profession: user?.profession || '',
    neighborhood: user?.neighborhood || '',
    city: user?.city || '',
    state: user?.state || '',
    hypertensive: user?.hypertensive ? 1 : 0,
    diabetes: user?.diabetes ? 1 : 0,
    indicatedBy: user?.indicatedBy || '',
    religion: user?.religion || '',
    badgeName: user?.badgeName || '',
    notes: user?.notes || '',
    leadershipPosition: user?.leadershipPosition || '',
    role: user?.role ?? DEFAULT_USER_ROLE,
  };
}

/**
 * Valores do formulário -> corpo do PUT: tira as máscaras e troca "" por
 * undefined, senão o servidor grava string vazia em campo opcional.
 *
 * A permissão fica fora do payload de propósito. Quem altera acesso é o modal
 * de permissão, que envia só o campo `role`; um formulário de dados pessoais
 * não deveria mexer em acesso nem por acidente. Além disso, devolver o valor
 * do próprio cadastro derrubava a edição de quem tem `role` legado fora da
 * lista aceita pelo servidor (1, 2, 3, 5) — mesmo mudando só o nome.
 */
export function formValuesToUserPayload(data: RegisterUsersFormType) {
  const semValor = (valor?: string) => (valor === '' ? undefined : valor);
  const { role: _permissao, ...valores } = data;

  return {
    ...valores,
    worker: !!data.worker,
    hypertensive: !!data.hypertensive,
    diabetes: !!data.diabetes,
    cellphone: removeMask(data.cellphone),
    cpf: removeMask(data.cpf),
    emergencyContact: data.emergencyContact
      ? removeMask(data.emergencyContact)
      : undefined,
    indicatedBy: semValor(data.indicatedBy),
    religion: semValor(data.religion),
    notes: semValor(data.notes),
    leadershipPosition:
      data.leadershipPosition === ENUM_OPTION_LEADERSHIP_POSITION.NOT_POSITION
        ? undefined
        : semValor(data.leadershipPosition),
  };
}
