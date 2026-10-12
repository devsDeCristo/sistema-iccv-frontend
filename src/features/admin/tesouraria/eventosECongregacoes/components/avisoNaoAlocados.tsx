import { Alert, Button } from '@mui/material';
import { Link } from 'react-router-dom';

import { formatCurrency } from '../../../../../utils';
import { nomeDosBancos, saldoDe, TipoDaTesouraria } from '../modelo';
import { useIgrejaDaTesouraria, useNaoAlocados } from '../api';

const DE: Record<
  TipoDaTesouraria,
  { nenhuma: string; uma: string; dela: string; de: string; lista: string }
> = {
  EVENT: {
    nenhuma: 'nenhum evento',
    uma: 'um evento',
    dela: 'dele',
    de: 'evento',
    lista: '/admin/tesouraria/eventos/nao-alocados',
  },
  CONGREGATION: {
    nenhuma: 'nenhuma congregação',
    uma: 'uma congregação',
    dela: 'dela',
    de: 'congregação',
    lista: '/admin/tesouraria/congregacoes/nao-alocados',
  },
};

/**
 * O que está na conta e não foi alocado em tesouraria nenhuma. Parte é só
 * trabalho por fazer (a Conciliação de cada tesouraria resolve); parte nunca
 * será de nenhuma — uma tarifa do banco —, e por isso o aviso fica à vista em
 * vez de escondido dentro de cada tesouraria, com o botão para a lista.
 *
 * Só aparece quando a conta tem banco próprio: com a conta única, o que não
 * foi alocado já está na Administrativa, e o aviso de lá basta.
 *
 * "Não alocado" é o termo de rateio de custos (o lançamento sem centro de
 * custo); "competência" diz *quando* o lançamento conta, e não *onde*.
 */
function AvisoNaoAlocados({ tipo }: { tipo: TipoDaTesouraria }) {
  const { churchId } = useIgrejaDaTesouraria();
  const { data } = useNaoAlocados(churchId, tipo);
  const livres = data?.movimentos ?? [];
  if (!data?.temBancoProprio || !livres.length) return null;

  const total = saldoDe(
    livres.map(({ movimento, restante }) => ({
      tipo: movimento.tipo,
      valor: restante,
    }))
  );

  return (
    <Alert
      severity="warning"
      sx={{ mb: 2 }}
      action={
        <Button
          component={Link}
          to={DE[tipo].lista}
          color="inherit"
          size="small"
          sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}
        >
          Ver não alocados
        </Button>
      }
    >
      <b>
        {livres.length}{' '}
        {livres.length === 1
          ? 'lançamento não alocado'
          : 'lançamentos não alocados'}
      </b>{' '}
      em {nomeDosBancos(data.bancos)} ({formatCurrency(total)}): ainda não estão
      em {DE[tipo].nenhuma}. O que é de {DE[tipo].uma} se aloca na Conciliação{' '}
      {DE[tipo].dela}; tarifas do banco e o que não é de {DE[tipo].de} ficam
      aqui.
    </Alert>
  );
}

export { AvisoNaoAlocados };
