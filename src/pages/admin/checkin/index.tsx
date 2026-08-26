import { useEffect, useMemo, useState } from 'react';
import {
  useParams,
  useNavigate,
  useBlocker,
} from 'react-router-dom';
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ArrowBack,
  CloudDone,
  CloudOff,
  HowToReg,
  PhotoCamera,
} from '@mui/icons-material';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { CheckinStats } from '../../../features/admin/checkin/components/checkinStats';
import { ReceptionStation } from '../../../features/admin/checkin/components/receptionStation';
import { PhotoStation } from '../../../features/admin/checkin/components/photoStation';
import { InputSelect } from '../../../components/inputSelect';
import {
  abasSx,
  campoBuscaSx,
  superficieAbasSx,
  superficieSx,
} from '../../../components/listPageStyles';
import { useSearchCheckin } from '../../../features/admin/checkin/api/getCheckin';
import { useCheckinSocket } from '../../../features/admin/checkin/hooks/useCheckinSocket';
import { CHECKIN_REFETCH_MS } from '../../../features/admin/checkin/constants';
import {
  TODOS_OS_GRUPOS,
  contarCheckin,
  filtrarPorGrupo,
  gruposDosInscritos,
} from '../../../features/admin/checkin/utils';

type Posto = 'recepcao' | 'foto';

function Checkin() {
  const { id: eventId = '' } = useParams();
  const theme = useTheme();
  const navigate = useNavigate();
  const [posto, setPosto] = useState<Posto>('recepcao');
  const [grupo, setGrupo] = useState(TODOS_OS_GRUPOS);
  const [painelAberto, setPainelAberto] = useState(false);
  // trocar de aba não é navegação, então tem estado próprio
  const [abaPendente, setAbaPendente] = useState<Posto | null>(null);

  const { connected } = useCheckinSocket(eventId);

  // a mesma consulta da recepção: o react-query serve as duas telas do mesmo
  // cache, sem uma segunda ida ao servidor
  const { data: inscritos } = useSearchCheckin(eventId, '', {
    enabled: !!eventId,
    refetchInterval: CHECKIN_REFETCH_MS,
  });

  const grupos = useMemo(() => gruposDosInscritos(inscritos || []), [inscritos]);

  // os contadores acompanham o recorte escolhido — se o check-in de hoje é só
  // de um grupo, o "faltam X" precisa ser o daquele grupo
  const stats = useMemo(
    () => contarCheckin(filtrarPorGrupo(inscritos || [], grupo)),
    [inscritos, grupo]
  );

  // o grupo escolhido pode deixar de existir; sem isto a tela ficaria vazia
  // sem explicação nenhuma
  useEffect(() => {
    if (
      grupo !== TODOS_OS_GRUPOS &&
      grupos.length > 0 &&
      !grupos.includes(grupo)
    ) {
      setGrupo(TODOS_OS_GRUPOS);
    }
  }, [grupos, grupo]);

  /**
   * Sair desta tela desmonta o posto de foto, e a janela do participante fecha
   * junto. Com ela aberta tem gente do outro lado olhando para a própria ficha,
   * então qualquer saída é confirmada antes de acontecer.
   *
   * O bloqueador cobre toda navegação — menu lateral, voltar, link solto —, de
   * modo que só a troca de aba, que não muda de rota, precisa ser tratada à
   * parte.
   */
  const bloqueioDeRota = useBlocker(
    ({ currentLocation, nextLocation }) =>
      painelAberto && currentLocation.pathname !== nextLocation.pathname
  );

  const trocarPosto = (destino: Posto) => {
    if (destino === posto) return;

    if (posto === 'foto' && painelAberto) {
      setAbaPendente(destino);
      return;
    }

    setPosto(destino);
  };

  const avisandoDaSaida =
    !!abaPendente || bloqueioDeRota.state === 'blocked';

  const cancelarSaida = () => {
    setAbaPendente(null);
    if (bloqueioDeRota.state === 'blocked') bloqueioDeRota.reset();
  };

  const confirmarSaida = () => {
    setPainelAberto(false);

    if (abaPendente) {
      setPosto(abaPendente);
      setAbaPendente(null);
    }

    if (bloqueioDeRota.state === 'blocked') bloqueioDeRota.proceed();
  };

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 } }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        useFlexGap
        spacing={1.5}
        sx={{ mb: 2 }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton
            onClick={() =>
              navigate(`/admin/eventos/${eventId}/detalhes/geral`)
            }
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" fontWeight={600}>
            Check-in do evento
          </Typography>
        </Stack>

        {/* os controles do cabeçalho também ficam sobre superfície: soltos,
            eram os únicos campos da tela sem paper */}
        <Paper
          sx={{ ...superficieSx, p: 1.5 }}
          component={Stack}
          direction="row"
          alignItems="center"
          spacing={1.5}
        >
          <Box sx={{ minWidth: 220 }}>
            <InputSelect
              label="Grupo"
              size="small"
              sx={campoBuscaSx(theme)}
              value={grupo}
              onChange={(event) => setGrupo(String(event.target.value))}
              menuOptions={[
                { value: TODOS_OS_GRUPOS, name: 'Todos os grupos' },
                ...grupos.map((nome) => ({ value: nome, name: nome })),
              ]}
            />
          </Box>

          {/* o operador precisa saber se a tela ainda está viva */}
          <Tooltip
            title={
              connected
                ? 'Conectado: a fila atualiza em tempo real'
                : 'Sem conexão em tempo real — a fila atualiza a cada 15 segundos'
            }
          >
            <Chip
              size="small"
              icon={connected ? <CloudDone /> : <CloudOff />}
              label={connected ? 'Ao vivo' : 'Reconectando'}
              color={connected ? 'success' : 'default'}
              variant={connected ? 'filled' : 'outlined'}
            />
          </Tooltip>
        </Paper>
      </Stack>

      <Box sx={{ mb: 2 }}>
        <CheckinStats stats={stats} />
      </Box>

      <Paper sx={{ ...superficieAbasSx, mb: 2 }}>
        <Tabs
          value={posto}
          onChange={(_, value: Posto) => trocarPosto(value)}
          sx={abasSx(theme)}
        >
          <Tab
            value="recepcao"
            label="Recepção e crachá"
            icon={<HowToReg />}
            iconPosition="start"
          />
          <Tab
            value="foto"
            label="Foto e conferência"
            icon={<PhotoCamera />}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {posto === 'recepcao' ? (
        <ReceptionStation eventId={eventId} grupo={grupo} />
      ) : (
        <PhotoStation
          eventId={eventId}
          painelAberto={painelAberto}
          onPainelAbertoChange={setPainelAberto}
        />
      )}

      <ConfirmModal
        open={avisandoDaSaida}
        title="Fechar a tela do participante?"
        message="A tela do participante está aberta e será fechada ao sair daqui. O atendimento em andamento continua na fila e pode ser retomado depois."
        confirmLabel="Sair e fechar"
        cancelLabel="Ficar na aba"
        onClose={cancelarSaida}
        onConfirm={confirmarSaida}
      />
    </Box>
  );
}

export { Checkin };
