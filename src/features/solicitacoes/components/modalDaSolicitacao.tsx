import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  darken,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { CalendarTodayOutlined, PhoneOutlined } from '@mui/icons-material';

import CustomChip from '../../../components/customChip';
import { ResponsiveModal } from '../../../components/responsiveModal';
import { UserAvatar } from '../../../components/userAvatar';
import { formatPhoneNumber } from '../../../utils';
import { useMudarStatus } from '../api';
import {
  corDoStatus,
  ICONE_DO_STATUS,
  ROTULO_DO_STATUS,
  STATUS,
} from '../constants';
import { iconeDoMinisterio } from '../ministerios';
import { SolicitacaoDaIgreja, StatusDaSolicitacao } from '../types';
import { LinkDoProduto } from './linkDoProduto';

const data = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');

interface Props {
  churchId: string;
  /** a solicitação aberta; `null` fecha a janela */
  solicitacao: SolicitacaoDaIgreja | null;
  onClose: () => void;
}

/**
 * A solicitação inteira, para o admin ler e responder: o pedido sem corte,
 * quem pediu e como falar com ela; embaixo, a situação (select) e a resposta.
 * Salvar grava as duas juntas (o membro lê as duas); Cancelar fecha sem mudar.
 */
function ModalDaSolicitacao({ churchId, solicitacao: s, onClose }: Props) {
  const theme = useTheme();
  const [status, setStatus] = useState<StatusDaSolicitacao>('REQUESTED');
  const [resposta, setResposta] = useState('');
  const mudar = useMudarStatus();

  // abre com a situação e a resposta que já estavam na solicitação
  useEffect(() => {
    if (!s) return;
    setStatus(s.status);
    setResposta(s.response ?? '');
  }, [s]);

  const salvar = () =>
    s &&
    mudar.mutate(
      { churchId, id: s.id, status, resposta },
      { onSuccess: onClose }
    );

  const cor = s ? corDoStatus(theme, s.status) : theme.palette.text.secondary;
  const ocupado = mudar.isLoading;
  const mudou = !!s && (status !== s.status || resposta !== (s.response ?? ''));

  return (
    <ResponsiveModal
      open={!!s}
      onClose={onClose}
      disableClose={ocupado}
      maxWidth="sm"
      fullWidth
      title="Solicitação"
      actions={
        <>
          <Button onClick={onClose} disabled={ocupado} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={ocupado || !mudou}
            onClick={salvar}
          >
            {ocupado ? 'Salvando…' : 'Salvar'}
          </Button>
        </>
      }
    >
      {s && (
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          <Stack direction="row" alignItems="center" flexWrap="wrap" gap={1}>
            {/* a situação de agora, no mesmo vermelho/verde da etiqueta do card */}
            <Stack
              direction="row"
              alignItems="center"
              gap={0.75}
              sx={{
                px: 1.25,
                py: 0.5,
                borderRadius: 1.5,
                bgcolor: darken(cor, 0.35),
              }}
            >
              <Box
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
            <Stack direction="row" alignItems="center" gap={0.5}>
              <CalendarTodayOutlined
                sx={{ fontSize: 15, color: 'text.secondary' }}
              />
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>
                Pedido em {data(s.createdAt)}
              </Typography>
            </Stack>
          </Stack>

          <Stack spacing={1}>
            <Typography
              sx={{ fontSize: 20, fontWeight: 700, overflowWrap: 'anywhere' }}
            >
              {s.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{ whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}
            >
              {s.description}
            </Typography>
            {s.link && <LinkDoProduto link={s.link} />}
          </Stack>

          {/* quem pediu, e por onde falar com ela antes de decidir */}
          <Stack
            direction="row"
            alignItems="center"
            gap={1.5}
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'background.default',
            }}
          >
            <UserAvatar
              name={s.requester.fullName}
              photoUrl={s.requester.profilePhotoUrl ?? undefined}
              sx={{ width: 40, height: 40, fontSize: 15 }}
            />
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }} noWrap>
                {s.requester.fullName}
              </Typography>
              {s.requester.cellphone && (
                <Stack direction="row" alignItems="center" gap={0.5}>
                  <PhoneOutlined
                    sx={{ fontSize: 14, color: 'text.secondary' }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {formatPhoneNumber(s.requester.cellphone)}
                  </Typography>
                </Stack>
              )}
            </Box>
          </Stack>

          <Divider />

          <TextField
            select
            label="Situação"
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusDaSolicitacao)}
          >
            {STATUS.map((opcao) => {
              const Icone = ICONE_DO_STATUS[opcao];
              return (
                <MenuItem key={opcao} value={opcao}>
                  <Stack direction="row" alignItems="center" gap={1}>
                    <Icone
                      sx={{ fontSize: 18, color: corDoStatus(theme, opcao) }}
                    />
                    {ROTULO_DO_STATUS[opcao]}
                  </Stack>
                </MenuItem>
              );
            })}
          </TextField>
          <TextField
            label="Resposta para quem pediu"
            placeholder="O motivo de recusar, o prazo da compra, o próximo passo"
            helperText="Quem pediu lê a resposta junto da situação. Opcional."
            value={resposta}
            onChange={(e) => setResposta(e.target.value)}
            inputProps={{ maxLength: 1000 }}
            multiline
            minRows={3}
          />
        </Stack>
      )}
    </ResponsiveModal>
  );
}

export { ModalDaSolicitacao };
