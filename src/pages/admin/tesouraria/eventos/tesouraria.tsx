import { useState } from 'react';
import {
  Alert,
  Button,
  Paper,
  Skeleton,
  Stack,
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
  useConciliacaoDaTesouraria,
  useIgrejaDaTesouraria,
  useLancamentosDaTesouraria,
  useTesouraria,
} from '../../../../features/admin/tesouraria/eventosECongregacoes/api';
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
  // o tesoureiro(a) do evento não escolhe igreja; a API recusa a tesouraria
  // de evento que não é dele
  const { escopo, churchId, soTesoureiroDeEvento } = useIgrejaDaTesouraria();
  const { isSuperAdmin, perfilNaIgreja } = useRole();
  const [lancando, setLancando] = useState(false);
  const [tesoureiros, setTesoureiros] = useState(false);

  const { data: tesouraria, isLoading } = useTesouraria(churchId, id);
  const { data: conciliacao } = useConciliacaoDaTesouraria(churchId, id);
  const { data: lancamentos } = useLancamentosDaTesouraria(
    churchId,
    aba === 'lancamentos' ? id : undefined
  );

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

  if (!soTesoureiroDeEvento && (escopo.precisaEscolher || escopo.semIgreja)) {
    return (
      <PageStyle>
        {voltar}
        <Alert severity="info">
          {escopo.semIgreja
            ? 'Você não é admin nem tesouraria de nenhuma igreja. A tesouraria é por igreja.'
            : 'Escolha no topo da página de qual igreja é a tesouraria: cada igreja tem a sua.'}
        </Alert>
      </PageStyle>
    );
  }

  if (isLoading || escopo.carregando) {
    return (
      <PageStyle>
        {voltar}
        <Skeleton variant="rounded" height={240} sx={{ borderRadius: 3 }} />
      </PageStyle>
    );
  }

  if (!tesouraria || !churchId) {
    return (
      <PageStyle>
        {voltar}
        <Alert severity="warning">
          Tesouraria não encontrada, ou de um evento em que você não é
          tesoureiro(a).
        </Alert>
      </PageStyle>
    );
  }

  const base = `${LISTA}/${tesouraria.id}`;
  const fechada = !!tesouraria.fechamento;
  // os tesoureiros(as) são do evento do sistema; o de fora não tem a quem
  // ligar. Escolhe quem é admin da igreja
  const botaoTesoureiros = tesouraria.eventoId &&
    (isSuperAdmin || perfilNaIgreja(churchId) === Role.ADMIN) && (
      <Button
        variant="outlined"
        startIcon={<SupervisorAccountOutlined />}
        onClick={() => setTesoureiros(true)}
        sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
      >
        Configurar tesoureiros
      </Button>
    );

  const conteudo = (
    <>
      <BarraDoFechamento
        tesouraria={tesouraria}
        churchId={churchId}
        aConciliar={conciliacao?.aConciliar}
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
          lancamentos={lancamentos ?? []}
          periodo="No evento"
          destaque={{
            categoria: 'Ingressos',
            legenda: 'Das inscrições do evento',
            icone: <ConfirmationNumber sx={{ fontSize: 20 }} />,
          }}
        />
      ) : (
        <ConciliacaoDaTesouraria
          tipo="EVENT"
          churchId={churchId}
          tesourariaId={tesouraria.id}
          fechada={fechada}
        />
      )}
      <ModalLancamentoDoEvento
        open={lancando}
        churchId={churchId}
        tesourariaId={tesouraria.id}
        onClose={() => setLancando(false)}
        onSalvo={() => setLancando(false)}
      />
      {tesouraria.eventoId && (
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
        description={[
          'Tesouraria de evento',
          tesouraria.periodo,
          tesouraria.eventoId ? '' : 'fora do sistema',
        ]
          .filter(Boolean)
          .join(' · ')}
        acaoAoLado
      >
        {/* o tesoureiro(a) do evento não escolhe igreja: o evento é dele */}
        {!soTesoureiroDeEvento && (
          <ChurchScopeBar escopo={escopo} oQueMuda="a tesouraria" />
        )}
      </Header>

      {conteudo}
    </PageStyle>
  );
}

export { TesourariaDoEvento };
