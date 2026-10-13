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
  ArrowOutward,
  Campaign,
  Diversity3,
  Event,
  LockOutlined,
} from '@mui/icons-material';
import { Role } from '../../../../constants/roles';
import { ModuloDaIgreja } from '../../../../constants/modulos';
import { useRole } from '../../../../hooks/useRole';
import { DashboardResumo } from '../types';

interface Modulo {
  nome: string;
  descricao: string;
  icone: ReactElement;
  cor: string;
  link: string;
  /** Membros não depende de plano: toda igreja tem */
  modulo?: ModuloDaIgreja;
}

/**
 * A apresentação dos módulos do sistema, logo abaixo da saudação: o que existe
 * e para que serve, um tile por módulo — sem números (eles estão dentro de
 * cada módulo). É a porta de entrada da home: a igreja não é só os eventos.
 *
 * Cada tile tem a cor do módulo, o ícone grande em marca d'água, a palavra
 * "Módulo", o nome e uma frase do que ele faz. Não é o card de números do
 * sistema: sem anel nem sombra.
 *
 * Fora do plano, o tile fica listrado e sem cor, com cadeado, e leva a Meus
 * planos (o super admin, a Igrejas, onde se troca o plano). O plano vem da API
 * (`resumo.modulos`), também para quem alcança tudo. Módulo que o perfil não
 * alcança (Notícias para a tesouraria) nem aparece.
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
  const escuro = theme.palette.mode === 'dark';
  const { isSuperAdmin, isAdmin, perfilNaIgreja } = useRole();
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

  const modulos: Modulo[] = [
    {
      nome: 'Membros',
      descricao: 'Quem é da igreja, organizado em famílias.',
      icone: <Diversity3 />,
      cor: theme.palette.chips.info,
      link: '/admin/membros',
    },
    {
      nome: 'Eventos',
      descricao: 'Inscrições, equipes, quartos, check-in e pagamentos.',
      icone: <Event />,
      cor: theme.palette.chips.success,
      link: '/admin/eventos',
      modulo: 'EVENTS',
    },
    ...(adminAqui
      ? [
          {
            nome: 'Notícias',
            descricao: 'Mural dos inscritos e avisos pelo WhatsApp.',
            icone: <Campaign />,
            cor: theme.palette.chips.pending,
            link: '/admin/noticias',
            modulo: 'NEWS' as const,
          },
        ]
      : []),
    {
      nome: 'Tesouraria',
      descricao: 'Dízimos, lançamentos e conciliação com o banco.',
      icone: <AccountBalanceWallet />,
      cor: theme.palette.chips.alert,
      link: '/admin/tesouraria',
      modulo: 'TREASURY',
    },
  ];

  return (
    <Box
      component="nav"
      aria-label="Módulos da igreja"
      sx={{
        display: 'grid',
        gap: 1.5,
        gridTemplateColumns: {
          xs: 'repeat(2, minmax(0, 1fr))',
          lg: `repeat(${modulos.length}, minmax(0, 1fr))`,
        },
      }}
    >
      {modulos.map((m) => {
        const bloqueado = !!m.modulo && !resumo.modulos.includes(m.modulo);
        const tom = bloqueado ? theme.palette.text.disabled : m.cor;
        return (
          <ButtonBase
            key={m.nome}
            component={Link}
            to={bloqueado ? ondeMudar.link : m.link}
            aria-label={
              bloqueado
                ? `Módulo ${m.nome}: ${ondeMudar.fora.toLowerCase()}. ${ondeMudar.texto}`
                : `Abrir o módulo ${m.nome}`
            }
            sx={{
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              // o ButtonBase centraliza por padrão: o texto desalinhava entre os tiles
              justifyContent: 'flex-start',
              alignItems: 'flex-start',
              textAlign: 'left',
              minHeight: { xs: 132, sm: 148 },
              p: { xs: 1.75, sm: 2.25 },
              borderRadius: 4,
              bgcolor: bloqueado
                ? 'transparent'
                : alpha(m.cor, escuro ? 0.11 : 0.07),
              backgroundImage: bloqueado
                ? `repeating-linear-gradient(135deg, ${alpha(
                    theme.palette.text.primary,
                    0.035
                  )} 0 6px, transparent 6px 14px)`
                : 'none',
              border: `1px ${bloqueado ? 'dashed' : 'solid'} ${
                bloqueado ? theme.palette.divider : alpha(m.cor, 0.2)
              }`,
              transition: theme.transitions.create([
                'background-color',
                'border-color',
              ]),
              '&:hover': bloqueado
                ? { borderColor: theme.palette.text.disabled }
                : {
                    bgcolor: alpha(m.cor, escuro ? 0.17 : 0.12),
                    borderColor: alpha(m.cor, 0.35),
                  },
              '&:hover .abrir': {
                transform: 'translate(2px, -2px)',
                opacity: 1,
              },
              '&:focus-visible': {
                outline: `2px solid ${theme.palette.primary.main}`,
                outlineOffset: 2,
              },
            }}
          >
            {/* o ícone do módulo, grande e quase apagado, assina o tile */}
            <Box
              aria-hidden
              sx={{
                position: 'absolute',
                right: -16,
                bottom: -20,
                color: alpha(tom, bloqueado ? 0.06 : 0.09),
                '& svg': { fontSize: 112 },
                pointerEvents: 'none',
              }}
            >
              {m.icone}
            </Box>

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ width: '100%', position: 'relative' }}
            >
              <Box
                sx={{
                  display: 'grid',
                  placeItems: 'center',
                  width: 34,
                  height: 34,
                  borderRadius: 2,
                  color: tom,
                  bgcolor: alpha(tom, bloqueado ? 0.08 : 0.16),
                  '& svg': { fontSize: 19 },
                }}
              >
                {m.icone}
              </Box>
              {bloqueado ? (
                <LockOutlined sx={{ fontSize: 17, color: 'text.disabled' }} />
              ) : (
                <ArrowOutward
                  className="abrir"
                  sx={{
                    fontSize: 17,
                    color: tom,
                    opacity: 0.6,
                    transition: theme.transitions.create([
                      'transform',
                      'opacity',
                    ]),
                  }}
                />
              )}
            </Stack>

            <Box sx={{ mt: 2, position: 'relative' }}>
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: bloqueado ? 'text.disabled' : tom,
                }}
              >
                Módulo
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: 17, sm: 19 },
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.15,
                  color: bloqueado ? 'text.disabled' : 'text.primary',
                }}
              >
                {m.nome}
              </Typography>
              <Typography
                sx={{
                  mt: 0.5,
                  fontSize: 12.5,
                  lineHeight: 1.35,
                  color: bloqueado ? 'text.disabled' : 'text.secondary',
                }}
              >
                {bloqueado ? (
                  <>
                    {ondeMudar.fora} ·{' '}
                    <Box
                      component="span"
                      sx={{ color: 'primary.main', fontWeight: 600 }}
                    >
                      {ondeMudar.texto} →
                    </Box>
                  </>
                ) : (
                  m.descricao
                )}
              </Typography>
            </Box>
          </ButtonBase>
        );
      })}
    </Box>
  );
}
