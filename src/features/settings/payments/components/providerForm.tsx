import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  ButtonBase,
  FormControlLabel,
  Stack,
  Step,
  StepButton,
  StepLabel,
  Stepper,
  Switch,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  CheckCircle,
  CreditCard,
  Lock,
  Payment,
  Pix,
  ReceiptLong,
  SvgIconComponent,
} from '@mui/icons-material';

import { semAutopreencher } from '../../shared/semAutopreencher';
import { ResponsiveModal } from '../../../../components/responsiveModal';
import { ProviderLogo } from './providerLogo';
import { WebhookUrls } from './webhookUrls';
import { PROVIDER_EM_TESTE, PROVIDER_WEBHOOK_SETUP } from '../constants';
import { Input } from '../../../../components/input';
import { SelectField } from '../../../../components/selectField';
import { useSavePaymentProvider } from '../api/paymentProviderActions';
import { useWebhookDraft } from '../api/getPaymentProviders';
import { useRole } from '../../../../hooks/useRole';
import {
  CredentialField,
  PAYMENT_METHOD_LABEL,
  PaymentProviderIntegration,
  PaymentProviderMode,
} from '../types';

interface Props {
  churchId: string;
  integracao: PaymentProviderIntegration | null;
  onClose: () => void;
}

const MODOS = [
  { value: 'PRODUCTION', label: 'Produção — Movimentação real' },
  { value: 'SANDBOX', label: 'Sandbox — Local de testes' },
];

const ICONE_DA_FORMA: Record<string, SvgIconComponent> = {
  PIX: Pix,
  BOLETO: ReceiptLong,
  CREDIT_CARD: CreditCard,
  DEBIT_CARD: Payment,
};

/** Campo da etapa "Pagamento": decide como a igreja cobra, não com que credencial */
const ehDePagamento = (campo: CredentialField) =>
  !!(campo.toggle || campo.methods || campo.installmentsMax);

/**
 * Formulário de credenciais, desenhado a partir do que o backend declara.
 *
 * Não há um layout por casa aqui: os campos vêm em `integracao.fields`, com
 * rótulo, obrigatoriedade e ajuda. Uma integração nova entra no ar sem tocar
 * neste arquivo — que é o mesmo motivo de o backend guardar essa lista no
 * adapter em vez de num DTO.
 *
 * Em etapas, como o formulário de notícias: numa página só, com a URL de
 * notificação, as credenciais e as formas de pagamento, o modal passava da
 * altura da tela. A URL de notificação fica nas credenciais, acima dos
 * campos: é ela que o painel do gateway pede para só então mostrar a
 * assinatura que os campos logo abaixo pedem.
 */
function ProviderForm({ churchId, integracao, onClose }: Props) {
  const [valores, setValores] = useState<Record<string, string>>({});
  const [modo, setModo] = useState<PaymentProviderMode>('PRODUCTION');
  const { isDev } = useRole();
  const theme = useTheme();
  const [ligado, setLigado] = useState(false);
  const [passo, setPasso] = useState(0);

  const precisaCadastrarWebhook =
    !!integracao &&
    PROVIDER_WEBHOOK_SETUP[integracao.provider] !== 'por-cobranca';
  const emTeste = !!integracao && !!PROVIDER_EM_TESTE[integracao.provider];

  // Integração ainda não salva: a URL vem de um rascunho, para dar para
  // cadastrá-la no painel e pegar a assinatura antes do primeiro salvar
  const { data: rascunho } = useWebhookDraft(
    churchId,
    integracao?.provider,
    precisaCadastrarWebhook && !integracao.configured
  );

  const { mutate: salvar, isLoading } = useSavePaymentProvider({
    onSuccess: onClose,
  });

  // Reabrir o formulário tem que mostrar o que está gravado hoje, e não o que
  // ficou da última edição — inclusive quando a casa é outra.
  useEffect(() => {
    if (!integracao) return;

    const iniciais: Record<string, string> = {};

    integracao.fields.forEach((campo) => {
      // Segredo volta mascarado do servidor e não pode ser reenviado: o campo
      // começa vazio, e vazio significa "mantém o que já está lá".
      iniciais[campo.key] = campo.secret
        ? ''
        : (integracao.credentialsHint?.[campo.key] ?? '');

      // Parcelas gravadas quando o Ton aceitava texto livre: "24" vale o que o
      // gateway já cobrava (o teto), lixo vira o padrão. Sem isto o seletor
      // abria vazio e o salvar era recusado sem dizer por quê.
      if (campo.installmentsMax && iniciais[campo.key]) {
        const n = Number(iniciais[campo.key]);
        iniciais[campo.key] =
          Number.isInteger(n) && n >= 1
            ? String(Math.min(n, campo.installmentsMax))
            : '';
      }
    });

    setValores(iniciais);
    setModo(integracao.mode);
    // Nova começa desligada: salvar credencial não pode tirar de cena, sem
    // ninguém pedir, a integração que já está cobrando
    setLigado(integracao.enabled && integracao.isDefault);
    setPasso(0);
  }, [integracao]);

  const faltando = useMemo(() => {
    if (!integracao) return [];

    return integracao.fields.filter((campo) => {
      if (!campo.required) return false;
      if (valores[campo.key]?.trim()) return false;

      // Segredo já gravado continua valendo com o campo em branco
      return !(campo.secret && integracao.credentialsHint?.[campo.key]);
    });
  }, [integracao, valores]);

  if (!integracao) return null;

  const PASSOS = ['Credenciais', 'Pagamento'];
  const etapa = PASSOS[passo];
  const ultimo = passo === PASSOS.length - 1;
  // na criação o caminho é em ordem; na edição dá para ir direto à etapa
  const editando = integracao.configured;
  const credenciaisIncompletas = faltando.length > 0;

  const styles = {
    // aviso de uma linha não precisa do respiro de um bloco de texto
    aviso: { py: 0.25, alignItems: 'center' },
    chaves: {
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 2,
      px: 1.5,
    },
    chave: {
      ml: 0,
      mr: 0,
      width: '100%',
      justifyContent: 'space-between',
      py: 0.25,
      '& + &': { borderTop: `1px solid ${theme.palette.divider}` },
    },
  };

  const definir = (chave: string, valor: string) =>
    setValores((atual) => ({ ...atual, [chave]: valor }));

  const enviar = () => {
    salvar({
      churchId,
      provider: integracao.provider,
      // sem o campo na tela, o modo também não vai no corpo: o servidor
      // mantém o que já está gravado, em vez de a edição empurrar tudo para
      // produção sem ninguém ter pedido
      ...(isDev ? { mode: modo } : {}),
      // só uma cobra por vez: ligada é a padrão, e o backend desliga as demais
      enabled: ligado,
      makeDefault: ligado,
      // Só o que a pessoa digitou. O campo secreto em branco não vai no corpo,
      // e o backend entende isso como "não mexi neste campo".
      credentials: Object.fromEntries(
        Object.entries(valores).filter(([, valor]) => valor.trim() !== '')
      ),
      ...(!integracao.configured && rascunho?.webhookDraft
        ? { webhookDraft: rascunho.webhookDraft }
        : {}),
    });
  };

  const webhooks = integracao.configured
    ? integracao.webhooks
    : (rascunho?.webhooks ?? []);

  const camposDePagamento = integracao.fields.filter(ehDePagamento);
  const campoDeFormas = camposDePagamento.find((campo) => campo.methods);

  /** Formas marcadas: o campo vazio (nunca salvo) é o padrão do gateway, como no backend */
  const formasMarcadas = (campo: CredentialField) =>
    valores[campo.key]
      ? valores[campo.key].split(',')
      : (campo.defaultMethods ?? campo.methods ?? []);

  const comCredito =
    !campoDeFormas || formasMarcadas(campoDeFormas).includes('CREDIT_CARD');

  const renderFormas = (campo: CredentialField) => {
    const marcadas = formasMarcadas(campo);

    const alternar = (forma: string) =>
      definir(
        campo.key,
        // na ordem do gateway, não na ordem dos cliques
        (campo.methods ?? [])
          .filter((f) =>
            f === forma ? !marcadas.includes(f) : marcadas.includes(f)
          )
          .join(',')
      );

    return (
      <Box key={campo.key}>
        <Typography variant="body2" fontWeight={600}>
          {campo.label}
        </Typography>
        {campo.help && (
          <Typography variant="caption" color="text.secondary">
            {campo.help}
          </Typography>
        )}

        {/*
          Blocos com ícone em vez de caixas soltas numa linha: a forma marcada
          se lê de longe, e o bloco inteiro é a área de clique — o que importa
          no celular. Duas colunas no celular, quatro a partir do tablet.
        */}
        <Box
          sx={{
            mt: 1,
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
            gap: 1,
          }}
        >
          {campo.methods?.map((forma) => {
            const marcada = marcadas.includes(forma);
            // sem nenhuma forma não há checkout: a última fica presa
            const presa = marcada && marcadas.length === 1;
            const Icone = ICONE_DA_FORMA[forma] ?? Payment;

            return (
              <ButtonBase
                key={forma}
                role="checkbox"
                aria-checked={marcada}
                disabled={presa}
                onClick={() => alternar(forma)}
                title={presa ? 'Pelo menos uma forma fica ligada' : undefined}
                sx={{
                  position: 'relative',
                  flexDirection: 'column',
                  gap: 0.5,
                  py: 1.25,
                  borderRadius: 2,
                  border: `1px solid ${
                    marcada ? theme.palette.primary.main : theme.palette.divider
                  }`,
                  bgcolor: marcada
                    ? alpha(theme.palette.primary.main, 0.08)
                    : 'transparent',
                  color: marcada ? 'text.primary' : 'text.secondary',
                  transition: 'border-color .15s, background-color .15s',
                  '&:hover': { borderColor: theme.palette.primary.main },
                  '&.Mui-disabled': { opacity: 1 },
                  '&.Mui-focusVisible': {
                    outline: `2px solid ${theme.palette.primary.main}`,
                    outlineOffset: 2,
                  },
                }}
              >
                {marcada && (
                  <CheckCircle
                    color="primary"
                    sx={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      fontSize: 16,
                    }}
                  />
                )}
                <Icone
                  sx={{
                    fontSize: 22,
                    color: marcada ? 'primary.main' : 'text.disabled',
                  }}
                />
                <Typography variant="body2" fontWeight={marcada ? 600 : 400}>
                  {campo.methodLabels?.[forma] ??
                    PAYMENT_METHOD_LABEL[forma] ??
                    forma}
                </Typography>
              </ButtonBase>
            );
          })}
        </Box>
      </Box>
    );
  };

  const renderParcelas = (campo: CredentialField) => (
    <SelectField
      key={campo.key}
      label={campo.label}
      size="small"
      value={valores[campo.key] ?? ''}
      onChange={(valor) => definir(campo.key, valor)}
      disabled={!comCredito}
      helperText={
        comCredito ? campo.help : 'Só vale com cartão de crédito marcado.'
      }
      options={[
        { value: '', label: 'Padrão do gateway' },
        ...Array.from({ length: campo.installmentsMax ?? 1 }, (_, i) => ({
          value: String(i + 1),
          label: i === 0 ? '1x (só à vista)' : `Até ${i + 1}x`,
        })),
      ]}
    />
  );

  const renderChave = (campo: CredentialField) => (
    <FormControlLabel
      key={campo.key}
      labelPlacement="start"
      sx={styles.chave}
      control={
        <Switch
          checked={valores[campo.key] === 'true'}
          onChange={(evento) =>
            definir(campo.key, evento.target.checked ? 'true' : '')
          }
        />
      }
      label={
        <Box sx={{ py: 0.5, pr: 1 }}>
          <Typography variant="body2">{campo.label}</Typography>
          {campo.help && (
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              {campo.help}
            </Typography>
          )}
        </Box>
      }
    />
  );

  return (
    <ResponsiveModal
      open={!!integracao}
      onClose={onClose}
      disableClose={isLoading}
      maxWidth="sm"
      fullWidth
      title={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <ProviderLogo provider={integracao.provider} size={32} />
          <span>Configurar {integracao.label}</span>
        </Stack>
      }
      actions={
        <>
          <Button
            onClick={passo === 0 ? onClose : () => setPasso(passo - 1)}
            disabled={isLoading}
            color="inherit"
          >
            {passo === 0 ? 'Cancelar' : 'Voltar'}
          </Button>

          {!ultimo && (
            <Button
              variant={editando ? 'outlined' : 'contained'}
              onClick={() => setPasso(passo + 1)}
              // só segue das credenciais com o obrigatório preenchido
              disabled={
                !editando && etapa === 'Credenciais' && credenciaisIncompletas
              }
            >
              Próximo
            </Button>
          )}

          {/* na edição o salvar fica sempre à mão: trocar só as parcelas não
              obriga a percorrer as etapas */}
          {(editando || ultimo) && (
            <Button
              variant="contained"
              onClick={enviar}
              disabled={isLoading || credenciaisIncompletas}
            >
              {isLoading ? 'Salvando…' : 'Salvar'}
            </Button>
          )}
        </>
      }
    >
      <Stack spacing={2}>
        <Stepper activeStep={passo} nonLinear={editando} alternativeLabel>
          {PASSOS.map((rotulo, indice) => (
            <Step key={rotulo} completed={!editando && indice < passo}>
              <StepButton
                disabled={!editando && indice > passo}
                onClick={() => setPasso(indice)}
              >
                <StepLabel
                  error={
                    rotulo === 'Credenciais' &&
                    credenciaisIncompletas &&
                    passo > indice
                  }
                >
                  {rotulo}
                </StepLabel>
              </StepButton>
            </Step>
          ))}
        </Stepper>

        {/* altura mínima: sem ela o modal muda de tamanho a cada etapa e
            "pula" na tela */}
        <Stack spacing={2} sx={{ minHeight: { md: 300 } }}>
          {etapa === 'Credenciais' && (
            <>
              {/*
                O aviso vem antes das credenciais: ele é material de escolha —
                ainda dá para fechar e ficar no gateway que já está rodando.
              */}
              {emTeste && (
                <Alert severity="warning" sx={styles.aviso}>
                  Integração recente: confira no painel dela se os primeiros
                  pagamentos deram baixa sozinhos.
                </Alert>
              )}

              {/*
                O ambiente é escolha de dev, e a rota recusa o resto.

                Quem administra a igreja cadastra para receber de verdade: uma
                integração em sandbox aceita inscrição, devolve link, e o
                dinheiro nunca chega — com a tela inteira dizendo que está tudo
                certo. Quem não é dev também não muda o que já está gravado: o
                formulário não manda o campo, e o servidor mantém o que estava.
              */}
              {isDev ? (
                <SelectField
                  label="Ambiente"
                  value={modo}
                  onChange={(valor) => setModo(valor as PaymentProviderMode)}
                  options={MODOS}
                />
              ) : (
                modo === 'SANDBOX' && (
                  <Alert severity="warning" sx={styles.aviso}>
                    Em <strong>sandbox</strong>: pagamento de teste, o dinheiro
                    não entra. Só o dev altera.
                  </Alert>
                )
              )}

              {/*
                PagBank e InfinitePay recebem o endereço dentro da própria
                chamada que cria a cobrança e não têm o que cadastrar: para
                eles esta parte não aparece. Vem antes dos campos porque o
                painel pede a URL para só então mostrar a assinatura.
              */}
              {precisaCadastrarWebhook &&
                (webhooks.length > 0 ? (
                  <WebhookUrls integracao={{ ...integracao, webhooks }} />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Gerando o endereço de notificação…
                  </Typography>
                ))}

              {integracao.fields
                .filter((campo) => !ehDePagamento(campo))
                .map((campo) => (
                  <Input
                    key={campo.key}
                    label={campo.label + (campo.required ? ' *' : '')}
                    value={valores[campo.key] ?? ''}
                    onChange={(evento) =>
                      definir(campo.key, evento.target.value)
                    }
                    // `password` nos segredos evita que o token fique legível
                    // durante um compartilhamento de tela — que é como isso
                    // vaza na prática, não por invasão.
                    type={campo.secret ? 'password' : 'text'}
                    // sem isto o navegador punha o login salvo (CPF e senha) aqui
                    {...semAutopreencher(campo.secret)}
                    size="small"
                    placeholder={
                      campo.secret && integracao.credentialsHint?.[campo.key]
                        ? `Salvo: ${integracao.credentialsHint[campo.key]} — deixe em branco para manter`
                        : campo.placeholder
                    }
                    errorMessage={campo.help}
                  />
                ))}

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                <Lock sx={{ fontSize: 13 }} />
                Credenciais são gravadas cifradas e não voltam para a tela.
              </Typography>
            </>
          )}

          {etapa === 'Pagamento' && (
            <>
              {camposDePagamento
                .filter((campo) => campo.methods)
                .map(renderFormas)}

              {camposDePagamento
                .filter((campo) => campo.installmentsMax)
                .map(renderParcelas)}

              {/*
                Cada coisa que a integração não deixa escolher ganha o próprio
                aviso: o PayPal escolhe o Pix por aqui mas não as parcelas, e
                um aviso único dizendo "nada se escolhe" contradizia a chave
                logo abaixo.
              */}
              {!camposDePagamento.some((campo) => campo.installmentsMax) && (
                <Alert severity="info" sx={styles.aviso}>
                  O número de parcelas não pode ser definido por aqui: configure
                  na conta da {integracao.label}.
                </Alert>
              )}

              {!camposDePagamento.some(
                (campo) => campo.methods || campo.toggle
              ) && (
                <Alert severity="info" sx={styles.aviso}>
                  As formas de pagamento seguem o que está ativo na conta da{' '}
                  {integracao.label}.
                </Alert>
              )}

              {/*
                Rótulo à esquerda e chave à direita, num bloco só. A principal
                é a mesma do card: só uma integração cobra por vez, e ligar
                esta desliga as demais. Embaixo, as chaves que o próprio
                gateway declarar (`toggle`; hoje nenhum) — desligada, a chave
                não vai no corpo, e o servidor entende como desligada.
              */}
              <Box sx={styles.chaves}>
                <FormControlLabel
                  labelPlacement="start"
                  sx={styles.chave}
                  control={
                    <Switch
                      checked={ligado}
                      onChange={(evento) => setLigado(evento.target.checked)}
                    />
                  }
                  label={
                    <Box sx={{ py: 0.5, pr: 1 }}>
                      <Typography variant="body2">
                        Definir como forma de pagamento ativa
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        display="block"
                      >
                        As novas inscrições passam a ser cobradas por aqui. Só
                        uma integração fica ativa por vez: a que estiver ativa
                        hoje é desligada, mas as cobranças já abertas nela
                        continuam recebendo baixa.
                      </Typography>
                    </Box>
                  }
                />
                {camposDePagamento
                  .filter((campo) => campo.toggle)
                  .map(renderChave)}
              </Box>
            </>
          )}
        </Stack>
      </Stack>
    </ResponsiveModal>
  );
}

export { ProviderForm };
