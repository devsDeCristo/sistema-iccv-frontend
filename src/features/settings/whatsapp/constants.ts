export const GET_WHATSAPP_STATUS = 'GET_WHATSAPP_STATUS';

/**
 * De quanto em quanto tempo a tela pergunta a situação da conexão enquanto o QR
 * está no ar. O QR do WhatsApp se renova a cada ~20s, então a consulta precisa
 * ser mais frequente que isso para a imagem na tela não vencer.
 */
export const INTERVALO_ENQUANTO_CONECTA = 3000;
