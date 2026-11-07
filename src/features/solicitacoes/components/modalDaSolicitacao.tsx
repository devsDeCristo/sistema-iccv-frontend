import { useEffect, useState } from 'react';
import {
  Alert,
  alpha,
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
import {
  AccountBalanceWalletOutlined,
  CalendarTodayOutlined,
  Church,
  PhoneOutlined,
} from '@mui/icons-material';

import CustomChip from '../../../components/customChip';
import { ResponsiveModal } from '../../../components/responsiveModal';
import { UserAvatar } from '../../../components/userAvatar';
import { formatPhoneNumber } from '../../../utils';
import { useDecidir, useMudarStatus, usePapelNasSolicitacoes } from '../api';
import {
  corDoStatus,
  ICONE_DO_STATUS,
  RESPONDIDA,
  ROTULO_DO_STATUS,
} from '../constants';
import { iconeDoMinisterio } from '../ministerios';
import { SolicitacaoDaIgreja, StatusDaSolicitacao } from '../types';

const data = (iso: string) => new Date(iso).toLocaleDateString('pt-BR');

/** As situações que se põem à mão, antes de qualquer decisão */
const ANTES_DA_DECISAO = ['REQUESTED', 'IN_REVIEW'] as const;
type SituacaoAMao = (typeof ANTES_DA_DECISAO)[number];
const aMao = (status: StatusDaSolicitacao): status is SituacaoAMao =>
  (ANTES_DA_DECISAO as readonly string[]).includes(status);

/** Uma das duas confirmações: "Pastor · Aprovou · Maria, 07/11" */
function Confirmacao({
  rotulo,
  Icone,
  decisao,
  quem,
  quando,
}: {
  rotulo: string;
  Icone: typeof Church;
  decisao: boolean | null;
  quem: string | undefined;
  quando: string | null;
}) {
  const theme = useTheme();
  const cor =
    decisao === true
      ? theme.palette.chips.success
      : decisao === false
        ? theme.palette.chips.canceled
        : theme.palette.chips.pending;
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={1.25}
      sx={{
        flex: 1,
        minWidth: 0,
        p: 1.25,
        borderRadius: 2,
        border: `1px solid ${alpha(cor, 0.35)}`,
        bgcolor: alpha(cor, 0.06),
      }}
    >
      <Icone sx={{ color: cor, fontSize: 22 }} />
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
          {rotulo} ·{' '}
          {decisao === true
            ? 'Aprovou'
            : decisao === false
              ? 'Recusou'
              : 'Aguardando'}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {decisao === null
            ? 'Ainda não decidiu'
            : `${quem ?? 'Conta excluída'}${quando ? `, ${data(quando)}` : ''}`}
        </Typography>
      </Box>
    </Stack>
  );
}
import { ListaDeProdutos } from './listaDeProdutos';

interface Props {
  churchId: string;
  /** a solicitação aberta; `null` fecha a janela */
  solicitacao: SolicitacaoDaIgreja | null;
  onClose: () => void;
}

/**
 * A solicitação inteira, para quem está no painel: no topo, quem pediu (e como
 * falar com ela), o ministério, a situação e a data; depois o pedido sem corte
 * e os produtos; as duas confirmações; e embaixo a situação e a resposta.
 *
 * Aprovar pede o pastor (líder espiritual da igreja) e uma tesouraria, em
 * qualquer ordem; recusar basta um. Quem é um dos dois e ainda não decidiu
 * marca os produtos que aprova — vindo depois do outro, a lista já abre com o
 * que o outro aprovou e mostra, em cada produto, o que ele liberou ou recusou
 * — e escolhe Aprovar ou Recusar. Entra só o que os dois aprovaram.
 *
 * Os demais (o admin, dev e super admin) acompanham: põem em análise antes de
 * qualquer decisão e escrevem a resposta ao membro (Salvar). Recusar encerra a
 * solicitação para todos, então pede confirmação ali mesmo — o SweetAlert do
 * resto do sistema abriria por baixo desta janela.
 */
function ModalDaSolicitacao({ churchId, solicitacao: s, onClose }: Props) {
  const theme = useTheme();
  const [status, setStatus] = useState<StatusDaSolicitacao>('REQUESTED');
  const [resposta, setResposta] = useState('');
  const [aceitos, setAceitos] = useState<Set<string>>(new Set());
  const [confirmandoRecusa, setConfirmandoRecusa] = useState(false);
  const mudar = useMudarStatus();
  const decidir = useDecidir();
  const { data: papel } = usePapelNasSolicitacoes(s ? churchId : null);
  const lado = papel?.lado ?? null;

  const minha =
    lado === 'PASTOR'
      ? s?.pastorDecision
      : lado === 'TESOURARIA'
        ? s?.treasuryDecision
        : undefined;
  const outra =
    lado === 'PASTOR'
      ? s?.treasuryDecision
      : lado === 'TESOURARIA'
        ? s?.pastorDecision
        : undefined;
  const possoDecidir = !!s && !!lado && !RESPONDIDA[s.status] && minha === null;

  // abre com a situação e a resposta que já estavam; quem vai decidir começa
  // com o que o outro lado aprovou (ou com tudo, se é o primeiro)
  useEffect(() => {
    if (!s) return;
    setStatus(s.status);
    setResposta(s.response ?? '');
    setConfirmandoRecusa(false);
    const doOutro = (p: SolicitacaoDaIgreja['items'][number]) =>
      lado === 'PASTOR' ? p.treasuryAccepted : p.pastorAccepted;
    setAceitos(
      new Set(
        s.items
          .filter((p) => (outra === true ? doOutro(p) === true : true))
          .map((p) => p.id)
      )
    );
  }, [s, lado, outra]);

  const total = s?.items.length ?? 0;

  const alternar = (id: string) => {
    const novo = new Set(aceitos);
    if (novo.has(id)) novo.delete(id);
    else novo.add(id);
    setAceitos(novo);
  };

  const salvar = () =>
    s &&
    mudar.mutate(
      {
        churchId,
        id: s.id,
        ...(aMao(status) && status !== s.status && { status }),
        resposta,
      },
      { onSuccess: onClose }
    );

  const enviarDecisao = (aprova: boolean) =>
    s &&
    decidir.mutate(
      {
        churchId,
        id: s.id,
        aprova,
        ...(aprova && { produtosAceitos: [...aceitos] }),
        resposta,
      },
      { onSuccess: onClose }
    );

  const cor = s ? corDoStatus(theme, s.status) : theme.palette.text.secondary;
  const ocupado = mudar.isLoading || decidir.isLoading;
  const mudou = !!s && (status !== s.status || resposta !== (s.response ?? ''));
  const rotuloDoLado = lado === 'PASTOR' ? 'pastor' : 'tesouraria';

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
            variant={possoDecidir ? 'outlined' : 'contained'}
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
                color={
                  possoDecidir && !aceitos.size ? 'error' : 'text.secondary'
                }
              >
                {possoDecidir
                  ? `${aceitos.size} de ${total} aprovados por você · marque os que aprova`
                  : RESPONDIDA[s.status]
                    ? 'Entra o que o pastor e a tesouraria aprovaram'
                    : 'O resultado sai quando os dois decidirem'}
              </Typography>
            </Stack>
            <ListaDeProdutos
              produtos={s.items}
              marcar={{
                marcados: possoDecidir
                  ? aceitos
                  : new Set(s.items.filter((p) => p.accepted).map((p) => p.id)),
                ...(possoDecidir && { onAlternar: alternar }),
                etiquetas: [
                  { rotulo: 'Pastor', de: (p) => p.pastorAccepted },
                  { rotulo: 'Tesouraria', de: (p) => p.treasuryAccepted },
                ],
              }}
            />
          </Stack>

          {/* as duas confirmações: quem já decidiu, quem falta */}
          <Stack spacing={1}>
            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>
              Aprovação
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
              <Confirmacao
                rotulo="Pastor"
                Icone={Church}
                decisao={s.pastorDecision}
                quem={s.pastor?.fullName}
                quando={s.pastorAt}
              />
              <Confirmacao
                rotulo="Tesouraria"
                Icone={AccountBalanceWalletOutlined}
                decisao={s.treasuryDecision}
                quem={s.treasurer?.fullName}
                quando={s.treasuryAt}
              />
            </Stack>
            {papel && !papel.temPastor && !RESPONDIDA[s.status] && (
              <Alert severity="warning">
                Esta igreja não tem pastor cadastrado: sem ele, nenhuma
                solicitação é aprovada. Cadastre o líder espiritual em Igrejas.
              </Alert>
            )}
          </Stack>

          {/* a decisão de quem pode decidir: aprovar os marcados ou recusar */}
          {possoDecidir &&
            (confirmandoRecusa ? (
              <Alert
                severity="error"
                action={
                  <Stack direction="row" gap={1}>
                    <Button
                      color="inherit"
                      size="small"
                      disabled={ocupado}
                      onClick={() => setConfirmandoRecusa(false)}
                    >
                      Voltar
                    </Button>
                    <Button
                      color="error"
                      size="small"
                      variant="contained"
                      disabled={ocupado}
                      onClick={() => enviarDecisao(false)}
                    >
                      Sim, recusar
                    </Button>
                  </Stack>
                }
              >
                Recusar encerra a solicitação, mesmo que{' '}
                {lado === 'PASTOR' ? 'a tesouraria' : 'o pastor'}{' '}
                {outra ? 'já tenha aprovado' : 'aprove depois'}.
              </Alert>
            ) : (
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ sm: 'center' }}
                gap={1.5}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                }}
              >
                <Typography variant="body2" sx={{ flex: 1 }}>
                  Sua decisão como <strong>{rotuloDoLado}</strong>
                  {outra
                    ? `: ${lado === 'PASTOR' ? 'a tesouraria' : 'o pastor'} já aprovou, e entra só o que os dois aprovarem.`
                    : `: depois falta ${lado === 'PASTOR' ? 'a tesouraria' : 'o pastor'}.`}
                </Typography>
                <Stack direction="row" gap={1}>
                  <Button
                    color="error"
                    disabled={ocupado}
                    onClick={() => setConfirmandoRecusa(true)}
                  >
                    Recusar
                  </Button>
                  <Button
                    variant="contained"
                    disabled={ocupado || !aceitos.size}
                    onClick={() => enviarDecisao(true)}
                  >
                    {decidir.isLoading
                      ? 'Enviando…'
                      : aceitos.size === total
                        ? 'Aprovar tudo'
                        : `Aprovar ${aceitos.size} de ${total}`}
                  </Button>
                </Stack>
              </Stack>
            ))}

          <Divider />

          {/* à mão, só antes de qualquer decisão */}
          {aMao(s.status) && (
            <TextField
              select
              label="Situação"
              helperText="Aprovar e recusar são do pastor e da tesouraria"
              value={status}
              onChange={(e) => setStatus(e.target.value as StatusDaSolicitacao)}
            >
              {ANTES_DA_DECISAO.map((opcao) => {
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
          )}
          <TextField
            label="Resposta para quem pediu"
            placeholder="O motivo de recusar, o prazo da compra, o próximo passo"
            helperText="Quem pediu lê a resposta junto da situação; vai junto da sua decisão, ou em Salvar. Opcional."
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
