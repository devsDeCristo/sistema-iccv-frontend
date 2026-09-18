import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  FormControlLabel,
  Link,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { OpenInNew } from '@mui/icons-material';

import { ResponsiveModal } from '../../../../components/responsiveModal';
import { ProviderLogo } from './providerLogo';
import { WebhookUrls } from './webhookUrls';
import { PROVIDER_EM_TESTE, PROVIDER_WEBHOOK_SETUP } from '../constants';
import { Input } from '../../../../components/input';
import { SelectField } from '../../../../components/selectField';
import { useSavePaymentProvider } from '../api/paymentProviderActions';
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
  const [ligado, setLigado] = useState(true);
  const [padrao, setPadrao] = useState(false);

  const precisaCadastrarWebhook =
    !!integracao && PROVIDER_WEBHOOK_SETUP[integracao.provider] === 'painel';
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

  const enviar = () => {
    salvar({
      churchId,
      provider: integracao.provider,
      mode: modo,
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
      <Stack spacing={2.5}>
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
          é material de escolha — ainda dá para fechar e ficar na casa que já
          está rodando. Ao lado do Salvar, chegaria depois de a pessoa já ter
          ido atrás das credenciais.
        */}
        {emTeste && (
          <Alert severity="warning" >
            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.25 }}>
              Integração em teste
            </Typography>
            Este banco é recente por aqui e ainda está em acompanhamento. Pode
            usar normalmente — só vale conferir no painel dela se os primeiros
            pagamentos deram baixa sozinhos.
          </Alert>
        )}

        <SelectField
          label="Ambiente"
          value={modo}
          onChange={(valor) => setModo(valor as PaymentProviderMode)}
          options={MODOS}
        />

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

        <Stack>
          <FormControlLabel
            control={
              <Switch
                checked={ligado}
                onChange={(evento) => {
                  setLigado(evento.target.checked);
                  if (!evento.target.checked) setPadrao(false);
                }}
              />
            }
            label="Integração ativa"
          />
          <FormControlLabel
            control={
              <Switch
                checked={padrao}
                disabled={!ligado}
                onChange={(evento) => setPadrao(evento.target.checked)}
              />
            }
            label="Usar este gateway para cobrar os inscritos"
          />
        </Stack>

        {/*
          Quase nenhuma casa precisa de cadastro: PagBank, Mercado Pago e
          InfinitePay recebem o endereço de notificação dentro da própria
          chamada que cria a cobrança, e não há o que fazer em painel nenhum.
          Mostrar a URL para elas só dava trabalho inventado a quem configura.

          O Ton é a exceção — a API v5 da Pagar.me resolve webhook por conta, e
          não por pedido — e é o único caso em que a URL aparece.
        */}
        {precisaCadastrarWebhook && integracao.webhooks.length > 0 && (
          <Stack spacing={1}>
            <WebhookUrls integracao={integracao} />
          </Stack>
        )}

        <Alert severity="info" sx={{ py: 0.5 }}>
          As credenciais são gravadas cifradas e não voltam para esta tela — só
          a máscara.
        </Alert>
      </Stack>
    </ResponsiveModal>
  );
}

export { ProviderForm };
