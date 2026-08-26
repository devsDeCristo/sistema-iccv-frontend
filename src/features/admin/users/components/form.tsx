import { Box, Divider, Grid, Stack, Typography } from '@mui/material';
import { ReactNode } from 'react';
import { Input } from '../../../../components/input';
import { InputDatePicker } from '../../../../components/inputDatePicker';
import { InputSelect } from '../../../../components/inputSelect';
import { Controller, useFormContext } from 'react-hook-form';
import { RegisterUsersFormType } from '../../../../types/user';
import {
  formatCPF,
  formatDate,
  formatPhoneNumber,
  formatState,
} from '../../../../utils';
import { OPTIONS_BOOLEAN, OPTIONS_LEADERSHIP } from '../constants';

/** Bloco de campos agrupados por categoria (dados pessoais, endereço, etc.) */
/**
 * Sem Paper de propósito: a página já é uma superfície com padding, e envolver
 * cada grupo numa segunda superfície só empilhava caixa dentro de caixa. O que
 * agrupa é o título com a divisória embaixo.
 */
function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box component="section">
      {/* em rem para acompanhar quem redimensiona a raiz — na tela de
          detalhes continua nos mesmos 18px */}
      <Typography variant="h6" fontSize="1.125rem" fontWeight={600}>
        {title}
      </Typography>
      <Divider sx={{ mt: 1, mb: 2.5 }} />
      <Grid container spacing={2.5}>
        {children}
      </Grid>
    </Box>
  );
}

/** Exibe um campo como texto, no lugar do input, quando o form está em leitura */
function ViewField({ label, value }: { label: string; value?: ReactNode }) {
  const isEmpty = value === null || value === undefined || value === '';

  return (
    <Stack gap={0.25}>
      <Typography
        variant="caption"
        color="text.secondary"
        // um pouco mais de corpo: no tamanho anterior o rótulo quase
        // desaparecia ao lado do valor
        sx={{ fontWeight: 500, lineHeight: 1.4 }}
      >
        {label}
      </Typography>
      <Typography
        variant="body1"
        color={isEmpty ? 'text.disabled' : 'text.primary'}
        sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
      >
        {isEmpty ? '—' : value}
      </Typography>
    </Stack>
  );
}

/**
 * Em leitura os valores são curtos, então as colunas não precisam da largura
 * dos inputs — um grid uniforme e mais estreito evita buracos entre os campos.
 */
const VIEW_SIZE = { xs: 12, sm: 6, md: 3 };

/** Converte o valor 0/1 dos selects de saúde para texto */
function booleanLabel(value: unknown) {
  return OPTIONS_BOOLEAN.find((option) => option.value === Number(value))?.name;
}

function Form({ readOnly = false }: { readOnly?: boolean }) {
  const {
    control,
    watch,
    formState: { errors },
  } = useFormContext<RegisterUsersFormType>();
  const values = watch();

  return (
    // espaçamento maior entre os grupos: sem superfície, é o vão que separa
    <Grid container spacing={4}>
      <Grid item xs={12}>
        <Section title="Dados pessoais">
          <Grid item {...(readOnly ? VIEW_SIZE : { xs: 12, md: 8 })}>
            {readOnly ? (
              <ViewField label="Nome completo" value={values.fullName} />
            ) : (
              <Controller
                control={control}
                name="fullName"
                render={({ field: { onChange, value } }) => (
                  <Input
                    value={value}
                    onChange={onChange}
                    required
                    label="Nome completo"
                  />
                )}
              />
            )}
          </Grid>

          <Grid item {...(readOnly ? VIEW_SIZE : { xs: 12, md: 4 })}>
            {readOnly ? (
              <ViewField label="Nome do crachá" value={values.badgeName} />
            ) : (
              <Controller
                control={control}
                name="badgeName"
                render={({ field: { onChange, value } }) => (
                  <Input
                    value={value}
                    onChange={onChange}
                    required
                    label="Nome do crachá"
                  />
                )}
              />
            )}
          </Grid>

          <Grid item {...(readOnly ? VIEW_SIZE : { xs: 12, sm: 6, md: 3 })}>
            {readOnly ? (
              <ViewField label="CPF" value={values.cpf} />
            ) : (
              <Controller
                name="cpf"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    required
                    label="CPF"
                    value={value}
                    error={!!errors.cpf}
                    errorMessage={errors.cpf?.message}
                    onChange={(event) =>
                      onChange(formatCPF(event.target.value))
                    }
                  />
                )}
              />
            )}
          </Grid>

          <Grid item {...(readOnly ? VIEW_SIZE : { xs: 12, sm: 6, md: 3 })}>
            {readOnly ? (
              <ViewField
                label="Data de nascimento"
                value={values.birthday ? formatDate(values.birthday) : ''}
              />
            ) : (
              <Controller
                name="birthday"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <InputDatePicker
                    label="Data de nascimento"
                    value={value as unknown as Date}
                    onChange={onChange}
                    errorMessage={errors.birthday?.message}
                  />
                )}
              />
            )}
          </Grid>

          <Grid item {...(readOnly ? VIEW_SIZE : { xs: 12, sm: 6, md: 3 })}>
            {readOnly ? (
              <ViewField label="Celular" value={values.cellphone} />
            ) : (
              <Controller
                name="cellphone"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    required
                    label="Celular"
                    value={value}
                    error={!!errors.cellphone}
                    errorMessage={errors.cellphone?.message}
                    onChange={(event) =>
                      onChange(formatPhoneNumber(event.target.value))
                    }
                  />
                )}
              />
            )}
          </Grid>

          <Grid item {...(readOnly ? VIEW_SIZE : { xs: 12, sm: 6, md: 3 })}>
            {readOnly ? (
              <ViewField
                label="Contato de emergência"
                value={values.emergencyContact}
              />
            ) : (
              <Controller
                name="emergencyContact"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    required
                    label="Contato de emergência"
                    value={value}
                    error={!!errors.emergencyContact}
                    errorMessage={errors.emergencyContact?.message}
                    onChange={(event) =>
                      onChange(formatPhoneNumber(event.target.value))
                    }
                  />
                )}
              />
            )}
          </Grid>

          <Grid item {...(readOnly ? VIEW_SIZE : { xs: 12, md: 7 })}>
            {readOnly ? (
              <ViewField label="E-mail" value={values.email} />
            ) : (
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, value } }) => (
                  <Input
                    value={value}
                    onChange={onChange}
                    required
                    label="E-mail"
                  />
                )}
              />
            )}
          </Grid>

          <Grid item {...(readOnly ? VIEW_SIZE : { xs: 12, md: 5 })}>
            {readOnly ? (
              <ViewField label="Profissão" value={values.profession} />
            ) : (
              <Controller
                name="profession"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    required
                    label="Profissão"
                    value={value}
                    error={!!errors.profession}
                    errorMessage={errors.profession?.message}
                    onChange={onChange}
                  />
                )}
              />
            )}
          </Grid>
        </Section>
      </Grid>

      <Grid item xs={12}>
        <Section title="Endereço">
          <Grid item {...(readOnly ? VIEW_SIZE : { xs: 12, sm: 6, md: 5 })}>
            {readOnly ? (
              <ViewField label="Cidade" value={values.city} />
            ) : (
              <Controller
                name="city"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    required
                    label="Cidade"
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
            )}
          </Grid>

          <Grid item {...(readOnly ? VIEW_SIZE : { xs: 12, sm: 6, md: 5 })}>
            {readOnly ? (
              <ViewField label="Bairro" value={values.neighborhood} />
            ) : (
              <Controller
                name="neighborhood"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    required
                    label="Bairro"
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
            )}
          </Grid>

          <Grid item {...(readOnly ? VIEW_SIZE : { xs: 6, sm: 3, md: 2 })}>
            {readOnly ? (
              <ViewField label="Estado" value={values.state} />
            ) : (
              <Controller
                name="state"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    required
                    label="Estado"
                    placeholder="RN"
                    value={value}
                    onChange={(event) =>
                      onChange(formatState(event.target.value)?.toUpperCase())
                    }
                  />
                )}
              />
            )}
          </Grid>
        </Section>
      </Grid>

      <Grid item xs={12}>
        <Section title="Dados de saúde">
          <Grid item {...(readOnly ? VIEW_SIZE : { xs: 12, sm: 6, md: 3 })}>
            {readOnly ? (
              <ViewField
                label="Possui Diabetes?"
                value={booleanLabel(values.diabetes)}
              />
            ) : (
              <Controller
                name="diabetes"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <InputSelect
                    label="Possui Diabetes?"
                    menuOptions={OPTIONS_BOOLEAN}
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
            )}
          </Grid>

          <Grid item {...(readOnly ? VIEW_SIZE : { xs: 12, sm: 6, md: 3 })}>
            {readOnly ? (
              <ViewField
                label="Possui Hipertensão?"
                value={booleanLabel(values.hypertensive)}
              />
            ) : (
              <Controller
                name="hypertensive"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <InputSelect
                    label="Possui Hipertensão?"
                    menuOptions={OPTIONS_BOOLEAN}
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
            )}
          </Grid>

          <Grid item xs={12}>
            {readOnly ? (
              <ViewField label="Observações" value={values.notes} />
            ) : (
              <Controller
                name="notes"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    value={value}
                    onChange={onChange}
                    multiline
                    minRows={2}
                    label="Observações"
                    placeholder="Insira aqui caso tenha alguma alergia ou algo parecido"
                  />
                )}
              />
            )}
          </Grid>
        </Section>
      </Grid>

      <Grid item xs={12}>
        <Section title="Outros">
          <Grid item {...(readOnly ? VIEW_SIZE : { xs: 12, sm: 6, md: 4 })}>
            {readOnly ? (
              <ViewField label="Religião" value={values.religion} />
            ) : (
              <Controller
                name="religion"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    label="Religião"
                    value={value}
                    error={!!errors.religion}
                    errorMessage={errors.religion?.message}
                    onChange={onChange}
                  />
                )}
              />
            )}
          </Grid>

          <Grid item {...(readOnly ? VIEW_SIZE : { xs: 12, sm: 6, md: 4 })}>
            {readOnly ? (
              <ViewField label="Indicado por" value={values.indicatedBy} />
            ) : (
              <Controller
                name="indicatedBy"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    required
                    label="Indicado por"
                    placeholder="Nome de quem indicou"
                    value={value}
                    onChange={onChange}
                    error={!!errors.indicatedBy}
                    errorMessage={errors.indicatedBy?.message}
                  />
                )}
              />
            )}
          </Grid>

          <Grid item {...(readOnly ? VIEW_SIZE : { xs: 12, md: 4 })}>
            {readOnly ? (
              <ViewField
                label="Ministério na igreja"
                value={values.leadershipPosition}
              />
            ) : (
              <Controller
                name="leadershipPosition"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <InputSelect
                    label="Ministério na igreja"
                    menuOptions={OPTIONS_LEADERSHIP}
                    value={value}
                    onChange={onChange}
                    helperText={errors.leadershipPosition?.message}
                  />
                )}
              />
            )}
          </Grid>
        </Section>
      </Grid>
    </Grid>
  );
}

export { Form };
