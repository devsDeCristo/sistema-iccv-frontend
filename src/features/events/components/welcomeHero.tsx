import {
  alpha,
  Box,
  Button,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { ConfirmationNumberOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { UserAvatar } from '../../../components/userAvatar';
import { useUser } from '../../../contexts/userContext';
import { useGetEvents } from '../../admin/events/api/getEvents';
import { eventosAbertos, primeiroNome, saudacao } from '../utils';

/**
 * Explica em uma frase quantos eventos estão de inscrição aberta, para a pessoa
 * saber o que esperar antes de olhar a lista.
 */
function convite(quantidade: number, carregando: boolean) {
  if (carregando) return 'Só um instante, estamos buscando os eventos abertos…';

  if (quantidade === 0) {
    return 'Não há inscrições abertas neste momento. Assim que um evento novo abrir, ele aparece aqui.';
  }

  if (quantidade === 1) {
    return 'Um evento está com inscrições abertas. Confira os detalhes e garanta sua vaga.';
  }

  return `${quantidade} eventos estão com inscrições abertas. Escolha um para ver os detalhes e garantir sua vaga.`;
}

/**
 * Boas-vindas da tela de eventos, a primeira coisa que o inscrito vê ao entrar.
 *
 * Superfície como o resto do sistema, com a foto e o nome de quem entrou: é o
 * que faz a tela receber a pessoa em vez de só informar. O atalho para as
 * inscrições fica aqui porque antes só existia no menu.
 *
 * A consulta de eventos é a mesma da lista (mesma chave no react-query), então o
 * contador não custa uma segunda ida ao servidor.
 */
function WelcomeHero() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useUser();
  const { data, isLoading } = useGetEvents({});

  // o contexto só é preenchido depois do loader da rota; no primeiro quadro os
  // dados vêm do storage para a saudação não piscar sem nome
  const doStorage = JSON.parse(localStorage.getItem('user') || '{}');
  const nomeCompleto = user?.fullName || doStorage?.fullName || '';
  const nome = primeiroNome(nomeCompleto);

  return (
    <Paper
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        p: { xs: 2, md: 3 },
        // `backgroundImage`, e não `background`: o shorthand apagaria a cor de
        // fundo do Paper e a faixa ficaria sem superfície nenhuma
        backgroundImage: `linear-gradient(120deg, ${alpha(
          theme.palette.primary.main,
          theme.palette.mode === 'dark' ? 0.16 : 0.08
        )}, transparent 62%)`,
      }}
    >
      {/* brilho no canto: profundidade sem imagem, do mesmo jeito dos cards de
          status do admin */}
      <Box
        sx={{
          position: 'absolute',
          top: -110,
          right: -70,
          width: 260,
          height: 260,
          borderRadius: '50%',
          pointerEvents: 'none',
          backgroundImage: `radial-gradient(circle, ${alpha(
            theme.palette.primary.main,
            theme.palette.mode === 'dark' ? 0.2 : 0.12
          )}, transparent 70%)`,
        }}
      />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        gap={2}
        sx={{ position: 'relative' }}
      >
        <Stack direction="row" alignItems="center" gap={2} sx={{ minWidth: 0 }}>
          <UserAvatar
            name={nomeCompleto}
            photoUrl={user?.profilePhotoUrl || doStorage?.profilePhotoUrl}
            sx={{ width: 52, height: 52, flexShrink: 0 }}
          />

          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: { xs: 20, md: 24 },
                fontWeight: 600,
                lineHeight: 1.2,
              }}
            >
              {saudacao()}
              {nome ? `, ${nome}` : ''}
            </Typography>
            <Typography
              sx={{
                mt: 0.5,
                maxWidth: 620,
                fontSize: '0.9375rem',
                color: 'text.secondary',
              }}
            >
              {convite(eventosAbertos(data).length, isLoading)}
            </Typography>
          </Box>
        </Stack>

        <Button
          variant="outlined"
          startIcon={<ConfirmationNumberOutlined />}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
          onClick={() => navigate('/minhasInscricoes')}
        >
          Minhas inscrições
        </Button>
      </Stack>
    </Paper>
  );
}

export { WelcomeHero };
