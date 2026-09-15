import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Popover,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  Autorenew,
  CheckCircle,
  DeleteOutline,
  ErrorOutline,
  MoreVert,
  NetworkCheck,
  Settings,
} from '@mui/icons-material';

import { ConfirmModal } from '../../../../components/ConfirmModal';
import { ProviderLogo } from './providerLogo';
import { ProviderFees } from './providerFees';
import {
  PROVIDER_EM_TESTE,
  PROVIDER_PRICING,
  PROVIDER_WEBHOOK_SETUP,
} from '../constants';
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

/** O pontinho colorido das linhas de situação */
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

/**
 * O cartão de uma casa de pagamento.
 *
 * A hierarquia é a da decisão: qual casa é, em que situação ela está, quanto
 * custa e o que dá para fazer com ela. Cada uma dessas quatro coisas ocupa uma
 * faixa própria, sempre na mesma altura — três cartões lado a lado só se
 * comparam se a mesma informação estiver na mesma linha nos três.
 *
 * Nada que o cartão mostra depois de uma ação muda a altura dele. Situação é
 * sempre uma linha; o resultado do teste de conexão é um popover ancorado ao
 * botão. Um alerta empurrando o rodapé para baixo reflowava a grade inteira e
 * mexia de lugar os botões dos cartões vizinhos, bem na hora em que a pessoa
 * ia clicar num deles.
 */
function ProviderCard({ churchId, integracao, onConfigurar }: Props) {
  const theme = useTheme();
  const [menu, setMenu] = useState<HTMLElement | null>(null);
  const [confirmandoRemocao, setConfirmandoRemocao] = useState(false);
  const [confirmandoGiro, setConfirmandoGiro] = useState(false);
  const [saude, setSaude] = useState<GatewayHealth | null>(null);
  const [ancoraDoTeste, setAncoraDoTeste] = useState<HTMLElement | null>(null);

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
  const cadastradoNoPainel =
    PROVIDER_WEBHOOK_SETUP[integracao.provider] === 'painel';
  const emTeste = !!PROVIDER_EM_TESTE[integracao.provider];

  const verde = theme.palette.chips.success;
  const ambar = theme.palette.chips.alert;
  const apagado = theme.palette.text.disabled;

  /** A situação da casa em uma linha só — ver a nota da altura fixa acima. */
  const situacao = !integracao.configured
    ? { cor: apagado, texto: 'Não configurada' }
    : !integracao.enabled
      ? { cor: apagado, texto: 'Desligada' }
      : integracao.isDefault
        ? { cor: verde, texto: 'Recebendo' }
        : { cor: theme.palette.text.secondary, texto: 'Pronta para usar' };

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2.5,
        border: `1px solid ${
          integracao.isDefault ? alpha(verde, 0.45) : theme.palette.divider
        }`,
        // A casa que recebe ganha um fundo levemente tingido além da borda: a
        // borda sozinha se perde quando são três cartões por linha.
        backgroundColor: integracao.isDefault
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
        <ProviderLogo
          provider={integracao.provider}
          size={40}
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
          {/*
            A etiqueta fica colada no nome da casa, e não na linha de situação
            logo abaixo: "em teste" é uma coisa da integração, que vale igual
            antes e depois de configurar, enquanto aquela linha conta o estado
            de agora. As duas juntas leriam como se a casa estivesse num estado
            chamado "em teste".
          */}
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Typography fontSize={15.5} fontWeight={600} noWrap>
              {integracao.label}
            </Typography>

            {emTeste && (
              <Tooltip title="Integração recente, ainda em acompanhamento. Funciona normalmente — vale conferir no painel da casa se os primeiros pagamentos deram baixa sozinhos.">
                <Chip
                  size="small"
                  label="Em teste"
                  sx={{
                    flexShrink: 0,
                    height: 19,
                    fontSize: 10.5,
                    fontWeight: 600,
                    color: ambar,
                    backgroundColor: alpha(ambar, 0.14),
                    '& .MuiChip-label': { px: 0.75 },
                  }}
                />
              </Tooltip>
            )}
          </Stack>

          <Stack direction="row" spacing={0.75} alignItems="center">
            <Ponto cor={situacao.cor} />
            <Typography variant="caption" sx={{ color: situacao.cor }}>
              {situacao.texto}
            </Typography>

            {integracao.mode === 'SANDBOX' && integracao.configured && (
              <Typography variant="caption" sx={{ color: ambar }}>
                · Sandbox
              </Typography>
            )}
          </Stack>
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

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          lineHeight: 1.45,
          // Duas linhas fixas: as descrições têm comprimentos diferentes, e sem
          // o corte a faixa de taxas começava numa altura em cada cartão.
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          minHeight: 40,
        }}
      >
        {integracao.summary}
      </Typography>

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

      <Box sx={{ mt: 'auto', pt: 0.5 }}>
        <Divider sx={{ mb: 1.25 }} />

        {/*
          Box com `gap` e não Stack: o Stack espaça os filhos com uma regra de
          `margin-left` no pai, que ganha em especificidade do `ml: 'auto'` do
          botão de teste e o deixava colado no botão do meio em vez de na
          borda direita.
        */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Button
            size="small"
            variant={integracao.configured ? 'outlined' : 'contained'}
            startIcon={<Settings fontSize="small" />}
            onClick={onConfigurar}
          >
            {integracao.configured ? 'Editar' : 'Configurar'}
          </Button>

          {integracao.configured &&
            integracao.enabled &&
            !integracao.isDefault && (
              <Button
                size="small"
                variant="text"
                disabled={definindo}
                onClick={() => definirPadrao(acao)}
              >
                Usar esta
              </Button>
            )}

          {integracao.configured && (
            // Botão de ícone, e não de texto: com três cartões por linha, três
            // botões escritos quebravam em duas fileiras e desalinhavam o
            // rodapé de um cartão para o outro.
            <Tooltip title="Testar conexão">
              <Box sx={{ ml: 'auto' }}>
                <IconButton
                  size="small"
                  disabled={testando}
                  onClick={(evento) => {
                    setAncoraDoTeste(evento.currentTarget);
                    testar(acao);
                  }}
                >
                  {testando ? (
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

      {/*
        O resultado do teste flutua ancorado no botão em vez de entrar no fluxo
        do cartão. Ele é passageiro — lido uma vez e dispensado — e no fluxo
        empurrava o rodapé para baixo, mudando a altura da linha inteira da
        grade.
      */}
      <Popover
        open={!!saude && !!ancoraDoTeste}
        anchorEl={ancoraDoTeste}
        onClose={() => setSaude(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        PaperProps={{ sx: { maxWidth: 300, mt: -1 } }}
      >
        <Stack direction="row" spacing={1} sx={{ p: 1.5 }}>
          {saude?.ok ? (
            <CheckCircle sx={{ fontSize: 18, color: verde, mt: 0.2 }} />
          ) : (
            <ErrorOutline
              sx={{
                fontSize: 18,
                color: theme.palette.chips.canceled,
                mt: 0.2,
              }}
            />
          )}

          <Box>
            <Typography variant="body2">{saude?.message}</Typography>

            {saude?.account && (
              <Typography variant="caption" color="text.secondary">
                {saude.account}
              </Typography>
            )}
          </Box>
        </Stack>
      </Popover>

      <ConfirmModal
        open={confirmandoGiro}
        onClose={() => setConfirmandoGiro(false)}
        onConfirm={() => girarSegredo(acao)}
        title="Gerar novo endereço de notificação?"
        message={
          cadastradoNoPainel
            ? `O endereço atual deixa de ser aceito imediatamente. Até você cadastrar o novo no painel da ${integracao.label}, nenhum pagamento recebe baixa automática.`
            : // As cobranças já abertas saíram com o endereço antigo gravado na
              // casa e não têm como ser avisadas da troca — elas param de dar
              // baixa sozinhas. As novas já nascem com o endereço novo.
              'As cobranças já abertas continuam apontando para o endereço antigo e param de receber baixa automática. As novas já saem com o endereço novo, sem você precisar cadastrar nada.'
        }
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
