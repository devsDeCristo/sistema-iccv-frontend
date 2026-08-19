import { ReactNode, useEffect, useState } from 'react';
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
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  CheckCircle,
  PlayArrow,
  Undo,
  HourglassEmpty,
  Monitor,
  MonitorOutlined,
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
import { ParticipantDisplay } from './participantDisplay';
import { ExternalWindow } from '../../../../components/externalWindow';
import { InputPhoto } from '../../users/components/inputPhoto';
import { UserDataForm } from '../../users/components/userDataForm';
import { WebcamModal } from '../../users/components/webcamModal';
import { CHECKIN_REFETCH_MS, esperaEmMinutos, horaCurta } from '../constants';
import { CheckinParticipant } from '../types';

interface PhotoStationProps {
  eventId: string;
}

const TAMANHO_MAXIMO_FOTO = 5 * 1024 * 1024;

/** Passo numerado do atendimento, na ordem em que o operador executa. */
function Etapa({
  numero,
  titulo,
  descricao,
  children,
}: {
  numero: number;
  titulo: string;
  descricao?: string;
  children: ReactNode;
}) {
  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar
          sx={{
            width: 30,
            height: 30,
            fontSize: 15,
            fontWeight: 600,
            bgcolor: 'primary.main',
          }}
        >
          {numero}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={600} lineHeight={1.2}>
            {titulo}
          </Typography>
          {descricao && (
            <Typography variant="caption" color="text.secondary">
              {descricao}
            </Typography>
          )}
        </Box>
      </Stack>
      <Box sx={{ pl: { xs: 0, md: 5.5 } }}>{children}</Box>
    </Stack>
  );
}

/**
 * Posto 2 — conferência dos dados e foto.
 *
 * Quem está sendo atendido fica em estado local, não derivado da fila: com dois
 * operadores no mesmo posto, cada tela precisa lembrar do participante que ela
 * chamou. A lista de "em atendimento" do servidor serve para os dois se
 * enxergarem e para retomar um atendimento depois de recarregar a página.
 *
 * O atendimento ocupa a tela inteira quando começa, porque o segundo monitor —
 * espelhado e virado para o inscrito — mostra exatamente isto: ele confere os
 * próprios dados, o operador corrige o que estiver errado e só então a foto é
 * tirada, na mesma webcam usada no cadastro de usuário.
 */
function PhotoStation({ eventId }: PhotoStationProps) {
  const [emAtendimento, setEmAtendimento] = useState<CheckinParticipant | null>(
    null
  );
  const [observacoes, setObservacoes] = useState('');
  const [foto, setFoto] = useState<File | null>(null);
  const [previewFoto, setPreviewFoto] = useState<string | null>(null);
  const [webcamAberta, setWebcamAberta] = useState(false);
  const [salvando, setSalvando] = useState(false);
  // janela do participante: vive na mesma árvore React, então acompanha o
  // atendimento sozinha e usa o mesmo stream da webcam, sem abrir a câmera duas
  // vezes
  const [painelAberto, setPainelAberto] = useState(false);
  const [streamCamera, setStreamCamera] = useState<MediaStream | null>(null);
  const [capturaCamera, setCapturaCamera] = useState<File | null>(null);
  const theme = useTheme();

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

  const fecharWebcam = () => {
    setWebcamAberta(false);
    setStreamCamera(null);
    setCapturaCamera(null);
  };

  const limparAtendimento = () => {
    setEmAtendimento(null);
    setObservacoes('');
    setFoto(null);
    fecharWebcam();
  };

  const iniciarAtendimento = (participante: CheckinParticipant) => {
    setEmAtendimento(participante);
    setObservacoes(participante.notes || '');
    setFoto(null);
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

  /** Devolve se a foto foi aceita — a webcam só fecha quando foi. */
  const selecionarFoto = (arquivo?: File | null) => {
    if (!arquivo) return false;

    if (!arquivo.type.startsWith('image/')) {
      toast.error('Selecione um arquivo de imagem válido.');
      return false;
    }

    if (arquivo.size > TAMANHO_MAXIMO_FOTO) {
      toast.error('A foto deve ter no máximo 5MB.');
      return false;
    }

    setFoto(arquivo);
    return true;
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
    <Stack spacing={2}>
      <Stack
        direction="row"
        justifyContent="flex-end"
        alignItems="center"
        spacing={1.5}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: { xs: 'none', md: 'block' } }}
        >
          Arraste para o segundo monitor e deixe em tela cheia
        </Typography>
        <Button
          variant={painelAberto ? 'contained' : 'outlined'}
          startIcon={painelAberto ? <Monitor /> : <MonitorOutlined />}
          onClick={() => setPainelAberto((aberto) => !aberto)}
        >
          {painelAberto ? 'Fechar tela do participante' : 'Tela do participante'}
        </Button>
      </Stack>

      <Grid container spacing={2}>
        {/* ---------------- fila ---------------- */}
        <Grid item xs={12} md={emAtendimento ? 4 : 12}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
              spacing={1}
              sx={{ mb: 1.5 }}
            >
              <Typography variant="h6" fontWeight={600}>
                Fila da foto ({aguardando.length})
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
              <Stack
                divider={<Divider />}
                spacing={1}
                sx={{
                  // com o atendimento aberto a fila é coadjuvante: rola sozinha
                  // em vez de empurrar o participante para fora da tela
                  maxHeight: emAtendimento ? 520 : 'none',
                  overflowY: emAtendimento ? 'auto' : 'visible',
                }}
              >
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
                        <ParticipantSummary
                          participant={participante}
                          variant="dense"
                        />
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

            {!emAtendimento && emAtendimentoNoEvento.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Em atendimento agora
                </Typography>
                <Stack spacing={1}>
                  {emAtendimentoNoEvento.map((participante) => (
                    <Stack
                      key={participante.userId}
                      direction="row"
                      alignItems="center"
                      spacing={1}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <ParticipantSummary
                          participant={participante}
                          variant="dense"
                        />
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
              </>
            )}

            {!emAtendimento && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Chame alguém da fila para abrir o atendimento: os dados aparecem
                em tamanho grande no monitor virado para o inscrito.
              </Alert>
            )}
          </Card>
        </Grid>

        {/* ---------------- atendimento ---------------- */}
        {emAtendimento && (
          <Grid item xs={12} md={8}>
            <Card sx={{ overflow: 'hidden' }}>
              {/* faixa de identificação: é o que o inscrito lê no monitor */}
              <Box
                sx={{
                  p: { xs: 2, md: 3 },
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                <ParticipantSummary
                  participant={emAtendimento}
                  variant="display"
                  previewPhotoUrl={previewFoto}
                />
              </Box>

              <Stack spacing={3} sx={{ p: { xs: 2, md: 3 } }}>
                <Etapa
                  numero={1}
                  titulo="Confira os dados com o participante"
                  descricao="Algo errado? Corrija agora, antes da foto."
                >
                  <UserDataForm userId={emAtendimento.userId} />
                </Etapa>

                <Divider />

                <Etapa
                  numero={2}
                  titulo="Tire a foto"
                  descricao="Mesma webcam do cadastro; a foto é salva ao concluir."
                >
                  <Stack spacing={1}>
                    <InputPhoto
                      profilePhoto={emAtendimento.profilePhotoUrl || undefined}
                      previewPhoto={previewFoto || undefined}
                      onSelectPhoto={(arquivo) => selecionarFoto(arquivo)}
                      onOpenWebcam={() => setWebcamAberta(true)}
                    />

                    {foto ? (
                      <Typography variant="body2" color="success.main">
                        Foto nova capturada — será salva ao concluir o check-in.
                      </Typography>
                    ) : semFotoCadastrada ? (
                      <Typography variant="body2" color="warning.main">
                        Este participante ainda não tem foto cadastrada.
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Já existe foto cadastrada. Tire outra apenas se
                        necessário.
                      </Typography>
                    )}
                  </Stack>
                </Etapa>

                <Divider />

                <Etapa
                  numero={3}
                  titulo="Conclua o atendimento"
                  descricao="O participante sai da fila e o crachá está liberado."
                >
                  <Stack spacing={2}>
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
                </Etapa>
              </Stack>

              <WebcamModal
                isOpen={webcamAberta}
                onClose={fecharWebcam}
                onSelectPhoto={(arquivo) => {
                  if (selecionarFoto(arquivo)) fecharWebcam();
                }}
                onStream={setStreamCamera}
                onCapture={setCapturaCamera}
              />
            </Card>
          </Grid>
        )}
      </Grid>

      {/* o participante vê só o que lhe diz respeito: seus dados, e a câmera
          no lugar deles enquanto a foto é tirada — nunca a fila */}
      <ExternalWindow
        open={painelAberto}
        title="Check-in — participante"
        name="checkin-participante"
        onClose={() => setPainelAberto(false)}
        onBlocked={() =>
          toast.error(
            'O navegador bloqueou a janela. Libere pop-ups para este endereço e tente de novo.'
          )
        }
      >
        <ParticipantDisplay
          participant={emAtendimento}
          capturing={webcamAberta}
          stream={streamCamera}
          captured={capturaCamera}
          pendingPhotoUrl={previewFoto}
        />
      </ExternalWindow>
    </Stack>
  );
}

export { PhotoStation };
