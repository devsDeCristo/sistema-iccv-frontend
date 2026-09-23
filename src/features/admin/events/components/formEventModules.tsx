import {
  alpha,
  Box,
  Paper,
  Stack,
  Switch,
  Typography,
  useTheme,
} from '@mui/material';
import {
  BedOutlined,
  DirectionsBusOutlined,
  GroupsOutlined,
} from '@mui/icons-material';
import { ReactNode } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { ModulesFormType } from '../types';

type CampoDeModulo = 'moduleBedrooms' | 'moduleTeams' | 'moduleTransport';

const MODULOS: {
  campo: CampoDeModulo;
  nome: string;
  descricao: string;
  icone: ReactNode;
}[] = [
  {
    campo: 'moduleBedrooms',
    nome: 'Quartos',
    descricao:
      'Divide os inscritos em quartos, com capacidade e restrição por grupo. É daqui que sai a alocação automática do check-in.',
    icone: <BedOutlined />,
  },
  {
    campo: 'moduleTeams',
    nome: 'Equipes',
    descricao:
      'Monta as equipes de trabalho do evento, com líderes e membros, e gera o PDF de quadrantes.',
    icone: <GroupsOutlined />,
  },
  {
    campo: 'moduleTransport',
    nome: 'Transporte',
    descricao:
      'Organiza quem vai em qual ônibus ou van, com lugares e restrição por grupo — igual aos quartos.',
    icone: <DirectionsBusOutlined />,
  },
];

/**
 * O que este evento tem.
 *
 * Nem todo evento hospeda gente, monta equipe ou leva ônibus: um encontro de um
 * dia não tem quarto, e um retiro na própria igreja não tem transporte. O que
 * fica desligado some do painel, em vez de virar uma aba vazia que a pessoa
 * abre para descobrir que não era ali.
 *
 * Os três nascem ligados, inclusive nos eventos que já existem: é o que eles
 * têm hoje, e desligar por padrão esconderia quarto cheio de gente.
 */
function FormEventModules() {
  const theme = useTheme();
  const { control } = useFormContext<ModulesFormType>();

  const styles = {
    cartao: {
      p: { xs: 2, sm: 2.5 },
      display: 'flex',
      alignItems: 'flex-start',
      gap: 2,
      boxShadow:
        theme.palette.mode === 'dark' ? '' : '0px 0px 5px 2px rgba(0,0,0,0.1)',
    },
    selo: {
      width: 44,
      height: 44,
      flexShrink: 0,
      borderRadius: 2,
      display: 'grid',
      placeItems: 'center',
      color: theme.palette.primary.main,
      bgcolor: alpha(theme.palette.primary.main, 0.12),
    },
    apagado: {
      color: 'text.disabled',
      bgcolor: alpha(theme.palette.text.primary, 0.06),
    },
  };

  return (
    <Stack gap={2} sx={{ mb: 1 }}>
      <Box>
        <Typography variant="h6" fontSize={18}>
          O que este evento tem
        </Typography>
        <Typography variant="body2" color="text.secondary">
          O que ficar desligado não aparece no painel do evento. Dá para ligar
          depois; para desligar, o módulo precisa estar vazio.
        </Typography>
      </Box>

      {MODULOS.map((modulo) => (
        <Controller
          key={modulo.campo}
          name={modulo.campo}
          control={control}
          render={({ field }) => (
            <Paper sx={styles.cartao}>
              <Box
                sx={{
                  ...styles.selo,
                  ...(field.value ? {} : styles.apagado),
                }}
              >
                {modulo.icone}
              </Box>

              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Typography fontWeight={600}>{modulo.nome}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {modulo.descricao}
                </Typography>
              </Box>

              <Switch
                checked={!!field.value}
                onChange={(evento) => field.onChange(evento.target.checked)}
                inputProps={{ 'aria-label': `Módulo ${modulo.nome}` }}
              />
            </Paper>
          )}
        />
      ))}
    </Stack>
  );
}

export { FormEventModules };
