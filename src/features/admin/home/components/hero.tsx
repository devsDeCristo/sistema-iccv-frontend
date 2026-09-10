import {
  alpha,
  Box,
  Chip,
  Paper,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { ChurchOutlined, PublicOutlined } from '@mui/icons-material';
import { UserAvatar } from '../../../../components/userAvatar';
import { useUser } from '../../../../contexts/userContext';
import { AZUL_VIVO, degradeVivo } from '../../../../themes';
import { primeiroNome } from '../../../events/utils';
import { ROLE_LABELS } from '../../../../constants/roles';
import { DashboardChurch } from '../types';

interface HeroProps {
  /** `null` é super admin/dev (nenhuma igreja própria); ausente é carregando */
  churches?: DashboardChurch[] | null;
}

/**
 * Faixa de abertura: quem entrou e por qual igreja ele responde.
 *
 * Só contexto. Os números ficam abaixo, dentro do evento a que pertencem — a
 * faixa que também contava inscritos e dinheiro dava um resumo que não era de
 * nada em particular.
 */
function Hero({ churches }: HeroProps) {
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
   * `churches` ausente e `churches` nulo diziam a mesma coisa aqui, e um admin
   * via "todas as igrejas" piscar antes do nome da igreja dele aparecer.
   */
  const carregando = churches === undefined;
  const todasAsIgrejas = churches === null;

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
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        gap={2}
        sx={{ position: 'relative' }}
      >
        <Stack direction="row" alignItems="center" gap={2} sx={{ minWidth: 0 }}>
          <UserAvatar
            name={nomeCompleto}
            photoUrl={user?.profilePhotoUrl || doStorage?.profilePhotoUrl}
            sx={{ width: 46, height: 46, flexShrink: 0 }}
          />

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
            <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
              {carregando
                ? 'Montando o resumo do painel…'
                : todasAsIgrejas
                  ? 'Você acompanha todas as igrejas do sistema.'
                  : 'Aqui está como andam os eventos da sua igreja.'}
            </Typography>
          </Box>
        </Stack>

        <Stack
          gap={0.75}
          alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
          sx={{ flexShrink: 0, maxWidth: '100%' }}
        >
          <Typography
            sx={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              color: 'text.secondary',
            }}
          >
            {carregando || todasAsIgrejas ? 'Alcance' : 'Sua igreja'}
          </Typography>

          {carregando ? (
            <Skeleton variant="rounded" width={180} height={32} />
          ) : todasAsIgrejas ? (
            <Chip
              icon={<PublicOutlined sx={{ fontSize: 18 }} />}
              label="Todas as igrejas"
              sx={{
                fontWeight: 600,
                bgcolor: alpha(corDoTom, 0.14),
                color: 'text.primary',
              }}
            />
          ) : (
            <Stack
              direction="row"
              gap={1}
              flexWrap="wrap"
              justifyContent={{ xs: 'flex-start', sm: 'flex-end' }}
            >
              {churches.length === 0 && (
                // admin sem vínculo: o backend fecha o recorte e a tela chega
                // vazia — dizer isso é melhor do que uma faixa sem etiqueta
                <Chip
                  variant="outlined"
                  label="Nenhuma igreja vinculada"
                  sx={{ fontWeight: 600 }}
                />
              )}

              {churches.map((igreja) => (
                <Chip
                  key={igreja.id}
                  icon={<ChurchOutlined sx={{ fontSize: 18 }} />}
                  label={
                    // quem é admin de uma e financeiro de outra precisa ver os
                    // dois chapéus; com uma igreja só o perfil já está na barra
                    // do topo e o nome basta
                    churches.length > 1 && igreja.role !== null
                      ? `${igreja.name} · ${ROLE_LABELS[igreja.role]}`
                      : igreja.name
                  }
                  sx={{
                    fontWeight: 600,
                    maxWidth: 320,
                    bgcolor: alpha(corDoTom, 0.14),
                    color: 'text.primary',
                  }}
                />
              ))}
            </Stack>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}

export { Hero };
