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
import { AZUL_VIVO, VIOLETA_VIVO } from '../../../../themes';
import { primeiroNome, saudacaoDoDia } from '../../../events/utils';
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
 *
 * O desenho é o mesmo da faixa da área do inscrito, peça por peça: o painel e
 * a área do usuário são o mesmo sistema visto por duas portas, e a faixa é a
 * primeira coisa que cada uma mostra.
 */
function Hero({ churches, role }: HeroProps) {
  const theme = useTheme();
  const { user } = useUser();

  const escuro = theme.palette.mode === 'dark';
  const corDoTom = escuro ? theme.palette.primary.main : AZUL_VIVO;
  const saudacao = saudacaoDoDia();

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

  const styles = {
    /**
     * O azul entra pela esquerda, o violeta cruza o meio e a luz sai pela
     * direita — o mesmo par de cores dos botões e do cartaz em destaque.
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
     * impressa onde antes havia um degradê liso e nada mais.
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
  };

  return (
    <Paper sx={styles.faixa}>
      {/* brilhos e textura: profundidade sem imagem, do mesmo jeito dos cards
          de status */}
      <Box sx={styles.brilhoDireito} />
      <Box sx={styles.brilhoEsquerdo} />
      <Box sx={styles.textura} />

      <Stack
        direction="row"
        alignItems="center"
        gap={2}
        sx={{ position: 'relative', minWidth: 0 }}
      >
        <RoleBadge role={role}>
          <Box sx={styles.anelDoAvatar}>
            <UserAvatar
              name={nomeCompleto}
              photoUrl={user?.profilePhotoUrl || doStorage?.profilePhotoUrl}
              sx={styles.avatar}
            />
          </Box>
        </RoleBadge>

        <Box sx={{ minWidth: 0 }}>
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

          {carregando ? (
            <Skeleton
              variant="text"
              width={280}
              sx={{ fontSize: '0.875rem', mt: 0.25 }}
            />
          ) : (
            <Typography
              sx={{ mt: 0.25, fontSize: '0.875rem', color: 'text.secondary' }}
            >
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
