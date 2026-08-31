import { Box, Grid, Switch, Typography } from '@mui/material';
import { Input } from '../../../../components/input';
import { Controller, useFormContext } from 'react-hook-form';
import { InputSelect } from '../../../../components/inputSelect';
import { OPTIONS_STATUS } from '../constants';
import { GeneralInfoFormType } from '../types';
import 'react-quill/dist/quill.snow.css';
import ReactQuillEditor from '../../../../components/reactQuillEditor';
import { useRole } from '../../../../hooks/useRole';
import { useGetChurches } from '../../churches/api/getChurches';
type FormGeneralInfoProps = {
  /**
   * Mostra a escolha da igreja. Vale só na criação: depois de criado o evento
   * não muda de igreja — os inscritos, pagamentos e quartos iriam junto.
   */
  escolheIgreja?: boolean;
};

function FormGeneralInfo({ escolheIgreja = false }: FormGeneralInfoProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext<GeneralInfoFormType>();

  // o admin não escolhe: o backend vincula o evento à igreja do perfil dele.
  // O super admin não pertence a nenhuma, então precisa dizer para qual cria.
  const { isSuperAdmin } = useRole();
  const { data: churches = [] } = useGetChurches();
  const mostraIgreja = escolheIgreja && isSuperAdmin;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={12}>
        <Typography variant="h6" fontSize={'18px'}>
          Informações Gerais do Evento
        </Typography>
      </Grid>
      <Grid item xs={12} md={6}>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input
              size="small"
              value={value}
              inputProps={{ maxLength: 100 }}
              onChange={onChange}
              required
              label="Nome do evento"
              error={!!errors.name}
              errorMessage={errors.name?.message}
            />
          )}
        />
      </Grid>{' '}
      <Grid item xs={12} md={6}>
        <Controller
          control={control}
          name="status"
          render={({ field: { onChange, value } }) => (
            <InputSelect
              size="small"
              label="Status do evento"
              menuOptions={OPTIONS_STATUS}
              value={value ?? ''}
              onChange={onChange}
              // o aviso só aparece no status que esconde o evento: em "Ativo"
              // seria ruído embaixo de um campo que já se explica
              helperText={
                value === 'TEST'
                  ? 'Evento de teste: aparece na área do usuário só para admin e super admin'
                  : undefined
              }
              error={!!errors.status}
              errorMessage={errors.status?.message}
            />
          )}
        />
      </Grid>{' '}
      {mostraIgreja && (
        <Grid item xs={12} md={6}>
          <Controller
            control={control}
            name="churchId"
            render={({ field: { onChange, value } }) => (
              <InputSelect
                size="small"
                label="Igreja do evento"
                menuOptions={churches.map((church) => ({
                  value: church.id,
                  name: church.name,
                }))}
                value={value ?? ''}
                onChange={onChange}
                helperText="O evento e os inscritos ficam visíveis só para o painel desta igreja"
                error={!!errors.churchId}
                errorMessage={errors.churchId?.message}
              />
            )}
          />
        </Grid>
      )}
      <Grid item xs={12} md={12}>
        <Controller
          control={control}
          name="hideVacancies"
          render={({ field: { onChange, value } }) => (
            <Box display="flex" alignItems="center" gap={1}>
              <Switch
                checked={value}
                onChange={(e) => onChange(e.target.checked)}
              />{' '}
              <Box gap={1}>
                <Typography>Ocultar vagas</Typography>
                <Typography variant="body2" color="textSecondary">
                  Oculta a quantidade de vagas restantes para cada grupo na
                  página de detalhes do evento
                </Typography>
              </Box>
            </Box>
          )}
        />
      </Grid>{' '}
      <Grid item xs={12} md={12}>
        <Controller
          control={control}
          name="groupLink"
          render={({ field: { onChange, value } }) => (
            <Input
              size="small"
              value={value}
              inputProps={{ maxLength: 200 }}
              onChange={onChange}
              label="Link do grupo de whatsapp"
              error={!!errors.groupLink}
              errorMessage={errors.groupLink?.message}
            />
          )}
        />
      </Grid>
      <Grid item xs={12} md={12}>
        <Controller
          control={control}
          name="shortDescription"
          render={({ field: { onChange, value } }) => (
            <Input
              size="small"
              value={value}
              onChange={onChange}
              inputProps={{ maxLength: 100 }}
              // required
              label="Descrição curta"
              helperText={`${value?.length || 0}/100 caracteres`}
              error={!!errors.shortDescription}
              errorMessage={errors.shortDescription?.message}
            />
          )}
        />
      </Grid>{' '}
      <Grid item xs={12} md={12}>
        <Typography variant="subtitle1" fontSize={'16px'} mb={1}>
          Descrição detalhada
        </Typography>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, value } }) => (
            <ReactQuillEditor key={'quill'} value={value} onChange={onChange} />
          )}
        />
      </Grid>
    </Grid>
  );
}

export { FormGeneralInfo };
