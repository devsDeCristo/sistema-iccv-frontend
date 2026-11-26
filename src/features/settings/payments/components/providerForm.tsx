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
import { gravarTaxas, lerTaxas, taxaValida, taxasConhecidas } from '../taxas';
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
  !!(
    campo.toggle ||
    campo.methods ||
    campo.installmentsMax ||
    campo.fees ||
    campo.staticPix
  );

/** O estado do formulário comparável: o que mudou é o que difere do retrato ao abrir */
const retrato = (
  valores: Record<string, string>,
  ligado: boolean,
  modo: string,
  // ligar o Pix estático é mudança mesmo antes de colar o código
  pixEstatico: boolean
) =>
  JSON.stringify({
    // campo vazio e campo ausente são a mesma coisa para o salvar
    valores: Object.entries(valores)
      .filter(([, valor]) => valor.trim() !== '')
      .map(([chave, valor]) => [chave, valor.trim()])
      .sort(),
    ligado,
    modo,
    pixEstatico,
  });

/**
 * O código como o banco gerou: copiado de mensagem ou PDF, ele chega quebrado
 * em linhas e às vezes com caractere invisível. Espaço comum fica ("SAO
 * PAULO"). O servidor limpa igual (`limparBrCode`).
 */
const limparBrCode = (codigo: string) =>
  codigo
    .replace(/[\r\n\t\u200B-\u200D\u2060\uFEFF]/g, '')
    // espaço "especial" que alguns apps põem no lugar do comum ao copiar
    .replace(/[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g, ' ');

/** O que já dá para dizer na tela; o resto (CRC, campos) o servidor diz ao salvar */
const problemaNoCodigo = (codigo: string) => {
  const texto = codigo.trim();
  if (!texto.startsWith('000201')) {
    return /@|^\+?[\d\s().-]{10,18}$/.test(texto)
      ? 'Isso é a chave Pix, não o código: no app do banco, gere um Pix para receber (sem valor) e copie o "Pix Copia e Cola".'
      : 'O código precisa começar com 000201: copie de novo o "Pix Copia e Cola" inteiro.';
  }
  if (!/6304[0-9A-Fa-f]{4}$/.test(texto)) {
    return 'O final do código está faltando (ele termina em 6304 e mais 4 letras ou números): copie de novo, até o fim.';
  }
  return null;
};

/** BR Code inteiro: começa em `000201` e fecha com o CRC (`6304` + 4 hex) */
const pareceBrCode = (codigo: string) =>
  /^000201.*6304[0-9A-Fa-f]{4}$/.test(codigo.trim());

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
  // a chave do Pix estático: ligada com o campo ainda vazio, enquanto cola
  const [comPixEstatico, setComPixEstatico] = useState(false);
  // o que estava gravado ao abrir: na edição, salvar sem mudar nada não salva
  const [original, setOriginal] = useState('');
  // clicou em Salvar com algo a corrigir: daí em diante o motivo fica à vista
  const [tentouSalvar, setTentouSalvar] = useState(false);

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

      // Integração nova abre com todas as formas marcadas, e a lista vai
      // explícita no salvar. A já gravada sem escolha mostra o padrão que o
      // backend aplica a ela (`defaultMethods`), que é o que está valendo.
      if (campo.methods && !integracao.configured && !iniciais[campo.key]) {
        iniciais[campo.key] = campo.methods.join(',');
      }

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
    const estaticoAoAbrir = integracao.fields.some(
      (campo) => campo.staticPix && iniciais[campo.key]
    );
    setComPixEstatico(estaticoAoAbrir);
    // o retrato usa a mesma regra do envio: o estático só vale com o Pix
    // marcado. Sem isto, um código gravado sem Pix ligava o Salvar ao abrir
    const formasAoAbrir = integracao.fields.find((campo) => campo.methods);
    const pixAoAbrir =
      !formasAoAbrir ||
      (iniciais[formasAoAbrir.key]
        ? iniciais[formasAoAbrir.key].split(',')
        : (formasAoAbrir.defaultMethods ?? formasAoAbrir.methods ?? [])
      ).includes('PIX');
    setModo(integracao.mode);
    // Nova começa desligada: salvar credencial não pode tirar de cena, sem
    // ninguém pedir, a integração que já está cobrando
    const ligadaAoAbrir = integracao.enabled && integracao.isDefault;
    setLigado(ligadaAoAbrir);
    setOriginal(
      retrato(
        iniciais,
        ligadaAoAbrir,
        integracao.mode,
        pixAoAbrir && estaticoAoAbrir
      )
    );
    setPasso(0);
    setTentouSalvar(false);
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
  const campoDoPixEstatico = integracao.fields.find((c) => c.staticPix);

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

  const camposDePagamento = integracao.fields.filter(ehDePagamento);
  const campoDeFormas = camposDePagamento.find((campo) => campo.methods);

  /** Formas marcadas: o campo vazio (nunca salvo) é o padrão do gateway, como no backend */
  const formasMarcadas = (campo: CredentialField) =>
    valores[campo.key]
      ? valores[campo.key].split(',')
      : (campo.defaultMethods ?? campo.methods ?? []);

  const comCredito =
    !campoDeFormas || formasMarcadas(campoDeFormas).includes('CREDIT_CARD');
  const comPix =
    !campoDeFormas || formasMarcadas(campoDeFormas).includes('PIX');
  const usaPixEstatico = comPix && comPixEstatico;

  /**
   * As formas do repasse que valem agora: só as marcadas, e sem o Pix quando
   * o Pix estático o substitui (o gateway não cobra nada ali). O resto fica
   * guardado na tela — remarcar a forma traz a taxa de volta —, mas não trava
   * o Salvar nem vai para o servidor.
   */
  const formasDoRepasse = (campo: CredentialField) =>
    (campo.fees ?? []).filter(
      (forma) =>
        (!campoDeFormas || formasMarcadas(campoDeFormas).includes(forma)) &&
        !(forma === 'PIX' && usaPixEstatico)
    );
  const rotuloDaForma = (forma: string) =>
    campoDeFormas?.methodLabels?.[forma] ??
    PAYMENT_METHOD_LABEL[forma] ??
    forma;

  // taxa fora do formato (0 a 99,99) numa forma que vale: o servidor recusaria
  const taxasInvalidas = integracao.fields.flatMap((campo) => {
    if (!campo.fees) return [];
    const taxas = lerTaxas(valores[campo.key] ?? '');
    if (!Object.keys(taxas).length) return [];
    return formasDoRepasse(campo).filter(
      (forma) => !taxaValida(taxas[forma] ?? '')
    );
  });

  // ligado sem código válido: o servidor recusaria, ou salvaria desligado
  const pixEstaticoInvalido =
    !!campoDoPixEstatico &&
    usaPixEstatico &&
    !pareceBrCode(valores[campoDoPixEstatico.key] ?? '');

  // nova sempre tem o que salvar; a gravada, só se algo mudou (digitar e
  // apagar de volta conta como não mexido)
  const semMudanca =
    editando && retrato(valores, ligado, modo, usaPixEstatico) === original;

  /**
   * O que impede o envio. Não trava o botão — qualquer mudança liga o
   * Salvar —: o clique mostra o motivo ao lado dos botões e leva à etapa
   * onde ele está, em vez de mandar ao servidor o que ele recusaria.
   */
  const problema = credenciaisIncompletas
    ? {
        etapa: 0,
        texto: `Preencha ${faltando.map((campo) => campo.label).join(', ')} em Credenciais.`,
      }
    : taxasInvalidas.length
      ? {
          etapa: 1,
          texto: `Taxa de repasse inválida em ${taxasInvalidas
            .map(rotuloDaForma)
            .join(', ')}: use de 0 a 99,99%.`,
        }
      : pixEstaticoInvalido
        ? {
            etapa: 1,
            texto:
              campoDoPixEstatico &&
              (valores[campoDoPixEstatico.key] ?? '').trim()
                ? `Pix estático: ${problemaNoCodigo(valores[campoDoPixEstatico.key] ?? '') ?? 'código inválido.'}`
                : 'Cole o código do Pix estático para salvar.',
          }
        : null;

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
        Object.entries(valores)
          .map(([chave, valor]) => {
            const campo = integracao.fields.find((c) => c.key === chave);
            if (!campo?.fees) return [chave, valor];
            // o repasse leva só as formas que valem (ver `formasDoRepasse`)
            const taxas = lerTaxas(valor);
            return [
              chave,
              gravarTaxas(
                Object.fromEntries(
                  formasDoRepasse(campo)
                    .filter((forma) => forma in taxas)
                    .map((forma) => [forma, taxas[forma]])
                )
              ),
            ];
          })
          .filter(
            ([chave, valor]) =>
              valor.trim() !== '' &&
              // Pix estático desligado, ou sem o Pix marcado para ele
              // substituir, não vai: o servidor apaga o que estava gravado
              !(chave === campoDoPixEstatico?.key && !usaPixEstatico)
          )
      ),
      ...(!integracao.configured && rascunho?.webhookDraft
        ? { webhookDraft: rascunho.webhookDraft }
        : {}),
    });
  };

  const tentarSalvar = () => {
    if (problema) {
      setTentouSalvar(true);
      setPasso(problema.etapa);
      return;
    }
    enviar();
  };

  const webhooks = integracao.configured
    ? integracao.webhooks
    : (rascunho?.webhooks ?? []);

  const renderFormas = (campo: CredentialField) => {
    const marcadas = formasMarcadas(campo);

    const alternar = (forma: string) => {
      definir(
        campo.key,
        // na ordem do gateway, não na ordem dos cliques
        (campo.methods ?? [])
          .filter((f) =>
            f === forma ? !marcadas.includes(f) : marcadas.includes(f)
          )
          .join(',')
      );
      // sem Pix oferecido o Pix estático não tem onde aparecer: sai junto,
      // em vez de ficar gravado sem uso
      if (forma === 'PIX' && marcadas.includes('PIX') && campoDoPixEstatico) {
        setComPixEstatico(false);
        definir(campoDoPixEstatico.key, '');
      }
    };

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
                  gap: 0.75,
                  // folga dos lados para o rótulo longo ("Cartão ou conta
                  // PayPal") não encostar na borda nem no ✓ do canto
                  py: 1.5,
                  px: 3,
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
                <Typography
                  variant="body2"
                  fontWeight={marcada ? 600 : 400}
                  textAlign="center"
                  lineHeight={1.3}
                >
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

  /**
   * Repassar a taxa ao inscrito. Ligada, um percentual por forma — só as
   * formas marcadas, que são as que podem ser cobradas —, já preenchido com
   * o pior cenário que conhecemos (recebimento na hora). A igreja ajusta para
   * o plano dela: a API de nenhum gateway informa a taxa da conta.
   */
  const renderRepasse = (campo: CredentialField) => {
    const taxas = lerTaxas(valores[campo.key] ?? '');
    const ligado = Object.keys(taxas).length > 0;
    const visiveis = formasDoRepasse(campo);
    const rotulo = rotuloDaForma;

    const ligar = (sim: boolean) => {
      if (!sim) return definir(campo.key, '');
      const conhecidas = taxasConhecidas(integracao.provider);
      // forma sem taxa publicada (débito no PagBank, boleto no Ton) nasce com
      // a maior conhecida do gateway — o pior caso; zero seria o melhor
      const maior = Math.max(0, ...Object.values(conhecidas));
      definir(
        campo.key,
        gravarTaxas(
          Object.fromEntries(
            (campo.fees ?? []).map((forma) => [
              forma,
              String(conhecidas[forma] ?? maior),
            ])
          )
        )
      );
    };

    return (
      <Box key={campo.key} sx={styles.chaves}>
        <FormControlLabel
          labelPlacement="start"
          sx={styles.chave}
          control={
            <Switch
              checked={ligado}
              onChange={(evento) => ligar(evento.target.checked)}
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

        {ligado && (
          <Box sx={{ py: 1.5 }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, 1fr)',
                  sm: `repeat(${Math.min(visiveis.length, 4)}, 1fr)`,
                },
                gap: 1.5,
              }}
            >
              {visiveis.map((forma) => {
                const texto = taxas[forma] ?? '';
                return (
                  <Input
                    key={forma}
                    label={rotulo(forma)}
                    size="small"
                    value={texto.replace('.', ',')}
                    onChange={(evento) =>
                      definir(
                        campo.key,
                        gravarTaxas({
                          ...taxas,
                          [forma]: evento.target.value
                            .replace(/[^\d,.]/g, '')
                            .replace(',', '.'),
                        })
                      )
                    }
                    error={!taxaValida(texto)}
                    errorMessage={
                      taxaValida(texto) ? undefined : 'De 0 a 99,99'
                    }
                    inputProps={{ inputMode: 'decimal' }}
                    InputProps={{
                      endAdornment: (
                        <Typography color="text.secondary">%</Typography>
                      ),
                    }}
                  />
                );
              })}
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mt={1}
            >
              Preenchido com a taxa de recebimento na hora; ajuste para a do seu
              plano. No checkout, cartão e boleto dividem o mesmo valor, e vale
              a maior taxa entre as formas de lá. A taxa fixa por transação,
              quando houver, não entra.
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  const renderPixEstatico = (campo: CredentialField) => {
    const ligar = (sim: boolean) => {
      setComPixEstatico(sim);
      if (!sim) definir(campo.key, '');
    };
    const codigo = valores[campo.key] ?? '';

    return (
      <Box key={campo.key} sx={styles.chaves}>
        <FormControlLabel
          labelPlacement="start"
          sx={styles.chave}
          control={
            <Switch
              checked={comPixEstatico}
              onChange={(evento) => ligar(evento.target.checked)}
            />
          }
          label={
            <Box sx={{ py: 0.5, pr: 1 }}>
              <Typography variant="body2">Usar Pix estático</Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
              >
                Quem escolher Pix vê o QR Code da chave Pix da igreja, já com o
                valor da inscrição, sem passar pelo {integracao.label}.
              </Typography>
            </Box>
          }
        />
        {comPixEstatico && (
          <Stack spacing={1.5} sx={{ pb: 1.5, pt: 0.5 }}>
            <Alert severity="warning" sx={{ alignItems: 'center' }}>
              O Pix estático <strong>não é verificado automaticamente</strong> e{' '}
              <strong>não dá baixa</strong>: confira o extrato da conta e marque
              cada pagamento como pago em Pagamentos.
            </Alert>
            <Input
              label={campo.label}
              value={codigo}
              onChange={(evento) =>
                definir(campo.key, limparBrCode(evento.target.value))
              }
              {...semAutopreencher(false)}
              size="small"
              multiline
              minRows={2}
              placeholder="00020126…"
              sx={{ width: '100%' }}
              // Vermelho só com código colado que não fecha, ou depois de
              // tentar salvar: vazio, logo ao ligar a chave, é só o começo
              error={codigo.trim() ? !pareceBrCode(codigo) : tentouSalvar}
              errorMessage={
                !codigo.trim()
                  ? tentouSalvar
                    ? 'Cole o código para salvar.'
                    : campo.help
                  : (problemaNoCodigo(codigo) ?? campo.help)
              }
            />
          </Stack>
        )}
      </Box>
    );
  };

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
      // 700px em todos os gateways: no `sm` (600) as formas e o repasse
      // apertavam; no celular continua a folha de baixo
      maxWidth={false}
      fullWidth
      sx={{ '& .MuiDialog-paper': { maxWidth: 700 } }}
      title={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <ProviderLogo provider={integracao.provider} size={32} />
          <span>Configurar {integracao.label}</span>
        </Stack>
      }
      actions={
        <>
          {/* à esquerda dos botões: o que falta corrigir, depois do clique
              em Salvar (ou já, no Próximo travado do cadastro novo) */}
          {!isLoading &&
            problema &&
            (tentouSalvar ||
              (!editando &&
                etapa === 'Credenciais' &&
                credenciaisIncompletas)) && (
              <Typography
                variant="caption"
                color="error"
                sx={{ mr: 'auto', alignSelf: 'center', minWidth: 0 }}
              >
                {problema.texto}
              </Typography>
            )}
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
              obriga a percorrer as etapas. Travado só sem mudança nenhuma */}
          {(editando || ultimo) && (
            <Button
              variant="contained"
              onClick={tentarSalvar}
              disabled={isLoading || semMudanca}
              title={semMudanca ? 'Nada foi alterado' : undefined}
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
                .map((campo) => {
                  // Segredo gravado (o servidor devolve a máscara, e ela só
                  // diz que existe). O campo vem vazio de propósito — em
                  // branco mantém o que está lá —, mas tem que parecer
                  // preenchido: só bolinhas, sem caractere nenhum.
                  const salvo = campo.secret
                    ? integracao.credentialsHint?.[campo.key]
                    : undefined;

                  return (
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
                      placeholder={salvo ? '••••••••••••' : campo.placeholder}
                      // Com rótulo, o MUI só mostra o placeholder em foco: sem
                      // o rótulo fixo no alto, as bolinhas não apareciam e o
                      // campo parecia vazio
                      InputLabelProps={salvo ? { shrink: true } : undefined}
                      // as bolinhas em tom de texto, não no cinza claro do
                      // placeholder comum: é o que está valendo
                      sx={{
                        width: '100%',
                        ...(salvo && {
                          '& input::placeholder': {
                            opacity: 0.85,
                            letterSpacing: '0.1em',
                          },
                        }),
                      }}
                      errorMessage={
                        salvo
                          ? `Salvo. Deixe em branco para manter, ou digite para trocar.${campo.help ? ` ${campo.help}` : ''}`
                          : campo.help
                      }
                    />
                  );
                })}

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

              {camposDePagamento
                .filter((campo) => campo.fees)
                .map(renderRepasse)}

              {/* só com o Pix marcado nas formas: é o Pix que ele substitui */}
              {comPix &&
                camposDePagamento
                  .filter((campo) => campo.staticPix)
                  .map(renderPixEstatico)}

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
