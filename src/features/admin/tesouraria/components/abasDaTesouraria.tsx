import { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CompareArrows,
  ReceiptLong,
  VolunteerActivism,
} from '@mui/icons-material';
import { NavTabs } from '../../../../components/navTabs';

export interface AbaDaTesouraria {
  valor: string;
  rotulo: string;
  link: string;
}

// o ícone vem do valor da aba, que é o mesmo em toda tesouraria
const ICONES: Record<string, ReactElement> = {
  conciliacao: <CompareArrows fontSize="small" />,
  dizimos: <VolunteerActivism fontSize="small" />,
  lancamentos: <ReceiptLong fontSize="small" />,
};

interface Props {
  abas: AbaDaTesouraria[];
  atual: string;
}

/**
 * As abas de uma tesouraria (Conciliação, Dízimos, Lançamentos). Trocar de
 * aba é trocar de endereço: cada aba é uma rota, e a régua lateral continua
 * acesa na tesouraria.
 */
function AbasDaTesouraria({ abas, atual }: Props) {
  const navigate = useNavigate();

  return (
    <NavTabs
      value={atual}
      onChange={(valor) => {
        const aba = abas.find((a) => a.valor === valor);
        if (aba) navigate(aba.link);
      }}
      options={abas.map((a) => ({
        value: a.valor,
        label: a.rotulo,
        icon: ICONES[a.valor],
      }))}
      fullWidth
      sx={{ mb: 2 }}
    />
  );
}

export { AbasDaTesouraria };
