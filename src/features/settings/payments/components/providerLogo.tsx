import { Box, SxProps, Theme } from '@mui/material';

import PagbankLogo from '../../../../assets/gateways/pagbank.svg?react';
import MercadoPagoLogo from '../../../../assets/gateways/mercadopago.svg?react';
import InfinitePayLogo from '../../../../assets/gateways/infinitepay.svg?react';
import TonLogo from '../../../../assets/gateways/ton.svg?react';
import { PaymentProviderKey } from '../types';

/**
 * A marca de cada casa.
 *
 * Um arquivo por casa em `src/assets/gateways/`, e o mapa aqui é o único lugar
 * que os conhece — trocar um desenho pelo oficial do provedor é substituir o
 * `.svg` e mais nada. Os que estão lá hoje são reconstruções pela cor e pelo
 * símbolo da marca, não os arquivos originais.
 *
 * Cada desenho é quadrado, com o fundo já incluso: assim a marca clara
 * (InfinitePay, fundo escuro) e a escura (Mercado Pago, fundo amarelo) ficam
 * legíveis nos dois temas da tela sem ajuste em cada uma.
 */
const LOGOS: Record<
  PaymentProviderKey,
  React.FunctionComponent<React.SVGProps<SVGSVGElement>>
> = {
  PAGBANK: PagbankLogo,
  MERCADO_PAGO: MercadoPagoLogo,
  INFINITEPAY: InfinitePayLogo,
  TON: TonLogo,
};

interface Props {
  provider: PaymentProviderKey;
  size?: number;
  sx?: SxProps<Theme>;
}

function ProviderLogo({ provider, size = 40, sx }: Props) {
  const Logo = LOGOS[provider];

  if (!Logo) return null;

  return (
    <Box
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        lineHeight: 0,
        // o mesmo raio do `rx` dos desenhos (11 em 48), para o contorno abaixo
        // acompanhar o canto da marca em vez de desenhar um quadrado em volta
        borderRadius: `${size * (11 / 48)}px`,
        // A marca da InfinitePay é quase preta e some no fundo escuro do tema.
        // Um fio de luz por dentro resolve as quatro de uma vez, sem precisar
        // de exceção para uma.
        boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.10)',
        '& svg': { width: '100%', height: '100%', display: 'block' },
        ...sx,
      }}
    >
      <Logo />
    </Box>
  );
}

export { ProviderLogo };
