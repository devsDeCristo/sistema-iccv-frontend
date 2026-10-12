import { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Popover,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  CheckCircle,
  DeleteOutline,
  ErrorOutline,
  MoreVert,
  NetworkCheck,
  Settings,
} from '@mui/icons-material';

import { ConfirmModal } from '../../../components/ConfirmModal';
import { tempoRelativo } from '../../../utils';
import {
  PluggyTeste,
  useGetPluggy,
  useRemovePluggy,
  useTestPluggy,
} from './api';
import { PluggyForm } from './pluggyForm';
import { PluggyLogo } from './pluggyLogo';

/** Situações do item na Pluggy, do jeito que quem configura entende */
const STATUS_DO_ITEM: Record<string, string> = {
  UPDATED: 'Atualizado',
  UPDATING: 'Atualizando',
  LOGIN_ERROR: 'Erro de acesso: reconecte no MeuPluggy',
  OUTDATED: 'Desatualizado: reconecte no MeuPluggy',
  WAITING_USER_INPUT: 'Aguardando confirmação no MeuPluggy',
  WAITING_USER_ACTION: 'Aguardando uma ação no MeuPluggy',
};

/** O pontinho colorido da linha de situação, o mesmo dos cards de gateway */
function Ponto({ cor }: { cor: string }) {
  return (
    <Box
      component="span"
      sx={{
        width: 7,
        height: 7,
        borderRadius: '50%',
        backgroundColor: cor,
        flexShrink: 0,
      }}
    />
  );
}

interface Props {
  churchId: string;
}

/**
 * A Pluggy como card de integração, no molde dos cards de gateway em
 * Pagamentos (`ProviderCard`): marca, nome, a situação numa linha só, o que
 * ela faz em duas linhas e as ações no rodapé. A configuração abre numa
 * janela (`PluggyForm`), e o teste de conexão flutua ancorado no botão — nada
 * que acontece muda a altura do card, para a grade não pular quando entrarem
 * outras integrações ao lado.
 *
 * A Pluggy fala com o banco via Open Finance: os bancos são conectados no
 * MeuPluggy, e aqui entram só a credencial da aplicação e um Item ID por
 * banco conectado.
 */
function PluggyIntegrationCard({ churchId }: Props) {
  const theme = useTheme();
  const { data, isLoading } = useGetPluggy(churchId);
  const testar = useTestPluggy();
  const remover = useRemovePluggy();

  const [configurando, setConfigurando] = useState(false);
  const [menu, setMenu] = useState<HTMLElement | null>(null);
  const [confirmandoRemocao, setConfirmandoRemocao] = useState(false);
  const [teste, setTeste] = useState<PluggyTeste | null>(null);
  const [ancoraDoTeste, setAncoraDoTeste] = useState<HTMLElement | null>(null);

  if (isLoading) return <Skeleton variant="rounded" height={190} />;

  const integracao = data?.integracao ?? null;
  const cofreDisponivel = data?.cofreDisponivel ?? true;

  const verde = theme.palette.chips.success;
  const ambar = theme.palette.chips.alert;
  const vermelho = theme.palette.chips.canceled;
  const apagado = theme.palette.text.disabled;

  const bancos = integracao?.itemIds.length ?? 0;
  /** A situação em uma linha só — ver a nota da altura fixa acima */
  const situacao = !cofreDisponivel
    ? { cor: vermelho, texto: 'Indisponível no servidor' }
    : !integracao
      ? { cor: apagado, texto: 'Não configurada' }
      : !integracao.enabled
        ? { cor: apagado, texto: 'Desligada' }
        : integracao.statusMessage
          ? { cor: ambar, texto: 'Reconectar no MeuPluggy' }
          : {
              cor: verde,
              texto: `Conectada · ${bancos} ${bancos === 1 ? 'banco' : 'bancos'}`,
            };
  const conectada = situacao.cor === verde;

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2.5,
        border: `1px solid ${
          conectada ? alpha(verde, 0.45) : theme.palette.divider
        }`,
        // a integração no ar ganha um fundo levemente tingido, como o gateway
        // que recebe em Pagamentos
        backgroundColor: conectada
          ? alpha(verde, 0.05)
          : theme.palette.background.paperSecondary,
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        height: '100%',
        transition: 'box-shadow .15s, border-color .15s',
        '&:hover': { boxShadow: `0 3px 14px ${alpha('#000', 0.1)}` },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
        <PluggyLogo
          size={40}
          // desligada fica acinzentada, como o gateway guardado
          sx={{
            opacity: integracao && !integracao.enabled ? 0.45 : 1,
            filter: integracao && !integracao.enabled ? 'grayscale(1)' : 'none',
          }}
        />

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography fontSize={15.5} fontWeight={600} noWrap>
            Pluggy
          </Typography>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Ponto cor={situacao.cor} />
            <Typography variant="caption" sx={{ color: situacao.cor }} noWrap>
              {situacao.texto}
            </Typography>
          </Stack>
        </Box>

        {integracao && (
          <>
            <IconButton
              size="small"
              aria-label="Mais ações"
              onClick={(evento) => setMenu(evento.currentTarget)}
              sx={{ mt: -0.5, mr: -0.5 }}
            >
              <MoreVert fontSize="small" />
            </IconButton>
            <Menu anchorEl={menu} open={!!menu} onClose={() => setMenu(null)}>
              <MenuItem
                onClick={() => {
                  setMenu(null);
                  setConfirmandoRemocao(true);
                }}
                sx={{ color: vermelho }}
              >
                <DeleteOutline fontSize="small" sx={{ mr: 1 }} />
                Remover integração
              </MenuItem>
            </Menu>
          </>
        )}
      </Box>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          lineHeight: 1.45,
          // duas linhas fixas, como nos cards de gateway: cards lado a lado
          // só se comparam com o rodapé na mesma altura
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: 40,
        }}
      >
        Open Finance: lê saldos e extratos dos bancos da igreja para o
        tesouraria.
      </Typography>

      <Typography variant="caption" color="text.secondary">
        {integracao?.lastSyncAt
          ? `Última leitura ${tempoRelativo(integracao.lastSyncAt)}`
          : 'Nenhuma leitura ainda'}
      </Typography>

      <Box sx={{ mt: 'auto', pt: 0.5 }}>
        <Divider sx={{ mb: 1.25 }} />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            variant={integracao ? 'outlined' : 'contained'}
            startIcon={<Settings fontSize="small" />}
            onClick={() => setConfigurando(true)}
          >
            {integracao ? 'Editar' : 'Configurar'}
          </Button>

          {integracao && (
            <Tooltip title="Testar conexão">
              <Box sx={{ ml: 'auto' }}>
                <IconButton
                  size="small"
                  aria-label="Testar conexão"
                  disabled={testar.isLoading}
                  onClick={(evento) => {
                    setAncoraDoTeste(evento.currentTarget);
                    testar.mutate(churchId, { onSuccess: setTeste });
                  }}
                >
                  {testar.isLoading ? (
                    <CircularProgress size={16} />
                  ) : (
                    <NetworkCheck fontSize="small" />
                  )}
                </IconButton>
              </Box>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* o resultado do teste, banco a banco, flutua ancorado no botão */}
      <Popover
        open={!!teste && !!ancoraDoTeste}
        anchorEl={ancoraDoTeste}
        onClose={() => setTeste(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        PaperProps={{ sx: { maxWidth: 340, mt: -1 } }}
      >
        <Stack spacing={1} sx={{ p: 1.5 }}>
          {teste?.erro && (
            <Stack direction="row" spacing={1}>
              <ErrorOutline sx={{ fontSize: 18, color: vermelho, mt: 0.2 }} />
              <Typography variant="body2">{teste.erro}</Typography>
            </Stack>
          )}
          {teste?.itens.map((item) => (
            <Stack key={item.itemId} direction="row" spacing={1}>
              {item.ok ? (
                <CheckCircle sx={{ fontSize: 18, color: verde, mt: 0.2 }} />
              ) : (
                <ErrorOutline sx={{ fontSize: 18, color: vermelho, mt: 0.2 }} />
              )}
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {item.banco ?? item.itemId}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.erro ??
                    `${STATUS_DO_ITEM[item.status ?? ''] ?? item.status} · ${item.contas} conta(s)`}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </Popover>

      <PluggyForm
        open={configurando}
        churchId={churchId}
        integracao={integracao}
        cofreDisponivel={cofreDisponivel}
        onClose={() => setConfigurando(false)}
      />

      <ConfirmModal
        open={confirmandoRemocao}
        onClose={() => setConfirmandoRemocao(false)}
        title="Remover integração com a Pluggy?"
        message="A credencial e os Item IDs desta igreja serão apagados. Os bancos continuam conectados no MeuPluggy."
        confirmLabel="Remover"
        onConfirm={() => {
          setConfirmandoRemocao(false);
          remover.mutate(churchId);
        }}
      />
    </Box>
  );
}

export { PluggyIntegrationCard };
