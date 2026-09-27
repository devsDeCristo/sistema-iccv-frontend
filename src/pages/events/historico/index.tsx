import { useMemo } from 'react';
import { Box, Skeleton, Stack, Typography } from '@mui/material';
import { Header } from '../../../components/header';
import { PageStyle } from '../../../components/pageStyle';
import { useGetEvents } from '../../../features/admin/events/api/getEvents';
import { useGetGroupsByUser } from '../../../features/admin/events/api/getGroupsByUser';
import { Event, PayLoadGroup } from '../../../features/admin/events/types';
import { CartazDoEvento } from '../../../features/events/components/cards';

type Situacao = 'inscrito' | 'espera';

/**
 * Todos os eventos, do mais recente para o mais antigo, agrupados por ano — o
 * histórico do que já passou e do que vem. A home mostra só o que está aberto;
 * aqui fica tudo.
 */
function HistoricoDeEventos() {
  const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id || '';
  const { data, isLoading } = useGetEvents({});
  const { data: grupos } = useGetGroupsByUser(
    { userId },
    { enabled: !!userId }
  );

  // em quais a pessoa está; inscrito ganha da lista de espera
  const situacaoPorEvento = useMemo(() => {
    const { present = [], waitlist = [] } = (grupos ?? {}) as PayLoadGroup;
    const mapa = new Map<string, Situacao>();
    waitlist.forEach((grupo) => mapa.set(grupo.eventId, 'espera'));
    present.forEach((grupo) => mapa.set(grupo.eventId, 'inscrito'));
    return mapa;
  }, [grupos]);

  const porAno = useMemo(() => {
    const anos = new Map<string, Event[]>();
    (Array.isArray(data) ? (data as Event[]) : [])
      // evento desligado pela organização não aparece para o usuário
      .filter((event) => event.status !== 'INACTIVE')
      .sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      )
      .forEach((event) => {
        const ano = String(new Date(event.startDate).getFullYear());
        anos.set(ano, [...(anos.get(ano) ?? []), event]);
      });
    return [...anos.entries()];
  }, [data]);

  const grade = {
    display: 'grid',
    gap: 1.5,
    gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
  };

  return (
    <PageStyle>
      <Header title="Eventos" />

      {isLoading ? (
        <Box sx={grade}>
          {[0, 1, 2, 3].map((posicao) => (
            <Skeleton key={posicao} variant="rounded" height={132} />
          ))}
        </Box>
      ) : porAno.length === 0 ? (
        <Typography color="text.secondary">
          Nenhum evento por aqui ainda.
        </Typography>
      ) : (
        <Stack gap={4}>
          {porAno.map(([ano, eventos]) => (
            <Box key={ano}>
              <Stack
                direction="row"
                alignItems="baseline"
                gap={1}
                sx={{ mb: 1.5 }}
              >
                <Typography sx={{ fontSize: '1.125rem', fontWeight: 700 }}>
                  {ano}
                </Typography>
                <Typography
                  sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}
                >
                  {eventos.length === 1
                    ? '1 evento'
                    : `${eventos.length} eventos`}
                </Typography>
              </Stack>
              {/* o mesmo cartaz da home: dois por linha, um no celular */}
              <Box sx={grade}>
                {eventos.map((event) => (
                  <CartazDoEvento
                    key={event.id}
                    event={event}
                    minhaSituacao={situacaoPorEvento.get(event.id) ?? null}
                  />
                ))}
              </Box>
            </Box>
          ))}
        </Stack>
      )}
    </PageStyle>
  );
}

export { HistoricoDeEventos };
