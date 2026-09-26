import {
  Alert,
  alpha,
  Box,
  LinearProgress,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { CheckRounded, GroupsOutlined } from '@mui/icons-material';
import { Controller, useFormContext } from 'react-hook-form';
import { EventDetails, PayLoadGroup, SelectGroupRoleFormType } from '../types';
import { ocupacao } from '../../../events/utils';
import { estadoDoGrupo, quandoDoGrupo, useAgoraDosGrupos } from '../groups';

interface FormSelectGroupRoleProps {
  event: EventDetails;
  groups: PayLoadGroup;
}

/** Etiqueta de situação do grupo, no canto do cartão. */
function Etiqueta({ cor, children }: { cor: string; children: string }) {
  return (
    <Box
      sx={{
        px: 0.85,
        py: 0.15,
        borderRadius: 1,
        fontSize: 10.5,
        fontWeight: 700,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        color: cor,
        backgroundColor: alpha(cor, 0.12),
        border: `1px solid ${alpha(cor, 0.28)}`,
      }}
    >
      {children}
    </Box>
  );
}

/**
 * Primeiro passo: de quais grupos a pessoa quer participar.
 *
 * Cada grupo é um cartão inteiro clicável, com a marca de escolhido no canto
 * esquerdo — antes era uma caixa de seleção do Material colada num retângulo,
 * e o alvo de clique parecia ser só ela.
 *
 * As vagas deixaram de ser uma frase ("Vagas Disponíveis: 3 de 50") e viraram
 * barra: cheia é lotado, e a cor muda quando aperta. O número continua escrito
 * ao lado, para quem precisa do dado exato.
 */
function FormSelectGroupRole({ event, groups }: FormSelectGroupRoleProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<SelectGroupRoleFormType>();
  const theme = useTheme();
  const escondeVagas = !!event?.data?.hideVacancies;
  // o grupo agendado libera sozinho na hora, sem recarregar a página
  const agora = useAgoraDosGrupos(event?.groupRoles);

  return (
    <Box>
      <Typography
        sx={{ fontSize: '0.9375rem', color: 'text.secondary', mb: 2 }}
      >
        De quais grupos você quer participar? Dá para escolher mais de um.
      </Typography>

      <Controller
        name="groupRoleId"
        control={control}
        render={({ field }) => (
          <Stack gap={1.5}>
            {event?.groupRoles?.map((group) => {
              if (group.id === undefined) return null;

              const inscritos =
                group.roles?.reduce(
                  (total, role) => total + (role.registered ?? 0),
                  0
                ) ?? 0;
              const vagas = ocupacao(inscritos, group.capacity);

              const jaInscrito =
                groups?.present?.some((g) => g.id === group.id) || false;
              const naEspera =
                groups?.waitlist?.some((g) => g.id === group.id) || false;
              const estado = estadoDoGrupo(group, agora);

              // desligado some; quem já está nele ainda vê o próprio grupo
              if (estado === 'inativo' && !jaInscrito && !naEspera) {
                return null;
              }

              const fechado = estado !== 'aberto';
              const travado = jaInscrito || naEspera || fechado;

              const escolhido = field.value?.includes(group.id) ?? false;
              const soEspera = !travado && vagas.situacao === 'esgotado';
              const avisoDaJanela =
                jaInscrito || naEspera
                  ? null
                  : estado === 'agendado'
                    ? `Abre ${quandoDoGrupo(group.opensAt!)}`
                    : fechado
                      ? 'Inscrições encerradas'
                      : null;

              const alternar = () => {
                if (travado) return;
                field.onChange(
                  escolhido
                    ? field.value.filter((id) => id !== group.id)
                    : [...(field.value ?? []), group.id]
                );
              };

              return (
                <Box
                  key={group.id}
                  onClick={alternar}
                  role="checkbox"
                  aria-checked={escolhido}
                  aria-disabled={travado}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1.5,
                    p: 2,
                    borderRadius: 2.5,
                    cursor: travado ? 'default' : 'pointer',
                    opacity: travado ? 0.65 : 1,
                    border: '1px solid',
                    borderColor: escolhido
                      ? theme.palette.primary.main
                      : theme.palette.divider,
                    backgroundColor: escolhido
                      ? alpha(theme.palette.primary.main, 0.08)
                      : alpha(theme.palette.text.primary, 0.02),
                    transition: theme.transitions.create(
                      ['background-color', 'border-color'],
                      { duration: 160 }
                    ),
                    ...(travado || escolhido
                      ? {}
                      : {
                          '&:hover': {
                            borderColor: alpha(theme.palette.primary.main, 0.5),
                            backgroundColor: alpha(
                              theme.palette.primary.main,
                              0.04
                            ),
                          },
                        }),
                  }}
                >
                  {/* a marca de escolhido é desenhada, e não uma caixa do
                    Material: o cartão inteiro é o alvo, e a caixa fazia o
                    clique parecer restrito a ela */}
                  <Box
                    sx={{
                      mt: 0.25,
                      width: 22,
                      height: 22,
                      flexShrink: 0,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#fff',
                      border: escolhido ? 'none' : '2px solid',
                      borderColor: alpha(theme.palette.text.primary, 0.3),
                      backgroundColor: escolhido
                        ? theme.palette.primary.main
                        : 'transparent',
                    }}
                  >
                    {escolhido && <CheckRounded sx={{ fontSize: 15 }} />}
                  </Box>

                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      gap={1}
                      sx={{ flexWrap: 'wrap' }}
                    >
                      <Typography
                        sx={{
                          fontSize: '1rem',
                          fontWeight: 600,
                          wordBreak: 'break-word',
                        }}
                      >
                        {group.name}
                      </Typography>

                      {jaInscrito && (
                        <Etiqueta cor={theme.palette.chips.success}>
                          Você já está inscrito
                        </Etiqueta>
                      )}
                      {naEspera && (
                        <Etiqueta cor={theme.palette.chips.info}>
                          Na lista de espera
                        </Etiqueta>
                      )}
                      {soEspera && (
                        <Etiqueta cor={theme.palette.chips.alert}>
                          Só lista de espera
                        </Etiqueta>
                      )}
                      {avisoDaJanela && (
                        <Etiqueta
                          cor={
                            estado === 'agendado'
                              ? theme.palette.chips.info
                              : theme.palette.text.secondary
                          }
                        >
                          {avisoDaJanela}
                        </Etiqueta>
                      )}
                    </Stack>

                    {!escondeVagas && (group.capacity ?? 0) > 0 && (
                      <Box sx={{ mt: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={vagas.percentual}
                          sx={{
                            height: 6,
                            borderRadius: 999,
                            backgroundColor: alpha(
                              theme.palette.text.primary,
                              0.1
                            ),
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 999,
                              backgroundColor:
                                vagas.situacao === 'esgotado'
                                  ? theme.palette.chips.alert
                                  : vagas.situacao === 'ultimas'
                                    ? theme.palette.warning.main
                                    : theme.palette.primary.main,
                            },
                          }}
                        />
                        <Typography
                          sx={{
                            mt: 0.5,
                            fontSize: '0.75rem',
                            color: 'text.secondary',
                          }}
                        >
                          {vagas.restantes === 0
                            ? `Sem vagas — ${group.capacity} lugares ocupados`
                            : `${vagas.restantes} de ${group.capacity} vagas livres`}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      />

      {errors.groupRoleId && (
        <Alert
          severity="error"
          variant="outlined"
          sx={{
            mt: 2,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.error.main, 0.08),
          }}
          icon={<GroupsOutlined fontSize="small" />}
        >
          <Typography color="error" variant="body2">
            {errors.groupRoleId.message}
          </Typography>
        </Alert>
      )}
    </Box>
  );
}

export { FormSelectGroupRole };
