import { Alert, Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Link } from 'react-router-dom';

import { PageStyle } from '../../../components/pageStyle';
import { Header } from '../../../components/header';
import { ChurchScopeBar } from '../../../features/settings/shared/churchScopeBar';
import { useIgrejaSelecionada } from '../../../features/settings/shared/useIgrejaSelecionada';
import { formatCurrency } from '../../../utils';
import {
  aDistribuir,
  ContaDaTesouraria,
  nomeDosBancos,
  saldoDe,
} from '../../../features/admin/tesouraria/eventosECongregacoes/dados';
import { TabelaDaTesouraria } from '../../../features/admin/tesouraria/eventosECongregacoes/components/tabelaDaTesouraria';

const DA_CONTA: Record<
  ContaDaTesouraria,
  { voltar: string; rotulo: string; nenhuma: string }
> = {
  EVENTOS: {
    voltar: '/admin/tesouraria/eventos',
    rotulo: 'Tesourarias de eventos',
    nenhuma: 'nenhum evento',
  },
  CONGREGACOES: {
    voltar: '/admin/tesouraria/congregacoes',
    rotulo: 'Tesourarias de congregações',
    nenhuma: 'nenhuma congregação',
  },
};

/**
 * Os lançamentos da conta que não foram para tesouraria nenhuma — o que o
 * aviso da lista conta. Só leitura: alocar é na Conciliação de cada
 * tesouraria. A mesma tabela dos Lançamentos, com o banco de cada um.
 */
function NaoAlocados({ conta }: { conta: ContaDaTesouraria }) {
  const escopo = useIgrejaSelecionada(true, 'TREASURY');
  const d = DA_CONTA[conta];
  const livres = aDistribuir(conta);

  return (
    <PageStyle>
      <Button
        component={Link}
        to={d.voltar}
        size="small"
        startIcon={<ArrowBack />}
        sx={{ textTransform: 'none', mb: 1, alignSelf: 'flex-start' }}
      >
        {d.rotulo}
      </Button>
      <Header
        title="Lançamentos não alocados"
        description={`Em ${nomeDosBancos(conta)}, ainda em ${d.nenhuma}`}
        acaoAoLado
      >
        <ChurchScopeBar escopo={escopo} oQueMuda="a tesouraria" />
      </Header>

      <Alert severity="info" sx={{ mb: 2 }}>
        {livres.length
          ? `${livres.length} na conta, ${formatCurrency(
              saldoDe(
                livres.map(({ movimento, restante }) => ({
                  tipo: movimento.tipo,
                  valor: restante,
                }))
              )
            )} (entradas menos saídas). Para alocar, abra a Conciliação da tesouraria a que cada um pertence. Dados de exemplo.`
          : 'Tudo o que está na conta já foi alocado.'}
      </Alert>

      <TabelaDaTesouraria
        lancamentos={livres.map(({ movimento: m, restante }) => ({
          id: m.id,
          tesourariaId: '',
          tipo: m.tipo,
          categoria: 'Não alocado',
          descricao: m.pagador ? `${m.descricao} — ${m.pagador}` : m.descricao,
          valor: restante,
          data: m.data,
          origem: 'BANCO',
          banco: m.banco,
          situacao: null,
        }))}
      />
    </PageStyle>
  );
}

export { NaoAlocados };
