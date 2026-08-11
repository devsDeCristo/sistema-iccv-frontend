import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Search, HowToReg, Undo } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useSearchCheckin } from '../api/getCheckin';
import { useDeliverBadge, useUndoCheckin } from '../api/postCheckin';
import { ParticipantSummary } from './participantSummary';
import { CheckinParticipant } from '../types';

interface ReceptionStationProps {
  eventId: string;
}

/**
 * Posto 1 — reconhecimento e entrega do crachá.
 *
 * A busca só dispara a partir de 2 caracteres: com a lista inteira do evento na
 * tela, é fácil entregar o crachá para o homônimo errado.
 */
function ReceptionStation({ eventId }: ReceptionStationProps) {
  const [termo, setTermo] = useState('');
  const [termoBuscado, setTermoBuscado] = useState('');
  const campoBusca = useRef<HTMLInputElement>(null);

  // espera a digitação parar antes de consultar
  useEffect(() => {
    const timer = setTimeout(() => setTermoBuscado(termo.trim()), 350);
    return () => clearTimeout(timer);
  }, [termo]);

  const buscaValida = termoBuscado.length >= 2;

  const { data: resultados, isFetching } = useSearchCheckin(
    eventId,
    termoBuscado,
    { enabled: !!eventId && buscaValida, keepPreviousData: true }
  );

  const { mutate: entregarCracha, isLoading: entregando } = useDeliverBadge({
    onSuccess: (participante) => {
      toast.success(
        `${participante.fullName} entrou na fila da foto. Encaminhe ao posto.`
      );
      setTermo('');
      setTermoBuscado('');
      campoBusca.current?.focus();
    },
  });

  const { mutate: desfazer, isLoading: desfazendo } = useUndoCheckin({
    onSuccess: (participante) => {
      toast.success(`Entrega de crachá desfeita para ${participante.fullName}`);
    },
  });

  // `keepPreviousData` mantém o resultado anterior enquanto a consulta muda —
  // sem esta guarda, a lista continuaria na tela depois de limpar a busca e o
  // operador poderia entregar o crachá para o participante errado.
  const lista = useMemo(
    () => (buscaValida ? resultados || [] : []),
    [resultados, buscaValida]
  );

  const acaoDoParticipante = (participante: CheckinParticipant) => {
    if (participante.status === 'PENDING') {
      return (
        <Button
          variant="contained"
          startIcon={<HowToReg />}
          disabled={entregando}
          onClick={() => entregarCracha({ eventId, userId: participante.userId })}
        >
          Entregar crachá
        </Button>
      );
    }

    return (
      <Stack spacing={1} alignItems="flex-end">
        <Typography variant="body2" color="success.main" fontWeight={500}>
          Crachá já entregue
        </Typography>
        {/* só desfaz quem ainda não foi chamado; depois disso é o outro posto */}
        {participante.status === 'QUEUED' && (
          <Button
            size="small"
            color="warning"
            startIcon={<Undo />}
            disabled={desfazendo}
            onClick={() => desfazer({ eventId, userId: participante.userId })}
          >
            Desfazer
          </Button>
        )}
      </Stack>
    );
  };

  return (
    <Stack spacing={2}>
      <TextField
        inputRef={campoBusca}
        autoFocus
        fullWidth
        size="medium"
        placeholder="Buscar por nome, CPF ou número de inscrição"
        value={termo}
        onChange={(event) => setTermo(event.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
          endAdornment: isFetching ? (
            <InputAdornment position="end">
              <CircularProgress size={18} />
            </InputAdornment>
          ) : null,
        }}
        helperText={
          termo.length > 0 && !buscaValida
            ? 'Digite ao menos 2 caracteres'
            : 'O participante é encaminhado ao posto de foto após a entrega'
        }
      />

      {buscaValida && !isFetching && lista.length === 0 && (
        <Alert severity="warning">
          Ninguém encontrado com "{termoBuscado}". Confira a grafia do nome ou
          use o CPF — a busca cobre apenas os inscritos deste evento.
        </Alert>
      )}

      {!buscaValida && (
        <Alert severity="info">
          Busque o participante para conferir os dados e liberar a entrega do
          crachá.
        </Alert>
      )}

      <Stack spacing={1.5}>
        {lista.map((participante) => (
          <Card key={participante.userId} sx={{ p: 2 }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', md: 'center' }}
              justifyContent="space-between"
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <ParticipantSummary participant={participante} />
              </Box>
              <Box sx={{ flexShrink: 0 }}>
                {acaoDoParticipante(participante)}
              </Box>
            </Stack>
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}

export { ReceptionStation };
