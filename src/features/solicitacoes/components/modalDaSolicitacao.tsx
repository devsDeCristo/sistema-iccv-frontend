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
import { ListaDeProdutos } from './listaDeProdutos';

const data = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');

interface Props {
  churchId: string;
  /** a solicitação aberta; `null` fecha a janela */
  solicitacao: SolicitacaoDaIgreja | null;
  onClose: () => void;
}

/**
 * A solicitação inteira, para o admin ler e responder: no topo, quem pediu
 * (e como falar com ela), o ministério, a situação e a data; depois o pedido sem corte e os
 * produtos; embaixo, a situação (select) e a resposta.
 * Salvar grava as duas juntas (o membro lê as duas); Cancelar fecha sem mudar.
 *
 * Os produtos vêm sempre com uma caixa, e as caixas e o select andam juntos:
 * - marcar decide a situação: alguns marcados, aceita parcialmente; todos,
 *   aceita; nenhum, volta à situação de antes da decisão (a que a solicitação
 *   tinha, se era solicitada ou em análise; senão, em análise). Recusar é uma
 *   escolha do select, e não o efeito de desmarcar.
 * - o select manda nas caixas: aceita marca todas; recusada, solicitada e em
 *   análise desmarcam todas; aceita parcialmente mantém as marcadas.
 * A parcial exige alguns marcados (nem nenhum, nem todos — a API recusa os
 * dois). Com um produto só, ela não faz sentido e some do select.
 */
function ModalDaSolicitacao({ churchId, solicitacao: s, onClose }: Props) {
  const theme = useTheme();
  const [status, setStatus] = useState<StatusDaSolicitacao>('REQUESTED');
  const [resposta, setResposta] = useState('');
  const [aceitos, setAceitos] = useState<Set<string>>(new Set());
  const mudar = useMudarStatus();

  // abre com a situação, a resposta e os produtos aceitos que já estavam
  useEffect(() => {
    if (!s) return;
    setStatus(s.status);
    setResposta(s.response ?? '');
    setAceitos(
      new Set(s.items.filter((p) => p.accepted === true).map((p) => p.id))
    );
  }, [s]);

  const parcial = status === 'PARTIALLY_ACCEPTED';
  const total = s?.items.length ?? 0;
  const parcialValida = aceitos.size > 0 && aceitos.size < total;

  /** Para onde a situação volta quando o admin desmarca tudo */
  const semDecisao: StatusDaSolicitacao =
    s?.status === 'REQUESTED' ? 'REQUESTED' : 'IN_REVIEW';

  const alternar = (id: string) => {
    const novo = new Set(aceitos);
    if (novo.has(id)) novo.delete(id);
    else novo.add(id);
    setAceitos(novo);
    setStatus(
      novo.size === 0
        ? semDecisao
        : novo.size === total
          ? 'ACCEPTED'
          : 'PARTIALLY_ACCEPTED'
    );
  };

  const escolherStatus = (novo: StatusDaSolicitacao) => {
    setStatus(novo);
    if (novo === 'ACCEPTED') setAceitos(new Set(s?.items.map((p) => p.id)));
    else if (novo !== 'PARTIALLY_ACCEPTED') setAceitos(new Set());
  };

  const salvar = () =>
    s &&
    mudar.mutate(
      {
        churchId,
        id: s.id,
        status,
        resposta,
        ...(parcial && { produtosAceitos: [...aceitos] }),
      },
      { onSuccess: onClose }
    );

  const cor = s ? corDoStatus(theme, s.status) : theme.palette.text.secondary;
  const ocupado = mudar.isLoading;
  const aceitosAntes = s
    ? s.items.filter((p) => p.accepted === true).map((p) => p.id)
    : [];
  const mudou =
    !!s &&
    (status !== s.status ||
      resposta !== (s.response ?? '') ||
      (parcial &&
        (aceitos.size !== aceitosAntes.length ||
          aceitosAntes.some((id) => !aceitos.has(id)))));

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
            disabled={ocupado || !mudou || (parcial && !parcialValida)}
            onClick={salvar}
          >
            {ocupado ? 'Salvando…' : 'Salvar'}
          </Button>
        </>
      }
    >
      {s && (
        <Stack spacing={2.5} sx={{ pt: 1 }}>
          {/* quem pediu, a situação e a data: o que o admin lê primeiro */}
          <Stack
            direction="row"
            alignItems="flex-start"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={1.5}
          >
            <Stack
              direction="row"
              alignItems="center"
              gap={1.5}
              sx={{ minWidth: 0 }}
            >
              <UserAvatar
                name={s.requester.fullName}
                photoUrl={s.requester.profilePhotoUrl ?? undefined}
                sx={{ width: 44, height: 44, fontSize: 16 }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 600 }} noWrap>
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
            <Stack alignItems={{ xs: 'flex-start', sm: 'flex-end' }} gap={0.5}>
              <Stack
                direction="row"
                alignItems="center"
                flexWrap="wrap"
                gap={0.75}
                sx={{ justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}
              >
                <CustomChip
                  size="small"
                  icon={iconeDoMinisterio(s.ministry)}
                  label={s.ministry}
                  customColor={theme.palette.secondary.main}
                  sx={{ '& .MuiChip-icon': { color: 'inherit', fontSize: 15 } }}
                />
                {/* a situação de agora, na mesma etiqueta do card do membro */}
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
                  <Typography
                    sx={{ fontSize: 12, fontWeight: 700, color: '#fff' }}
                  >
                    {ROTULO_DO_STATUS[s.status]}
                  </Typography>
                </Stack>
              </Stack>
              <Stack direction="row" alignItems="center" gap={0.5}>
                <CalendarTodayOutlined
                  sx={{ fontSize: 14, color: 'text.secondary' }}
                />
                <Typography variant="caption" color="text.secondary">
                  Pedido em {data(s.createdAt)}
                </Typography>
              </Stack>
            </Stack>
          </Stack>

          <Divider />

          <Stack spacing={1} alignItems="flex-start">
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
          </Stack>

          <Stack spacing={1}>
            <Stack direction="row" alignItems="baseline" gap={1}>
              <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
                Produtos
              </Typography>
              <Typography
                variant="caption"
                color={parcial && !parcialValida ? 'error' : 'text.secondary'}
              >
                {aceitos.size} de {total} aceitos
                {parcial && !parcialValida
                  ? ' · em parte é alguns, não todos'
                  : ' · marque os aceitos'}
              </Typography>
            </Stack>
            <ListaDeProdutos
              produtos={s.items}
              marcar={{ marcados: aceitos, onAlternar: alternar }}
            />
          </Stack>

          <Divider />

          <TextField
            select
            label="Situação"
            helperText="Acompanha os produtos marcados; dá para mudar à mão"
            value={status}
            onChange={(e) =>
              escolherStatus(e.target.value as StatusDaSolicitacao)
            }
          >
            {/* com um produto só, aceitar em parte não existe */}
            {STATUS.filter(
              (opcao) => opcao !== 'PARTIALLY_ACCEPTED' || total > 1
            ).map((opcao) => {
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
