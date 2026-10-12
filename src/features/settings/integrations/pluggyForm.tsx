import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  IconButton,
  Link,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  Switch,
  TextField,
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

/** A tesouraria a que um banco serve, quando os bancos são divididos */
type TesourariaDoBanco = 'ADMINISTRATIVA' | 'EVENTOS' | 'CONGREGACOES';

const TESOURARIAS_DO_BANCO: { valor: TesourariaDoBanco; rotulo: string }[] = [
  { valor: 'ADMINISTRATIVA', rotulo: 'Administrativa' },
  { valor: 'EVENTOS', rotulo: 'Eventos' },
  { valor: 'CONGREGACOES', rotulo: 'Congregações' },
];

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
  /**
   * ponytail: prévia — a divisão dos bancos por tesouraria ainda não vai para
   * o servidor (a rota recusaria o campo). Fica só enquanto a tela está
   * aberta; quando entrar no backend, vai junto no `salvar` como os Item IDs.
   */
  const [divisao, setDivisao] = useState<'LIVRE' | 'POR_TESOURARIA'>('LIVRE');
  // pelo Item ID, e não pela posição: remover um campo não troca a
  // tesouraria dos outros
  const [tesourariaDoBanco, setTesourariaDoBanco] = useState<
    Record<string, TesourariaDoBanco>
  >({});
  const porTesouraria = divisao === 'POR_TESOURARIA';

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

          <RadioGroup
            value={divisao}
            onChange={(evento) =>
              setDivisao(evento.target.value as typeof divisao)
            }
            sx={{ gap: 0.5 }}
          >
            {[
              {
                valor: 'LIVRE',
                titulo: 'Sem restrição de tesouraria',
                ajuda:
                  'O extrato de qualquer banco pode ser conciliado em qualquer tesouraria.',
              },
              {
                valor: 'POR_TESOURARIA',
                titulo: 'Bancos divididos por tesouraria',
                ajuda:
                  'Cada banco é de uma tesouraria: administrativa, eventos ou congregações.',
              },
            ].map((opcao) => (
              <FormControlLabel
                key={opcao.valor}
                value={opcao.valor}
                control={<Radio size="small" />}
                sx={{ alignItems: 'flex-start', mr: 0 }}
                label={
                  <Box sx={{ pt: 0.75 }}>
                    <Typography variant="body2">{opcao.titulo}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {opcao.ajuda}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </RadioGroup>

          {porTesouraria && (
            <Alert severity="info" sx={{ py: 0.25 }}>
              Prévia: a divisão dos bancos por tesouraria ainda não é salva.
            </Alert>
          )}

          {/* ponytail: travado em "uma para todas"; a conta por congregação
              fica à vista, desligada, até a tesouraria das congregações
              existir de verdade */}
          {porTesouraria && (
            <TextField
              select
              size="small"
              label="Conta das congregações"
              value="UMA_PARA_TODAS"
              sx={{ mt: 1 }}
              helperText="Por enquanto, uma conta para todas: a conciliação de cada congregação distribui o extrato dela."
            >
              <MenuItem value="UMA_PARA_TODAS">
                Uma conta para todas as congregações
              </MenuItem>
              <MenuItem value="UMA_POR_CONGREGACAO" disabled>
                Uma conta por congregação (em breve)
              </MenuItem>
            </TextField>
          )}

          {itemIds.map((id, indice) => (
            <Stack
              key={indice}
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
            >
              <Input
                sx={{ flex: '1 1 220px' }}
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
              {porTesouraria && (
                <TextField
                  select
                  size="small"
                  label="Tesouraria"
                  value={tesourariaDoBanco[id.trim()] ?? 'ADMINISTRATIVA'}
                  onChange={(evento) =>
                    setTesourariaDoBanco((atual) => ({
                      ...atual,
                      [id.trim()]: evento.target.value as TesourariaDoBanco,
                    }))
                  }
                  sx={{ flex: '0 0 160px' }}
                >
                  {TESOURARIAS_DO_BANCO.map((t) => (
                    <MenuItem key={t.valor} value={t.valor}>
                      {t.rotulo}
                    </MenuItem>
                  ))}
                </TextField>
              )}
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
