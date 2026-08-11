import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  CameraAlt,
  CheckCircle,
  PlayArrow,
  Undo,
  HourglassEmpty,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { useGetCheckinQueue } from '../api/getCheckin';
import {
  useCallNext,
  useCallParticipant,
  useCompleteCheckin,
  useUndoCheckin,
  useUploadProfilePhoto,
} from '../api/postCheckin';
import { ParticipantSummary } from './participantSummary';
import { CHECKIN_REFETCH_MS, esperaEmMinutos, horaCurta } from '../constants';
import { CheckinParticipant } from '../types';

interface PhotoStationProps {
  eventId: string;
}

const TAMANHO_MAXIMO_FOTO = 5 * 1024 * 1024;

/**
 * Posto 2 — foto e conferência dos dados.
 *
 * Quem está sendo atendido fica em estado local, não derivado da fila: com dois
 * operadores no mesmo posto, cada tela precisa lembrar do participante que ela
 * chamou. A lista de "em atendimento" do servidor serve para os dois se
 * enxergarem e para retomar um atendimento depois de recarregar a página.
 */
function PhotoStation({ eventId }: PhotoStationProps) {
  const [emAtendimento, setEmAtendimento] = useState<CheckinParticipant | null>(
    null
  );
  const [observacoes, setObservacoes] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);
  const inputFoto = useRef<HTMLInputElement>(null);

  const { data: fila } = useGetCheckinQueue(eventId, {
    enabled: !!eventId,
    refetchInterval: CHECKIN_REFETCH_MS,
  });

  const aguardando = fila?.waiting || [];
  const emAtendimentoNoEvento = fila?.inProgress || [];

  // libera a URL do preview para não vazar memória a cada participante
  useEffect(() => {
    if (!foto) {
      setPreviewFoto(null);
      return;
    }

    const url = URL.createObjectURL(foto);
    setPreviewFoto(url);

    return () => URL.revokeObjectURL(url);
  }, [foto]);

  const limparAtendimento = () => {
    setEmAtendimento(null);
    setObservacoes('');
    setFoto(null);
    if (inputFoto.current) inputFoto.current.value = '';
  };

  const iniciarAtendimento = (participante: CheckinParticipant) => {
    setEmAtendimento(participante);
    setObservacoes(participante.notes || '');
    setFoto(null);
    if (inputFoto.current) inputFoto.current.value = '';
  };

  const { mutate: chamarProximo, isLoading: chamando } = useCallNext({
    onSuccess: (participante) => {
      iniciarAtendimento(participante);
      toast.info(`Chame ${participante.fullName}`);
    },
  });

  const { mutate: chamarParticipante, isLoading: chamandoEspecifico } =
    useCallParticipant({
      onSuccess: (participante) => {
        iniciarAtendimento(participante);
        toast.info(`Chame ${participante.fullName}`);
      },
    });

  const { mutateAsync: enviarFoto } = useUploadProfilePhoto();
  const { mutateAsync: concluir } = useCompleteCheckin();
  const { mutate: desfazer, isLoading: desfazendo } = useUndoCheckin({
    onSuccess: () => {
      toast.success('Atendimento devolvido para a fila');
      limparAtendimento();
    },
  });

  const selecionarFoto = (arquivo?: File | null) => {
    if (!arquivo) return;

    if (!arquivo.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem válido.');
      return;
    }

    if (arquivo.size > TAMANHO_MAXIMO_FOTO) {
      toast.error('A foto deve ter no máximo 5MB.');
      return;
    }

    setFoto(arquivo);
  };

  const concluirCheckin = async () => {
    if (!emAtendimento) return;

    setSalvando(true);
    try {
      // a foto sobe primeiro: se o upload falhar, o check-in não é dado como
      // concluído e o participante continua no posto
      if (foto) {
        await enviarFoto({ userId: emAtendimento.userId, file: foto });
      }

      await concluir({
        eventId,
        userId: emAtendimento.userId,
        notes: observacoes.trim() || undefined,
      });

      toast.success(`Check-in de ${emAtendimento.fullName} concluído!`);
      limparAtendimento();
    } catch {
      // o interceptor da API já exibe o motivo em toast
    } finally {
      setSalvando(false);
    }
  };

  const semFotoCadastrada = !emAtendimento?.profilePhotoUrl && !foto;

  return (
    <Grid container spacing={2}>
      {/* ---------------- fila ---------------- */}
      <Grid item xs={12} md={5}>
        <Card sx={{ p: 2 }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1.5 }}
          >
            <Typography variant="h6" fontWeight={600}>
              Fila ({aguardando.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<PlayArrow />}
              disabled={chamando || aguardando.length === 0 || !!emAtendimento}
              onClick={() => chamarProximo({ eventId })}
            >
              Chamar próximo
            </Button>
          </Stack>

          {!!emAtendimento && aguardando.length > 0 && (
            <Alert severity="info" sx={{ mb: 1.5 }}>
              Conclua o atendimento atual para chamar o próximo.
            </Alert>
          )}

          {aguardando.length === 0 ? (
            <Stack alignItems="center" spacing={1} sx={{ py: 4 }}>
              <HourglassEmpty color="disabled" />
              <Typography variant="body2" color="text.secondary">
                Ninguém aguardando. A fila enche conforme a recepção entrega os
                crachás.
              </Typography>
            </Stack>
          ) : (
            <Stack divider={<Divider />} spacing={1}>
              {aguardando.map((participante, indice) => {
                const espera = esperaEmMinutos(participante.badgeDeliveredAt);

                return (
                  <Stack
                    key={participante.userId}
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ pt: indice === 0 ? 0 : 1 }}
                  >
                    <Chip
                      label={indice + 1}
                      size="small"
                      color={indice === 0 ? 'primary' : 'default'}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <ParticipantSummary participant={participante} dense />
                    </Box>
                    <Stack alignItems="flex-end" spacing={0.5}>
                      {espera !== null && (
                        <Typography variant="caption" color="text.secondary">
                          {espera} min
                        </Typography>
                      )}
                      <Button
                        size="small"
                        disabled={chamandoEspecifico || !!emAtendimento}
                        onClick={() =>
                          chamarParticipante({
                            eventId,
                            userId: participante.userId,
                          })
                        }
                      >
                        Chamar
                      </Button>
                    </Stack>
                  </Stack>
                );
              })}
            </Stack>
          )}
        </Card>
      </Grid>

      {/* ---------------- atendimento ---------------- */}
      <Grid item xs={12} md={7}>
        <Card sx={{ p: 2 }}>
          {!emAtendimento ? (
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={600}>
                Nenhum atendimento aberto
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Use "Chamar próximo" para iniciar. Se você recarregou a página no
                meio de um atendimento, retome abaixo.
              </Typography>

              {emAtendimentoNoEvento.length > 0 && (
                <Stack spacing={1}>
                  <Typography variant="subtitle2">
                    Em atendimento agora
                  </Typography>
                  {emAtendimentoNoEvento.map((participante) => (
                    <Stack
                      key={participante.userId}
                      direction="row"
                      alignItems="center"
                      spacing={1}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <ParticipantSummary participant={participante} dense />
                      </Box>
                      <Stack alignItems="flex-end">
                        <Typography variant="caption" color="text.secondary">
                          {participante.calledBy
                            ? `com ${participante.calledBy}`
                            : ''}
                          {participante.calledAt
                            ? ` às ${horaCurta(participante.calledAt)}`
                            : ''}
                        </Typography>
                        <Button
                          size="small"
                          onClick={() => iniciarAtendimento(participante)}
                        >
                          Retomar
                        </Button>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              )}
            </Stack>
          ) : (
            <Stack spacing={2}>
              <ParticipantSummary participant={emAtendimento} />

              <Divider />

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems="center"
              >
                <Avatar
                  src={previewFoto || emAtendimento.profilePhotoUrl || undefined}
                  sx={{ width: 110, height: 110 }}
                />
                <Stack spacing={1} sx={{ flex: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<CameraAlt />}
                    onClick={() => inputFoto.current?.click()}
                  >
                    {foto ? 'Trocar foto' : 'Tirar / escolher foto'}
                  </Button>
                  <input
                    ref={inputFoto}
                    type="file"
                    accept="image/*"
                    // no tablet/celular abre a câmera direto
                    capture="user"
                    hidden
                    onChange={(event) =>
                      selecionarFoto(event.target.files?.[0])
                    }
                  />
                  {foto ? (
                    <Typography variant="caption" color="success.main">
                      Foto nova selecionada — será salva ao concluir.
                    </Typography>
                  ) : semFotoCadastrada ? (
                    <Typography variant="caption" color="warning.main">
                      Este participante ainda não tem foto cadastrada.
                    </Typography>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Já existe foto cadastrada. Tire outra apenas se necessário.
                    </Typography>
                  )}
                </Stack>
              </Stack>

              <Stack spacing={0.5}>
                <Typography variant="body2">
                  Telefone: <b>{emAtendimento.cellphone || '—'}</b>
                </Typography>
                <Typography variant="body2">
                  Cidade: <b>{emAtendimento.city || '—'}</b>
                </Typography>
                {emAtendimento.roles.length > 0 && (
                  <Typography variant="body2">
                    Inscrição: <b>{emAtendimento.roles.join(', ')}</b>
                  </Typography>
                )}
              </Stack>

              <TextField
                label="Observações do atendimento"
                placeholder="Ex.: chegou sem documento, conferido pelo padrinho"
                multiline
                rows={2}
                fullWidth
                size="small"
                value={observacoes}
                onChange={(event) => setObservacoes(event.target.value)}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  size="large"
                  startIcon={<CheckCircle />}
                  disabled={salvando}
                  onClick={concluirCheckin}
                >
                  {salvando ? 'Salvando...' : 'Concluir check-in'}
                </Button>
                <Button
                  color="warning"
                  startIcon={<Undo />}
                  disabled={salvando || desfazendo}
                  onClick={() =>
                    desfazer({ eventId, userId: emAtendimento.userId })
                  }
                >
                  Devolver à fila
                </Button>
              </Stack>
            </Stack>
          )}
        </Card>
      </Grid>
    </Grid>
  );
}

export { PhotoStation };
