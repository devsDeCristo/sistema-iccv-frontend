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

/** Abre a sessão: a partir daí o status passa a trazer o QR. */
const connectWhatsapp = () =>
  apiClient
    .post<WhatsappConnection>('/whatsapp/connect')
    .then((response) => response.data)
    .catch(handleResponseThrowError());

export const useConnectWhatsapp = ({
  onSuccess,
  ...options
}: MutationOptions<WhatsappConnection, unknown, void> = {}) =>
  useMutation({
    mutationFn: connectWhatsapp,
    onSuccess: (...args) => {
      invalidar();
      onSuccess?.(...args);
    },
    ...options,
  });

/** Pareamento sem QR: o admin digita o número e recebe o código de 8 caracteres. */
const requestPairingCode = (phoneNumber: string) =>
  apiClient
    .post<{ pairingCode: string }>('/whatsapp/pairing-code', { phoneNumber })
    .then((response) => response.data)
    .catch(handleResponseThrowError());

export const useRequestPairingCode = ({
  onSuccess,
  ...options
}: MutationOptions<{ pairingCode: string }, unknown, string> = {}) =>
  useMutation({
    mutationFn: requestPairingCode,
    onSuccess: (...args) => {
      invalidar();
      onSuccess?.(...args);
    },
    ...options,
  });

/** Desiste do pareamento: fecha o QR e para as tentativas de conexão. */
const cancelPairing = () =>
  apiClient
    .delete<WhatsappConnection>('/whatsapp/pairing')
    .then((response) => {
      handleResponseSuccess(response.data, 'Pareamento cancelado')();
      return response.data;
    })
    .catch(handleResponseThrowError());

export const useCancelPairing = ({
  onSuccess,
  ...options
}: MutationOptions<WhatsappConnection, unknown, void> = {}) =>
  useMutation({
    mutationFn: cancelPairing,
    onSuccess: (...args) => {
      invalidar();
      onSuccess?.(...args);
    },
    ...options,
  });

/** Desconecta e apaga a sessão gravada — o próximo uso pede pareamento de novo. */
const disconnectWhatsapp = () =>
  apiClient
    .delete<WhatsappConnection>('/whatsapp/session')
    .then((response) => {
      handleResponseSuccess(response.data, 'WhatsApp desconectado')();
      return response.data;
    })
    .catch(handleResponseThrowError());

export const useDisconnectWhatsapp = ({
  onSuccess,
  ...options
}: MutationOptions<WhatsappConnection, unknown, void> = {}) =>
  useMutation({
    mutationFn: disconnectWhatsapp,
    onSuccess: (...args) => {
      invalidar();
      onSuccess?.(...args);
    },
    ...options,
  });
