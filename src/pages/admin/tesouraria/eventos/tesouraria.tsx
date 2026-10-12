import { useReducer, useState } from 'react';
import {
  Alert,
  Button,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add,
  ArrowBack,
  ConfirmationNumber,
  SupervisorAccountOutlined,
} from '@mui/icons-material';
import { Link, useParams } from 'react-router-dom';

import { PageStyle } from '../../../../components/pageStyle';
import { Header } from '../../../../components/header';
import { ChurchScopeBar } from '../../../../features/settings/shared/churchScopeBar';
import { useIgrejaSelecionada } from '../../../../features/settings/shared/useIgrejaSelecionada';
import { useRole } from '../../../../hooks/useRole';
import { Role } from '../../../../constants/roles';
import {
  barraLarguraCheiaNoCelularSx,
  superficieSx,
} from '../../../../components/listPageStyles';
import { ModalTesoureiros } from '../../../../features/admin/events/components/modalTesoureiros';
import { ModalLancamentoDoEvento } from '../../../../features/admin/tesouraria/eventosECongregacoes/components/modalLancamentoDoEvento';
import { AbasDaTesouraria } from '../../../../features/admin/tesouraria/components/abasDaTesouraria';
import {
  buscarTesouraria,
  EVENTOS_DO_SISTEMA,
  fechamentoDa,
  lancamentosDa,
} from '../../../../features/admin/tesouraria/eventosECongregacoes/dados';
import { BarraDoFechamento } from '../../../../features/admin/tesouraria/eventosECongregacoes/components/barraDoFechamento';
import { ConciliacaoDaTesouraria } from '../../../../features/admin/tesouraria/eventosECongregacoes/components/conciliacaoDaTesouraria';
import { LancamentosDaTesouraria } from '../../../../features/admin/tesouraria/eventosECongregacoes/components/lancamentosDaTesouraria';

const LISTA = '/admin/tesouraria/eventos';

/**
 * A tesouraria de um evento, em duas abas com endereço próprio:
 * `/admin/tesouraria/eventos/:id/conciliacao` e `.../lancamentos`.
 *
 * Além do admin e da tesouraria da igreja (que veem a de todos os eventos),
 * entra o tesoureiro(a) completo — só na tesouraria de um evento de que ele é
 * tesoureiro. Fechar e reabrir é do admin e da tesouraria da igreja; escolher
 * os tesoureiros(as) do evento, só do admin.
 */
function TesourariaDoEvento() {
  const { id, aba } = useParams();
  const escopo = useIgrejaSelecionada(true, 'TREASURY');
  const {
    soTesoureiroDeEvento,
    eventTreasurers,
    isSuperAdmin,
    perfilNaIgreja,
  } = useRole();
  const [lancando, setLancando] = useState(false);
  const [tesoureiros, setTesoureiros] = useState(false);
  // os dados de exemplo mudam fora do React: isto só pede um novo desenho
  const [, redesenhar] = useReducer((n: number) => n + 1, 0);

  const encontrada = buscarTesouraria(id);
  const tesouraria =
    soTesoureiroDeEvento &&
    !eventTreasurers.some(
      (t) => t.kind === 'COMPLETO' && t.eventId === encontrada?.eventoId
    )
      ? null
      : encontrada;

  const voltar = (
    <Button
      component={Link}
      to={LISTA}
      size="small"
      startIcon={<ArrowBack />}
      sx={{ textTransform: 'none', mb: 1 }}
    >
      Tesourarias de eventos
    </Button>
  );

  if (!tesouraria) {
    return (
      <PageStyle>
        {voltar}
        <Alert severity="warning">
          Tesouraria não encontrada. As criadas nesta demonstração somem ao
          recarregar a página.
        </Alert>
      </PageStyle>
    );
  }

  const base = `${LISTA}/${tesouraria.id}`;
  const fechada = !!fechamentoDa(tesouraria.id);
  const churchId = escopo.churchId;
  // os tesoureiros(as) são do evento do sistema; os de exemplo não existem
  // na API, e o evento fora do sistema não tem a quem ligar
  const deExemplo = EVENTOS_DO_SISTEMA.some(
    (e) => e.id === tesouraria.eventoId
  );
  const botaoTesoureiros = tesouraria.eventoId &&
    churchId &&
    (isSuperAdmin || perfilNaIgreja(churchId) === Role.ADMIN) && (
      <Tooltip
        title={
          deExemplo
            ? 'Evento de exemplo: crie a tesouraria de um evento cadastrado para escolher os tesoureiros(as)'
            : ''
        }
      >
        <span>
          <Button
            variant="outlined"
            startIcon={<SupervisorAccountOutlined />}
            disabled={deExemplo}
            onClick={() => setTesoureiros(true)}
            sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
          >
            Configurar tesoureiros
          </Button>
        </span>
      </Tooltip>
    );

  const conteudo = (
    <>
      <Alert severity="info" sx={{ mb: 2 }}>
        Tela de demonstração: os números são de exemplo, e o que for distribuído
        ou fechado aqui some ao recarregar a página.
      </Alert>
      <BarraDoFechamento
        tesourariaId={tesouraria.id}
        churchId={churchId}
        onMudou={redesenhar}
        deEvento
        acoes={botaoTesoureiros || undefined}
      />
      <AbasDaTesouraria
        atual={aba === 'lancamentos' ? 'lancamentos' : 'conciliacao'}
        abas={[
          {
            valor: 'conciliacao',
            rotulo: 'Conciliação',
            link: `${base}/conciliacao`,
          },
          {
            valor: 'lancamentos',
            rotulo: 'Lançamentos',
            link: `${base}/lancamentos`,
          },
        ]}
      />
      {aba === 'lancamentos' && !fechada && (
        <Paper
          sx={{ ...superficieSx, ...barraLarguraCheiaNoCelularSx, p: 2, mb: 2 }}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ flex: 1, minWidth: 220 }}
            >
              Os pagamentos das inscrições e dos produtos vêm do evento. O que
              não passa por eles — uma venda no intervalo, um gasto pago em
              dinheiro — lance aqui; ele entra a conciliar com o banco.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setLancando(true)}
              sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
            >
              Novo lançamento
            </Button>
          </Stack>
        </Paper>
      )}
      {aba === 'lancamentos' ? (
        <LancamentosDaTesouraria
          lancamentos={lancamentosDa(tesouraria.id)}
          periodo="No evento"
          destaque={{
            categoria: 'Ingressos',
            legenda: 'Das inscrições do evento',
            icone: <ConfirmationNumber sx={{ fontSize: 20 }} />,
          }}
        />
      ) : (
        <ConciliacaoDaTesouraria
          conta="EVENTOS"
          tesourariaId={tesouraria.id}
          fechada={fechada}
        />
      )}
      <ModalLancamentoDoEvento
        open={lancando}
        tesourariaId={tesouraria.id}
        onClose={() => setLancando(false)}
        onSalvo={() => {
          setLancando(false);
          redesenhar();
        }}
      />
      {tesouraria.eventoId && churchId && !deExemplo && (
        <ModalTesoureiros
          open={tesoureiros}
          eventId={tesouraria.eventoId}
          churchId={churchId}
          onClose={() => setTesoureiros(false)}
        />
      )}
    </>
  );

  return (
    <PageStyle>
      {voltar}
      <Header
        title={tesouraria.nome}
        description={`Tesouraria de evento · ${tesouraria.periodo}${
          tesouraria.eventoId ? '' : ' · fora do sistema'
        }`}
        acaoAoLado
      >
        {/* o tesoureiro(a) do evento não escolhe igreja: o evento é dele */}
        {!soTesoureiroDeEvento && (
          <ChurchScopeBar escopo={escopo} oQueMuda="a tesouraria" />
        )}
      </Header>

      {soTesoureiroDeEvento ? (
        conteudo
      ) : escopo.precisaEscolher ? (
        <Alert severity="info">
          Escolha no topo da página de qual igreja é a tesouraria: cada igreja
          tem a sua.
        </Alert>
      ) : escopo.semIgreja ? (
        <Alert severity="info">
          Você não é admin nem tesouraria de nenhuma igreja. A tesouraria é por
          igreja.
        </Alert>
      ) : (
        conteudo
      )}
    </PageStyle>
  );
}

export { TesourariaDoEvento };
