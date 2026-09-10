import {
  alpha,
  Box,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { UserAvatar } from '../../../../components/userAvatar';
import { useUser } from '../../../../contexts/userContext';
import { AZUL_VIVO, degradeVivo } from '../../../../themes';
import { primeiroNome } from '../../../events/utils';
import { DashboardChurch } from '../types';
import { apresentacao } from '../utils';
import { RoleBadge } from './roleBadge';

interface HeroProps {
  /** `null` é super admin/dev (nenhuma igreja própria); ausente é carregando */
  churches?: DashboardChurch[] | null;
  /**
   * Perfil efetivo de quem entrou. Vem da API, e não do storage: o vínculo
   * pode ter mudado desde o login, e a saudação não é lugar de mostrar um
   * cargo vencido.
   */
  role?: number | null;
}

/**
 * Faixa de abertura: quem entrou, com que cargo e por qual igreja responde.
 *
 * Dito por extenso, numa frase, e não em etiquetas soltas — é a primeira coisa
 * que a tela fala, e deve se ler como alguém falando. A etiqueta da igreja que
 * ficava à direita saiu junto: a frase já diz o nome dela, e repetir a mesma
 * informação em dois lugares da mesma faixa não a torna mais clara.
 */
function Hero({ churches, role }: HeroProps) {
  const theme = useTheme();
  const { user } = useUser();

  const escuro = theme.palette.mode === 'dark';
  const corDoTom = escuro ? theme.palette.primary.main : AZUL_VIVO;

  // o contexto só é preenchido depois do loader da rota; no primeiro quadro os
  // dados vêm do storage para a saudação não piscar sem nome
  const doStorage = JSON.parse(localStorage.getItem('user') || '{}');
  const nomeCompleto = user?.fullName || doStorage?.fullName || '';
  const nome = primeiroNome(nomeCompleto);

  /**
   * `churches` ausente é "ainda carregando"; `null` é super admin/dev, que não
   * têm igreja própria. Tratar os dois igual fazia um admin ver "todas as
   * igrejas" piscar antes do nome da dele aparecer.
   */
  const carregando = churches === undefined;
  const frase = apresentacao(role, churches);

  return (
    <Paper
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        px: { xs: 2, md: 3 },
        py: { xs: 2, md: 2.5 },
        backgroundImage: degradeVivo(escuro, 120, 0.7),
      }}
    >
      {/* brilho no canto: profundidade sem imagem, igual à faixa da área do
          inscrito e aos cards de status */}
      <Box
        sx={{
          position: 'absolute',
          top: -110,
          right: -70,
          width: 240,
          height: 240,
          borderRadius: '50%',
          pointerEvents: 'none',
          backgroundImage: `radial-gradient(circle, ${alpha(
            corDoTom,
            escuro ? 0.2 : 0.18
          )}, transparent 70%)`,
        }}
      />

      <Stack
        direction="row"
        alignItems="center"
        gap={2}
        sx={{ position: 'relative', minWidth: 0 }}
      >
        <RoleBadge role={role}>
          <UserAvatar
            name={nomeCompleto}
            photoUrl={user?.profilePhotoUrl || doStorage?.profilePhotoUrl}
            sx={{ width: 52, height: 52, flexShrink: 0 }}
          />
        </RoleBadge>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: { xs: 19, md: 22 },
              fontWeight: 600,
              lineHeight: 1.2,
            }}
          >
            Olá{nome ? `, ${nome}` : ''}!
          </Typography>

          {carregando ? (
            <Skeleton
              variant="text"
              width={280}
              sx={{ fontSize: '0.9375rem' }}
            />
          ) : (
            <Typography sx={{ fontSize: '0.9375rem', color: 'text.secondary' }}>
              {frase
                ? frase.map((trecho, indice) =>
                    trecho.forte ? (
                      <Box
                        key={indice}
                        component="span"
                        sx={{ fontWeight: 700, color: 'text.primary' }}
                      >
                        {trecho.texto}
                      </Box>
                    ) : (
                      trecho.texto
                    )
                  )
                : 'Bem-vindo ao painel.'}
            </Typography>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}

export { Hero };
