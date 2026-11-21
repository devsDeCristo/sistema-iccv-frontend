import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Stack, Typography, useTheme } from '@mui/material';
import { Add, DeleteOutline, EditOutlined, Work } from '@mui/icons-material';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { useMinhasPropostas, useRetirarProposta } from '../api';
import { OportunidadeDaIgreja } from '../types';
import { AcaoDaLinha, ListaDaIgreja } from './listaDaIgreja';

/**
 * As vagas que a pessoa propôs à igreja: a situação de cada uma (pendente,
 * aprovada, recusada com o motivo). A pendente ela edita e retira; a
 * aprovada mostra os candidatos — quem propôs os vê, como o admin.
 */
export function MinhasPropostas() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { data, isFetching } = useMinhasPropostas(true);
  const retirar = useRetirarProposta();
  const [retirando, setRetirando] = useState<OportunidadeDaIgreja | null>(null);

  const acoesDaLinha = (o: OportunidadeDaIgreja): AcaoDaLinha[] =>
    o.status !== 'PENDING'
      ? []
      : [
          {
            titulo: 'Editar',
            icone: <EditOutlined fontSize="small" />,
            onClick: () => navigate(`/oportunidades/propostas/${o.id}`),
          },
          {
            titulo: 'Retirar',
            icone: <DeleteOutline fontSize="small" />,
            onClick: () => setRetirando(o),
            cor: theme.palette.error.main,
          },
        ];

  if (data && !data.length) {
    return (
      <Stack alignItems="center" spacing={1.5} sx={{ py: 6 }}>
        <Work sx={{ fontSize: 40, color: 'text.disabled' }} />
        <Typography color="text.secondary" textAlign="center">
          Você ainda não propôs nenhuma vaga.
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/oportunidades/propor')}
          sx={{ textTransform: 'none' }}
        >
          Propor uma vaga
        </Button>
      </Stack>
    );
  }

  return (
    <>
      <Alert severity="info" sx={{ mb: 2 }}>
        A proposta só vai ao ar depois que o admin da igreja aprova. Enquanto
        estiver pendente, você pode editar ou retirar. Aprovada, você passa a
        ver os candidatos dela.
      </Alert>
      <ListaDaIgreja
        oportunidades={data ?? []}
        carregando={isFetching && !data}
        onInteressados={(o) =>
          navigate(`/oportunidades/propostas/${o.id}/candidaturas`)
        }
        acoesDaLinha={acoesDaLinha}
      />
      <ConfirmModal
        open={!!retirando}
        onClose={() => setRetirando(null)}
        title="Retirar a proposta?"
        message={`“${retirando?.title ?? ''}” sai da fila do admin e não vai ao ar.`}
        confirmLabel="Retirar"
        onConfirm={() =>
          retirando &&
          retirar.mutate(retirando.id, {
            onSuccess: () => setRetirando(null),
            onError: () => setRetirando(null),
          })
        }
      />
    </>
  );
}
