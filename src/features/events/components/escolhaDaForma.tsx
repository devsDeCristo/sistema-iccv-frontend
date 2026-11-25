import {
  Box,
  ButtonBase,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import { OpenInNew, QrCode2, ReceiptLong } from '@mui/icons-material';

import { ProviderLogo } from '../../settings/payments/components/providerLogo';
import { PaymentProviderKey } from '../../settings/payments/types';
import { formatCurrency } from '../../../utils';
import CustomChip from '../../../components/customChip';
import { useEstiloDeIngresso } from './ingresso';
import { TaxaDeServico, comTaxa, formatarPercentual } from '../taxaDeServico';

/** O que o servidor devolve quando o gateway pede a escolha antes do checkout */
export interface EscolhaDePagamento {
  provider: string;
  /** Nome comercial do gateway: `PayPal` */
  label: string;
  methods: string[];
  /**
   * O nome da outra saída, com o que a igreja ligou no checkout do gateway:
   * "Cartão ou boleto", "Cartão ou conta PayPal". Ausente em servidor antigo.
   */
  checkoutLabel?: string;
  /** a taxa de serviço de cada saída; nula sem repasse */
  serviceFee?: TaxaDeServico | null;
  /** o que a igreja tem a receber, sem a taxa (servidor antigo não manda) */
  amountCents?: number;
}

/** `CREDIT_CARD` é a outra saída: o checkout do gateway, com o que estiver lá */
export type FormaDePagamento = 'PIX' | 'CREDIT_CARD';

/** O verde do Pix */
const VERDE_DO_PIX = '#1E9E8F';

interface OpcoesDaFormaProps {
  escolha: EscolhaDePagamento;
  onEscolher: (forma: FormaDePagamento) => void;
  /** o valor a pagar, no canhoto de cada opção; sem ele, "Escolher" */
  total?: number;
}

/**
 * "Como você quer pagar?": o gateway que processa e as duas saídas lado a lado
 * (uma embaixo da outra no celular), cada uma um ingresso em pé — Pix, ou o
 * checkout do gateway com o resto.
 *
 * É o conteúdo, sem modal em volta: Minhas Inscrições o mostra como etapa do
 * próprio modal de pagamentos, e a inscrição e a loja pelo `useEscolhaDaForma`.
 */
export function OpcoesDaForma({
  escolha,
  onEscolher,
  total: totalDaTela,
}: OpcoesDaFormaProps) {
  // O que o servidor mandou com a pergunta manda: é a mesma conta da
  // cobrança (desconto, estoque, arredondamento por item). O total da tela só
  // vale com servidor antigo, que não manda o valor.
  const total =
    escolha.amountCents != null ? escolha.amountCents / 100 : totalDaTela;
  const theme = useTheme();
  const { raio, claro, papel, styles } = useEstiloDeIngresso(
    theme.palette.primary.main
  );

  const outra = escolha.checkoutLabel ?? `Cartão ou conta ${escolha.label}`;

  // As descrições dizem como se paga e quando confirma — nada de "aqui" ou
  // "no site do gateway": de onde a pessoa paga não é o que ela escolhe.
  const opcoes = [
    {
      forma: 'PIX' as FormaDePagamento,
      titulo: 'Pix',
      texto:
        'Pague pelo app do seu banco, com QR Code ou Pix Copia e Cola. A confirmação sai na hora.',
      Icone: QrCode2,
      cor: VERDE_DO_PIX,
      taxa: escolha.serviceFee?.pix ?? 0,
    },
    {
      forma: 'CREDIT_CARD' as FormaDePagamento,
      titulo: outra,
      texto: `Pague com ${outra.toLowerCase()}. A confirmação sai assim que o pagamento for aprovado.`,
      Icone: OpenInNew,
      cor: theme.palette.primary.main,
      taxa: escolha.serviceFee?.checkout ?? 0,
    },
  ];

  return (
    <Stack spacing={1.25}>
      {/* para quem se paga: é esse nome que aparece no app do banco e na fatura */}
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ pb: 0.5 }}>
        <ProviderLogo
          provider={escolha.provider as PaymentProviderKey}
          size={40}
        />
        <Box>
          <Typography fontWeight={700}>
            Processado pelo {escolha.label}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            No app do banco e na fatura, o recebedor pode aparecer com esse
            nome.
          </Typography>
        </Box>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 1.5,
        }}
      >
        {opcoes.map(({ forma, titulo, texto, Icone, cor, taxa }) => (
          <ButtonBase
            key={forma}
            disableRipple
            onClick={() => onEscolher(forma)}
            sx={{
              ...styles.ingresso,
              ...styles.emPe,
              '&:hover': { transform: 'translateY(-2px)' },
              '&.Mui-focusVisible': {
                outline: `2px solid ${cor}`,
                outlineOffset: 3,
                borderRadius: `${raio}px`,
              },
            }}
          >
            <Box sx={{ ...styles.corpoEmPe, ...papel }}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <Box
                  sx={{
                    ...styles.selo,
                    color: cor,
                    backgroundColor: alpha(cor, claro ? 0.14 : 0.22),
                  }}
                >
                  <Icone sx={{ fontSize: 20 }} />
                </Box>
                <Typography fontWeight={700} fontSize={16}>
                  {titulo}
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" mt={1}>
                {texto}
              </Typography>
            </Box>
            <Box sx={{ ...styles.canhotoEmPe, ...papel }}>
              {/* o valor desta saída, já com a taxa de serviço dela */}
              <Typography fontWeight={700} fontSize={18} textAlign="center">
                {total && total > 0
                  ? formatCurrency(comTaxa(total, taxa))
                  : 'Escolher'}
              </Typography>
              {/* em destaque: é o que muda de uma opção para a outra */}
              {taxa > 0 && (
                <CustomChip
                  size="small"
                  icon={<ReceiptLong sx={{ fontSize: 14 }} />}
                  label={
                    total && total > 0
                      ? `inclui ${formatCurrency(comTaxa(total, taxa) - total)} de taxa de serviço (${formatarPercentual(taxa)})`
                      : `+ ${formatarPercentual(taxa)} de taxa de serviço`
                  }
                  customColor={theme.palette.chips.alert}
                  sx={{
                    mt: 0.75,
                    '& .MuiChip-icon': { color: 'inherit' },
                  }}
                />
              )}
            </Box>
          </ButtonBase>
        ))}
      </Box>
    </Stack>
  );
}
