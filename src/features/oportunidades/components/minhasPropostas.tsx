import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Add,
  ChevronRight,
  DeleteOutline,
  EditOutlined,
  PeopleOutline,
  Work,
} from '@mui/icons-material';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { corDoModulo } from '../../../constants/identidadeDosModulos';
import { useMinhasPropostas, useRetirarProposta } from '../api';
import { OportunidadeDaIgreja } from '../types';
import { CardDaVaga, EtiquetaDaVaga } from './cardDaVaga';

/**
 * As vagas que a pessoa propôs à igreja, nos mesmos cards da vitrine (a
 * página da carteira), com o pé trocado pela situação e as opções de cada
 * uma: a pendente ela edita e retira; a aprovada mostra os candidatos (quem
 * propôs os vê, como o admin); a recusada traz o motivo.
 */
export function MinhasPropostas() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { data, isFetching } = useMinhasPropostas(true);
  const retirar = useRetirarProposta();
  const [retirando, setRetirando] = useState<OportunidadeDaIgreja | null>(null);

  const cor = corDoModulo(theme, 'oportunidades');

  // o pé do card: a situação da proposta e o que dá para fazer com ela
  const rodape = (o: OportunidadeDaIgreja) => {
    if (o.status === 'PENDING') {
      return (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={1}
        >
          <EtiquetaDaVaga
            rotulo="Aguardando aprovação"
            cor={theme.palette.warning.main}
          />
          <Stack direction="row" gap={0.5}>
            <Button
              size="small"
              startIcon={<EditOutlined />}
              onClick={() => navigate(`/oportunidades/propostas/${o.id}`)}
              sx={{ textTransform: 'none' }}
            >
              Editar
            </Button>
            <Button
              size="small"
              color="error"
              startIcon={<DeleteOutline />}
              onClick={() => setRetirando(o)}
              sx={{ textTransform: 'none' }}
            >
              Retirar
            </Button>
          </Stack>
        </Stack>
      );
    }
    if (o.status === 'REJECTED') {
      return (
        <Stack gap={0.75}>
          <EtiquetaDaVaga rotulo="Recusada" cor={theme.palette.error.main} />
          <Typography
            sx={{
              fontSize: 12.5,
              color: 'error.main',
              overflowWrap: 'anywhere',
            }}
          >
            {o.rejectionReason
              ? `Motivo: ${o.rejectionReason}`
              : 'Recusada sem motivo informado'}
          </Typography>
        </Stack>
      );
    }
    const quantas = o.interests.length;
    return (
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={1}
      >
        <EtiquetaDaVaga
          {...(o.encerrada
            ? { rotulo: 'Encerrada', cor: theme.palette.text.secondary }
            : {
                rotulo: 'Aprovada',
                cor: theme.palette.success.main,
                check: true,
              })}
        />
        <Button
          size="small"
          startIcon={<PeopleOutline />}
          endIcon={<ChevronRight />}
          onClick={() =>
            navigate(`/oportunidades/propostas/${o.id}/candidaturas`)
          }
          sx={{ textTransform: 'none', fontWeight: 700, color: cor }}
        >
          {quantas === 1 ? '1 candidatura' : `${quantas} candidaturas`}
        </Button>
      </Stack>
    );
  };

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
      {isFetching && !data ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        // a mesma grade da vitrine
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
          {(data ?? []).map((o) => (
            <CardDaVaga key={o.id} vaga={o} rodape={rodape(o)} />
          ))}
        </Box>
      )}
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
