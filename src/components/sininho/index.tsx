import { useEffect, useRef, useState } from 'react';
import {
  alpha,
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  useTheme,
} from '@mui/material';
import { NotificationsNone } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Notificacao,
  TipoDeNotificacao,
  useMarcarLidas,
  useNaoLidas,
  useNotificacoes,
} from '../../features/notificacoes/api';
import { useIgrejaEscolhida } from '../../hooks/useIgrejaEscolhida';
import {
  ChaveDoModulo,
  CORES_DO_MODULO,
  ICONE_DO_MODULO,
} from '../../constants/identidadeDosModulos';

/**
 * De qual módulo é cada aviso (o ícone e a cor vêm dele), para onde leva, e
 * se troca a igreja do painel — só os avisos de quem administra.
 */
const DESTINO: Record<
  TipoDeNotificacao,
  {
    modulo: ChaveDoModulo;
    rota: (n: Notificacao) => string;
    doPainel?: boolean;
  }
> = {
  MEMBERSHIP_REQUEST: {
    modulo: 'membros',
    rota: () => '/admin/membros?aba=pedidos',
    doPainel: true,
  },
  MEMBERSHIP_ANSWERED: { modulo: 'membros', rota: () => '/home' },
  CHURCH_REQUEST: {
    modulo: 'solicitacoes',
    rota: () => '/admin/solicitacoes',
    doPainel: true,
  },
  CHURCH_REQUEST_ANSWERED: {
    modulo: 'solicitacoes',
    rota: () => '/solicitacoes',
  },
  // a vez do pastor ou da tesouraria: abre o painel na igreja da solicitação
  CHURCH_REQUEST_AWAITING: {
    modulo: 'solicitacoes',
    rota: () => '/admin/solicitacoes',
    doPainel: true,
  },
  NEWS: { modulo: 'noticias', rota: () => '/home' },
  EVENT: { modulo: 'eventos', rota: (n) => `/eventos/${n.origemId}` },
};

/**
 * O sininho da barra: o número é o das não lidas, e a lista só vem com ele
 * aberto. Abrir não lê nada; clicar numa notificação marca só ela, e "Marcar
 * todas" lê todas as não lidas.
 */
export function Sininho() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const aberto = Boolean(anchorEl);
  const { data: naoLidas = 0 } = useNaoLidas();
  const { data: itens, isLoading } = useNotificacoes(aberto);
  const marcarLidas = useMarcarLidas();
  const [, setIgreja] = useIgrejaEscolhida();
  const navigate = useNavigate();
  const theme = useTheme();
  const tom = theme.palette.mode === 'dark' ? 'escuro' : 'claro';

  // o sino balança quando chega aviso novo (o número sobe), não a cada consulta
  const antes = useRef(naoLidas);
  const [tocando, setTocando] = useState(false);
  useEffect(() => {
    if (naoLidas > antes.current) setTocando(true);
    antes.current = naoLidas;
  }, [naoLidas]);

  const fechar = () => setAnchorEl(null);
  const ir = (n: Notificacao) => {
    const destino = DESTINO[n.tipo];
    if (!n.lida) marcarLidas.mutate([n.id]);
    // o pedido é de uma igreja: o seletor do painel vai para ela
    if (destino.doPainel && n.churchId) setIgreja(n.churchId);
    navigate(destino.rota(n));
    fechar();
  };

  return (
    <>
      <IconButton
        size="small"
        aria-label={
          naoLidas ? `Notificações, ${naoLidas} não lidas` : 'Notificações'
        }
        aria-haspopup="true"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        sx={{
          color: '#fff',
          '&:hover': { backgroundColor: alpha('#fff', 0.16) },
          // preso no alto, como um sino de verdade
          '@keyframes balancarSino': {
            '0%, 100%': { transform: 'rotate(0)' },
            '15%': { transform: 'rotate(14deg)' },
            '30%': { transform: 'rotate(-12deg)' },
            '45%': { transform: 'rotate(8deg)' },
            '60%': { transform: 'rotate(-5deg)' },
            '75%': { transform: 'rotate(2deg)' },
          },
          '&:hover .sino': { animation: 'balancarSino .7s ease-in-out' },
          '@media (prefers-reduced-motion: reduce)': {
            '& .sino, &:hover .sino': { animation: 'none' },
          },
        }}
      >
        <Badge
          badgeContent={naoLidas}
          color="error"
          max={99}
          // o padrão do MUI (20px) cobria metade do sino de 22px; e, no canto
          // do ícone, a bolinha saía acima dele: desce para encostar no sino
          sx={{
            '& .MuiBadge-badge': {
              height: 15,
              minWidth: 15,
              px: 0.5,
              fontSize: 10,
              fontWeight: 700,
              top: 2,
            },
          }}
        >
          <NotificationsNone
            className="sino"
            onAnimationEnd={() => setTocando(false)}
            sx={{
              fontSize: 22,
              transformOrigin: '50% 8%',
              ...(tocando && { animation: 'balancarSino .9s ease-in-out' }),
            }}
          />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={aberto}
        onClose={fechar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 380,
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: 480,
            borderRadius: 3,
          },
        }}
      >
        <Box
          sx={{
            px: 2,
            py: 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography sx={{ fontWeight: 700 }}>Notificações</Typography>
          {naoLidas > 0 && (
            <Button
              size="small"
              disabled={marcarLidas.isLoading}
              onClick={() => marcarLidas.mutate(undefined)}
            >
              Marcar todas como lidas
            </Button>
          )}
        </Box>
        <Divider />
        {isLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        {!isLoading && !itens?.length && (
          <Typography sx={{ px: 2, py: 3, color: 'text.secondary' }}>
            Nenhum aviso por aqui.
          </Typography>
        )}
        {itens?.map((n) => {
          const { modulo } = DESTINO[n.tipo];
          const cores = CORES_DO_MODULO[modulo][tom];
          const Icone = ICONE_DO_MODULO[modulo];
          return (
            <MenuItem
              key={n.id}
              onClick={() => ir(n)}
              sx={{ alignItems: 'flex-start', whiteSpace: 'normal', py: 1.25 }}
            >
              <Box
                sx={{
                  flexShrink: 0,
                  width: 36,
                  height: 36,
                  mr: 1.5,
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  color: cores.secundaria,
                  bgcolor: alpha(cores.secundaria, 0.14),
                }}
              >
                <Icone fontSize="small" />
              </Box>
              <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                <Typography
                  sx={{ fontSize: 14, fontWeight: n.lida ? 500 : 700 }}
                >
                  {n.titulo}
                </Typography>
                <Typography
                  sx={{ fontSize: 13, color: 'text.secondary' }}
                  noWrap
                >
                  {n.texto}
                </Typography>
                <Typography
                  component="time"
                  dateTime={n.data}
                  title={new Date(n.data).toLocaleString('pt-BR')}
                  sx={{ fontSize: 12, color: 'text.secondary' }}
                >
                  {formatDistanceToNow(new Date(n.data), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </Typography>
              </Box>
              {!n.lida && (
                <Box
                  aria-label="Não lida"
                  sx={{
                    flexShrink: 0,
                    width: 8,
                    height: 8,
                    mt: 0.75,
                    ml: 1,
                    borderRadius: '50%',
                    bgcolor: cores.terciaria,
                  }}
                />
              )}
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
