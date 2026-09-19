import { z } from 'zod';
import { REGISTER_USERS_SCHEMA } from '../features/admin/users/constants';

export type PaymentStatus =
  | 'PAID'
  | 'IN_ANALYSIS'
  | 'DECLINED'
  | 'CANCELED'
  | 'WAITING'
  | 'REFUNDED';

/**
 * Por onde o dinheiro entrou. `PENDING` é o estado de nascença — a cobrança
 * existe e ninguém pagou por lugar nenhum ainda —, e é o que separa a linha
 * que a tela ainda pode resolver à mão daquela que o gateway passou a governar.
 */
export type PaymentReceived = 'PENDING' | 'SYSTEM' | 'EXTERNAL';

export type PaymentMethod =
  | 'PIX'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'CASH'
  | 'BOLETO'
  | 'OTHER';

  export interface discountsResponse {
    id: string;
    percentage: number;
    description: string;
  }

export interface PaymentResponse {
  // dados do usuário
  id: string;
  fullName: string;
  email: string;
  cpf: string;
  profilePhotoUrl?: string;

  // dados do pagamento
  method: PaymentMethod;
  status: PaymentStatus;
  receivedFrom: PaymentReceived;
  amount: number;

  createdAt: string; // ISO date string
  updatedAt: string;

  eventId: string;
  roleRegistrationId: string;
  userId: string;
  groupId: string;
  groupName: string;

  payload: Record<string, any> | null;
  discountsAppliedId?: string;
  /**
   * `REGISTRATION`: o pagamento de uma inscrição (e dos produtos que foram
   * junto). `PRODUCTS`: compra avulsa de produto, sem grupo nem regra.
   */
  purchaseType?: 'REGISTRATION' | 'PRODUCTS';
  /** descrição da regra de inscrição; só nas linhas de inscrição */
  roleName?: string;
  /** quando os produtos desta compra foram entregues; null é "ainda não" */
  productsDeliveredAt?: string | null;
  /** produtos comprados junto deste ingresso */
  productItems?: {
    id: string;
    quantity: number;
    unitPrice: number;
    variant: {
      id: string;
      name: string;
      product: { id: string; name: string };
    };
  }[];
}
/** O perfil que uma pessoa tem em uma igreja. */
export interface ChurchRole {
  role: number;
  church: { id: string; name: string };
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  cpf: string;
  birthday: Date;
  cellphone: string;
  diabetes: boolean;
  hypertensive: boolean;
  profession: string;
  neighborhood: string;
  /** Opcionais no servidor: os cadastros anteriores à coluna não têm o dado */
  /** Só os 8 dígitos; a máscara é aplicada na exibição */
  zipCode?: string;
  street?: string;
  number?: string;
  city: string;
  state: string;
  worker: boolean;
  profilePhotoUrl?: string;
  badgeName?: string;
  /**
   * Perfil efetivo: super admin, usuário comum ou o mais alto dos vínculos.
   * Diz se a pessoa alcança a rota; em qual igreja, quem responde é
   * `churchRoles`.
   */
  role?: number;
  /**
   * Vínculos de painel: o perfil que ela tem em cada igreja. A mesma pessoa
   * pode ser admin de uma e financeiro de outra. Inscrito não tem nenhum.
   */
  churchRoles?: ChurchRole[];
  emergencyContact?: string;
  indicatedBy?: string;
  leadershipPosition?: string;
  /** Igreja que frequenta, texto livre — não é uma igreja do sistema */
  congregation?: string;
  pastorName?: string;
  /**
   * Nome do responsável — preenchido só quando o usuário é menor de 16 anos.
   * O telefone do responsável usa `emergencyContact`, mesmo campo.
   */
  guardianName?: string;
  religion?: string;
  notes?: string;
  eventId?: string;
  /** data/hora do cadastro do usuário no sistema (User.createdAt) */
  createdAt?: string;
  /** data/hora da inscrição no evento (EventOnUsers.createdAt) */
  registeredAt?: string;
  /** data/hora de entrada na lista de espera (Waitlist.createdAt) */
  waitlistCreatedAt?: string;
  bedrooms?: any[];
  teams?: any[];
  groupsRegistration?: any[];
  /**
   * Liberação de menor de idade para o evento desta linha — devolvido por
   * `GET /events/:idEvent/users`. `NOT_REQUIRED` é maior de idade.
   */
  minorApprovalStatus?: 'NOT_REQUIRED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  signedTermUrl?: string | null;
  minorApprovalReviewedById?: string | null;
  minorApprovalReviewedAt?: string | null;
  minorApprovalRejectionReason?: string | null;
  /** Inscrições do usuário — o `/users` devolve o evento de cada uma */
  events?: {
    event: { id: string; name: string; status: 'ACTIVE' | 'INACTIVE' | 'TEST' };
  }[];

}
export interface UserTeam extends User {
  roleTeam: 'LEADER' | 'MEMBER';
}
export type RegisterUsersFormType = z.infer<typeof REGISTER_USERS_SCHEMA>;
