import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  Stack,
  Typography,
} from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { ReactNode, useState } from 'react';
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
  formatZipCode,
  removeMask,
} from '../../../../utils';
import { OPTIONS_BOOLEAN, OPTIONS_LEADERSHIP } from '../constants';
import { useBuscaCep } from '../../../../hooks/useBuscaCep';

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

/** Campos de endereço que a consulta de CEP preenche — e portanto pode travar. */
type CampoDoCep = 'street' | 'neighborhood' | 'city' | 'state';

const NADA_TRAVADO: Record<CampoDoCep, boolean> = {
  street: false,
  neighborhood: false,
  city: false,
  state: false,
};

/** Converte o valor 0/1 dos selects de saúde para texto */
function booleanLabel(value: unknown) {
  return OPTIONS_BOOLEAN.find((option) => option.value === Number(value))?.name;
}

function Form({ readOnly = false }: { readOnly?: boolean }) {
  const {
    control,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors },
  } = useFormContext<RegisterUsersFormType>();
  const values = watch();

  const { buscar: buscarCep, buscando: buscandoCep } = useBuscaCep();
  /**
   * Trava só o que a consulta trouxe preenchido, e só nesta sessão de
   * preenchimento. Cadastro antigo aberto para edição abre destravado: o dado
   * dele não veio de consulta nenhuma, e travar o que não se sabe de onde veio
   * impediria a correção justamente do endereço errado.
   */
  const [travados, setTravados] =
    useState<Record<CampoDoCep, boolean>>(NADA_TRAVADO);

  const temCampoTravado = Object.values(travados).some(Boolean);

  /**
   * Campo travado fica em `readOnly`, e não `disabled`: desabilitado o texto
   * some no cinza, sai da ordem de tabulação e não é lido por leitor de tela —
   * o endereço que a pessoa acabou de buscar viraria um borrão. O cadeado diz
   * por que não dá para digitar ali.
   */
  function travaDoCampo(campo: CampoDoCep) {
    if (!travados[campo]) return undefined;

    return {
      readOnly: true,
      endAdornment: (
        <InputAdornment position="end">
          <LockOutlined fontSize="small" color="disabled" />
        </InputAdornment>
      ),
    };
  }

  async function aoDigitarCep(
    digitado: string,
    onChange: (valor: string) => void
  ) {
    // no formulário o CEP anda sem máscara, como cpf e cellphone: a máscara é
    // só o que aparece no campo, e assim nada precisa ser limpo no envio
    const digitos = removeMask(digitado).slice(0, 8);

    onChange(digitos);
    clearErrors('zipCode');

    if (digitos.length < 8) {
      // apagar um dígito para corrigir o CEP destrava tudo de novo: senão o
      // endereço da consulta anterior fica preso na tela sem jeito de sair
      setTravados(NADA_TRAVADO);
      return;
    }

    const resultado = await buscarCep(digitos);

    // consulta superada por outra mais nova: quem responde é a última
    if (resultado.status === 'ignorado') return;

    if (resultado.status !== 'ok') {
      // ViaCEP fora do ar não pode impedir o cadastro: destrava e deixa a
      // pessoa escrever o endereço à mão
      setTravados(NADA_TRAVADO);
      setError('zipCode', {
        type: 'manual',
        message:
          resultado.status === 'nao-encontrado'
            ? 'CEP não encontrado. Confira o número ou preencha o endereço à mão.'
            : 'Não foi possível consultar o CEP agora. Preencha o endereço à mão.',
      });
      return;
    }

    const { endereco } = resultado;

    setValue('street', endereco.street, { shouldValidate: true });
    setValue('neighborhood', endereco.neighborhood, { shouldValidate: true });
    setValue('city', endereco.city, { shouldValidate: true });
    setValue('state', endereco.state, { shouldValidate: true });

    // trava campo a campo, e não o bloco inteiro: em município de CEP único o
    // ViaCEP devolve a rua vazia, e travá-la deixaria o endereço sem como ser
    // completado
    setTravados({
      street: !!endereco.street,
      neighborhood: !!endereco.neighborhood,
      city: !!endereco.city,
      state: !!endereco.state,
    });
  }

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
          {/* O CEP vem primeiro porque é ele que preenche o resto: digitado
              inteiro, a consulta traz rua, bairro, cidade e estado. */}
          <Grid item {...(readOnly ? VIEW_SIZE : { xs: 12, sm: 4, md: 3 })}>
            {readOnly ? (
              <ViewField label="CEP" value={formatZipCode(values.zipCode)} />
            ) : (
              <Controller
                name="zipCode"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    required
                    label="CEP"
                    placeholder="00000-000"
                    // no elemento do input, e não na raiz: é o que faz o
                    // teclado numérico aparecer no celular
                    inputProps={{ inputMode: 'numeric', maxLength: 9 }}
                    value={formatZipCode(value)}
                    error={!!errors.zipCode}
                    errorMessage={errors.zipCode?.message}
                    onChange={(event) =>
                      aoDigitarCep(event.target.value, onChange)
                    }
                    InputProps={
                      buscandoCep
                        ? {
                            endAdornment: (
                              <InputAdornment position="end">
                                <CircularProgress size={16} />
                              </InputAdornment>
                            ),
                          }
                        : undefined
                    }
                  />
                )}
              />
            )}
          </Grid>

          <Grid item {...(readOnly ? VIEW_SIZE : { xs: 8, sm: 8, md: 6 })}>
            {readOnly ? (
              <ViewField label="Rua" value={values.street} />
            ) : (
              <Controller
                name="street"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    required
                    label="Rua"
                    value={value}
                    onChange={onChange}
                    InputProps={travaDoCampo('street')}
                    // o valor chega pela consulta, sem passar pelo foco do
                    // campo, e sem isto o rótulo ficaria por cima do texto
                    InputLabelProps={{ shrink: Boolean(value) || undefined }}
                  />
                )}
              />
            )}
          </Grid>

          {/* Divide a linha com a rua até no celular: o número é curto e uma
              linha inteira só para ele empurraria o resto do bloco para baixo */}
          <Grid item {...(readOnly ? VIEW_SIZE : { xs: 4, sm: 4, md: 3 })}>
            {readOnly ? (
              <ViewField label="Número" value={values.number} />
            ) : (
              <Controller
                name="number"
                control={control}
                render={({ field: { onChange, value } }) => (
                  <Input
                    required
                    label="Número"
                    // texto livre de propósito: cabe "s/n" e "120-A". Nunca
                    // trava, porque o CEP não conhece o número da casa
                    placeholder="120 ou s/n"
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
            )}
          </Grid>

          <Grid item {...(readOnly ? VIEW_SIZE : { xs: 12, sm: 8, md: 5 })}>
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
                    InputProps={travaDoCampo('neighborhood')}
                    InputLabelProps={{ shrink: Boolean(value) || undefined }}
                  />
                )}
              />
            )}
          </Grid>

          <Grid item {...(readOnly ? VIEW_SIZE : { xs: 8, sm: 9, md: 5 })}>
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
                    InputProps={travaDoCampo('city')}
                    InputLabelProps={{ shrink: Boolean(value) || undefined }}
                  />
                )}
              />
            )}
          </Grid>

          <Grid item {...(readOnly ? VIEW_SIZE : { xs: 4, sm: 3, md: 2 })}>
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
                    InputProps={travaDoCampo('state')}
                    InputLabelProps={{ shrink: Boolean(value) || undefined }}
                  />
                )}
              />
            )}
          </Grid>

          {/* Saída de emergência: o ViaCEP erra e desatualiza. Sem isto, um
              endereço errado vindo da consulta não teria como ser corrigido. */}
          {!readOnly && temCampoTravado ? (
            <Grid item xs={12}>
              <Button
                variant="text"
                size="small"
                sx={{ textTransform: 'none', px: 0.5 }}
                onClick={() => setTravados(NADA_TRAVADO)}
              >
                Endereço errado? Editar manualmente
              </Button>
            </Grid>
          ) : null}
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
