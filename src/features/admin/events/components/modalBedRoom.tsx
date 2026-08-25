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
  usersId: [] as UserOption[],
};

function ModalBedRoom({
  open,
  handleClose,
  eventId = '',
  bedRoom,
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

  const capacity = Number(watch('capacity') || 0);
  const ocupantes = (watch('usersId') || []).length;
  const vagasRestantes = capacity - ocupantes;
  const semCapacidade = capacity <= 0;
  const quartoCheio = !semCapacidade && vagasRestantes <= 0;

  const onSubimitBedroom = (data: any) => {
    const { tags, capacity, ...rest } = data;
    const transoformData = {
      ...rest,
      tags: (tags || []).map((tag: any) => tag.value),
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
                            options={options || []}
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
