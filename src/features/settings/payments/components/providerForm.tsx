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
import { Input } from '../../../../components/input';
import { SelectField } from '../../../../components/selectField';
import { useSavePaymentProvider } from '../api/paymentProviderActions';
import {
  PaymentProviderIntegration,
  PaymentProviderMode,
} from '../types';

interface Props {
  churchId: string;
  integracao: PaymentProviderIntegration | null;
  onClose: () => void;
}

const MODOS = [
  { value: 'PRODUCTION', label: 'Produção — dinheiro de verdade' },
  { value: 'SANDBOX', label: 'Sandbox — só para testar' },
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
        : integracao.credentialsHint?.[campo.key] ?? '';
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
      title={`Configurar ${integracao.label}`}
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
            label="Usar esta casa para cobrar os inscritos"
          />
        </Stack>

        <Alert severity="info" sx={{ py: 0.5 }}>
          As credenciais são gravadas cifradas e não voltam para esta tela — só
          a máscara. Depois de salvar, copie os endereços de notificação do
          cartão e cadastre-os no painel do provedor.
        </Alert>
      </Stack>
    </ResponsiveModal>
  );
}

export { ProviderForm };
