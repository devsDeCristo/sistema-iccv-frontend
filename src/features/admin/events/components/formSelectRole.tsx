import {
  Alert,
  alpha,
  Box,
  Button,
  Checkbox,
  Divider,
  Grid,
  Link,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { AttachFile, CheckCircle } from '@mui/icons-material';
import { Controller, useFormContext } from 'react-hook-form';
import { GroupRole, SelectRoleFormType } from '../types';
import { useEffect, useRef } from 'react';
import { extensionFromDataUri, triggerDownload } from '../../../../utils';
interface FormSelectRoleProps {
  groupRoles: GroupRole[];
  /** Participante vai completar menos de 16 anos na data do evento */
  isMinor?: boolean;
  /** Termo em branco anexado ao evento, para download */
  minorTermUrl?: string | null;
  /** Termo assinado escolhido nesta tela — pode ser enviado depois em "Minhas Inscrições" */
  signedTermFile?: File | null;
  onSignedTermFileChange?: (file: File | null) => void;
}
function FormSelectRole({
  groupRoles,
  isMinor,
  minorTermUrl,
  signedTermFile,
  onSignedTermFileChange,
}: FormSelectRoleProps) {
  const {
    control,
    setValue,
    formState: { errors },
    reset,
  } = useFormContext<SelectRoleFormType>();
  const theme = useTheme();
  const termFileInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    // Reset roleId when groupRoles change
    // setValue('roleId', []);
    reset({
      groupRole: groupRoles.map((gr) => ({
        groupRoleId: gr.id,
        roleIds: [],
      })),
    });
  }, [groupRoles, setValue]);
  if (!groupRoles) return <></>;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={12}>
        <Typography
          variant="h5"
          sx={{
            mt: -1,
            fontSize: '18px',
            color: theme.palette.text.secondary,
          }}
        >
          Seleciona as regras que você se encaixa em cada grupo
        </Typography>
      </Grid>
      <Grid item xs={12} md={12}>
        <Grid container spacing={2}>
          {groupRoles.map((groupRole) => {
            return (
              <>
                <Grid item xs={12} md={12}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: { xs: '16px', sm: '19px' },
                      wordBreak: 'break-word',
                    }}
                  >
                    Grupo:{' '}
                    <span
                      style={{
                        fontWeight: 'bold',
                        color: theme.palette.text.secondary,
                      }}
                    >
                      {groupRole.name}
                    </span>
                  </Typography>
                  <Divider sx={{ mb: 1 }} />
                  <Controller
                    name={`groupRole.${groupRoles.indexOf(groupRole)}.roleIds`}
                    control={control}
                    rules={{ required: 'Selecione ao menos uma opção' }}
                    render={({ field }) => (
                      <Grid item xs={12} md={12}>
                        {groupRole?.roles?.map((role) => {
                          if (role.id === undefined) return null;
                          const isSelected = field.value?.includes(role.id);
                          const handleToggle = () => {
                            const currentValues = field.value || [];
                            if (isSelected) {
                              field.onChange(
                                currentValues.filter(
                                  (id: string) => id !== role.id
                                )
                              );
                            } else {
                              // Remove todas as roles do mesmo grupo antes de adicionar a nova
                              const otherGroupRoleIds =
                                groupRole.roles
                                  ?.map((r) => r.id)
                                  .filter(
                                    (id): id is string => id !== undefined
                                  ) || [];

                              const valuesWithoutCurrentGroup =
                                currentValues.filter(
                                  (id: string) =>
                                    !otherGroupRoleIds.includes(id)
                                );

                              field.onChange([
                                ...valuesWithoutCurrentGroup,
                                role.id,
                              ]);
                            }
                          };
                          return (
                            <Box
                              key={role.id}
                              onClick={handleToggle}
                              sx={{
                                mt: 2,
                                p: 2,
                                borderRadius: 2,
                                border: isSelected
                                  ? `1px solid ${theme.palette.primary.main}`
                                  : `1px solid ${theme.palette.divider}`,
                                backgroundColor: isSelected
                                  ? alpha(theme.palette.primary.main, 0.08)
                                  : alpha(theme.palette.text.primary, 0.02),
                                cursor: 'pointer',
                                '&:hover': {
                                  ...(!isSelected
                                    ? {
                                        backgroundColor: alpha(
                                          theme.palette.text.primary,
                                          0.08
                                        ),
                                      }
                                    : {}),
                                },
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              {' '}
                              <Checkbox
                                sx={{ p: 0.5, flexShrink: 0 }}
                                value={role.id}
                                checked={isSelected || false}
                                // onChange={handleToggle}
                                inputProps={{ 'aria-label': role.description }}
                              />
                              <Box sx={{ ml: { xs: 1, sm: 2 }, minWidth: 0 }}>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontSize: { xs: '1rem', sm: '1.25rem' },
                                    wordBreak: 'break-word',
                                  }}
                                >
                                  {role.description}
                                </Typography>
                                <Typography variant="body2">
                                  Preço: {role.price}
                                </Typography>
                              </Box>
                            </Box>
                          );
                        })}{' '}
                        {errors?.groupRole &&
                          Array.isArray(errors?.groupRole) &&
                          errors?.groupRole?.some(
                            (g) => !!g?.roleIds?.message
                          ) && (
                            <Alert
                              severity="error"
                              sx={{
                                mt: 2,
                                backgroundColor: alpha(
                                  theme.palette.error.main,
                                  0.1
                                ),
                              }}
                              variant="outlined"
                            >
                              <Typography color="error" variant="body2">
                                {Array.isArray(errors?.groupRole)
                                  ? errors?.groupRole?.find(
                                      (g) => !!g?.roleIds?.message
                                    )?.roleIds?.message
                                  : undefined}
                              </Typography>
                            </Alert>
                          )}
                      </Grid>
                    )}
                  />
                </Grid>{' '}
                {/* <Divider sx={{ mt: 3, mb: 3 }} /> */}
              </>
            );
          })}{' '}
        </Grid>{' '}
      </Grid>

      {isMinor && (
        <Grid item xs={12} md={12}>
          <Alert
            severity="warning"
            variant="outlined"
            sx={{ backgroundColor: alpha(theme.palette.warning.main, 0.08) }}
          >
            <Typography fontWeight={700} gutterBottom>
              ATENÇÃO — PARTICIPANTES MENORES DE 16 ANOS
            </Typography>
            <Typography variant="body2" gutterBottom>
              Para menores de 16 anos, é obrigatória a apresentação de
              autorização feita pelos pais ou responsáveis, informando quem
              acompanhará o(a) participante.
            </Typography>

            <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" sx={{ mt: 1.5 }} gap={1}>
              {minorTermUrl ? (
                <Link
                  component="button"
                  type="button"
                  onClick={() =>
                    triggerDownload(
                      minorTermUrl,
                      `termo-de-autorizacao.${extensionFromDataUri(minorTermUrl)}`
                    )
                  }
                >
                  Baixar termo de autorização
                </Link>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Entre em contato com a organização do evento para obter o termo.
                </Typography>
              )}

              <input
                ref={termFileInputRef}
                hidden
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) =>
                  onSignedTermFileChange?.(e.target.files?.[0] ?? null)
                }
              />
              <Button
                size="small"
                variant="outlined"
                color="warning"
                startIcon={signedTermFile ? <CheckCircle /> : <AttachFile />}
                onClick={() => {
                  if (termFileInputRef.current) termFileInputRef.current.value = '';
                  termFileInputRef.current?.click();
                }}
              >
                {signedTermFile
                  ? signedTermFile.name
                  : 'Anexar termo assinado (opcional agora)'}
              </Button>
            </Stack>

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
              Se preferir, você pode enviar o termo assinado depois, em
              "Minhas Inscrições".
            </Typography>
          </Alert>
        </Grid>
      )}
    </Grid>
  );
}

export { FormSelectRole };
