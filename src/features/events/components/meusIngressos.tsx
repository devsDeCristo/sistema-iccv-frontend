import { useMemo } from 'react';
import { alpha, Box, Paper, Typography, useTheme } from '@mui/material';
import { ConfirmationNumberOutlined } from '@mui/icons-material';
import { useGetEvents } from '../../admin/events/api/getEvents';
import { Event } from '../../admin/events/types';
import { useGetPayments } from '../../myRegisters/api/getPaymentByUser';
import { EventCard, PaymentData } from '../../myRegisters/components/cards';
import { paymentsWithRoles } from '../../myRegisters/types';
import { filtrarPorIgreja, jaAcabou } from '../utils';

/**
 * Os ingressos na home: só dos eventos que ainda vão acontecer ou estão
 * acontecendo. O histórico continua em Minhas Inscrições.
 *
 * A inscrição não traz a data do evento; ela sai do catálogo que a home já
 * carrega (mesma consulta, em cache). Evento fora do catálogo fica de fora:
 * sem data não dá para saber se já passou.
 */
function MeusIngressos({
  igrejaId,
  igrejaFiltrada,
}: {
  igrejaId: string;
  /** nome da igreja escolhida no filtro, quando há uma */
  igrejaFiltrada?: string;
}) {
  const theme = useTheme();
  const userId = JSON.parse(localStorage.getItem('user') || '{}')?.id || '';
  const { data: inscricoes, isLoading: carregando } = useGetPayments(
    { userId },
    { enabled: !!userId }
  );
  const { data: catalogo } = useGetEvents({});

  const ingressos = useMemo(() => {
    // o mesmo filtro de igreja do catálogo: ingresso de outra igreja sai junto
    const eventos = new Map(
      filtrarPorIgreja(
        Array.isArray(catalogo) ? (catalogo as Event[]) : [],
        igrejaId
      ).map((event) => [event.id, event])
    );
    // cada ingresso sai junto do evento: é dele que vem a data
    return ((inscricoes ?? []) as paymentsWithRoles[])
      .map((inscricao) => ({
        inscricao,
        event: eventos.get(inscricao.eventId),
      }))
      .filter(
        (item): item is { inscricao: paymentsWithRoles; event: Event } =>
          !!item.event && !jaAcabou(item.event)
      )
      .sort(
        (a, b) =>
          new Date(a.event.startDate).getTime() -
          new Date(b.event.startDate).getTime()
      );
  }, [inscricoes, catalogo, igrejaId]);

  return (
    <Box sx={{ mb: 3 }}>
      <Typography sx={{ fontSize: '1.0625rem', fontWeight: 600, mb: 1.25 }}>
        Meus Ingressos Ativos
      </Typography>
      {/* quantos couberem, com um mínimo que o conteúdo aguenta: a coluna
          divide a tela com o menu e a agenda, e contar colunas pela largura da
          janela espremia o ingresso até quebrar. Na tela larga dá 4 */}
      {ingressos.length > 0 ? (
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          }}
        >
          {ingressos.map(({ inscricao, event }) => (
            <EventCard
              key={inscricao.eventId}
              payment={inscricao as paymentsWithRoles & { data: PaymentData }}
              compacto
              periodo={event}
            />
          ))}
        </Box>
      ) : (
        // enquanto carrega, só o título: o aviso de vazio piscaria antes dos
        // ingressos chegarem
        !carregando && (
          <Paper sx={{ borderRadius: 3, p: 2.5, textAlign: 'center' }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                mx: 'auto',
                mb: 1,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
              }}
            >
              <ConfirmationNumberOutlined sx={{ fontSize: 22 }} />
            </Box>
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600 }}>
              {igrejaFiltrada
                ? `Nenhum ingresso ativo em ${igrejaFiltrada}`
                : 'Nenhum ingresso ativo'}
            </Typography>
            <Typography
              sx={{ mt: 0.5, fontSize: '0.8125rem', color: 'text.secondary' }}
            >
              {igrejaFiltrada
                ? 'Ingressos de eventos de outras igrejas aparecem em "Todas as igrejas".'
                : 'Quando você se inscrever em um evento que vem por aí, o ingresso aparece aqui.'}
            </Typography>
          </Paper>
        )
      )}
    </Box>
  );
}

export { MeusIngressos };
