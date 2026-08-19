import { useEffect, useLayoutEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Avatar, Box, Chip, Stack, Typography } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import Logo from '../../../../assets/logo-ic.svg?react';
import { Form } from '../../users/components/form';
import { useGetUsers } from '../../users/api/getUsers';
import { userToFormValues } from '../../users/utils';
import { myTheme } from '../../../../themes';
import { RegisterUsersFormType, User } from '../../../../types/user';
import { CheckinParticipant } from '../types';

interface ParticipantDisplayProps {
  /** Quem está sendo atendido; sem ninguém, a tela fica em repouso */
  participant: CheckinParticipant | null;
  /** Webcam aberta: o participante vê a câmera no lugar dos dados */
  capturing: boolean;
  /** Stream ao vivo da webcam do posto */
  stream: MediaStream | null;
  /** Foto congelada, entre o "Capturar" e o "Usar foto" */
  captured: File | null;
  /** Foto já escolhida no atendimento e ainda não salva */
  pendingPhotoUrl?: string | null;
}

/** Esta janela é do participante, não do operador: clara sempre. */
const TEMA = myTheme(false);

const TAMANHO_BASE = 18;
const TAMANHO_MINIMO = 9;
const TAMANHO_MAXIMO = 44;

/**
 * Ajusta a fonte da raiz até a ficha inteira caber na janela.
 *
 * O MUI dimensiona tudo em rem, então mexer na raiz aumenta ou diminui a tela
 * de uma vez — em monitor grande os dados crescem, em janela apertada encolhem.
 * Rolagem não resolveria: o participante não tem mouse, e o que ficar abaixo da
 * dobra ele simplesmente não confere.
 *
 * `area` é o espaço que sobrou na janela e `ficha` é o conteúdo medido solto; a
 * razão entre os dois diz o quanto falta ou sobra. Cada passo mexe também na
 * altura do cabeçalho, por isso a medida é refeita até assentar.
 */
function useEscalaQueCabe(
  area: HTMLElement | null,
  ficha: HTMLElement | null,
  dependencias: unknown[]
) {
  useLayoutEffect(() => {
    const raiz = (area || ficha)?.ownerDocument.documentElement;
    const janela = raiz?.ownerDocument.defaultView;
    if (!raiz || !janela) return;

    if (!area || !ficha) {
      raiz.style.fontSize = `${TAMANHO_BASE}px`;
      return;
    }

    const ajustar = () => {
      let tamanho = TAMANHO_BASE;
      raiz.style.fontSize = `${tamanho}px`;

      for (let passo = 0; passo < 8; passo += 1) {
        const necessario = ficha.offsetHeight;
        if (!necessario) break;

        const razao = area.clientHeight / necessario;
        // faixa estreita: parar cedo demais deixa altura sobrando sem uso
        if (razao > 0.99 && razao < 1.015) break;

        // a folga de 0,5% evita ficar oscilando em volta do ponto exato
        const proximo = Math.min(
          TAMANHO_MAXIMO,
          Math.max(TAMANHO_MINIMO, tamanho * razao * 0.995)
        );
        if (Math.abs(proximo - tamanho) < 0.1) break;

        tamanho = proximo;
        raiz.style.fontSize = `${tamanho}px`;
      }
    };

    ajustar();
    // as métricas mudam quando a fonte termina de carregar
    const quadro = janela.requestAnimationFrame(ajustar);
    janela.addEventListener('resize', ajustar);

    return () => {
      janela.cancelAnimationFrame(quadro);
      janela.removeEventListener('resize', ajustar);
    };
  }, [area, ficha, ...dependencias]);
}

function ParticipantDisplay({
  participant,
  capturing,
  stream,
  captured,
  pendingPhotoUrl,
}: ParticipantDisplayProps) {
  const [capturaUrl, setCapturaUrl] = useState<string | null>(null);
  const [video, setVideo] = useState<HTMLVideoElement | null>(null);
  const [area, setArea] = useState<HTMLElement | null>(null);
  const [ficha, setFicha] = useState<HTMLElement | null>(null);

  // os mesmos dados da tela de detalhes; o posto já consultou, então o
  // react-query devolve do cache e atualiza sozinho quando algo é corrigido
  const { data } = useGetUsers(
    { userId: participant?.userId || '' },
    { enabled: !!participant?.userId }
  );
  const usuario = data as User | undefined;

  const methods = useForm<RegisterUsersFormType>({
    defaultValues: userToFormValues(usuario),
  });

  useEffect(() => {
    methods.reset(userToFormValues(usuario));
  }, [usuario]);

  useEscalaQueCabe(area, ficha, [usuario, participant?.userId]);

  useEffect(() => {
    if (!captured) {
      setCapturaUrl(null);
      return;
    }

    const url = URL.createObjectURL(captured);
    setCapturaUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [captured]);

  // srcObject não existe como atributo: só dá para atribuir pelo elemento
  useEffect(() => {
    if (video) video.srcObject = stream;
  }, [video, stream]);

  const moldura = (conteudo: React.ReactNode) => (
    <ThemeProvider theme={TEMA}>
      {/* nada de rolagem: o que não couber é reduzido, não escondido */}
      <Stack sx={{ height: '100vh', overflow: 'hidden', bgcolor: '#fff' }}>
        {conteudo}
      </Stack>
    </ThemeProvider>
  );

  if (!participant) {
    return moldura(
      <Stack flex={1} alignItems="center" justifyContent="center" spacing={5}>
        <Logo style={{ width: 130, height: 'auto', opacity: 0.85 }} />
        <Typography variant="h5" color="text.secondary">
          Aguardando o próximo participante
        </Typography>
      </Stack>
    );
  }

  const cabecalho = (titulo: string) => (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      spacing={3}
      sx={{ px: 2, py: 1, borderBottom: 1, borderColor: 'divider' }}
    >
      <Logo style={{ width: 30, height: 'auto' }} />
      <Typography
        variant="h6"
        color="text.secondary"
        sx={{ letterSpacing: 3, textTransform: 'uppercase' }}
      >
        {titulo}
      </Typography>
    </Stack>
  );

  if (capturing) {
    return moldura(
      <>
        {cabecalho('Foto do crachá')}
        <Stack
          flex={1}
          minHeight={0}
          alignItems="center"
          justifyContent="center"
          spacing={3}
          sx={{ p: 3, bgcolor: 'background.default' }}
        >
          {capturaUrl ? (
            <Box
              component="img"
              src={capturaUrl}
              alt="Foto capturada"
              sx={{ minHeight: 0, maxWidth: '100%', borderRadius: 3 }}
            />
          ) : stream ? (
            <Box
              component="video"
              ref={setVideo}
              autoPlay
              playsInline
              muted
              sx={{
                minHeight: 0,
                maxWidth: '100%',
                borderRadius: 3,
                bgcolor: '#000',
              }}
            />
          ) : (
            <Typography variant="h5" color="text.secondary">
              Preparando a câmera…
            </Typography>
          )}
          <Typography variant="h4" color="primary" fontWeight={600}>
            {capturaUrl ? 'Ficou boa?' : 'Olhe para a câmera'}
          </Typography>
        </Stack>
      </>
    );
  }

  return moldura(
    <>
      {cabecalho('Confira seus dados')}

      {/* a área é o espaço disponível; a ficha dentro dela é medida solta */}
      <Box ref={setArea} sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Box ref={setFicha}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={3}
            sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            {/* em rem, como o resto: uma foto de tamanho fixo travaria o
                quanto a ficha consegue encolher */}
            <Avatar
              variant="rounded"
              alt={participant.fullName}
              src={pendingPhotoUrl || usuario?.profilePhotoUrl || undefined}
              sx={{ width: '7rem', height: '7rem', my: 1.5 }}
            />
            <Stack spacing={1} sx={{ minWidth: 0 }}>
              <Typography variant="h3" fontWeight={700} lineHeight={1.1}>
                {participant.fullName}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={`Inscrição nº ${participant.registrationNumber}`} />
                {participant.bedroom && (
                  <Chip label={`Quarto ${participant.bedroom}`} />
                )}
                {participant.teams.map((team) => (
                  <Chip key={team.name} label={team.name} variant="outlined" />
                ))}
              </Stack>
            </Stack>
          </Stack>

          <Box sx={{ p: 2 }}>
            <FormProvider {...methods}>
              <Form readOnly />
            </FormProvider>
          </Box>
        </Box>
      </Box>

      <Typography
        variant="h6"
        color="text.secondary"
        sx={{ px: 2, py: 1, borderTop: 1, borderColor: 'divider' }}
        textAlign="center"
      >
        Algum dado está errado? Avise o atendente antes da foto.
      </Typography>
    </>
  );
}

export { ParticipantDisplay };
