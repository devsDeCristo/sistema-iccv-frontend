import { alpha, Box, Card, Stack, Typography, useTheme } from '@mui/material';
import {
  ArrowForward,
  HourglassEmptyOutlined,
  PendingActionsOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../../../utils';
import { DashboardPending } from '../types';
import { SecaoDaHome } from './secao';

interface PendingActionsProps {
  pending: DashboardPending[];
  /** Mostra a igreja de cada tarefa — só faz sentido para quem vê várias */
  showChurch?: boolean;
}

/**
 * O que espera uma ação de quem entrou.
 *
 * A diferença entre "6 comprovantes em análise" e "45° Cursilho: 6
 * comprovantes esperando conferência" é que o segundo é uma tarefa com
 * endereço — dá para clicar e resolver. O primeiro é um número que a pessoa
 * lê, não entende de onde veio, e ignora.
 *
 * A seção some quando não há nada: uma lista vazia com "tudo em dia" ocupa a
 * mesma altura de uma com tarefas e ensina o olho a pular a região.
 */
export function PendingActions({ pending, showChurch }: PendingActionsProps) {
  const theme = useTheme();
  const navigate = useNavigate();

  if (!pending.length) return null;

  const conteudo = (tarefa: DashboardPending) => {
    if (tarefa.kind === 'receipts') {
      return {
        cor: theme.palette.chips.pending,
        icone: <PendingActionsOutlined sx={{ fontSize: 20 }} />,
        titulo: `${tarefa.count} comprovante(s) esperando conferência`,
        detalhe: `${formatCurrency(tarefa.amount ?? 0)} parados até alguém aprovar`,
        destino: `/admin/eventos/${tarefa.eventId}/detalhes/pagamentos`,
      };
    }

    return {
      cor: theme.palette.chips.alert,
      icone: <HourglassEmptyOutlined sx={{ fontSize: 20 }} />,
      titulo: `${tarefa.count} pessoa(s) na lista de espera`,
      detalhe: `há ${tarefa.seatsOpen} vaga(s) em aberto para chamar`,
      destino: `/admin/eventos/${tarefa.eventId}/detalhes/lista-espera`,
    };
  };

  return (
    <SecaoDaHome titulo="Precisa de você">
      <Stack gap={1.5}>
        {pending.map((tarefa) => {
          const { cor, icone, titulo, detalhe, destino } = conteudo(tarefa);

          return (
            <Card
              key={`${tarefa.kind}-${tarefa.eventId}`}
              elevation={0}
              component="button"
              type="button"
              onClick={() => navigate(destino)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                width: '100%',
                p: 1.75,
                border: 0,
                textAlign: 'left',
                cursor: 'pointer',
                font: 'inherit',
                color: 'inherit',
                borderRadius: 3,
                boxShadow: `0 0 0 1px ${alpha(cor, 0.3)}`,
                backgroundImage: `linear-gradient(120deg, ${alpha(
                  cor,
                  0.1
                )}, transparent 70%)`,
                transition: theme.transitions.create(
                  ['box-shadow', 'transform'],
                  {
                    duration: theme.transitions.duration.shorter,
                  }
                ),
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: `0 0 0 1px ${alpha(cor, 0.45)}, 0 10px 22px -8px ${alpha(
                    cor,
                    0.35
                  )}`,
                },
              }}
            >
              <Box
                sx={{
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  bgcolor: cor,
                  color: theme.palette.common.white,
                }}
              >
                {icone}
              </Box>

              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                  {titulo}
                </Typography>
                <Typography
                  noWrap
                  sx={{ fontSize: 12.5, color: 'text.secondary' }}
                >
                  {tarefa.eventName}
                  {showChurch ? ` · ${tarefa.churchName}` : ''} — {detalhe}
                </Typography>
              </Box>

              <ArrowForward
                sx={{ flexShrink: 0, fontSize: 18, color: 'text.disabled' }}
              />
            </Card>
          );
        })}
      </Stack>
    </SecaoDaHome>
  );
}
