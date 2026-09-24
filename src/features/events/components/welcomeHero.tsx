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
import { AZUL_VIVO, VIOLETA_VIVO } from '../../../themes';
import { primeiroNome, saudacaoDoDia } from '../utils';

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
  const saudacao = saudacaoDoDia();

  const styles = {
    /**
     * A faixa é a primeira coisa da página, e estava mais apagada que os
     * cartazes logo abaixo. O tingimento subiu de tom e virou composição: o
     * azul entra pela esquerda, o violeta cruza o meio, e a luz sai pela
     * direita. É o mesmo par de cores dos botões e do cartaz em destaque.
     *
     * No tema escuro tudo entra por volta da metade da intensidade — cor viva
     * sobre fundo quase preto acende em vez de tingir, e a faixa virava neon.
     * Vale para o degradê, as duas luzes, a borda e as sombras coloridas.
     */
    faixa: {
      position: 'relative',
      overflow: 'hidden',
      borderRadius: 3,
      p: { xs: 2, md: 2.5 },
      backgroundImage: `linear-gradient(115deg, ${alpha(
        AZUL_VIVO,
        escuro ? 0.16 : 0.2
      )} 0%, ${alpha(VIOLETA_VIVO, escuro ? 0.1 : 0.14)} 42%, transparent 78%)`,
      border: `1px solid ${alpha(corDoTom, escuro ? 0.16 : 0.18)}`,
      boxShadow: `0 18px 40px -28px ${alpha(AZUL_VIVO, escuro ? 0.45 : 0.6)}`,
    },
    /** duas luzes em cantos opostos: a faixa deixa de ter um lado só */
    brilhoDireito: {
      position: 'absolute',
      top: -140,
      right: -80,
      width: 300,
      height: 300,
      borderRadius: '50%',
      pointerEvents: 'none',
      backgroundImage: `radial-gradient(circle, ${alpha(
        corDoTom,
        escuro ? 0.16 : 0.26
      )}, transparent 70%)`,
    },
    brilhoEsquerdo: {
      position: 'absolute',
      bottom: -160,
      left: -60,
      width: 260,
      height: 260,
      borderRadius: '50%',
      pointerEvents: 'none',
      backgroundImage: `radial-gradient(circle, ${alpha(
        VIOLETA_VIVO,
        escuro ? 0.12 : 0.18
      )}, transparent 70%)`,
    },
    /**
     * Listras finas na diagonal, quase invisíveis. Dão textura de superfície
     * impressa onde antes havia um degradê liso e nada mais — é o que tira a
     * faixa da cara de caixa vazia sem escrever nada nela.
     */
    textura: {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      opacity: escuro ? 0.5 : 0.7,
      backgroundImage: `repeating-linear-gradient(115deg, ${alpha(
        theme.palette.text.primary,
        0.03
      )} 0 2px, transparent 2px 12px)`,
    },
    /** o anel de cor destaca a foto sem moldura dura em volta dela */
    anelDoAvatar: {
      p: '3px',
      borderRadius: '50%',
      flexShrink: 0,
      display: 'flex',
      backgroundImage: `linear-gradient(135deg, ${AZUL_VIVO}, ${VIOLETA_VIVO})`,
      boxShadow: `0 8px 20px -10px ${alpha(AZUL_VIVO, escuro ? 0.45 : 0.9)}`,
    },
    avatar: {
      width: 46,
      height: 46,
      border: `2px solid ${theme.palette.background.paper}`,
    },
    saudacao: {
      fontSize: { xs: 19, md: 23 },
      fontWeight: 700,
      letterSpacing: '-0.02em',
      lineHeight: 1.15,
    },
    /**
     * Só o nome recebe o degradê, com o recorte no texto: a saudação inteira
     * colorida viraria enfeite, e o nome é o que a pessoa procura na frase.
     */
    nomeEmCor: {
      backgroundImage: `linear-gradient(120deg, ${AZUL_VIVO}, ${VIOLETA_VIVO})`,
      WebkitBackgroundClip: 'text',
      backgroundClip: 'text',
      color: 'transparent',
    },
    /** o mesmo botão de ação principal da página do evento e do cartaz */
    botao: {
      flexShrink: 0,
      height: 38,
      px: 2.5,
      borderRadius: 999,
      textTransform: 'none',
      fontWeight: 600,
      color: '#fff',
      whiteSpace: 'nowrap',
      backgroundImage: `linear-gradient(120deg, ${AZUL_VIVO}, ${VIOLETA_VIVO})`,
      boxShadow: `0 12px 28px -12px ${alpha(AZUL_VIVO, escuro ? 0.5 : 0.95)}`,
      transition: theme.transitions.create(['transform', 'box-shadow'], {
        duration: 220,
      }),
      '&:hover, &:focus-visible': {
        transform: 'scale(1.035)',
        boxShadow: `0 16px 34px -12px ${alpha(VIOLETA_VIVO, escuro ? 0.6 : 1)}`,
      },
    },
  };

  return (
    <Paper sx={styles.faixa}>
      {/* brilhos e textura: profundidade sem imagem, do mesmo jeito dos cards
          de status do admin */}
      <Box sx={styles.brilhoDireito} />
      <Box sx={styles.brilhoEsquerdo} />
      <Box sx={styles.textura} />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        gap={2}
        sx={{ position: 'relative' }}
      >
        <Stack direction="row" alignItems="center" gap={2} sx={{ minWidth: 0 }}>
          <Box sx={styles.anelDoAvatar}>
            <UserAvatar
              name={nomeCompleto}
              photoUrl={user?.profilePhotoUrl || doStorage?.profilePhotoUrl}
              sx={styles.avatar}
            />
          </Box>

          <Box sx={{ minWidth: 0 }}>
            {/* a hora do dia abre a frase, no lugar do "bem-vindo de volta":
              é como se cumprimenta alguém que chega, e o prazer de receber
              continua dito na linha de baixo */}
            <Typography sx={styles.saudacao}>
              {saudacao}
              {nome ? (
                <>
                  ,{' '}
                  <Box component="span" sx={styles.nomeEmCor}>
                    {nome}
                  </Box>
                </>
              ) : (
                ''
              )}
              !
            </Typography>
            <Typography
              sx={{
                mt: 0.25,
                maxWidth: 620,
                fontSize: '0.875rem',
                color: 'text.secondary',
              }}
            >
              É um prazer receber você novamente! Abaixo você pode ver os dados
              dos eventos.
            </Typography>
          </Box>
        </Stack>

        <Button
          startIcon={<ConfirmationNumberOutlined />}
          sx={styles.botao}
          onClick={() => navigate('/minhasInscricoes')}
        >
          Minhas inscrições
        </Button>
      </Stack>
    </Paper>
  );
}

export { WelcomeHero };
