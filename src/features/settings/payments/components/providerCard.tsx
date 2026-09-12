import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
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
import { ProviderLogo } from './providerLogo';
import { ProviderFees } from './providerFees';
import { PROVIDER_PRICING } from '../constants';
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
 * recebe o dinheiro, depois se ela está no ar, e só então a papelada. Os
 * endereços de notificação ficam recolhidos porque são consultados uma vez, na
 * configuração inicial, e depois só atrapalham — quatro cartões com três linhas
 * de URL cada viram uma parede de texto.
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
  const pricing = PROVIDER_PRICING[integracao.provider];

  const styles = {
    cartao: {
      p: 2.5,
      borderRadius: 2,
      border: `1px solid ${
        integracao.isDefault
          ? alpha(theme.palette.chips.success, 0.5)
          : theme.palette.divider
      }`,
      backgroundColor: theme.palette.background.paperSecondary,
      display: 'flex',
      flexDirection: 'column',
      gap: 1.75,
      height: '100%',
      transition: 'border-color .15s, box-shadow .15s',
      '&:hover': { boxShadow: `0 2px 12px ${alpha('#000', 0.08)}` },
    },
    topo: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 1.5,
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
    integracao.enabled &&
    !integracao.lastWebhookAt &&
    configuradoHaMaisDeUmaHora;

  return (
    <Box sx={styles.cartao}>
      <Box sx={styles.topo}>
        <ProviderLogo
          provider={integracao.provider}
          size={44}
          // A casa desligada fica acinzentada: o cartão continua legível, e a
          // diferença entre "no ar" e "guardada" se vê antes de ler qualquer
          // palavra.
          sx={{
            opacity: integracao.configured && !integracao.enabled ? 0.45 : 1,
            filter:
              integracao.configured && !integracao.enabled
                ? 'grayscale(1)'
                : 'none',
          }}
        />

        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack
            direction="row"
            spacing={0.75}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
          >
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

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5, lineHeight: 1.45 }}
          >
            {integracao.summary}
          </Typography>
        </Box>

        {integracao.configured && (
          <>
            <IconButton
              size="small"
              onClick={(evento) => setMenu(evento.currentTarget)}
              sx={{ mt: -0.5, mr: -0.5 }}
            >
              <MoreVert fontSize="small" />
            </IconButton>

            <Menu anchorEl={menu} open={!!menu} onClose={() => setMenu(null)}>
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

      {/*
        A tabela entra no lugar das etiquetas de forma de pagamento: ela já diz
        quais são as formas, e com o preço ao lado — as duas juntas repetiriam
        as mesmas palavras a dois centímetros de distância.

        A casa sem tabela cadastrada aqui volta a mostrar só as etiquetas. É o
        caso de uma integração nova no backend antes de alguém levantar o preço
        dela: o cartão fica incompleto, não quebrado.
      */}
      {pricing ? (
        <ProviderFees pricing={pricing} />
      ) : (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {integracao.paymentMethods.map((metodo) => (
            <Chip
              key={metodo}
              size="small"
              variant="outlined"
              label={PAYMENT_METHOD_LABEL[metodo] ?? metodo}
              sx={{ height: 22, fontSize: 11 }}
            />
          ))}
        </Stack>
      )}

      {semRetorno && (
        <Alert severity="warning" sx={{ py: 0.5 }}>
          Nenhuma notificação recebida até agora. Abra Editar e confira se os
          endereços estão cadastrados no painel da {integracao.label} — sem eles
          o pagamento entra e a inscrição continua marcada como pendente.
        </Alert>
      )}

      {saude && (
        <Alert
          severity={saude.ok ? 'success' : 'error'}
          sx={{ py: 0.5 }}
          onClose={() => setSaude(null)}
        >
          {saude.message}
          {saude.account && ` (${saude.account})`}
        </Alert>
      )}

      {integracao.configured && (
        <>
          <Divider />

          {/*
            Os endereços de notificação saíram daqui e foram para o formulário:
            são copiados uma vez, na instalação, e depois só ocupavam espaço. O
            que fica é o sinal de que eles estão funcionando.
          */}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block' }}
          >
            {integracao.lastWebhookAt
              ? `Último retorno em ${formatDateTime(integracao.lastWebhookAt)}`
              : 'Nenhum retorno recebido ainda'}
          </Typography>
        </>
      )}

      <Stack
        direction="row"
        spacing={1}
        sx={{ mt: 'auto', pt: 0.5, flexWrap: 'wrap' }}
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

        {integracao.configured &&
          integracao.enabled &&
          !integracao.isDefault && (
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
