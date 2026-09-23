import { MutationOptions, useMutation } from 'react-query';
import { apiClient } from '../../../../config/lib/axios/api-client';
import {
  handleResponseSuccess,
  handleResponseThrowError,
} from '../../../../utils/service';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import { GET_EVENTS } from '../constants';

type DeleteEventProps = {
  eventId: string;
  /** só para a mensagem: o evento já não existe quando ela aparece */
  eventName?: string;
};

/**
 * Apaga o evento.
 *
 * A rota é restrita ao perfil de desenvolvimento e o servidor recusa evento com
 * inscritos — a exclusão leva junto grupos, regras, quartos, equipes, lista de
 * espera e o histórico de cobrança, e não há desfazer.
 */
const deleteEvent = ({ eventId, eventName }: DeleteEventProps) =>
  apiClient
    .delete<{ message: string }>(`/events/${eventId}`)
    .then((response) => {
      handleResponseSuccess(
        response.data,
        eventName ? `Evento "${eventName}" apagado.` : 'Evento apagado.'
      )();
      return response.data;
    })
    .catch(handleResponseThrowError());

type DeleteEventData = Awaited<ReturnType<typeof deleteEvent>>;

export const useDeleteEvent = ({
  onSuccess,
  ...options
}: MutationOptions<DeleteEventData, unknown, DeleteEventProps> = {}) => {
  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: (...args) => {
      queryClient.invalidateQueries(GET_EVENTS);
      onSuccess?.(...args);
    },
    ...options,
  });
};
