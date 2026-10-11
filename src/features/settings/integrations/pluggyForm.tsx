import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  FormControlLabel,
  IconButton,
  Link,
  Stack,
  Switch,
  Typography,
} from '@mui/material';
import { Add, DeleteOutline, Lock, OpenInNew } from '@mui/icons-material';

import { Input } from '../../../components/input';
import { ResponsiveModal } from '../../../components/responsiveModal';
import { PluggyIntegration, useSavePluggy } from './api';
import { PluggyLogo } from './pluggyLogo';
import { semAutopreencher } from '../shared/semAutopreencher';

/** Vários IDs colados de uma vez: por linha, vírgula ou espaço */
const lerItemIds = (texto: string) =>
  texto
    .split(/[\s,;]+/)
    .map((id) => id.trim())
    .filter(Boolean);

interface Props {
  open: boolean;
  churchId: string;
  integracao: PluggyIntegration | null;
  cofreDisponivel: boolean;
  onClose: () => void;
}

/**
 * A configuração da Pluggy, numa janela: credencial da aplicação (dashboard
 * da Pluggy) e um Item ID por banco conectado no MeuPluggy. Mesmo molde do
 * formulário de gateway em Pagamentos.
 */
function PluggyForm({
  open,
  churchId,
  integracao,
  cofreDisponivel,
  onClose,
}: Props) {
  const salvar = useSavePluggy();

  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  // um campo por banco; sempre ao menos um, mesmo vazio
  const [itemIds, setItemIds] = useState<string[]>(['']);
  // o campo recém-adicionado ganha o foco
  const [novo, setNovo] = useState<number | null>(null);
  const [ativa, setAtiva] = useState(true);

  // Segredos voltam mascarados e começam vazios: vazio é "mantém o gravado".
  // Reabrir a janela descarta o que ficou digitado sem salvar.
  useEffect(() => {
    if (!open) return;
    setClientId('');
    setClientSecret('');
    setItemIds(integracao?.itemIds.length ? [...integracao.itemIds] : ['']);
    setNovo(null);
    setAtiva(integracao?.enabled ?? true);
  }, [open, integracao]);

  // vazios saem e repetidos contam uma vez
  const ids = Array.from(
    new Set(itemIds.map((id) => id.trim()).filter(Boolean))
  );

  const trocar = (indice: number, valor: string) =>
    setItemIds(itemIds.map((id, i) => (i === indice ? valor : id)));

  const removerCampo = (indice: number) =>
    setItemIds(
      itemIds.length === 1 ? [''] : itemIds.filter((_, i) => i !== indice)
    );

  // colar vários de uma vez (a lista que a pessoa tinha guardada) abre um
  // campo para cada, no lugar onde colou
  const colar = (indice: number, texto: string) => {
    const partes = lerItemIds(texto);
    if (partes.length < 2) return false;
    const atual = itemIds[indice].trim();
    const novos = [...itemIds];
    novos.splice(indice, 1, ...(atual ? [atual, ...partes] : partes));
    setItemIds(novos);
    return true;
  };
  const faltaCredencial =
    !integracao && (!clientId.trim() || !clientSecret.trim());

  const enviar = () =>
    salvar.mutate(
      {
        churchId,
        ...(clientId.trim() ? { clientId: clientId.trim() } : {}),
        ...(clientSecret.trim() ? { clientSecret: clientSecret.trim() } : {}),
        itemIds: ids,
        enabled: ativa,
      },
      { onSuccess: onClose }
    );

  return (
    <ResponsiveModal
      open={open}
      onClose={onClose}
      disableClose={salvar.isLoading}
      maxWidth="sm"
      fullWidth
      title={
        <Stack direction="row" spacing={1.5} alignItems="center">
          <PluggyLogo size={32} />
          <span>Configurar Pluggy</span>
        </Stack>
      }
      actions={
        <>
          <Button onClick={onClose} disabled={salvar.isLoading} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={enviar}
            disabled={
              salvar.isLoading ||
              faltaCredencial ||
              !ids.length ||
              !cofreDisponivel
            }
          >
            {salvar.isLoading ? 'Salvando…' : 'Salvar'}
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          Lê saldos e extratos dos bancos da igreja via Open Finance. Conecte os
          bancos no{' '}
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

        {!cofreDisponivel && (
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
          {...semAutopreencher(false)}
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
          {...semAutopreencher(true)}
          placeholder={
            integracao ? 'Salvo (deixe em branco para manter)' : undefined
          }
        />
        {/* o mesmo respiro dos outros campos: o rótulo fica acima de cada um */}
        <Stack spacing={2}>
          <div>
            <Typography variant="body2" fontWeight={600}>
              Bancos conectados
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Um Item ID para cada banco conectado no MeuPluggy.
            </Typography>
          </div>

          {itemIds.map((id, indice) => (
            <Stack key={indice} direction="row" spacing={1} alignItems="center">
              <Input
                label={`Banco ${indice + 1} · Item ID`}
                value={id}
                onChange={(evento) => trocar(indice, evento.target.value)}
                onPaste={(evento) => {
                  if (colar(indice, evento.clipboardData.getData('text')))
                    evento.preventDefault();
                }}
                autoFocus={indice === novo}
                size="small"
                {...semAutopreencher(false)}
                placeholder="b2c1f8e0-…"
              />
              <IconButton
                aria-label={`Remover banco ${indice + 1}`}
                onClick={() => removerCampo(indice)}
                disabled={itemIds.length === 1 && !id}
              >
                <DeleteOutline fontSize="small" />
              </IconButton>
            </Stack>
          ))}

          <Button
            size="small"
            startIcon={<Add />}
            onClick={() => {
              setNovo(itemIds.length);
              setItemIds([...itemIds, '']);
            }}
            sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
          >
            Adicionar banco
          </Button>
        </Stack>

        <FormControlLabel
          control={
            <Switch
              checked={ativa}
              onChange={(evento) => setAtiva(evento.target.checked)}
            />
          }
          label={<Typography variant="body2">Integração ativa</Typography>}
        />

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

export { PluggyForm };
