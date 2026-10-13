import { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import {
  alpha,
  Box,
  ButtonBase,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  AccountBalanceWallet,
  ArrowForward,
  Campaign,
  Diversity3,
  Event,
  LockOutlined,
} from '@mui/icons-material';
import { Role } from '../../../../constants/roles';
import { ModuloDaIgreja } from '../../../../constants/modulos';
import { useRole } from '../../../../hooks/useRole';
import { sombraSuperficie } from '../../../../themes';
import { formatCurrency } from '../../../../utils';
import { DashboardResumo } from '../types';

interface Card {
  titulo: string;
  icone: ReactElement;
  link: string;
  cor: string;
  /** Membros não é módulo: toda igreja tem */
  modulo?: ModuloDaIgreja;
  valor: string;
  legenda: string;
}

const plural = (n: number, um: string, varios: string) =>
  `${n} ${n === 1 ? um : varios}`;

/**
 * Os módulos do sistema logo abaixo da saudação, cada um com o número que
 * resume a igreja nele. É a porta de entrada da home: a igreja não é só os
 * eventos dela.
 *
 * Módulo fora do plano aparece apagado, com cadeado, e leva a Meus planos —
 * a igreja vê o que existe e por onde conseguir. O plano vem da API
 * (`resumo.modulos`), e não do acesso de quem olha: o super admin, que alcança
 * todos os módulos, vê a igreja como ela é, e o card apagado o leva a Igrejas,
 * onde se troca o plano. Módulo que o perfil não alcança (Notícias para a
 * tesouraria) nem aparece.
 */
export function ModulosDaIgreja({
  resumo,
  churchId,
}: {
  resumo: DashboardResumo;
  /** A igreja aberta */
  churchId?: string;
}) {
  const theme = useTheme();
  const { isSuperAdmin, isAdmin, perfilNaIgreja } = useRole();
  const noPlano = (modulo: ModuloDaIgreja) => resumo.modulos.includes(modulo);
  // o plano se troca em Igrejas; Meus planos é a vitrine da própria igreja
  const ondeMudar = isSuperAdmin
    ? {
        link: '/admin/igrejas',
        texto: 'Mudar o plano',
        fora: 'Fora do plano da igreja',
      }
    : {
        link: '/admin/meus-planos',
        texto: 'Ver planos',
        fora: 'Fora do seu plano',
      };
  const adminAqui =
    isSuperAdmin ||
    (churchId ? perfilNaIgreja(churchId) === Role.ADMIN : isAdmin);

  const { membros, eventos, noticias, tesouraria } = resumo;

  const cards: Card[] = [
    {
      titulo: 'Membros',
      icone: <Diversity3 />,
      link: '/admin/membros',
      cor: theme.palette.chips.info,
      valor: String(membros.total),
      legenda:
        [
          plural(membros.familias, 'família', 'famílias'),
          membros.pedidos ? plural(membros.pedidos, 'pedido', 'pedidos') : '',
        ]
          .filter(Boolean)
          .join(' · ') || 'Nenhuma família ainda',
    },
    {
      titulo: 'Eventos',
      icone: <Event />,
      link: '/admin/eventos',
      cor: theme.palette.chips.success,
      modulo: 'EVENTS',
      valor: eventos ? plural(eventos.ativos, 'ativo', 'ativos') : '—',
      legenda: eventos
        ? `${plural(eventos.inscricoes30d, 'inscrição', 'inscrições')} em 30 dias`
        : '',
    },
    ...(adminAqui
      ? [
          {
            titulo: 'Notícias',
            icone: <Campaign />,
            link: '/admin/noticias',
            cor: theme.palette.chips.pending,
            modulo: 'NEWS' as const,
            valor: noticias
              ? plural(noticias.publicadas30d, 'publicada', 'publicadas')
              : '—',
            legenda: noticias
              ? `em 30 dias · ${plural(noticias.rascunhos, 'rascunho', 'rascunhos')}`
              : '',
          },
        ]
      : []),
    {
      titulo: 'Tesouraria',
      icone: <AccountBalanceWallet />,
      link: '/admin/tesouraria',
      cor: theme.palette.chips.alert,
      modulo: 'TREASURY',
      valor: tesouraria ? formatCurrency(tesouraria.entradasNoMes) : '—',
      legenda: tesouraria
        ? `entradas no mês · saídas ${formatCurrency(tesouraria.saidasNoMes)}`
        : '',
    },
  ];

  return (
    <Box
      component="nav"
      aria-label="Módulos da igreja"
      sx={{
        display: 'grid',
        gap: { xs: 1, sm: 1.5 },
        gridTemplateColumns: {
          xs: 'repeat(2, minmax(0, 1fr))',
          md: `repeat(${cards.length}, minmax(0, 1fr))`,
        },
      }}
    >
      {cards.map((card) => {
        const bloqueado = !!card.modulo && !noPlano(card.modulo);
        const cor = bloqueado ? theme.palette.text.disabled : card.cor;
        return (
          <ButtonBase
            key={card.titulo}
            component={Link}
            to={bloqueado ? ondeMudar.link : card.link}
            aria-label={
              bloqueado
                ? `${card.titulo}: ${ondeMudar.fora.toLowerCase()}. ${ondeMudar.texto}`
                : card.titulo
            }
            sx={{
              display: 'block',
              textAlign: 'left',
              borderRadius: 3,
              p: { xs: 1.5, sm: 2 },
              backgroundColor: theme.palette.background.paper,
              backgroundImage: bloqueado
                ? 'none'
                : `linear-gradient(160deg, ${alpha(cor, 0.12)}, transparent 70%)`,
              boxShadow: bloqueado
                ? 'none'
                : `0 0 0 1px ${alpha(cor, 0.26)}, ${sombraSuperficie(
                    theme.palette.mode === 'dark'
                  )}`,
              border: bloqueado
                ? `1px dashed ${theme.palette.divider}`
                : '1px solid transparent',
              transition: theme.transitions.create(
                ['transform', 'box-shadow'],
                { duration: theme.transitions.duration.shorter }
              ),
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: bloqueado
                  ? 'none'
                  : `0 0 0 1px ${alpha(cor, 0.4)}, 0 10px 24px -8px ${alpha(
                      cor,
                      0.35
                    )}`,
              },
              '&:hover .seta': { transform: 'translateX(3px)' },
              '&:focus-visible': {
                outline: `2px solid ${theme.palette.primary.main}`,
                outlineOffset: 2,
              },
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Box
                sx={{
                  display: 'grid',
                  placeItems: 'center',
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  color: cor,
                  backgroundColor: alpha(cor, bloqueado ? 0.08 : 0.14),
                  '& svg': { fontSize: 20 },
                }}
              >
                {card.icone}
              </Box>
              {bloqueado ? (
                <LockOutlined
                  sx={{ fontSize: 18, color: theme.palette.text.disabled }}
                />
              ) : (
                <ArrowForward
                  className="seta"
                  sx={{
                    fontSize: 18,
                    color: theme.palette.text.secondary,
                    transition: theme.transitions.create('transform'),
                  }}
                />
              )}
            </Stack>

            <Typography
              sx={{
                mt: 1.5,
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: bloqueado ? 'text.disabled' : 'text.secondary',
              }}
            >
              {card.titulo}
            </Typography>
            {bloqueado ? (
              <>
                <Typography
                  sx={{ fontSize: 15, fontWeight: 600, color: 'text.disabled' }}
                >
                  {ondeMudar.fora}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: 'primary.main', fontWeight: 600 }}
                >
                  {ondeMudar.texto}
                </Typography>
              </>
            ) : (
              <>
                <Typography
                  noWrap
                  sx={{
                    fontSize: { xs: 18, sm: 22 },
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {card.valor}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  component="div"
                >
                  {card.legenda}
                </Typography>
              </>
            )}
          </ButtonBase>
        );
      })}
    </Box>
  );
}
