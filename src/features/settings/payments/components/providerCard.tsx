import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Menu,
  MenuItem,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Autorenew,
  CheckCircle,
  DeleteOutline,
  MoreVert,
  NetworkCheck,
  Settings,
} from '@mui/icons-material';

import CustomChip from '../../../../components/customChip';
import { ConfirmModal } from '../../../../components/ConfirmModal';
import { formatDateTime } from '../../../../utils';
import { WebhookUrls } from './webhookUrls';
import {
  useRemoveProvider,
  useRotateWebhookSecret,
  useSetDefaultProvider,
  useTestProvider,
} from '../api/paymentProviderActions';
import {
  GatewayHealth,
  PAYMENT_METHOD_LABEL,
  PaymentProviderIntegration,
} from '../types';

interface Props {
  churchId: string;
  integracao: PaymentProviderIntegration;
  onConfigurar: () => void;
}

/**
 * O cartão de uma casa de pagamento.
 *
 * A hierarquia da tela é a da decisão que a pessoa toma: primeiro *qual* casa
 * recebe o dinheiro (o selo de padrão), depois se ela está no ar, e só então a
 * papelada — credenciais e endereços de notificação.
 */
function ProviderCard({ churchId, integracao, onConfigurar }: Props) {
  const theme = useTheme();
  const [menu, setMenu] = useState<HTMLElement | null>(null);
  const [confirmandoRemocao, setConfirmandoRemocao] = useState(false);
  const [confirmandoGiro, setConfirmandoGiro] = useState(false);
  const [saude, setSaude] = useState<GatewayHealth | null>(null);

  const { mutate: definirPadrao, isLoading: definindo } =
    useSetDefaultProvider();
  const { mutate: testar, isLoading: testando } = useTestProvider({
    onSuccess: setSaude,
  });
  const { mutate: girarSegredo, isLoading: girando } = useRotateWebhookSecret({
    onSuccess: () => setConfirmandoGiro(false),
  });
  const { mutate: remover, isLoading: removendo } = useRemoveProvider({
    onSuccess: () => setConfirmandoRemocao(false),
  });

  const acao = { churchId, provider: integracao.provider };

  const corDaBorda = integracao.isDefault
    ? theme.palette.primary.main
    : theme.palette.divider;

  const styles = {
    cartao: {
      p: 2.5,
      borderRadius: 2,
      border: `1px solid ${corDaBorda}`,
      backgroundColor: theme.palette.background.paperSecondary,
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      height: '100%',
    },
    topo: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 1,
    },
  };

  /**
   * O aviso de "salvou mas nunca recebeu retorno".
   *
   * É o sintoma da URL cadastrada errada no painel do provedor — o erro mais
   * comum e o mais silencioso: tudo parece certo, o inscrito paga, e a baixa
   * nunca chega. Só aparece depois de uma hora para não acusar quem acabou de
   * configurar.
   */
  const configuradoHaMaisDeUmaHora =
    integracao.updatedAt &&
    Date.now() - new Date(integracao.updatedAt).getTime() > 60 * 60 * 1000;

  const semRetorno =
    integracao.enabled && !integracao.lastWebhookAt && configuradoHaMaisDeUmaHora;

  return (
    <Box sx={styles.cartao}>
      <Box sx={styles.topo}>
        <Box sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography fontWeight={600}>{integracao.label}</Typography>

            {integracao.isDefault && (
              <CustomChip
                size="small"
                label="Recebendo"
                customColor={theme.palette.chips.success}
                icon={<CheckCircle sx={{ fontSize: 14 }} />}
              />
            )}

            {integracao.configured && !integracao.enabled && (
              <CustomChip
                size="small"
                label="Desligada"
                customColor={theme.palette.text.disabled}
              />
            )}

            {integracao.mode === 'SANDBOX' && integracao.configured && (
              <CustomChip
                size="small"
                label="Sandbox"
                customColor={theme.palette.chips.alert}
              />
            )}
          </Stack>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {integracao.summary}
          </Typography>
        </Box>

        {integracao.configured && (
          <>
            <Button
              size="small"
              onClick={(evento) => setMenu(evento.currentTarget)}
              sx={{ minWidth: 32, px: 0.5 }}
              color="inherit"
            >
              <MoreVert fontSize="small" />
            </Button>

            <Menu
              anchorEl={menu}
              open={!!menu}
              onClose={() => setMenu(null)}
            >
              <MenuItem
                onClick={() => {
                  setMenu(null);
                  setConfirmandoGiro(true);
                }}
              >
                <Autorenew fontSize="small" sx={{ mr: 1 }} />
                Gerar novo endereço de notificação
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setMenu(null);
                  setConfirmandoRemocao(true);
                }}
                sx={{ color: theme.palette.chips.canceled }}
              >
                <DeleteOutline fontSize="small" sx={{ mr: 1 }} />
                Remover credenciais
              </MenuItem>
            </Menu>
          </>
        )}
      </Box>

      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
        {integracao.paymentMethods.map((metodo) => (
          <Chip
            key={metodo}
            size="small"
            variant="outlined"
            label={PAYMENT_METHOD_LABEL[metodo] ?? metodo}
          />
        ))}
      </Stack>

      {semRetorno && (
        <Alert severity="warning" sx={{ py: 0.5 }}>
          Nenhuma notificação recebida até agora. Confira se os endereços abaixo
          estão cadastrados no painel da {integracao.label} — sem eles o
          pagamento entra e a inscrição continua marcada como pendente.
        </Alert>
      )}

      {saude && (
        <Alert severity={saude.ok ? 'success' : 'error'} sx={{ py: 0.5 }}>
          {saude.message}
          {saude.account && ` (${saude.account})`}
        </Alert>
      )}

      {integracao.configured && (
        <>
          <Divider />
          <WebhookUrls integracao={integracao} />

          {integracao.lastWebhookAt && (
            <Typography variant="caption" color="text.secondary">
              Último retorno recebido em{' '}
              {formatDateTime(integracao.lastWebhookAt)}
            </Typography>
          )}
        </>
      )}

      <Stack
        direction="row"
        spacing={1}
        sx={{ mt: 'auto', pt: 1, flexWrap: 'wrap' }}
        useFlexGap
      >
        <Button
          size="small"
          variant={integracao.configured ? 'outlined' : 'contained'}
          startIcon={<Settings fontSize="small" />}
          onClick={onConfigurar}
        >
          {integracao.configured ? 'Editar' : 'Configurar'}
        </Button>

        {integracao.configured && (
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={
              testando ? (
                <CircularProgress size={14} />
              ) : (
                <NetworkCheck fontSize="small" />
              )
            }
            disabled={testando}
            onClick={() => testar(acao)}
          >
            Testar conexão
          </Button>
        )}

        {integracao.configured && integracao.enabled && !integracao.isDefault && (
          <Button
            size="small"
            variant="outlined"
            disabled={definindo}
            onClick={() => definirPadrao(acao)}
          >
            Usar esta
          </Button>
        )}
      </Stack>

      <ConfirmModal
        open={confirmandoGiro}
        onClose={() => setConfirmandoGiro(false)}
        onConfirm={() => girarSegredo(acao)}
        title="Gerar novo endereço de notificação?"
        message={`O endereço atual deixa de ser aceito imediatamente. Até você cadastrar o novo no painel da ${integracao.label}, nenhum pagamento recebe baixa automática.`}
        confirmLabel={girando ? 'Gerando…' : 'Gerar novo'}
      />

      <ConfirmModal
        open={confirmandoRemocao}
        onClose={() => setConfirmandoRemocao(false)}
        onConfirm={() => remover(acao)}
        title={`Remover as credenciais da ${integracao.label}?`}
        message="A igreja deixa de cobrar por esta casa. As cobranças já pagas continuam no histórico, mas para voltar a usá-la será preciso cadastrar as credenciais de novo."
        confirmLabel={removendo ? 'Removendo…' : 'Remover'}
      />
    </Box>
  );
}

export { ProviderCard };
