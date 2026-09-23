import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Button,
  CircularProgress,
  GlobalStyles,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { Download, Print } from '@mui/icons-material';
import FileSaver from 'file-saver';
import { toast } from 'react-toastify';
import { Header } from '../../../../components/header';
import { PageStyle } from '../../../../components/pageStyle';
import { apiClient } from '../../../../config/lib/axios/api-client';
import { useGetEvents } from '../../../../features/admin/events/api/getEvents';
import { useGetTeams } from '../../../../features/admin/events/api/getTeams';
import { EventDetails, Team } from '../../../../features/admin/events/types';
import { UserTeam } from '../../../../types/user';
import { superficieSx } from '../../../../components/listPageStyles';

/** Mesma ordem do PDF: líderes primeiro, depois alfabética */
function ordenarLideresPrimeiro(users: UserTeam[]) {
  return [...users].sort((a, b) =>
    a.roleTeam === b.roleTeam
      ? a.fullName.localeCompare(b.fullName)
      : a.roleTeam === 'LEADER'
        ? -1
        : 1
  );
}

/** As datas são gravadas à meia-noite em UTC: sem fixar o fuso, quem está no
 * Brasil vê o dia anterior */
function formatarData(valor?: Date | string) {
  if (!valor) return '';
  return new Date(valor).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}

/**
 * Tela do quadrante: o quadro de fotos das equipes, do jeito que vai para o
 * papel. Daqui a pessoa imprime direto ou baixa o PDF, que é gerado no
 * servidor a partir do mesmo conteúdo.
 */
function Quadrante() {
  const { id: eventId = '' } = useParams();
  const theme = useTheme();
  const [baixando, setBaixando] = useState(false);

  const { data: eventData, isLoading: carregandoEvento } = useGetEvents(
    { eventId, painel: true },
    { enabled: !!eventId }
  );
  const event = eventData as EventDetails;

  const { data: teamsData = [], isLoading: carregandoEquipes } = useGetTeams(
    { eventId },
    { enabled: !!eventId }
  );

  const equipes = useMemo(
    () =>
      (teamsData as unknown as Team[]).map((equipe) => ({
        ...equipe,
        users: ordenarLideresPrimeiro(equipe.users || []),
      })),
    [teamsData]
  );

  const carregando = carregandoEvento || carregandoEquipes;

  async function baixarPdf() {
    setBaixando(true);
    try {
      const resposta = await apiClient.get(
        `/events/${eventId}/quadrante/pdf`,
        { responseType: 'blob' }
      );

      const nomeArquivo =
        /filename="(.+)"/.exec(
          resposta.headers['content-disposition'] ?? ''
        )?.[1] ?? 'quadrante.pdf';

      FileSaver.saveAs(resposta.data, nomeArquivo);
    } catch {
      toast.error('Não foi possível gerar o PDF do quadrante.');
    } finally {
      setBaixando(false);
    }
  }

  const styles = {
    barraAcoes: {
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      justifyContent: 'flex-end',
      flexWrap: 'wrap',
      gap: 2,
      mb: 2,
      p: 2,
      ...superficieSx,
    },
    equipe: { mb: 4 },
    tituloEquipe: { fontSize: 20, fontWeight: 500, mb: 1.5 },
    grade: {
      display: 'grid',
      gridTemplateColumns: {
        xs: '1fr',
        sm: 'repeat(2, 1fr)',
        lg: 'repeat(3, 1fr)',
        xl: 'repeat(4, 1fr)',
      },
      gap: 1.5,
    },
    cartao: {
      display: 'flex',
      flexDirection: 'row',
      gap: 1,
      p: 0.75,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: 1,
    },
    foto: {
      width: 60,
      height: 78,
      flexShrink: 0,
      objectFit: 'cover',
      backgroundColor: theme.palette.action.hover,
      borderRadius: 0.5,
    },
    nome: { fontSize: 14, fontWeight: 700, lineHeight: 1.3 },
    dado: { fontSize: 12, color: theme.palette.text.secondary },
  };

  return (
    <PageStyle>
      {/* Impressão: sai a folha do quadrante, não a tela. Esconder tudo e
          revelar só o bloco imprimível é o que funciona com o menu e o
          cabeçalho do painel em volta. */}
      <GlobalStyles
        styles={{
          '@media print': {
            'body *': { visibility: 'hidden' },
            '#quadrante-impressao, #quadrante-impressao *': {
              visibility: 'visible',
              color: '#000 !important',
              borderColor: '#000 !important',
            },
            '#quadrante-impressao': {
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              backgroundColor: '#fff',
            },
            '#quadrante-impressao .quadrante-grade': {
              gridTemplateColumns: 'repeat(4, 1fr) !important',
            },
            '#quadrante-impressao .quadrante-cartao': { breakInside: 'avoid' },
            '#quadrante-impressao .quadrante-titulo': { breakAfter: 'avoid' },
            '@page': { size: 'A4 landscape', margin: '10mm' },
          },
        }}
      />

      <Header
        title="Quadrante"
        description={
          event
            ? `${event.name} · ${formatarData(event.startDate)} - ${formatarData(
                event.endDate
              )}`
            : ''
        }
        buttonBack
        pageBack={`/admin/eventos/${eventId}/detalhes/equipes`}
      />

      <Paper component="div" sx={styles.barraAcoes}>
        <Button
          variant="outlined"
          startIcon={<Print />}
          onClick={() => window.print()}
          disabled={carregando || !equipes.length}
        >
          Imprimir
        </Button>
        <Button
          variant="contained"
          startIcon={<Download />}
          onClick={baixarPdf}
          disabled={carregando || baixando || !equipes.length}
        >
          {baixando ? 'Gerando PDF...' : 'Baixar PDF'}
        </Button>
      </Paper>

      {carregando ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}>
          <CircularProgress />
        </Box>
      ) : !equipes.length ? (
        <Typography sx={{ p: 4, textAlign: 'center' }}>
          Este evento ainda não possui equipes cadastradas.
        </Typography>
      ) : (
        <Box id="quadrante-impressao">
          {equipes.map((equipe) => (
            <Box key={equipe.id} sx={styles.equipe}>
              <Typography sx={styles.tituloEquipe} className="quadrante-titulo">
                {equipe.name}
              </Typography>
              <Box sx={styles.grade} className="quadrante-grade">
                {equipe.users.map((user) => (
                  <Box
                    key={user.id}
                    sx={styles.cartao}
                    className="quadrante-cartao"
                  >
                    <Box
                      component={user.profilePhotoUrl ? 'img' : 'div'}
                      src={user.profilePhotoUrl || undefined}
                      alt=""
                      sx={styles.foto}
                    />
                    <Stack justifyContent="center" minWidth={0}>
                      <Typography sx={styles.nome}>{user.fullName}</Typography>
                      <Typography sx={styles.dado}>
                        Data Nasc: {formatarData(user.birthday)}
                      </Typography>
                      <Typography sx={styles.dado}>
                        Email: {user.email}
                      </Typography>
                      <Typography sx={styles.dado}>
                        Celular: {user.cellphone}
                      </Typography>
                    </Stack>
                  </Box>
                ))}
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </PageStyle>
  );
}

export { Quadrante };
