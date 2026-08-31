import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  alpha,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { Input } from '../../../../components/input';
import { useState } from 'react';
import {
  Add,
  DeleteOutline,
  ExpandMore,
  GroupsOutlined,
} from '@mui/icons-material';
import { GroupRole, RegistrationSettingsFormType } from '../types';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import Swal from 'sweetalert2';
import { sanitizePrice, sanitizeInteger } from '../../../../utils';

/**
 * Grupo e regra nascem vazios para o admin preencher, mas o schema pede número
 * em `capacity` e `price` — é a validação que cobra o preenchimento, não o
 * valor inicial.
 */
const grupoVazio = (): GroupRole => ({
  name: '',
  capacity: null as unknown as number,
  link: '',
  roles: [],
});

const regraVazia = () => ({
  price: null as unknown as number,
  description: '',
});

/** inscritos + lista de espera: quem já entrou no grupo por qualquer porta */
function contarInscritos(grupo: GroupRole) {
  return (grupo.roles ?? []).reduce(
    (total, regra) => total + (regra.registered ?? 0) + (regra.waitlisted ?? 0),
    0
  );
}

function plural(quantidade: number, singular: string, plural: string) {
  return `${quantidade} ${quantidade === 1 ? singular : plural}`;
}

type CartaoGrupoProps = {
  index: number;
  grupo: GroupRole;
  expandido: boolean;
  onAlternar: () => void;
  onRemover: () => void;
  onAdicionarRegra: () => void;
  onRemoverRegra: (indexRegra: number) => void;
};

/**
 * Um grupo por acordeão: o cabeçalho resume o que está dentro (nome, vagas,
 * regras, inscritos) e as regras ficam recolhidas até serem chamadas. Antes o
 * recolher era um `Chip` dentro de um `Divider`, sem foco por teclado e sem o
 * resumo — de fora não dava para saber o que o grupo tinha.
 */
function CartaoGrupo({
  index,
  grupo,
  expandido,
  onAlternar,
  onRemover,
  onAdicionarRegra,
  onRemoverRegra,
}: CartaoGrupoProps) {
  const theme = useTheme();
  const {
    control,
    formState: { errors },
  } = useFormContext<RegistrationSettingsFormType>();

  const regras = grupo.roles ?? [];
  const inscritos = contarInscritos(grupo);
  const temInscricoes = inscritos > 0;
  const errosDoGrupo = errors.groupRoles?.[index];

  const styles = {
    cartao: {
      // o MUI arredonda só o primeiro e o último de um grupo de acordeões, e
      // aqui cada um é um cartão solto
      boxShadow:
        theme.palette.mode == 'dark' ? '' : '0px 0px 5px 2px rgba(0,0,0,0.1)',
      borderRadius: 2,
      '&:first-of-type, &:last-of-type': { borderRadius: 2 },
      // a linha que o MUI desenha entre acordeões empilhados sobra: o
      // espaçamento entre os cartões já separa um do outro
      '&:before': { display: 'none' },
    },
    resumo: {
      '& .MuiAccordionSummary-content': {
        alignItems: 'center',
        gap: 1,
        flexWrap: 'wrap',
        my: 1,
        mr: 1,
      },
    },
    /**
     * O padding fica no Box e o espaçamento interno num Stack com `gap`. Com
     * `Grid container spacing` aqui, as margens negativas do próprio Grid
     * (-16px em cima e à esquerda) comiam essa padding e jogavam os campos por
     * cima da borda.
     */
    linhaRegra: {
      p: 1.5,
      ml: 0,
      borderRadius: 2,
      border: `1px solid ${theme.palette.divider}`,
      bgcolor: alpha(theme.palette.text.primary, 0.02),
    },
    semRegras: {
      p: 2,
      borderRadius: 2,
      border: `1px dashed ${theme.palette.divider}`,
      textAlign: 'center',
    },
  };

  return (
    <Accordion
      expanded={expandido}
      onChange={onAlternar}
      disableGutters
      sx={styles.cartao}
    >
      <AccordionSummary expandIcon={<ExpandMore />} sx={styles.resumo}>
        <Typography fontWeight={600} sx={{ mr: 'auto' }}>
          {grupo.name?.trim() || `Grupo ${index + 1}`}
        </Typography>

        {!!grupo.capacity && (
          <Chip
            size="small"
            variant="outlined"
            label={`${grupo.capacity} vagas`}
          />
        )}
        <Chip
          size="small"
          variant="outlined"
          label={plural(regras.length, 'regra', 'regras')}
          color={regras.length ? 'default' : 'warning'}
        />
        {temInscricoes && (
          <Chip
            size="small"
            variant="outlined"
            color="warning"
            label={plural(inscritos, 'inscrito', 'inscritos')}
          />
        )}

        <Tooltip
          title={
            temInscricoes
              ? 'Grupo com inscrições não pode ser removido'
              : 'Remover grupo'
          }
        >
          {/* o span mantém o tooltip vivo quando o botão está desabilitado */}
          <span>
            <IconButton
              size="small"
              disabled={temInscricoes}
              aria-label="Remover grupo"
              // sem isto o clique no botão também abriria e fecharia o grupo
              onClick={(event) => {
                event.stopPropagation();
                onRemover();
              }}
              sx={{ '&:hover': { color: theme.palette.error.main } }}
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </AccordionSummary>

      <AccordionDetails sx={{ pt: 0, mt:1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={8}>
            <Controller
              control={control}
              name={`groupRoles.${index}.name`}
              render={({ field: { onChange, value } }) => (
                <Input
                  size="small"
                  required
                  label="Nome do grupo"
                  placeholder="Ex: Completo"
                  value={value ?? ''}
                  onChange={onChange}
                  error={Boolean(errosDoGrupo?.name)}
                  errorMessage={errosDoGrupo?.name?.message}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Controller
              control={control}
              name={`groupRoles.${index}.capacity`}
              render={({ field: { onChange, value } }) => (
                <Input
                  size="small"
                  required
                  type="text"
                  label="Capacidade"
                  placeholder="Ex: 200"
                  value={value ?? ''}
                  onChange={(e) => {
                    const sanitized = sanitizeInteger(e.target.value);
                    onChange(sanitized ? Number(sanitized) : null);
                  }}
                  onPaste={(e) => {
                    e.preventDefault();
                    const colado = e.clipboardData.getData('text');
                    const sanitized = sanitizeInteger(colado);
                    onChange(sanitized ? Number(sanitized) : null);
                  }}
                  onKeyDown={(e) => {
                    const liberadas = [
                      'Backspace',
                      'Tab',
                      'ArrowLeft',
                      'ArrowRight',
                      'Delete',
                    ];
                    if (liberadas.includes(e.key)) return;
                    if (!/^[0-9]$/.test(e.key)) e.preventDefault();
                  }}
                  error={Boolean(errosDoGrupo?.capacity)}
                  errorMessage={
                    errosDoGrupo?.capacity?.message
                  }
                  inputProps={{
                    inputMode: 'numeric',
                    pattern: '\\d*',
                    min: 0,
                  }}
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid>

          {/* <Grid item xs={12}>
            <Controller
              control={control}
              name={`groupRoles.${index}.link`}
              render={({ field: { onChange, value } }) => (
                <Input
                  size="small"
                  label="Link do grupo (opcional)"
                  placeholder="Ex: https://chat.whatsapp.com/xxxxxxxx"
                  value={value ?? ''}
                  onChange={onChange}
                  error={Boolean(errosDoGrupo?.link)}
                  errorMessage={
                    errosDoGrupo?.link?.message
                  }
                  InputLabelProps={{ shrink: true }}
                />
              )}
            />
          </Grid> */}

          {temInscricoes && (
            <Grid item xs={12}>
              <Alert
                severity="warning"
                variant="outlined"
                sx={{ bgcolor: alpha(theme.palette.warning.main, 0.08) }}
              >
                Este grupo já tem inscrições: ele e as regras em uso não podem
                ser removidos.
              </Alert>
            </Grid>
          )}

          <Grid item xs={12}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              gap={1}
              sx={{ mt: 1 }}
            >
              <Stack direction="column" gap={0}>
                <Typography variant="subtitle2">Regras de valor</Typography>
                <Typography variant="caption" color="text.secondary">
                  Cada regra é um valor de inscrição dentro do grupo.
                </Typography>
              </Stack>
              <Button
                size="small"
                variant="outlined"
                startIcon={<Add />}
                onClick={onAdicionarRegra}
                sx={{ flexShrink: 0 }}
              >
                Adicionar regra
              </Button>
            </Stack>
          </Grid>

          {regras.length === 0 ? (
            <Grid item xs={12}>
              <Box sx={styles.semRegras}>
                <Typography variant="body2" color="text.secondary">
                  Nenhuma regra ainda. Sem pelo menos uma, ninguém consegue se
                  inscrever neste grupo.
                </Typography>
              </Box>
            </Grid>
          ) : (
            regras.map((regra, indexRegra) => {
              const errosDaRegra = errosDoGrupo?.roles?.[indexRegra];
              const inscritosNaRegra =
                (regra.registered ?? 0) + (regra.waitlisted ?? 0);

              return (
                <Grid item xs={12} key={regra.id ?? `regra-${indexRegra}`}>
                  <Box sx={styles.linhaRegra}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      alignItems={{ sm: 'center' }}
                      gap={2}
                    >
                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        <Controller
                          control={control}
                          name={`groupRoles.${index}.roles.${indexRegra}.description`}
                          render={({ field: { onChange, value } }) => (
                            <Input
                              size="small"
                              required
                              label="Descrição"
                              placeholder="Ex: Idade entre 2 e 10 anos"
                              value={value ?? ''}
                              onChange={onChange}
                              error={Boolean(errosDaRegra?.description)}
                              errorMessage={errosDaRegra?.description?.message}
                              InputLabelProps={{ shrink: true }}
                            />
                          )}
                        />
                      </Box>

                      <Box
                        sx={{ width: { xs: '100%', sm: 150 }, flexShrink: 0 }}
                      >
                        <Controller
                          control={control}
                          name={`groupRoles.${index}.roles.${indexRegra}.price`}
                          render={({ field: { onChange, value } }) => (
                            <Input
                              size="small"
                              required
                              type="number"
                              label="Preço"
                              placeholder="0,00"
                              value={value ?? ''}
                              onChange={(e) => {
                                const digitado = e.target.value;
                                onChange(
                                  digitado ? sanitizePrice(digitado) : null
                                );
                              }}
                              onKeyDown={(e) => {
                                // notação científica e sinal não fazem sentido em preço
                                if (['e', 'E', '+', '-'].includes(e.key)) {
                                  e.preventDefault();
                                }
                              }}
                              error={Boolean(errosDaRegra?.price)}
                              errorMessage={errosDaRegra?.price?.message}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    R$
                                  </InputAdornment>
                                ),
                              }}
                              InputLabelProps={{ shrink: true }}
                            />
                          )}
                        />
                      </Box>

                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="flex-end"
                        gap={0.5}
                        sx={{ flexShrink: 0 }}
                      >
                        {inscritosNaRegra > 0 && (
                          <Chip
                            size="small"
                            variant="outlined"
                            color="warning"
                            label={inscritosNaRegra}
                          />
                        )}
                        <Tooltip
                          title={
                            inscritosNaRegra > 0
                              ? 'Regra com inscrições não pode ser removida'
                              : 'Remover regra'
                          }
                        >
                          <span>
                            <IconButton
                              size="small"
                              aria-label="Remover regra"
                              disabled={inscritosNaRegra > 0}
                              onClick={() => onRemoverRegra(indexRegra)}
                              sx={{
                                '&:hover': { color: theme.palette.error.main },
                              }}
                            >
                              <DeleteOutline fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Box>
                </Grid>
              );
            })
          )}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}

function FormRegistrationSettings() {
  const { control, setValue } = useFormContext<RegistrationSettingsFormType>();
  const theme = useTheme();

  const grupos = (useWatch({ control, name: 'groupRoles' }) ??
    []) as GroupRole[];

  /**
   * Um booleano por grupo, na mesma ordem da lista: ao remover um grupo o
   * estado é recortado junto. O controle anterior era uma lista de objetos
   * `{ [índice]: boolean }` procurada por `Object.keys(...)[0]`, e depois de
   * remover um grupo o estado passava a apontar para o grupo errado.
   */
  const [expandidos, setExpandidos] = useState<boolean[]>(() =>
    grupos.map(() => true)
  );

  const estaExpandido = (index: number) => expandidos[index] ?? true;

  const alternarGrupo = (index: number) =>
    setExpandidos((atual) => {
      const proximos = grupos.map((_, i) => atual[i] ?? true);
      proximos[index] = !estaExpandido(index);
      return proximos;
    });

  /**
   * Toda alteração devolve arrays novos. O código antigo dava `splice` e `push`
   * direto no array observado pelo formulário, mexendo no estado interno do
   * react-hook-form sem avisar ninguém.
   */
  const atualizarGrupos = (proximos: GroupRole[]) =>
    setValue(
      'groupRoles',
      proximos as RegistrationSettingsFormType['groupRoles']
    );

  const adicionarGrupo = () => {
    atualizarGrupos([...grupos, grupoVazio()]);
    setExpandidos((atual) => [...grupos.map((_, i) => atual[i] ?? true), true]);
  };

  const removerGrupo = (index: number) => {
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Essa ação irá remover o grupo de inscrições.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, remover!',
      cancelButtonText: 'Cancelar',
    }).then((resultado) => {
      if (!resultado.isConfirmed) return;

      atualizarGrupos(grupos.filter((_, i) => i !== index));
      setExpandidos((atual) =>
        grupos.map((_, i) => atual[i] ?? true).filter((_, i) => i !== index)
      );
    });
  };

  const adicionarRegra = (index: number) =>
    atualizarGrupos(
      grupos.map((grupo, i) =>
        i === index
          ? { ...grupo, roles: [...(grupo.roles ?? []), regraVazia()] }
          : grupo
      )
    );

  const removerRegra = (index: number, indexRegra: number) =>
    atualizarGrupos(
      grupos.map((grupo, i) =>
        i === index
          ? {
              ...grupo,
              roles: (grupo.roles ?? []).filter((_, r) => r !== indexRegra),
            }
          : grupo
      )
    );

  const totalRegras = grupos.reduce(
    (total, grupo) => total + (grupo.roles?.length ?? 0),
    0
  );
  const totalVagas = grupos.reduce(
    (total, grupo) => total + (grupo.capacity ?? 0),
    0
  );

  const styles = {
    aviso: {
      bgcolor: alpha(theme.palette.info.main, 0.08),
      '& .MuiAlert-message': { py: 0.5 },
    },
    vazio: {
      p: 4,
      borderRadius: 2,
      border: `1px dashed ${theme.palette.divider}`,
      textAlign: 'center',
    },
  };

  return (
    <Stack gap={2} sx={{ mb: 1 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'flex-start' }}
        gap={2}
      >
        <Box>
          <Typography variant="h6" fontSize={18}>
            Grupos e regras de inscrição
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Definem como os participantes se separam e quanto cada um paga.
          </Typography>
          {grupos.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              {[
                plural(grupos.length, 'grupo', 'grupos'),
                plural(totalRegras, 'regra', 'regras'),
                `${totalVagas} vagas`,
              ].join(' · ')}
            </Typography>
          )}
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={adicionarGrupo}
          sx={{ flexShrink: 0 }}
        >
          Adicionar grupo
        </Button>
      </Stack>

      <Alert severity="info" variant="outlined" sx={styles.aviso}>
        <Typography variant="body2">
          <strong>Grupos</strong> separam os participantes em categorias — como{' '}
          {
            '“Cursilhistas” e “Cursilheiros” num Cursilho, ou “Completo” e “Diárias” num Retiro.'
          }
        </Typography>
        <Typography variant="body2">
          <strong>Regras</strong> definem os valores dentro de um grupo, por
          faixa de idade ou tipo de ingresso.
        </Typography>
      </Alert>

      {grupos.length === 0 ? (
        <Box sx={styles.vazio}>
          <GroupsOutlined sx={{ fontSize: 40, color: 'text.secondary' }} />
          <Typography fontWeight={500} sx={{ mt: 1 }}>
            Nenhum grupo criado
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Sem grupo não há como se inscrever no evento.
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={adicionarGrupo}
          >
            Adicionar grupo
          </Button>
        </Box>
      ) : (
        <Stack gap={1.5}>
          {grupos.map((grupo, index) => (
            <CartaoGrupo
              key={grupo.id ?? `grupo-${index}`}
              index={index}
              grupo={grupo}
              expandido={estaExpandido(index)}
              onAlternar={() => alternarGrupo(index)}
              onRemover={() => removerGrupo(index)}
              onAdicionarRegra={() => adicionarRegra(index)}
              onRemoverRegra={(indexRegra) => removerRegra(index, indexRegra)}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}

export { FormRegistrationSettings };
