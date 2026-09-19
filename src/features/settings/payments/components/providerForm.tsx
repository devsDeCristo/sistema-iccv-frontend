import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  Link,
  Stack,
  Switch,
  Typography,
  useTheme,
} from '@mui/material';
import { Lock, OpenInNew } from '@mui/icons-material';

import { ResponsiveModal } from '../../../../components/responsiveModal';
import { ProviderLogo } from './providerLogo';
import { WebhookUrls } from './webhookUrls';
import { PROVIDER_EM_TESTE, PROVIDER_WEBHOOK_SETUP } from '../constants';
import { Input } from '../../../../components/input';
import { SelectField } from '../../../../components/selectField';
import { useSavePaymentProvider } from '../api/paymentProviderActions';
import { useRole } from '../../../../hooks/useRole';
import { PaymentProviderIntegration, PaymentProviderMode } from '../types';

interface Props {
  churchId: string;
  integracao: PaymentProviderIntegration | null;
  onClose: () => void;
}

const MODOS = [
  { value: 'PRODUCTION', label: 'Produção — Movimentação real' },
  { value: 'SANDBOX', label: 'Sandbox — Local de testes' },
];

/**
 * Formulário de credenciais, desenhado a partir do que o backend declara.
 *
 * Não há um layout por casa aqui: os campos vêm em `integracao.fields`, com
 * rótulo, obrigatoriedade e ajuda. Uma integração nova entra no ar sem tocar
 * neste arquivo — que é o mesmo motivo de o backend guardar essa lista no
 * adapter em vez de num DTO.
 */
function ProviderForm({ churchId, integracao, onClose }: Props) {
  const [valores, setValores] = useState<Record<string, string>>({});
  const [modo, setModo] = useState<PaymentProviderMode>('PRODUCTION');
  const { isDev } = useRole();
  const theme = useTheme();
  const [ligado, setLigado] = useState(true);
  const [padrao, setPadrao] = useState(false);

  const precisaCadastrarWebhook =
    !!integracao &&
    PROVIDER_WEBHOOK_SETUP[integracao.provider] !== 'por-cobranca';
  const emTeste = !!integracao && !!PROVIDER_EM_TESTE[integracao.provider];

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
    });

    setValores(iniciais);
    setModo(integracao.mode);
    setLigado(integracao.configured ? integracao.enabled : true);
    setPadrao(integracao.isDefault);
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

  const enviar = () => {
    salvar({
      churchId,
      provider: integracao.provider,
      // sem o campo na tela, o modo também não vai no corpo: o servidor
      // mantém o que já está gravado, em vez de a edição empurrar tudo para
      // produção sem ninguém ter pedido
      ...(isDev ? { mode: modo } : {}),
      enabled: ligado,
      makeDefault: padrao && ligado,
      // Só o que a pessoa digitou. O campo secreto em branco não vai no corpo,
      // e o backend entende isso como "não mexi neste campo".
      credentials: Object.fromEntries(
        Object.entries(valores).filter(([, valor]) => valor.trim() !== '')
      ),
    });
  };

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
          <Button onClick={onClose} disabled={isLoading} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={enviar}
            disabled={isLoading || faltando.length > 0}
          >
            {isLoading ? 'Salvando…' : 'Salvar'}
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          {integracao.summary}{' '}
          <Link
            href={integracao.docsUrl}
            target="_blank"
            rel="noreferrer"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
          >
            Documentação <OpenInNew sx={{ fontSize: 14 }} />
          </Link>
        </Typography>

        {/*
          O aviso vem antes do formulário, e não junto do botão de salvar: ele
          é material de escolha — ainda dá para fechar e ficar no gateway que
          já está rodando. Ao lado do Salvar, chegaria depois de a pessoa já
          ter ido atrás das credenciais.
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
          integração em sandbox aceita inscrição, devolve link, e o dinheiro
          nunca chega — com a tela inteira dizendo que está tudo certo. É um
          erro caro e silencioso, e a única razão para colocar uma igreja em
          sandbox é desenvolvimento.

          Quem não é dev também não muda o que já está gravado: o formulário
          simplesmente não manda o campo, e o servidor mantém o que estava lá.
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
              Em <strong>sandbox</strong>: pagamento de teste, o dinheiro não
              entra. Só o dev altera.
            </Alert>
          )
        )}

        {integracao.fields.map((campo) => (
          <Input
            key={campo.key}
            label={campo.label + (campo.required ? ' *' : '')}
            value={valores[campo.key] ?? ''}
            onChange={(evento) =>
              setValores((atual) => ({
                ...atual,
                [campo.key]: evento.target.value,
              }))
            }
            // `password` nos segredos evita que o token fique legível na tela
            // durante um compartilhamento de tela — que é como isso vaza na
            // prática, não por invasão.
            type={campo.secret ? 'password' : 'text'}
            autoComplete="off"
            size="small"
            placeholder={
              campo.secret && integracao.credentialsHint?.[campo.key]
                ? `Salvo: ${integracao.credentialsHint[campo.key]} — deixe em branco para manter`
                : campo.placeholder
            }
            errorMessage={campo.help}
          />
        ))}

        {/*
          Rótulo à esquerda e chave à direita, dentro de um bloco só.

          Empilhadas com a chave na frente, as duas liam como dois campos
          soltos no meio do formulário, e a segunda — que decide quem cobra de
          verdade — passava como detalhe. Aqui elas viram uma seção, na ordem em
          que dependem uma da outra: sem a de cima ligada, a de baixo nem pode
          ser marcada.
        */}
        <Box sx={styles.chaves}>
          <FormControlLabel
            labelPlacement="start"
            sx={styles.chave}
            control={
              <Switch
                checked={ligado}
                onChange={(evento) => {
                  setLigado(evento.target.checked);
                  if (!evento.target.checked) setPadrao(false);
                }}
              />
            }
            label={<Typography variant="body2">Integração ativa</Typography>}
          />
          <FormControlLabel
            labelPlacement="start"
            sx={styles.chave}
            control={
              <Switch
                checked={padrao}
                disabled={!ligado}
                onChange={(evento) => setPadrao(evento.target.checked)}
              />
            }
            label={
              <Typography
                variant="body2"
                color={ligado ? 'text.primary' : 'text.disabled'}
              >
                Cobrar os inscritos por aqui
              </Typography>
            }
          />
        </Box>

        {/*
          PagBank e InfinitePay recebem o endereço dentro da própria chamada que
          cria a cobrança, e não há o que fazer em painel nenhum. Mostrar a URL
          para elas só dava trabalho inventado a quem configura.

          Aparece no Ton, cuja API resolve webhook por conta e não por pedido, e
          no Mercado Pago, que manda na cobrança mas só notifica em modo de
          teste o endereço cadastrado no painel.
        */}
        {precisaCadastrarWebhook && integracao.webhooks.length > 0 && (
          <WebhookUrls integracao={integracao} />
        )}

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <Lock sx={{ fontSize: 13 }} />
          Credenciais são gravadas cifradas e não voltam para a tela.
        </Typography>
      </Stack>
    </ResponsiveModal>
  );
}

export { ProviderForm };
