import { useState } from 'react';
import {
  alpha,
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { Add, Assignment } from '@mui/icons-material';

import { PageStyle } from '../../components/pageStyle';
import { Header } from '../../components/header';
import { getStoredUser } from '../../auth/session';
import { useMinhasSolicitacoes } from '../../features/solicitacoes/api';
import { ModalNovaSolicitacao } from '../../features/solicitacoes/components/modalNovaSolicitacao';
import { CardDaSolicitacao } from '../../features/solicitacoes/components/cardDaSolicitacao';
import {
  MinhaSolicitacao,
  StatusDaSolicitacao,
} from '../../features/solicitacoes/types';

/** Aceita ou recusada: a igreja já deu a resposta */
const RESPONDIDA: Record<StatusDaSolicitacao, boolean> = {
  REQUESTED: false,
  IN_REVIEW: false,
  ACCEPTED: true,
  REJECTED: true,
};

/** Uma divisão da lista: o título, a quantidade num chip e a grade de cards */
function Secao({
  titulo,
  solicitacoes,
}: {
  titulo: string;
  solicitacoes: MinhaSolicitacao[];
}) {
  const theme = useTheme();
  // seção vazia não aparece: quem não tem nada respondido não vê o título
  if (!solicitacoes.length) return null;

  return (
    <Stack spacing={1.5} component="section" aria-label={titulo}>
      <Stack direction="row" alignItems="center" gap={1}>
        <Typography sx={{ fontSize: 17, fontWeight: 700 }}>{titulo}</Typography>
        <Box
          component="span"
          sx={{
            minWidth: 22,
            px: 0.75,
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 700,
            lineHeight: '20px',
            textAlign: 'center',
            fontVariantNumeric: 'tabular-nums',
            color: theme.palette.primary.main,
            bgcolor: alpha(theme.palette.primary.main, 0.14),
          }}
        >
          {solicitacoes.length}
        </Box>
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(3, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        {solicitacoes.map((s) => (
          <CardDaSolicitacao key={s.id} solicitacao={s} />
        ))}
      </Box>
    </Stack>
  );
}

/**
 * O membro pede à igreja de que é membro e acompanha a resposta. A barra
 * lateral só mostra esta tela a quem é membro de uma igreja com o módulo; quem
 * chegar pelo endereço sem isso lê o motivo e não consegue pedir.
 */
function Solicitacoes() {
  const igreja = getStoredUser()?.memberChurch;
  const podePedir = !!igreja?.modulos.includes('REQUESTS');
  const [pedindo, setPedindo] = useState(false);
  const { data, isLoading } = useMinhasSolicitacoes();

  return (
    <PageStyle>
      <Header
        title="Solicitações"
        modulo="solicitacoes"
        description={
          podePedir
            ? `Peça à ${igreja?.name} o que o seu ministério precisa`
            : 'Pedidos de equipamentos e melhorias à igreja'
        }
      >
        {podePedir && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setPedindo(true)}
            sx={{ textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}
          >
            Nova solicitação
          </Button>
        )}
      </Header>

      {!podePedir && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {igreja
            ? `A ${igreja.name} ainda não recebe solicitações por aqui.`
            : 'Só quem é membro de uma igreja faz solicitações a ela.'}
        </Alert>
      )}

      {isLoading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : !data?.length ? (
        podePedir && (
          <Stack alignItems="center" spacing={1} sx={{ py: 6 }}>
            <Assignment sx={{ fontSize: 40, color: 'text.disabled' }} />
            <Typography color="text.secondary" textAlign="center">
              Você ainda não fez nenhuma solicitação. Use “Nova solicitação”
              para pedir um equipamento ou uma melhoria.
            </Typography>
          </Stack>
        )
      ) : (
        <Stack spacing={4}>
          <Secao
            titulo="Aguardando"
            solicitacoes={data.filter((s) => !RESPONDIDA[s.status])}
          />
          <Secao
            titulo="Respondidos"
            solicitacoes={data.filter((s) => RESPONDIDA[s.status])}
          />
        </Stack>
      )}

      {igreja && (
        <ModalNovaSolicitacao
          open={pedindo}
          igreja={igreja.name}
          onClose={() => setPedindo(false)}
        />
      )}
    </PageStyle>
  );
}

export { Solicitacoes };
