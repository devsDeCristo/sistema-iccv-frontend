import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  Link,
  Paper,
  Skeleton,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import {
  CheckCircle,
  ErrorOutline,
  Lock,
  OpenInNew,
} from '@mui/icons-material';

import { Input } from '../../../components/input';
import { ConfirmModal } from '../../../components/ConfirmModal';
import {
  PluggyTeste,
  useGetPluggy,
  useRemovePluggy,
  useSavePluggy,
  useTestPluggy,
} from './api';

/** Situações do item na Pluggy, do jeito que quem configura entende */
const STATUS_DO_ITEM: Record<string, string> = {
  UPDATED: 'Atualizado',
  UPDATING: 'Atualizando',
  LOGIN_ERROR: 'Erro de acesso: reconecte no MeuPluggy',
  OUTDATED: 'Desatualizado: reconecte no MeuPluggy',
  WAITING_USER_INPUT: 'Aguardando confirmação no MeuPluggy',
  WAITING_USER_ACTION: 'Aguardando uma ação no MeuPluggy',
};

/** Aceita um por linha, ou separados por vírgula/espaço, como vierem colados */
const lerItemIds = (texto: string) =>
  texto
    .split(/[\s,;]+/)
    .map((id) => id.trim())
    .filter(Boolean);

interface Props {
  churchId: string;
}

/**
 * Acesso aos bancos da igreja pela Pluggy (MeuPluggy), para o financeiro.
 *
 * A Pluggy fala com o banco via Open Finance: os bancos são conectados no
 * MeuPluggy, e aqui entram só a credencial da aplicação (dashboard da Pluggy)
 * e um Item ID por banco conectado.
 */
function PluggyIntegrationCard({ churchId }: Props) {
  const { data, isLoading } = useGetPluggy(churchId);
  const salvar = useSavePluggy();
  const testar = useTestPluggy();
  const remover = useRemovePluggy();

  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [itemIds, setItemIds] = useState('');
  const [ativa, setAtiva] = useState(true);
  const [teste, setTeste] = useState<PluggyTeste | null>(null);
  const [confirmandoRemocao, setConfirmandoRemocao] = useState(false);

  const integracao = data?.integracao ?? null;

  // Segredos voltam mascarados e começam vazios: vazio é "mantém o gravado"
  useEffect(() => {
    setClientId('');
    setClientSecret('');
    setItemIds(integracao?.itemIds.join('\n') ?? '');
    setAtiva(integracao?.enabled ?? true);
    setTeste(null);
  }, [integracao]);

  if (isLoading) return <Skeleton variant="rounded" height={320} />;

  const ids = lerItemIds(itemIds);
  const faltaCredencial =
    !integracao && (!clientId.trim() || !clientSecret.trim());

  const enviar = () =>
    salvar.mutate({
      churchId,
      ...(clientId.trim() ? { clientId: clientId.trim() } : {}),
      ...(clientSecret.trim() ? { clientSecret: clientSecret.trim() } : {}),
      itemIds: ids,
      enabled: ativa,
    });

  return (
    <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
      <Stack spacing={2}>
        <Box>
          <Typography fontSize={15.5} fontWeight={600}>
            Pluggy · Open Finance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Lê saldos e extratos dos bancos da igreja. Conecte os bancos no{' '}
            <Link href="https://meu.pluggy.ai" target="_blank" rel="noreferrer">
              MeuPluggy <OpenInNew sx={{ fontSize: 13 }} />
            </Link>{' '}
            e copie as credenciais da aplicação no{' '}
            <Link
              href="https://dashboard.pluggy.ai"
              target="_blank"
              rel="noreferrer"
            >
              dashboard da Pluggy <OpenInNew sx={{ fontSize: 13 }} />
            </Link>
            .
          </Typography>
        </Box>

        {data && !data.cofreDisponivel && (
          <Alert severity="error">
            O servidor está sem a chave que protege as credenciais (
            <code>PAYMENT_CREDENTIALS_KEY</code>). Fale com o suporte técnico.
          </Alert>
        )}

        {integracao?.statusMessage && (
          <Alert severity="warning">{integracao.statusMessage}</Alert>
        )}

        <Input
          label={'Client ID' + (integracao ? '' : ' *')}
          value={clientId}
          onChange={(evento) => setClientId(evento.target.value)}
          size="small"
          autoComplete="off"
          placeholder={
            integracao?.credentialsHint?.clientId
              ? `Salvo: ${integracao.credentialsHint.clientId} (deixe em branco para manter)`
              : 'c4a6d91e-f78a-…'
          }
        />
        <Input
          label={'Client Secret' + (integracao ? '' : ' *')}
          value={clientSecret}
          onChange={(evento) => setClientSecret(evento.target.value)}
          // `password` para o secret não ficar legível num compartilhamento de tela
          type="password"
          size="small"
          autoComplete="off"
          placeholder={
            integracao ? 'Salvo (deixe em branco para manter)' : undefined
          }
        />
        <Input
          label="Item IDs"
          value={itemIds}
          onChange={(evento) => setItemIds(evento.target.value)}
          size="small"
          multiline
          minRows={3}
          placeholder="Um por linha: um para cada banco conectado no MeuPluggy"
          errorMessage={
            ids.length
              ? `${ids.length} item(ns)`
              : 'No MeuPluggy, cada banco conectado tem o seu Item ID'
          }
        />

        <FormControlLabel
          control={
            <Switch
              checked={ativa}
              onChange={(evento) => setAtiva(evento.target.checked)}
            />
          }
          label={<Typography variant="body2">Integração ativa</Typography>}
        />

        {teste && (
          <Stack spacing={1}>
            {teste.erro && <Alert severity="error">{teste.erro}</Alert>}
            {teste.itens.map((item) => (
              <Stack
                key={item.itemId}
                direction="row"
                spacing={1}
                alignItems="center"
              >
                {item.ok ? (
                  <CheckCircle color="success" fontSize="small" />
                ) : (
                  <ErrorOutline color="error" fontSize="small" />
                )}
                <Typography variant="body2">
                  <strong>{item.banco ?? item.itemId}</strong>
                  {' · '}
                  {item.erro ??
                    `${STATUS_DO_ITEM[item.status ?? ''] ?? item.status} · ${item.contas} conta(s)`}
                </Typography>
              </Stack>
            ))}
          </Stack>
        )}

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            onClick={enviar}
            disabled={salvar.isLoading || faltaCredencial || !ids.length}
          >
            {salvar.isLoading ? 'Salvando…' : 'Salvar'}
          </Button>
          {integracao && (
            <>
              <Button
                variant="outlined"
                disabled={testar.isLoading}
                onClick={() => testar.mutate(churchId, { onSuccess: setTeste })}
              >
                {testar.isLoading ? 'Testando…' : 'Testar conexão'}
              </Button>
              <Button
                color="error"
                sx={{ ml: 'auto' }}
                disabled={remover.isLoading}
                onClick={() => setConfirmandoRemocao(true)}
              >
                Remover
              </Button>
            </>
          )}
        </Box>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <Lock sx={{ fontSize: 13 }} />
          Credenciais são gravadas cifradas e não voltam para a tela.
        </Typography>
      </Stack>

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
    </Paper>
  );
}

export { PluggyIntegrationCard };
