import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_URL } from '../../../../config/env';
import { queryClient } from '../../../../config/lib/react-query/query-client';
import { GET_CHECKIN_QUEUE, GET_CHECKIN_STATS } from '../constants';

/**
 * Mantém as telas de check-in em sincronia.
 *
 * O socket carrega só o aviso de que algo mudou no evento — os dados continuam
 * vindo das rotas REST autenticadas. Isso evita duplicar regra de autorização
 * no canal de tempo real e faz a reconexão ser trivial: reconectou, refaz a
 * consulta.
 */
export function useCheckinSocket(eventId?: string) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!eventId) return;

    const token = localStorage.getItem('access_token');
    if (!token) return;

    // o namespace precisa sair da origem: se a API_URL ganhar um caminho
    // (".../api"), concatenar direto criaria o namespace errado
    let origem = '';
    try {
      origem = new URL(API_URL).origin;
    } catch {
      origem = (API_URL || '').replace(/\/$/, '');
    }

    const socket: Socket = io(`${origem}/checkin`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    const entrarNaSala = () => {
      setConnected(true);
      socket.emit('checkin:join', { eventId });
    };

    const atualizar = () => {
      queryClient.invalidateQueries(GET_CHECKIN_QUEUE);
      queryClient.invalidateQueries(GET_CHECKIN_STATS);
    };

    socket.on('connect', entrarNaSala);
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => setConnected(false));
    socket.on('checkin:updated', atualizar);

    return () => {
      socket.off('connect', entrarNaSala);
      socket.off('checkin:updated', atualizar);
      socket.disconnect();
    };
  }, [eventId]);

  return { connected };
}
