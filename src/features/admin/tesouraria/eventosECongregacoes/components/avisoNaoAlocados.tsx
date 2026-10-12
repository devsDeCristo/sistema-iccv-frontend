import { Alert } from '@mui/material';

import { formatCurrency } from '../../../../../utils';
import {
  aDistribuir,
  ContaDaTesouraria,
  NOME_DA_CONTA,
  saldoDe,
} from '../dados';

const DE: Record<
  ContaDaTesouraria,
  { nenhuma: string; uma: string; dela: string; de: string }
> = {
  EVENTOS: {
    nenhuma: 'nenhum evento',
    uma: 'um evento',
    dela: 'dele',
    de: 'evento',
  },
  CONGREGACOES: {
    nenhuma: 'nenhuma congregação',
    uma: 'uma congregação',
    dela: 'dela',
    de: 'congregação',
  },
};

/**
 * O que está na conta e não foi alocado em tesouraria nenhuma. Parte é só
 * trabalho por fazer (a Conciliação de cada tesouraria resolve); parte nunca
 * será de nenhuma — uma tarifa do banco —, e por isso o aviso fica à vista em
 * vez de escondido dentro de cada tesouraria.
 *
 * "Não alocado" é o termo de rateio de custos (o lançamento sem centro de
 * custo); "competência" diz *quando* o lançamento conta, e não *onde*.
 */
function AvisoNaoAlocados({ conta }: { conta: ContaDaTesouraria }) {
  const livres = aDistribuir(conta);
  if (!livres.length) return null;

  const total = saldoDe(
    livres.map(({ movimento, restante }) => ({
      tipo: movimento.tipo,
      valor: restante,
    }))
  );

  return (
    <Alert severity="warning" sx={{ mb: 2 }}>
      <b>
        {livres.length}{' '}
        {livres.length === 1
          ? 'lançamento não alocado'
          : 'lançamentos não alocados'}
      </b>{' '}
      na conta {NOME_DA_CONTA[conta]} ({formatCurrency(total)}): ainda não estão
      em {DE[conta].nenhuma}. O que é de {DE[conta].uma} se aloca na Conciliação{' '}
      {DE[conta].dela}; tarifas do banco e o que não é de {DE[conta].de} ficam
      aqui.
    </Alert>
  );
}

export { AvisoNaoAlocados };
