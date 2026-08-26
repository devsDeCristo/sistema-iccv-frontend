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
import { AZUL_VIVO, degradeVivo } from '../../../themes';
import { primeiroNome } from '../utils';

/**
 * Faixa de boas-vindas da tela de eventos.
 *
 * Aqui é só acolhimento: a foto e o nome de quem entrou e a recepção da casa.
 * Nada de contagem de evento ou aviso de inscrição — isso é assunto da lista,
 * logo abaixo, e das notícias, ao lado.
 */
function WelcomeHero() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useUser();

  // o contexto só é preenchido depois do loader da rota; no primeiro quadro os
  // dados vêm do storage para a saudação não piscar sem nome
  const escuro = theme.palette.mode === 'dark';
  const corDoTom = escuro ? theme.palette.primary.main : AZUL_VIVO;

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
        backgroundImage: degradeVivo(escuro, 120),
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
            corDoTom,
            escuro ? 0.22 : 0.2
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
              Bem-vindo de volta{nome ? `, ${nome}` : ''}!
            </Typography>
            <Typography
              sx={{
                mt: 0.5,
                maxWidth: 620,
                fontSize: '0.9375rem',
                color: 'text.secondary',
              }}
            >
              É um prazer receber você novamente! Abaixo você pode ver os dados
              dos eventos.
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
