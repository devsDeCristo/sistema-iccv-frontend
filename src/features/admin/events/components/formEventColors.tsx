import {
  alpha,
  Box,
  Button,
  Grid,
  InputBase,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { AutoAwesome } from '@mui/icons-material';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { toast } from 'react-toastify';
import { EventLogoFormType } from '../types';
import { coresDaImagem, ehCorHex } from '../eventColors';

type CampoDeCor = 'primaryColor' | 'secondaryColor' | 'tertiaryColor';

/**
 * Onde cada cor aparece na página do evento (src/pages/events/details).
 *
 * Escrito no campo, e não só na documentação: escolher três cores sem saber o
 * que cada uma pinta é escolher no escuro — e a primária, que manda em quase
 * tudo, precisa ser a mais forte das três.
 *
 * Se a divisão mudar lá, muda aqui junto, ou o formulário passa a prometer o
 * que a página não faz.
 */
const CAMPOS: { nome: CampoDeCor; rotulo: string; pinta: string }[] = [
  {
    nome: 'primaryColor',
    rotulo: 'Primária',
    pinta: 'Botões, barras e detalhes · card Quando',
  },
  { nome: 'secondaryColor', rotulo: 'Secundária', pinta: 'Card Onde' },
  {
    nome: 'tertiaryColor',
    rotulo: 'Terciária',
    pinta: 'Card Tipos de ingresso',
  },
];

type FormEventColorsProps = {
  /** logo em exibição: arquivo recém-escolhido ou a que está salva */
  logoImagem: string | null;
  coverImagem: string | null;
};

/**
 * As três cores do evento.
 *
 * Elas nascem da logo e da capa — a arte já foi feita com uma paleta, e pedir
 * para o admin reencontrá-la num seletor é pedir para ele errar. O que sai da
 * leitura é sugestão: os três campos continuam abertos para digitar ou escolher
 * no seletor do sistema.
 *
 * A leitura só alcança imagem escolhida agora. A que já está salva vive no
 * Storage, de outro domínio, e o navegador não deixa ler os pixels de lá — por
 * isso a sugestão nunca apaga o que já está preenchido.
 */
function FormEventColors({ logoImagem, coverImagem }: FormEventColorsProps) {
  const theme = useTheme();
  const { control, getValues, setValue } = useFormContext<EventLogoFormType>();
  const [lendo, setLendo] = useState(false);

  const aplicar = useCallback(
    (campo: CampoDeCor, cor?: string) => {
      if (cor) setValue(campo, cor, { shouldDirty: true });
    },
    [setValue]
  );

  // sugestão da logo: só entra em campo vazio, para não desfazer a escolha de
  // quem já mexeu no seletor
  useEffect(() => {
    if (!logoImagem || ehCorHex(getValues('primaryColor'))) return;

    let ativo = true;
    coresDaImagem(logoImagem, 1)
      .then(([cor]) => ativo && aplicar('primaryColor', cor))
      .catch(() => undefined);

    return () => {
      ativo = false;
    };
  }, [aplicar, getValues, logoImagem]);

  useEffect(() => {
    if (!coverImagem) return;

    const faltaSecundaria = !ehCorHex(getValues('secondaryColor'));
    const faltaTerciaria = !ehCorHex(getValues('tertiaryColor'));
    if (!faltaSecundaria && !faltaTerciaria) return;

    let ativo = true;
    coresDaImagem(coverImagem, 2)
      .then(([primeira, segunda]) => {
        if (!ativo) return;
        if (faltaSecundaria) aplicar('secondaryColor', primeira);
        if (faltaTerciaria) aplicar('tertiaryColor', segunda);
      })
      .catch(() => undefined);

    return () => {
      ativo = false;
    };
  }, [aplicar, coverImagem, getValues]);

  const lerDasImagens = async () => {
    setLendo(true);
    try {
      let leu = false;

      if (logoImagem) {
        const [cor] = await coresDaImagem(logoImagem, 1);
        aplicar('primaryColor', cor);
        leu = leu || !!cor;
      }

      if (coverImagem) {
        const [primeira, segunda] = await coresDaImagem(coverImagem, 2);
        aplicar('secondaryColor', primeira);
        aplicar('tertiaryColor', segunda);
        leu = leu || !!primeira;
      }

      if (!leu) toast.info('Nenhuma imagem para ler as cores.');
    } catch {
      toast.error(
        'Não foi possível ler as cores destas imagens. Envie os arquivos de novo ou escolha as cores à mão.'
      );
    } finally {
      setLendo(false);
    }
  };

  const styles = {
    paper: {
      p: { xs: 2, sm: 2.5 },
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      boxShadow:
        theme.palette.mode === 'dark' ? '' : '0px 0px 5px 2px rgba(0,0,0,0.1)',
    },
    cartao: {
      borderRadius: 2,
      overflow: 'hidden',
      border: `1px solid ${theme.palette.divider}`,
      transition: theme.transitions.create('border-color'),
      '&:hover': { borderColor: theme.palette.text.disabled },
    },
    /**
     * A cor é o campo: uma faixa grande, do tamanho de quem manda no cartão, e
     * não um quadradinho ao lado de uma caixa de texto. O seletor do sistema
     * fica por cima dela, invisível, porque o desenho nativo dele muda em cada
     * navegador e nenhum deles combina com o resto da tela.
     */
    faixa: {
      position: 'relative',
      height: 64,
      display: 'grid',
      placeItems: 'center',
      cursor: 'pointer',
      color: 'text.disabled',
    },
    // xadrez de campo vazio: diz que ali não há cor, em vez de fingir branco
    vazia: {
      backgroundImage: `linear-gradient(45deg, ${alpha(
        theme.palette.text.primary,
        0.08
      )} 25%, transparent 25%, transparent 75%, ${alpha(
        theme.palette.text.primary,
        0.08
      )} 75%), linear-gradient(45deg, ${alpha(
        theme.palette.text.primary,
        0.08
      )} 25%, transparent 25%, transparent 75%, ${alpha(
        theme.palette.text.primary,
        0.08
      )} 75%)`,
      backgroundSize: '12px 12px',
      backgroundPosition: '0 0, 6px 6px',
    },
    seletor: {
      position: 'absolute',
      inset: 0,
      width: '100%',
      height: '100%',
      padding: 0,
      border: 'none',
      opacity: 0,
      cursor: 'pointer',
    },
    rodape: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 1,
      px: 1.25,
      py: 0.75,
    },
    rotulo: {
      fontSize: 11,
      fontWeight: 800,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: 'text.secondary',
    },
    // onde a cor aparece na página, em letra de apoio: é referência, não campo
    ondePinta: {
      fontSize: 11,
      lineHeight: 1.35,
      color: 'text.disabled',
    },
    hex: {
      width: 90,
      '& input': {
        p: 0,
        fontSize: 13,
        fontFamily: 'monospace',
        textAlign: 'right',
      },
    },
  };

  return (
    <Paper sx={styles.paper}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={1}
      >
        <Box>
          <Typography variant="h6" fontSize={18}>
            Cores do evento
          </Typography>
          <Typography variant="body2" color="text.secondary">
            A primária sai da logo; as outras duas, da capa. Sem cores, o evento
            usa o padrão do sistema.
          </Typography>
        </Box>

        <Button
          size="small"
          startIcon={<AutoAwesome />}
          onClick={lerDasImagens}
          disabled={lendo || (!logoImagem && !coverImagem)}
          sx={{ textTransform: 'none' }}
        >
          Tirar das imagens
        </Button>
      </Stack>

      <Grid container spacing={2}>
        {CAMPOS.map((campo) => (
          <Grid item xs={12} sm={4} key={campo.nome}>
            <Controller
              name={campo.nome}
              control={control}
              render={({ field }) => {
                const definida = ehCorHex(field.value);
                const cor = definida && field.value ? field.value : '#FFFFFF';

                return (
                  <Box sx={styles.cartao}>
                    <Box
                      sx={{
                        ...styles.faixa,
                        ...(definida ? { backgroundColor: cor } : styles.vazia),
                      }}
                    >
                      {!definida && (
                        <Typography variant="caption">Escolher</Typography>
                      )}
                      <Box
                        component="input"
                        type="color"
                        value={cor}
                        aria-label={`Cor ${campo.rotulo.toLowerCase()}`}
                        onChange={(
                          evento: React.ChangeEvent<HTMLInputElement>
                        ) => field.onChange(evento.target.value.toUpperCase())}
                        sx={styles.seletor}
                      />
                    </Box>

                    <Box sx={styles.rodape}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography sx={styles.rotulo}>
                          {campo.rotulo}
                        </Typography>
                        <Typography sx={styles.ondePinta}>
                          {campo.pinta}
                        </Typography>
                      </Box>

                      {/* digitar é o caminho de quem já tem o código da marca;
                          o texto entra como veio e só vira cor quando fecha os
                          seis dígitos, senão a faixa piscaria a cada tecla */}
                      <InputBase
                        value={field.value ?? ''}
                        onChange={(evento) =>
                          field.onChange(
                            evento.target.value.toUpperCase().slice(0, 7)
                          )
                        }
                        placeholder="#2563EB"
                        sx={styles.hex}
                        inputProps={{
                          maxLength: 7,
                          'aria-label': `Código da cor ${campo.rotulo.toLowerCase()}`,
                        }}
                      />
                    </Box>
                  </Box>
                );
              }}
            />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}

export { FormEventColors };
