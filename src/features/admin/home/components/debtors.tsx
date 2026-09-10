import {
  alpha,
  Box,
  Card,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { TaskAltOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { cardTabelaSx } from '../../../../components/listPageStyles';
import { UserAvatar } from '../../../../components/userAvatar';
import { formatCurrency } from '../../../../utils';
import { DashboardTreasury } from '../types';
import { SecaoDaHome } from './secao';

interface DebtorsProps {
  treasury: DashboardTreasury;
}

/**
 * Quem está devendo, com nome e rosto.
 *
 * "R$ 48.440 em aberto" não faz ninguém agir. Saber que são 151 pessoas, e
 * quais delas, faz — por isso o total fica no cabeçalho e a lista embaixo, do
 * maior valor para o menor. No empate ganha a cobrança mais antiga: R$ 430
 * parados há 34 dias são outra conversa que os mesmos R$ 430 de ontem.
 */
export function Debtors({ treasury }: DebtorsProps) {
  const theme = useTheme();
  const navigate = useNavigate();

  const { debtors } = treasury;

  return (
    <SecaoDaHome
      titulo={
        debtors.people
          ? `Quem está devendo · ${debtors.people} pessoa(s) · ${formatCurrency(
              debtors.amount
            )}`
          : 'Quem está devendo'
      }
    >
      <Card elevation={0} sx={{ ...cardTabelaSx, height: '100%' }}>
        {debtors.top.length === 0 ? (
          <Stack alignItems="center" gap={1} sx={{ py: 5, px: 2 }}>
            <TaskAltOutlined
              sx={{ fontSize: 34, color: theme.palette.chips.success }}
            />
            <Typography color="text.secondary" fontSize={14}>
              Ninguém com pagamento em aberto.
            </Typography>
          </Stack>
        ) : (
          debtors.top.map((pessoa) => (
            <Stack
              key={`${pessoa.userId}-${pessoa.eventId}`}
              component="button"
              type="button"
              onClick={() =>
                navigate(`/admin/eventos/${pessoa.eventId}/detalhes/pagamentos`)
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
                name={pessoa.name}
                photoUrl={pessoa.photoUrl}
                sx={{ width: 32, height: 32, flexShrink: 0 }}
              />

              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography noWrap sx={{ fontSize: 14, fontWeight: 600 }}>
                  {pessoa.name}
                </Typography>
                <Typography
                  noWrap
                  sx={{ fontSize: 12, color: 'text.secondary' }}
                >
                  {pessoa.eventName}
                </Typography>
              </Box>

              <Box sx={{ flexShrink: 0, textAlign: 'right' }}>
                <Typography
                  sx={{
                    fontSize: 14,
                    fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatCurrency(pessoa.amount)}
                </Typography>
                <Tooltip title="Tempo desde que a cobrança foi criada">
                  <Typography
                    sx={{
                      fontSize: 11.5,
                      // um mês parado deixa de ser esquecimento
                      color:
                        pessoa.days >= 30
                          ? theme.palette.chips.alert
                          : 'text.secondary',
                      fontWeight: pessoa.days >= 30 ? 600 : 400,
                    }}
                  >
                    {pessoa.days === 0 ? 'hoje' : `há ${pessoa.days} dias`}
                  </Typography>
                </Tooltip>
              </Box>
            </Stack>
          ))
        )}

        {debtors.charges > debtors.top.length && (
          <Typography
            sx={{
              px: 2,
              py: 1.25,
              fontSize: 12,
              color: 'text.secondary',
              borderTop: `1px solid ${theme.palette.divider}`,
            }}
          >
            Mostrando as {debtors.top.length} maiores de {debtors.charges}{' '}
            cobrança(s) em aberto.
          </Typography>
        )}
      </Card>
    </SecaoDaHome>
  );
}
