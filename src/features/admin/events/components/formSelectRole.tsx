import { Alert, alpha, Box, Stack, Typography, useTheme } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
import { useEffect } from 'react';
import { GroupRole, SelectRoleFormType } from '../types';
import { MinorTermNotice } from './minorTermNotice';
import { formatCurrency } from '../../../../utils';

interface FormSelectRoleProps {
  groupRoles: GroupRole[];
  /** Participante vai completar menos de 16 anos na data do evento */
  isMinor?: boolean;
  /** Termo em branco anexado ao evento, para download */
  minorTermUrl?: string | null;
  /** Termo assinado escolhido nesta tela — pode ser enviado depois em "Minhas Inscrições" */
  signedTermFile?: File | null;
  onSignedTermFileChange?: (file: File | null) => void;
  /** O aviso do termo foi lido; a inscrição de menor não segue sem isso */
  avisoLido?: boolean;
  onAvisoLidoChange?: (lido: boolean) => void;
}

/**
 * Segundo passo: qual ingresso, dentro de cada grupo escolhido.
 *
 * É escolha única por grupo — o formulário sempre trocou a opção anterior pela
 * nova —, e agora a tela diz isso: a marca é redonda, de rádio, e não mais a
 * caixa quadrada que dava a entender que dava para marcar dois.
 *
 * O preço saiu de "Preço: 350" para moeda de verdade, do lado direito do
 * cartão, onde se lê preço. Ingresso sem valor aparece como "Grátis", e não
 * como "R$ 0,00", que faz a pessoa procurar a pegadinha.
 */
function FormSelectRole({
  groupRoles,
  isMinor,
  minorTermUrl,
  signedTermFile,
  onSignedTermFileChange,
  avisoLido,
  onAvisoLidoChange,
}: FormSelectRoleProps) {
  const {
    control,
    setValue,
    formState: { errors },
    reset,
  } = useFormContext<SelectRoleFormType>();
  const theme = useTheme();

  useEffect(() => {
    reset({
      groupRole: groupRoles.map((gr) => ({
        groupRoleId: gr.id,
        roleIds: [],
      })),
    });
  }, [groupRoles, setValue]);

  if (!groupRoles) return <></>;

  /** o canhoto do bilhete, onde mora o preço */
  const LARGURA_DO_CANHOTO = 104;

  const styles = {
    /**
     * O bilhete: corpo à esquerda, canhoto à direita, picote entre os dois.
     *
     * A opção era um retângulo com o preço escrito em texto corrido. Aqui ela
     * tem a forma da coisa que está sendo comprada — e o preço mora onde
     * sempre morou em ingresso, no canhoto, separado por uma linha picotada.
     */
    ingresso: {
      position: 'relative',
      display: 'flex',
      alignItems: 'stretch',
      borderRadius: 2.5,
      cursor: 'pointer',
      border: '1px solid',
      transition: theme.transitions.create(
        ['background-color', 'border-color'],
        { duration: 160 }
      ),
    },
    ingressoHover: {
      '&:hover': {
        borderColor: alpha(theme.palette.primary.main, 0.5),
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
      },
    },
    /**
     * Os furos são da cor do papel de trás, não transparentes: o bilhete tem
     * fundo próprio, e um furo vazado mostraria esse fundo em vez da página.
     */
    furo: {
      position: 'absolute',
      right: LARGURA_DO_CANHOTO - 9,
      width: 18,
      height: 18,
      borderRadius: '50%',
      backgroundColor: theme.palette.background.paper,
      pointerEvents: 'none',
    },
    corpo: {
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      flexGrow: 1,
      minWidth: 0,
      p: 2,
    },
    canhoto: {
      width: LARGURA_DO_CANHOTO,
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      px: 1,
      borderLeft: '2px dashed',
      borderColor: alpha(theme.palette.text.primary, 0.18),
    },
    marca: {
      width: 20,
      height: 20,
      flexShrink: 0,
      borderRadius: '50%',
      display: 'grid',
      placeItems: 'center',
      border: '2px solid',
    },
    miolo: {
      width: 10,
      height: 10,
      borderRadius: '50%',
      backgroundColor: theme.palette.primary.main,
    },
    tipoDeIngresso: {
      fontSize: 10,
      fontWeight: 800,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'text.secondary',
    },
    porPessoa: {
      fontSize: 10.5,
      color: 'text.secondary',
      whiteSpace: 'nowrap',
    },
  };

  const erroDeAlgumGrupo =
    Array.isArray(errors?.groupRole) &&
    errors.groupRole.find((g) => !!g?.roleIds?.message)?.roleIds?.message;

  return (
    <Box>
      <Typography
        sx={{ fontSize: '0.9375rem', color: 'text.secondary', mb: 2 }}
      >
        Escolha o ingresso que corresponde a você em cada grupo.
      </Typography>

      <Stack gap={3}>
        {groupRoles.map((groupRole, indice) => (
          <Box key={groupRole.id}>
            {/* o grupo é o título da seção, e não um prefixo na frase: com
              dois grupos escolhidos a lista vira uma coisa só sem isto */}
            <Stack
              direction="row"
              alignItems="center"
              gap={1}
              sx={{ mb: 1.25 }}
            >
              <Box
                sx={{
                  width: 4,
                  height: 18,
                  borderRadius: 999,
                  backgroundColor: theme.palette.primary.main,
                }}
              />
              <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>
                {groupRole.name}
              </Typography>
            </Stack>

            <Controller
              name={`groupRole.${indice}.roleIds`}
              control={control}
              rules={{ required: 'Selecione ao menos uma opção' }}
              render={({ field }) => (
                <Stack gap={1.25}>
                  {groupRole?.roles?.map((role) => {
                    if (role.id === undefined) return null;

                    const escolhido = field.value?.includes(role.id) ?? false;

                    const escolher = () => {
                      const atuais = field.value || [];
                      if (escolhido) {
                        field.onChange(
                          atuais.filter((id: string) => id !== role.id)
                        );
                        return;
                      }

                      // escolha única: o que estiver marcado neste grupo sai
                      const idsDoGrupo =
                        groupRole.roles
                          ?.map((r) => r.id)
                          .filter((id): id is string => id !== undefined) || [];

                      field.onChange([
                        ...atuais.filter(
                          (id: string) => !idsDoGrupo.includes(id)
                        ),
                        role.id,
                      ]);
                    };

                    return (
                      <Box
                        key={role.id}
                        onClick={escolher}
                        role="radio"
                        aria-checked={escolhido}
                        sx={{
                          ...styles.ingresso,
                          borderColor: escolhido
                            ? theme.palette.primary.main
                            : theme.palette.divider,
                          backgroundColor: escolhido
                            ? alpha(theme.palette.primary.main, 0.08)
                            : alpha(theme.palette.text.primary, 0.02),
                          ...(escolhido ? {} : styles.ingressoHover),
                        }}
                      >
                        {/* os dois furos do picote: círculos da cor da
                          superfície de trás, mordendo a borda do bilhete */}
                        <Box sx={{ ...styles.furo, top: -9 }} />
                        <Box sx={{ ...styles.furo, bottom: -9 }} />

                        <Box sx={styles.corpo}>
                          {/* redondo com o miolo cheio: é escolha única, e a
                            caixa quadrada dizia o contrário */}
                          <Box
                            sx={{
                              ...styles.marca,
                              borderColor: escolhido
                                ? theme.palette.primary.main
                                : alpha(theme.palette.text.primary, 0.3),
                            }}
                          >
                            {escolhido && <Box sx={styles.miolo} />}
                          </Box>

                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={styles.tipoDeIngresso}>
                              Ingresso
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: '0.9375rem',
                                fontWeight: escolhido ? 700 : 600,
                                lineHeight: 1.25,
                                wordBreak: 'break-word',
                              }}
                            >
                              {role.description}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={styles.canhoto}>
                          <Typography
                            sx={{
                              fontSize: role.price ? '1.05rem' : '0.9375rem',
                              fontWeight: 800,
                              lineHeight: 1.1,
                              whiteSpace: 'nowrap',
                              color: role.price
                                ? 'text.primary'
                                : theme.palette.chips.success,
                            }}
                          >
                            {role.price ? formatCurrency(role.price) : 'Grátis'}
                          </Typography>
                          {!!role.price && (
                            <Typography sx={styles.porPessoa}>
                              por pessoa
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            />
          </Box>
        ))}
      </Stack>

      {erroDeAlgumGrupo && (
        <Alert
          severity="error"
          variant="outlined"
          sx={{
            mt: 2,
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.error.main, 0.08),
          }}
        >
          <Typography color="error" variant="body2">
            {erroDeAlgumGrupo}
          </Typography>
        </Alert>
      )}

      {isMinor && (
        <Box sx={{ mt: 3 }}>
          <MinorTermNotice
            minorTermUrl={minorTermUrl}
            signedTermFile={signedTermFile}
            onSignedTermFileChange={onSignedTermFileChange}
            lido={!!avisoLido}
            onLidoChange={(valor) => onAvisoLidoChange?.(valor)}
          />
        </Box>
      )}
    </Box>
  );
}

export { FormSelectRole };
