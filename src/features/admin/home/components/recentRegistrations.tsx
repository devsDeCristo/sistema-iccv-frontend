import {
  alpha,
  Box,
  Card,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { PersonAddAlt1Outlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { cardTabelaSx } from '../../../../components/listPageStyles';
import { UserAvatar } from '../../../../components/userAvatar';
import { formatDateTime, tempoRelativo } from '../../../../utils';
import { RecentRegistration } from '../types';
import { SecaoDaHome } from './secao';

interface RecentRegistrationsProps {
  registrations: RecentRegistration[];
  /** Mostra o evento de cada inscrição — some quando só há um em jogo */
  showEvent?: boolean;
}

/**
 * Quem entrou por último.
 *
 * É o pulso da tela. O contador de vagas diz onde o evento chegou; esta lista
 * diz se ele ainda se move — e é o que faz o admin voltar ao painel amanhã.
 * Sem ela, os números de hoje e os de ontem são indistinguíveis.
 */
export function RecentRegistrations({
  registrations,
  showEvent = true,
}: RecentRegistrationsProps) {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <SecaoDaHome titulo="Últimas inscrições">
      <Card elevation={0} sx={{ ...cardTabelaSx, height: '100%' }}>
        {registrations.length === 0 ? (
          <Stack alignItems="center" gap={1} sx={{ py: 5, px: 2 }}>
            <PersonAddAlt1Outlined
              sx={{ fontSize: 32, color: 'text.disabled' }}
            />
            <Typography color="text.secondary" fontSize={14}>
              Ninguém se inscreveu ainda.
            </Typography>
          </Stack>
        ) : (
          registrations.map((inscricao) => (
            <Stack
              key={`${inscricao.userId}-${inscricao.eventId}`}
              component="button"
              type="button"
              onClick={() =>
                navigate(
                  `/admin/eventos/${inscricao.eventId}/detalhes/usuarios`
                )
              }
              direction="row"
              alignItems="center"
              gap={1.5}
              sx={{
                width: '100%',
                border: 0,
                cursor: 'pointer',
                font: 'inherit',
                color: 'inherit',
                textAlign: 'left',
                px: 2,
                py: 1.25,
                bgcolor: 'transparent',
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.55)}`,
                '&:last-of-type': { borderBottom: 'none' },
                '&:hover': { bgcolor: theme.palette.background.hover },
                transition: theme.transitions.create('background-color', {
                  duration: theme.transitions.duration.shorter,
                }),
              }}
            >
              <UserAvatar
                name={inscricao.name}
                photoUrl={inscricao.photoUrl}
                sx={{ width: 32, height: 32, flexShrink: 0 }}
              />

              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography noWrap sx={{ fontSize: 14, fontWeight: 600 }}>
                  {inscricao.name}
                </Typography>
                {showEvent && (
                  <Typography
                    noWrap
                    sx={{ fontSize: 12, color: 'text.secondary' }}
                  >
                    {inscricao.eventName}
                  </Typography>
                )}
              </Box>

              <Tooltip title={formatDateTime(inscricao.createdAt)}>
                <Typography
                  sx={{
                    flexShrink: 0,
                    fontSize: 12,
                    color: 'text.secondary',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {tempoRelativo(inscricao.createdAt)}
                </Typography>
              </Tooltip>
            </Stack>
          ))
        )}
      </Card>
    </SecaoDaHome>
  );
}
