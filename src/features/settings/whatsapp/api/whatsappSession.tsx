import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../../utils/service';
import { GET_WHATSAPP_STATUS } from '../constants';
import { WhatsappConnection } from '../types';

const invalidar = () => queryClient.invalidateQueries(GET_WHATSAPP_STATUS);

/**
 * Toda ação é sobre a sessão de uma igreja.
 *
 * O `churchId` não tem valor padrão em lugar nenhum aqui, de propósito: um
 * padrão silencioso faria "desconectar" derrubar o número da primeira igreja
 * da lista em vez do que está na tela.
 */
const rota = (churchId: string) => `/churches/${churchId}/whatsapp`;

interface AcaoDaIgreja {
  churchId: string;
}

/** Abre a sessão: a partir daí o status passa a trazer o QR. */
const connectWhatsapp = ({ churchId }: AcaoDaIgreja) =>
  apiClient
    .post<WhatsappConnection>(`${rota(churchId)}/connect`)
    .then((response) => response.data)
    .catch(handleResponseThrowError());

export const useConnectWhatsapp = ({
  onSuccess,
  ...options
}: MutationOptions<WhatsappConnection, unknown, AcaoDaIgreja> = {}) =>
  useMutation({
    mutationFn: connectWhatsapp,
    onSuccess: (...args) => {
      invalidar();
      onSuccess?.(...args);
    },
    ...options,
  });

/** Pareamento sem QR: o admin digita o número e recebe o código de 8 caracteres. */
const requestPairingCode = ({
  churchId,
  phoneNumber,
}: AcaoDaIgreja & { phoneNumber: string }) =>
  apiClient
    .post<{ pairingCode: string }>(`${rota(churchId)}/pairing-code`, {
      phoneNumber,
    })
    .then((response) => response.data)
    .catch(handleResponseThrowError());

export const useRequestPairingCode = ({
  onSuccess,
  ...options
}: MutationOptions<
  { pairingCode: string },
  unknown,
  AcaoDaIgreja & { phoneNumber: string }
> = {}) =>
  useMutation({
    mutationFn: requestPairingCode,
    onSuccess: (...args) => {
      invalidar();
      onSuccess?.(...args);
    },
    ...options,
  });

/** Desiste do pareamento: fecha o QR e para as tentativas de conexão. */
const cancelPairing = ({ churchId }: AcaoDaIgreja) =>
  apiClient
    .delete<WhatsappConnection>(`${rota(churchId)}/pairing`)
    .then((response) => {
      handleResponseSuccess(response.data, 'Pareamento cancelado')();
      return response.data;
    })
    .catch(handleResponseThrowError());

export const useCancelPairing = ({
  onSuccess,
  ...options
}: MutationOptions<WhatsappConnection, unknown, AcaoDaIgreja> = {}) =>
  useMutation({
    mutationFn: cancelPairing,
    onSuccess: (...args) => {
      invalidar();
      onSuccess?.(...args);
    },
    ...options,
  });

/** Desconecta e apaga a sessão — o próximo uso pede pareamento de novo. */
const disconnectWhatsapp = ({ churchId }: AcaoDaIgreja) =>
  apiClient
    .delete<WhatsappConnection>(`${rota(churchId)}/session`)
    .then((response) => {
      handleResponseSuccess(response.data, 'WhatsApp desconectado')();
      return response.data;
    })
    .catch(handleResponseThrowError());

export const useDisconnectWhatsapp = ({
  onSuccess,
  ...options
}: MutationOptions<WhatsappConnection, unknown, AcaoDaIgreja> = {}) =>
  useMutation({
    mutationFn: disconnectWhatsapp,
    onSuccess: (...args) => {
      invalidar();
      onSuccess?.(...args);
    },
    ...options,
  });
