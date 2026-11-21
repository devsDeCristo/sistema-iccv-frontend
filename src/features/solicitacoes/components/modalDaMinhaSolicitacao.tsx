import {
  Box,
  Button,
  darken,
  Divider,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { CalendarTodayOutlined, Church } from '@mui/icons-material';

import CustomChip from '../../../components/customChip';
import { ResponsiveModal } from '../../../components/responsiveModal';
import { corDoStatus, RESPONDIDA, ROTULO_DO_STATUS } from '../constants';
import { iconeDoMinisterio } from '../ministerios';
import { MinhaSolicitacao } from '../types';
import { ListaDeProdutos } from './listaDeProdutos';

const data = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');

/**
 * A solicitação inteira, para quem pediu: o card corta a descrição, os
 * produtos e a resposta; aqui vai tudo. Só leitura. Os produtos usam a mesma
 * lista da janela do painel (nome inteiro e o resultado de cada um), sem o que
 * cada lado marcou — isso é trâmite de dentro.
 */
function ModalDaMinhaSolicitacao({
  solicitacao: s,
  onClose,
}: {
  /** a solicitação aberta; `null` fecha a janela */
  solicitacao: MinhaSolicitacao | null;
  onClose: () => void;
}) {
  const theme = useTheme();

  return (
    <ResponsiveModal
      open={!!s}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      title="Solicitação"
      actions={
        <Button onClick={onClose} color="inherit">
          Fechar
        </Button>
      }
    >
      {s && (
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1}>
            {/* a situação, na mesma etiqueta do card */}
            <Stack
              direction="row"
              alignItems="center"
              gap={0.75}
              sx={{
                px: 1.25,
                py: 0.5,
                borderRadius: 1.5,
                bgcolor: darken(corDoStatus(theme, s.status), 0.35),
              }}
            >
              <Box
                aria-hidden
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  bgcolor: '#fff',
                }}
              />
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
                {ROTULO_DO_STATUS[s.status]}
              </Typography>
            </Stack>
            <CustomChip
              size="small"
              icon={iconeDoMinisterio(s.ministry)}
              label={s.ministry}
              customColor={theme.palette.secondary.main}
              sx={{ '& .MuiChip-icon': { color: 'inherit', fontSize: 15 } }}
            />
          </Stack>

          <Stack spacing={1}>
            <Typography
              sx={{ fontSize: 20, fontWeight: 700, overflowWrap: 'anywhere' }}
            >
              {s.title}
            </Typography>
            <Stack
              direction="row"
              flexWrap="wrap"
              columnGap={2}
              rowGap={0.5}
              sx={{ '& svg': { fontSize: 14, color: 'text.secondary' } }}
            >
              <Stack direction="row" alignItems="center" gap={0.5}>
                <Church />
                <Typography variant="caption" color="text.secondary">
                  {s.church.name}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" gap={0.5}>
                <CalendarTodayOutlined />
                <Typography variant="caption" color="text.secondary">
                  Pedido em {data(s.createdAt)}
                </Typography>
              </Stack>
            </Stack>
            <Typography
              variant="body2"
              sx={{ whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}
            >
              {s.description}
            </Typography>
          </Stack>

          <Stack spacing={1}>
            <Stack direction="row" alignItems="baseline" gap={1}>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                Produtos
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {RESPONDIDA[s.status]
                  ? 'O ✓ marca o que a igreja aceitou'
                  : 'O resultado sai quando a igreja decidir'}
              </Typography>
            </Stack>
            <ListaDeProdutos
              produtos={s.items}
              marcar={{
                marcados: new Set(
                  s.items.filter((p) => p.accepted).map((p) => p.id)
                ),
              }}
            />
          </Stack>

          <Divider />

          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 0.5 }}>
              Resposta da igreja
            </Typography>
            {s.response ? (
              <Typography
                variant="body2"
                sx={{ whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}
              >
                {s.response}
              </Typography>
            ) : (
              <Typography variant="body2" color="text.disabled">
                Ainda sem resposta
              </Typography>
            )}
          </Box>
        </Stack>
      )}
    </ResponsiveModal>
  );
}

export { ModalDaMinhaSolicitacao };
