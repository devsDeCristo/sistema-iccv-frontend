import {
  Alert,
  Box,
  Switch,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { MoneyOff, Payments } from '@mui/icons-material';

import { useSetPaymentModule } from '../api/paymentProviderActions';

interface Props {
  churchId: string;
  ligado: boolean;
  /** Dev e super admin. Ver a nota de permissão abaixo. */
  podeAlternar: boolean;
}

const AVISO_DESLIGADO =
  'Os inscritos não veem nada de pagamento, e as cobranças que já estavam em aberto não recebem baixa automática.';

/**
 * O interruptor do módulo de cobrança da igreja.
 *
 * Substituiu duas variáveis de ambiente — `PAGBANK_PAYMENT_ENABLED` no servidor
 * e `VITE_MODULE_PAYMENT` na tela —, que eram globais: ou todas as igrejas
 * cobravam, ou nenhuma. Pior, sendo duas, dava para o servidor aceitar cobrança
 * com a tela escondendo o botão.
 *
 * Quem alterna é dev ou super admin, e não quem administra a igreja: continua
 * sendo decisão de plataforma, como era quando morava no `.env`. Deixar o admin
 * desligar daria a ele um jeito de parar a reconciliação das cobranças que ele
 * mesmo abriu — o dinheiro entra e ninguém dá baixa.
 *
 * ## O peso visual dos dois estados
 *
 * Os dois ocupam a mesma caixa, e o que muda é a cor. Ligado fica neutro — com
 * borda e fundo de superfície, como um controle — porque pintá-lo de verde
 * botava duas faixas verdes quase iguais uma em cima da outra, esta e a de
 * "recebendo agora" logo abaixo, as duas dizendo que está tudo bem.
 *
 * Desligado fica âmbar: é ele que explica por que o resto da tela está vazio, e
 * aí precisa ser lido antes de qualquer outra coisa.
 */
function ModuloDePagamento({ churchId, ligado, podeAlternar }: Props) {
  const theme = useTheme();
  const { mutate: alternar, isLoading } = useSetPaymentModule();

  const alternarPara = (enabled: boolean) => alternar({ churchId, enabled });

  // Quem não pode alternar só fica sabendo quando está desligado: ligado é o
  // normal, e dizê-lo seria uma linha a mais em toda visita para nada.
  if (!podeAlternar) {
    if (ligado) return null;

    return (
      <Alert severity="warning" icon={<MoneyOff fontSize="small" />}>
        <strong>A cobrança online está desligada para esta igreja.</strong>{' '}
        {AVISO_DESLIGADO} Fale com o suporte para religar.
      </Alert>
    );
  }

  const desligado = !ligado;
  const cor = desligado ? theme.palette.chips.alert : theme.palette.divider;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        p: 2,
        borderRadius: 2,
        border: `1px solid ${desligado ? alpha(cor, 0.4) : cor}`,
        backgroundColor: desligado
          ? alpha(theme.palette.chips.alert, 0.08)
          : theme.palette.background.paperSecondary,
      }}
    >
      {desligado ? (
        <MoneyOff
          sx={{ fontSize: 20, color: theme.palette.chips.alert, mt: 0.25 }}
        />
      ) : (
        <Payments sx={{ fontSize: 20, color: 'text.secondary', mt: 0.25 }} />
      )}

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography fontWeight={600}>
          {desligado
            ? 'A cobrança online desta igreja está desligada'
            : 'Cobrança online'}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
          {desligado
            ? `${AVISO_DESLIGADO} As credenciais continuam guardadas: religar devolve tudo como estava.`
            : 'Esta igreja cobra os inscritos pelo sistema. Desligar esconde o pagamento para eles, impede novas cobranças e faz a reconciliação parar de olhar as desta igreja.'}
        </Typography>
      </Box>

      <Tooltip title={ligado ? 'Desligar a cobrança desta igreja' : 'Religar'}>
        <Switch
          checked={ligado}
          disabled={isLoading}
          onChange={(evento) => alternarPara(evento.target.checked)}
          sx={{ mt: -0.5, mr: -1 }}
        />
      </Tooltip>
    </Box>
  );
}

export { ModuloDePagamento };
