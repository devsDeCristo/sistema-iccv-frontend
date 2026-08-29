export type WhatsappStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';

export interface WhatsappConnection {
  status: WhatsappStatus;
  /** Número pareado, só dígitos e com DDI */
  phoneNumber: string | null;
  pushName: string | null;
  /** Texto do QR enquanto espera leitura no celular */
  qr: string | null;
  /** Código de 8 caracteres do pareamento por número */
  pairingCode: string | null;
  connectedAt: string | null;
  lastError: string | null;
}
