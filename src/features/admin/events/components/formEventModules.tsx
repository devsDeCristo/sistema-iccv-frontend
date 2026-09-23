import {
  alpha,
  Box,
  Paper,
  Stack,
  Switch,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  BedOutlined,
  DirectionsBusOutlined,
  GroupsOutlined,
  LockOutlined,
} from '@mui/icons-material';
import { ReactNode } from 'react';
import { useParams } from 'react-router-dom';
import { Controller, useFormContext } from 'react-hook-form';
import { ModulesFormType } from '../types';
import { useGetBedrooms } from '../api/getBedrooms';
import { useGetTeams } from '../api/getTeams';
import { useGetTransports } from '../api/getTransports';

type CampoDeModulo = 'moduleBedrooms' | 'moduleTeams' | 'moduleTransport';

const MODULOS: {
  campo: CampoDeModulo;
  nome: string;
  descricao: string;
  icone: ReactNode;
  /** como contar o que já existe, no singular e no plural */
  unidade: [string, string];
}[] = [
  {
    campo: 'moduleBedrooms',
    nome: 'Quartos',
    descricao:
      'Divide os inscritos em quartos, com capacidade e restrição por grupo. É daqui que sai a alocação automática do check-in.',
    icone: <BedOutlined />,
    unidade: ['quarto', 'quartos'],
  },
  {
    campo: 'moduleTeams',
    nome: 'Equipes',
    descricao:
      'Monta as equipes de trabalho do evento, com líderes e membros, e gera o PDF de quadrantes.',
    icone: <GroupsOutlined />,
    unidade: ['equipe', 'equipes'],
  },
  {
    campo: 'moduleTransport',
    nome: 'Transporte',
    descricao:
      'Organiza quem vai em qual ônibus ou van, com lugares e restrição por grupo — igual aos quartos.',
    icone: <DirectionsBusOutlined />,
    unidade: ['transporte', 'transportes'],
  },
];

function quantos(lista: unknown) {
  return Array.isArray(lista) ? lista.length : 0;
}

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

  /**
   * O que já está cadastrado em cada módulo.
   *
   * O servidor recusa desligar módulo com conteúdo, mas descobrir isso só ao
   * salvar é descobrir tarde: a pessoa desliga, preenche o resto e leva o erro
   * na cara no fim. Aqui o interruptor já vem travado, com o número na tela.
   *
   * Na criação não há evento na URL, as três consultas ficam desligadas e nada
   * trava — evento novo não tem o que perder.
   */
  const { id: eventId = '' } = useParams();
  const consulta = { enabled: !!eventId };
  const { data: quartos } = useGetBedrooms({ eventId }, consulta);
  const { data: equipes } = useGetTeams({ eventId }, consulta);
  const { data: transportes } = useGetTransports({ eventId }, consulta);

  const cadastrados: Record<CampoDeModulo, number> = {
    moduleBedrooms: quantos(quartos),
    moduleTeams: quantos(equipes),
    moduleTransport: quantos(transportes),
  };

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
          render={({ field }) => {
            const total = cadastrados[modulo.campo];
            // só trava o que está ligado: módulo já desligado não tem conteúdo
            // para perder, e ligar de novo é sempre permitido
            const travado = !!field.value && total > 0;
            const [singular, plural] = modulo.unidade;

            return (
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

                  {travado && (
                    <Stack
                      direction="row"
                      gap={0.5}
                      alignItems="center"
                      sx={{ mt: 0.75 }}
                    >
                      <LockOutlined
                        sx={{ fontSize: 16, color: 'warning.main' }}
                      />
                      <Typography variant="caption" color="warning.main">
                        {total} {total === 1 ? singular : plural} cadastrado
                        {total === 1 ? '' : 's'}: apague
                        {total === 1 ? '-o' : '-os'} para poder desligar.
                      </Typography>
                    </Stack>
                  )}
                </Box>

                <Tooltip
                  title={
                    travado
                      ? `Este evento tem ${total} ${
                          total === 1 ? singular : plural
                        } cadastrado${total === 1 ? '' : 's'}`
                      : ''
                  }
                >
                  {/* o `span` segura o tooltip: interruptor desligado não
                    dispara evento de mouse */}
                  <span>
                    <Switch
                      checked={!!field.value}
                      disabled={travado}
                      onChange={(evento) =>
                        field.onChange(evento.target.checked)
                      }
                      inputProps={{ 'aria-label': `Módulo ${modulo.nome}` }}
                    />
                  </span>
                </Tooltip>
              </Paper>
            );
          }}
        />
      ))}
    </Stack>
  );
}

export { FormEventModules };
