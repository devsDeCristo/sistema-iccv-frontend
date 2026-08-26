import {
  Alert,
  Autocomplete,
  Backdrop,
  Box,
  Button,
  Checkbox,
  Fade,
  Grid,
  IconButton,
  Modal,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';

import { Controller, useForm } from 'react-hook-form';
import { usePostCreateBedroom } from '../api/postBedroom';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { ResponsiveAutocomplete } from '../../../../components/responsiveAutocomplete';
import { usePutBedroom } from '../api/putBedroom';
import { CheckBox, CheckBoxOutlineBlank, Close } from '@mui/icons-material';
import { useGetUsers } from '../api/getUsers';
import { User } from '../../../../types/user';

interface ModalBedRoomProps {
  open: boolean;
  handleClose: () => void;
  eventId: string;
  bedRoom?: any;
  /**
   * Grupos de inscrição do evento, para as tags de restrição. Vem de fora
   * porque grupo sem ninguém inscrito ainda não apareceria na lista derivada
   * dos participantes — e o quarto pode ser reservado antes das inscrições.
   */
  groupNames?: string[];
}

interface UserOption {
  value: string;
  label: string;
  groupName: string;
}

const emptyForm = {
  name: '',
  capacity: '',
  note: '',
  tags: [] as { value: string; label: string }[],
  groupTags: [] as { value: string; label: string }[],
  usersId: [] as UserOption[],
};

function ModalBedRoom({
  open,
  handleClose,
  eventId = '',
  bedRoom,
  groupNames,
}: ModalBedRoomProps) {
  const theme = useTheme();
  const styles = {
    title: {
      fontWeight: 500,
      fontSize: '1.25rem',
      color: theme.palette.text.primary,
    },
    subTitle: {
      fontWeight: 400,
      fontSize: '1rem',
      color: theme.palette.text.primary,
    },
    overflow: {
      overflow: 'auto',
      flex: 1,
      minHeight: 0,
      maxHeight: { xs: 'none', sm: '75vh' },
      p: 1,
      mb: 2,
    },
    container: {
      // no celular o modal toma a tela inteira; no desktop segue centralizado
      position: 'absolute' as 'absolute',
      top: { xs: 0, sm: '50%' },
      left: { xs: 0, sm: '50%' },
      transform: { xs: 'none', sm: 'translate(-50%, -50%)' },
      width: { xs: '100%', sm: 600 },
      height: { xs: '100%', sm: 'auto' },
      maxHeight: { xs: '100%', sm: '90vh' },
      display: 'flex',
      flexDirection: 'column',
      color: '#000',
      backgroundColor: theme.palette.background.paperSecondary,
      boxShadow: 14,
      p: { xs: 2, md: 3 },
    },
    // o corpo rola e o botão de salvar fica sempre à vista
    form: {
      display: 'flex',
      flexDirection: 'column',
      flex: 1,
      minHeight: 0,
    },
  };
  const {
    control,
    reset,
    handleSubmit,
    watch,
    getValues,
    trigger,
    formState: { errors },
  } = useForm({ defaultValues: emptyForm, mode: 'onChange' });

  const { mutate: putBedroom, isLoading: isUpdating } = usePutBedroom({
    onSuccess: () => {
      reset(emptyForm);
      handleClose();
    },
  });
  const { mutate: postCreateBedroom, isLoading: isCreating } =
    usePostCreateBedroom({
      onSuccess: () => {
        reset(emptyForm);
        handleClose();
      },
    });
  const isSaving = isCreating || isUpdating;

  const { data: userData, isLoading: isLoadingUsers } = useGetUsers(
    { eventId: eventId || '' },
    {
      enabled: !!eventId,
    }
  );

  const users = userData as User[];

  useEffect(() => {
    if (!open) return;

    if (bedRoom) {
      reset({
        name: bedRoom.name || '',
        capacity: String(bedRoom.capacity || ''),
        tags:
          bedRoom?.tag?.map((tag: any) => ({
            value: tag,
            label: tag,
          })) || [],
        groupTags:
          bedRoom?.groupTags?.map((tag: any) => ({
            value: tag,
            label: tag,
          })) || [],
        note: bedRoom.note || '',
        usersId:
          bedRoom?.users?.map((user: any) => ({
            value: user.id,
            label: user.fullName,
            groupName: '',
          })) || [],
      });
      return;
    }

    reset(emptyForm);
  }, [bedRoom, open]);

  function mapUsersToOptions(users: User[]): UserOption[] {
    return users
      .flatMap((user) =>
        user?.groupsRegistration?.map((group) => ({
          value: user.id,
          label: user.fullName,
          groupName: group.name,
        }))
      )
      .filter((option): option is UserOption => !!option?.groupName)
      .sort((a, b) => a.groupName.localeCompare(b.groupName));
  }

  const options = mapUsersToOptions(users || []);

  const gruposSelecionados: string[] = (watch('groupTags') || []).map(
    (tag: any) => tag.value
  );
  const restrito = gruposSelecionados.length > 0;

  /**
   * Lista de grupos para a restrição: os do evento, e como reserva os que
   * aparecem nos inscritos — assim a tela funciona mesmo sem a prop.
   */
  const gruposDoEvento = Array.from(
    new Set([
      ...(groupNames || []),
      ...options.map((option) => option.groupName),
    ])
  )
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'pt-BR'))
    .map((name) => ({ value: name, label: name }));

  /**
   * Com o quarto restrito, só aparecem os inscritos dos grupos marcados. Sem
   * isso a tela ofereceria gente que o backend vai recusar no salvamento.
   */
  const optionsPermitidas = restrito
    ? options.filter((option) => gruposSelecionados.includes(option.groupName))
    : options;

  /** Grupos de cada inscrito. A pessoa pode estar em mais de um. */
  const gruposPorUsuario = options.reduce((mapa, option) => {
    const grupos = mapa.get(option.value) || new Set<string>();
    grupos.add(option.groupName);
    return mapa.set(option.value, grupos);
  }, new Map<string, Set<string>>());

  /**
   * Selecionados que não pertencem a nenhum grupo do quarto.
   *
   * Só é avisado, nunca removido em silêncio: no modo edição os ocupantes são
   * carregados sem o grupo preenchido, e uma poda automática esvaziaria o
   * quarto sozinha. Enquanto a lista de inscritos não carregou, não há como
   * julgar e o aviso fica de fora.
   */
  const foraDoGrupo: UserOption[] =
    restrito && !isLoadingUsers && options.length > 0
      ? (watch('usersId') || []).filter((selecionado: UserOption) => {
          const grupos = gruposPorUsuario.get(selecionado.value);
          if (!grupos) return false;
          return !gruposSelecionados.some((grupo) => grupos.has(grupo));
        })
      : [];

  const capacity = Number(watch('capacity') || 0);
  const ocupantes = (watch('usersId') || []).length;
  const vagasRestantes = capacity - ocupantes;
  const semCapacidade = capacity <= 0;
  const quartoCheio = !semCapacidade && vagasRestantes <= 0;

  const onSubimitBedroom = (data: any) => {
    if (foraDoGrupo.length > 0) {
      toast.error(
        `Quarto restrito: remova ${foraDoGrupo
          .map((user) => user.label)
          .join(', ')} ou libere o grupo correspondente.`
      );
      return;
    }

    const { tags, groupTags, capacity, ...rest } = data;
    const transoformData = {
      ...rest,
      tags: (tags || []).map((tag: any) => tag.value),
      groupTags: (groupTags || []).map((tag: any) => tag.value),
      capacity: Number(capacity),
      usersId: (data.usersId || []).map((user: any) => user.value),
    };

    if (bedRoom) {
      putBedroom({
        eventId,
        bedRoomId: bedRoom.id,
        data: transoformData,
      });
      return;
    }

    postCreateBedroom({
      eventId,
      data: transoformData,
    });
  };

  const onInvalid = () => {
    toast.error(
      'Não foi possível salvar. Verifique os campos destacados em vermelho.'
    );
  };

  const Title = ({ title, hint }: { title: string; hint?: string }) => {
    return (
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
      >
        <Typography id="transition-modal-title" sx={styles.subTitle}>
          {title}
        </Typography>
        {hint && (
          <Typography variant="caption" color="text.secondary">
            {hint}
          </Typography>
        )}
      </Stack>
    );
  };

  const listaDeErros = Object.values(errors)
    .map((error: any) => error?.message)
    .filter(Boolean) as string[];

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={open}
      onClose={handleClose}
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
      sx={{
        '& .MuiBox-root': { borderRadius: { xs: 0, sm: 1 } },
      }}
    >
      <Fade in={open}>
        <Box sx={styles.container}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography sx={styles.title}>
              {bedRoom ? 'Editar ' : 'Adicionar '} quarto
            </Typography>
            <IconButton onClick={handleClose}>
              <Close />
            </IconButton>
          </Stack>
          <Box
            component="form"
            onSubmit={handleSubmit(onSubimitBedroom, onInvalid)}
            noValidate
            sx={styles.form}
          >
            <Box sx={styles.overflow}>
              {listaDeErros.length > 0 && (
                <Alert severity="error" sx={{ mb: 1.5 }}>
                  <Typography variant="body2" fontWeight={500}>
                    Corrija os itens abaixo para salvar:
                  </Typography>
                  <Box component="ul" sx={{ m: 0, pl: 2 }}>
                    {listaDeErros.map((mensagem) => (
                      <li key={mensagem}>
                        <Typography variant="body2">{mensagem}</Typography>
                      </li>
                    ))}
                  </Box>
                </Alert>
              )}
              <Grid id="transition-modal-description" container spacing={1.5}>
                <Grid item xs={12} md={7}>
                  <Controller
                    control={control}
                    name="name"
                    rules={{
                      required: 'Informe o nome do quarto',
                    }}
                    render={({ field: { onChange, value }, fieldState }) => (
                      <>
                        <Title title="Nome" />
                        <TextField
                          fullWidth
                          variant="outlined"
                          size="small"
                          placeholder="Informe o nome do quarto"
                          value={value}
                          onChange={onChange}
                          error={!!fieldState.error}
                          helperText={fieldState.error?.message}
                        />
                      </>
                    )}
                  />
                </Grid>

                <Grid item xs={12} md={5}>
                  <Controller
                    control={control}
                    name="capacity"
                    rules={{
                      required: 'Informe a capacidade do quarto',
                      validate: (value) => {
                        const capacidade = Number(value);
                        if (!capacidade || capacidade < 1) {
                          return 'A capacidade deve ser de no mínimo 1 pessoa';
                        }
                        const selecionados = (getValues('usersId') || []).length;
                        if (capacidade < selecionados) {
                          return `A capacidade (${capacidade}) é menor que as ${selecionados} pessoas já alocadas. Remova pessoas ou aumente a capacidade.`;
                        }
                        return true;
                      },
                    }}
                    render={({ field: { onChange, value }, fieldState }) => (
                      <>
                        <Title title="Capacidade" />
                        <TextField
                          fullWidth
                          type="number"
                          inputProps={{ min: 1 }}
                          variant="outlined"
                          size="small"
                          placeholder="Informe a capacidade"
                          value={value}
                          onChange={onChange}
                          error={!!fieldState.error}
                          helperText={
                            fieldState.error?.message ||
                            (!semCapacidade
                              ? `${ocupantes} de ${capacity} vagas preenchidas`
                              : 'Defina a capacidade para liberar a seleção')
                          }
                        />
                      </>
                    )}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Controller
                    control={control}
                    name="tags"
                    rules={{
                      validate: (value) =>
                        (value || []).length > 0 ||
                        'Selecione ao menos uma tag para o quarto',
                    }}
                    render={({ field: { onChange, value }, fieldState }) => (
                      <>
                        <Title title="Tags *" />

                        <Autocomplete
                          multiple
                          size="small"
                          disableCloseOnSelect
                          options={[
                            { value: 'Feminino', label: 'Feminino' },
                            { value: 'Masculino', label: 'Masculino' },
                            { value: 'Familia', label: 'Familia' },
                            { value: 'Outro', label: 'Outro' },
                          ]}
                          isOptionEqualToValue={(option, value) =>
                            option.label == value.label
                          }
                          getOptionLabel={(option) => option.label}
                          ListboxProps={{
                            style: {
                              maxHeight: 200, // altura máxima
                              overflowY: 'auto', // scroll vertical
                            },
                          }}
                          renderOption={(props, option, { selected }) => {
                            const { key, ...optionProps } = props;
                            return (
                              <li key={key} {...optionProps}>
                                <Checkbox
                                  icon={
                                    <CheckBoxOutlineBlank fontSize="small" />
                                  }
                                  checkedIcon={<CheckBox fontSize="small" />}
                                  style={{
                                    marginLeft: '-10px',
                                    marginRight: '5px',
                                  }}
                                  checked={selected}
                                />
                                {option.label}
                              </li>
                            );
                          }}
                          onChange={(_, newValue) => {
                            onChange(newValue);
                          }}
                          value={value || []}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Tags"
                              error={!!fieldState.error}
                              helperText={fieldState.error?.message}
                            />
                          )}
                        />
                      </>
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    control={control}
                    name="groupTags"
                    render={({ field: { onChange, value } }) => (
                      <>
                        <Title
                          title="Restringir a grupos"
                          hint={restrito ? 'Quarto restrito' : 'Quarto aberto'}
                        />
                        <Autocomplete
                          multiple
                          size="small"
                          disableCloseOnSelect
                          options={gruposDoEvento}
                          isOptionEqualToValue={(option, valor) =>
                            option.value === valor.value
                          }
                          getOptionLabel={(option) => option.label}
                          noOptionsText="Nenhum grupo de inscrição no evento"
                          renderOption={(props, option, { selected }) => {
                            const { key, ...optionProps } = props;
                            return (
                              <li key={key} {...optionProps}>
                                <Checkbox
                                  icon={
                                    <CheckBoxOutlineBlank fontSize="small" />
                                  }
                                  checkedIcon={<CheckBox fontSize="small" />}
                                  style={{
                                    marginLeft: '-10px',
                                    marginRight: '5px',
                                  }}
                                  checked={selected}
                                />
                                {option.label}
                              </li>
                            );
                          }}
                          onChange={(_, newValue) => onChange(newValue)}
                          value={value || []}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              placeholder="Deixe vazio para quarto aberto"
                              helperText={
                                restrito
                                  ? 'O check-in só aloca aqui quem for de um desses grupos.'
                                  : 'Sem grupo marcado o quarto é aberto: o check-in usa ele como reserva quando os quartos do grupo lotam.'
                              }
                            />
                          )}
                        />
                      </>
                    )}
                  />
                </Grid>

                {foraDoGrupo.length > 0 && (
                  <Grid item xs={12}>
                    <Alert severity="warning">
                      {`Fora do grupo do quarto: ${foraDoGrupo
                        .map((user) => user.label)
                        .join(', ')}. Remova essas pessoas ou marque o grupo delas.`}
                    </Alert>
                  </Grid>
                )}

                <Grid item xs={12}>
                  <Controller
                    control={control}
                    name="note"
                    render={({ field: { onChange, value } }) => (
                      <>
                        <Title title="Anotações" />
                        <TextField
                          multiline
                          rows={2}
                          fullWidth
                          variant="outlined"
                          size="small"
                          placeholder="Adicione uma anotação"
                          value={value}
                          onChange={onChange}
                        />
                      </>
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    control={control}
                    name="usersId"
                    render={({ field: { onChange, value } }) => {
                      const selecionados: UserOption[] = value || [];

                      return (
                        <>
                          <Title
                            title="Participantes"
                            hint={
                              semCapacidade
                                ? undefined
                                : `${selecionados.length} selecionado(s)`
                            }
                          />
                          <ResponsiveAutocomplete
                            mobileTitle="Participantes"
                            mobileNotice={
                              quartoCheio
                                ? `Capacidade máxima atingida: ${ocupantes} de ${capacity} vagas preenchidas. Aumente a capacidade do quarto para alocar mais pessoas.`
                                : undefined
                            }
                            multiple
                            size="small"
                            disableCloseOnSelect
                            loading={isLoadingUsers}
                            disabled={semCapacidade}
                            groupBy={(option) => option.groupName}
                            options={optionsPermitidas || []}
                            isOptionEqualToValue={(option, value) =>
                              option.value == value.value
                            }
                            getOptionLabel={(option) => option.label}
                            getOptionDisabled={(option) => {
                              const jaSelecionado = selecionados.some(
                                (item) => item.value === option.value
                              );
                              if (jaSelecionado) return false;
                              return quartoCheio;
                            }}
                            noOptionsText="Nenhuma pessoa inscrita encontrada"
                            ListboxProps={{
                              style: {
                                maxHeight: 200, // altura máxima
                                overflowY: 'auto', // scroll vertical
                              },
                            }}
                            renderOption={(props, option, { selected }) => {
                              const { key, ...optionProps } = props;
                              return (
                                <li key={key} {...optionProps}>
                                  <Checkbox
                                    icon={
                                      <CheckBoxOutlineBlank fontSize="small" />
                                    }
                                    checkedIcon={<CheckBox fontSize="small" />}
                                    style={{
                                      marginLeft: '-10px',
                                      marginRight: '5px',
                                    }}
                                    checked={selected}
                                  />
                                  {option.label}
                                </li>
                              );
                            }}
                            onChange={(_, newValue) => {
                              if (newValue.length < selecionados.length) {
                                onChange(newValue);
                                trigger('capacity');
                                return;
                              }
                              if (newValue.length > capacity) {
                                toast.warning(
                                  `Capacidade máxima de ${capacity} pessoas atingida. Aumente a capacidade para alocar mais alguém.`
                                );
                                return;
                              }
                              onChange(newValue);
                              trigger('capacity');
                            }}
                            value={selecionados}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder={
                                  semCapacidade
                                    ? 'Informe a capacidade primeiro'
                                    : 'Selecione os participantes'
                                }
                                helperText={
                                  semCapacidade
                                    ? 'Informe a capacidade do quarto para liberar a seleção'
                                    : quartoCheio
                                      ? `Quarto cheio (${ocupantes}/${capacity}). Aumente a capacidade para alocar mais pessoas.`
                                      : `${vagasRestantes} vaga(s) disponível(is)`
                                }
                              />
                            )}
                          />
                        </>
                      );
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isSaving}
            >
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </Box>
        </Box>
      </Fade>
    </Modal>
  );
}

export { ModalBedRoom };
