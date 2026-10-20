import { useRef, useState } from 'react';
import {
  alpha,
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Add,
  DeleteOutline,
  Draw,
  WorkspacePremiumOutlined,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { Controller, useFormContext } from 'react-hook-form';
import { ModulesFormType } from '../types';
import { AssinaturaDoCertificado } from '../api/certificado';

const MAXIMO_DE_ASSINATURAS = 2;
/** Mesmo teto do servidor, com folga: a assinatura já reduzida cabe nele */
const TAMANHO_MAXIMO = 380_000;

/**
 * A assinatura escaneada, reduzida no navegador antes de subir: no máximo
 * 600×200, em PNG para manter o fundo transparente de quem recortou. Uma foto
 * de celular inteira viraria uma página de PDF pesada.
 */
async function prepararAssinatura(arquivo: File): Promise<string> {
  const url = URL.createObjectURL(arquivo);
  try {
    const imagem = new Image();
    await new Promise((pronta, falhou) => {
      imagem.onload = pronta;
      imagem.onerror = falhou;
      imagem.src = url;
    });
    const escala = Math.min(1, 600 / imagem.width, 200 / imagem.height);
    const tela = document.createElement('canvas');
    tela.width = Math.round(imagem.width * escala);
    tela.height = Math.round(imagem.height * escala);
    tela.getContext('2d')?.drawImage(imagem, 0, 0, tela.width, tela.height);
    return tela.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(url);
  }
}

const vazia = (): AssinaturaDoCertificado => ({
  name: '',
  role: '',
  signature: null,
});

/**
 * O certificado de participação, na etapa "O que este evento tem" do cadastro
 * e da edição: se o evento emite certificado e, ligado, a carga horária e quem
 * assina (até duas pessoas, com a imagem da assinatura). Vai junto com o
 * evento, e é na aba Presença e certificados que eles são gerados.
 */
export function CartaoCertificado({ cartaoSx }: { cartaoSx: object }) {
  const theme = useTheme();
  const { control } = useFormContext<ModulesFormType>();
  const arquivoRef = useRef<HTMLInputElement>(null);
  const [assinaturaDoArquivo, setAssinaturaDoArquivo] = useState(0);

  return (
    <Controller
      name="certificate"
      control={control}
      render={({ field }) => {
        const config = field.value;
        const mudar = (parte: Partial<typeof config>) =>
          field.onChange({ ...config, ...parte });
        const mudarAssinatura = (
          indice: number,
          campo: Partial<AssinaturaDoCertificado>
        ) =>
          mudar({
            signers: config.signers.map((s, i) =>
              i === indice ? { ...s, ...campo } : s
            ),
          });

        const aoEscolher = async (arquivo?: File) => {
          if (!arquivo) return;
          if (!['image/png', 'image/jpeg'].includes(arquivo.type)) {
            toast.error('A assinatura precisa ser uma imagem PNG ou JPG.');
            return;
          }
          try {
            const imagem = await prepararAssinatura(arquivo);
            if (imagem.length > TAMANHO_MAXIMO) {
              toast.error(
                'A imagem da assinatura ficou grande demais. Recorte só a assinatura e tente de novo.'
              );
              return;
            }
            mudarAssinatura(assinaturaDoArquivo, { signature: imagem });
          } catch {
            toast.error('Não foi possível ler a imagem da assinatura.');
          }
        };

        return (
          <Paper sx={cartaoSx}>
            <Box
              sx={{
                width: 44,
                height: 44,
                flexShrink: 0,
                borderRadius: 2,
                display: 'grid',
                placeItems: 'center',
                ...(config.enabled
                  ? {
                      color: theme.palette.primary.main,
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                    }
                  : {
                      color: 'text.disabled',
                      bgcolor: alpha(theme.palette.text.primary, 0.06),
                    }),
              }}
            >
              <WorkspacePremiumOutlined />
            </Box>
            <Box sx={{ flex: '1 1 0', minWidth: 0 }}>
              <Typography fontWeight={600}>
                Certificado de participação
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Para quem fez check-in, com código e QR que confirmam que ele é
                verdadeiro. O participante baixa o dele em Minhas inscrições
                depois que o evento termina.
              </Typography>
            </Box>
            <Switch
              checked={config.enabled}
              onChange={(evento) => mudar({ enabled: evento.target.checked })}
              inputProps={{ 'aria-label': 'Certificado de participação' }}
            />

            {/* o rodapé do cartão, como o quadrante no de Equipes */}
            {config.enabled && (
              <Stack gap={2} sx={{ flexBasis: '100%' }}>
                <TextField
                  label="Carga horária"
                  placeholder="Ex.: 20 horas"
                  size="small"
                  value={config.workload ?? ''}
                  inputProps={{ maxLength: 40 }}
                  helperText="Opcional. Aparece no texto do certificado."
                  onChange={(e) => mudar({ workload: e.target.value })}
                  sx={{ maxWidth: 320 }}
                />

                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Quem assina
                  </Typography>
                  <Stack gap={1.5}>
                    {config.signers.map((assinatura, indice) => (
                      <Stack
                        key={indice}
                        direction={{ xs: 'column', md: 'row' }}
                        gap={1.5}
                        alignItems={{ xs: 'stretch', md: 'center' }}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <TextField
                          label="Nome"
                          size="small"
                          value={assinatura.name}
                          inputProps={{ maxLength: 80 }}
                          error={assinatura.name.trim().length < 2}
                          onChange={(e) =>
                            mudarAssinatura(indice, { name: e.target.value })
                          }
                          sx={{ flex: 1 }}
                        />
                        <TextField
                          label="Cargo"
                          placeholder="Ex.: Pastor presidente"
                          size="small"
                          value={assinatura.role}
                          inputProps={{ maxLength: 80 }}
                          onChange={(e) =>
                            mudarAssinatura(indice, { role: e.target.value })
                          }
                          sx={{ flex: 1 }}
                        />
                        {/* a assinatura sobre branco, como sai no papel */}
                        <Box
                          sx={{
                            width: { xs: '100%', md: 180 },
                            height: 56,
                            flexShrink: 0,
                            borderRadius: 1.5,
                            bgcolor: '#fff',
                            border: `1px dashed ${theme.palette.divider}`,
                            display: 'grid',
                            placeItems: 'center',
                            overflow: 'hidden',
                          }}
                        >
                          {assinatura.signature ? (
                            <Box
                              component="img"
                              src={assinatura.signature}
                              alt={`Assinatura de ${assinatura.name}`}
                              sx={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                              }}
                            />
                          ) : (
                            <Typography variant="caption" color="#8a8aa0">
                              Sem imagem: só a linha
                            </Typography>
                          )}
                        </Box>
                        <Stack direction="row" gap={0.5} sx={{ flexShrink: 0 }}>
                          <Button
                            size="small"
                            startIcon={<Draw />}
                            onClick={() => {
                              setAssinaturaDoArquivo(indice);
                              if (arquivoRef.current) {
                                arquivoRef.current.value = '';
                              }
                              arquivoRef.current?.click();
                            }}
                          >
                            {assinatura.signature
                              ? 'Trocar'
                              : 'Enviar assinatura'}
                          </Button>
                          {assinatura.signature && (
                            <Button
                              size="small"
                              color="inherit"
                              onClick={() =>
                                mudarAssinatura(indice, { signature: null })
                              }
                            >
                              Tirar imagem
                            </Button>
                          )}
                          <Tooltip title="Remover quem assina">
                            <IconButton
                              size="small"
                              aria-label="Remover quem assina"
                              onClick={() =>
                                mudar({
                                  signers: config.signers.filter(
                                    (_, i) => i !== indice
                                  ),
                                })
                              }
                            >
                              <DeleteOutline fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </Stack>
                    ))}
                    {config.signers.length < MAXIMO_DE_ASSINATURAS && (
                      <Button
                        startIcon={<Add />}
                        sx={{ alignSelf: 'flex-start' }}
                        onClick={() =>
                          mudar({ signers: [...config.signers, vazia()] })
                        }
                      >
                        Adicionar quem assina
                      </Button>
                    )}
                  </Stack>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    component="p"
                    sx={{ mt: 1 }}
                  >
                    Até duas pessoas. A imagem é opcional: PNG com fundo
                    transparente fica melhor. Ela só aparece no PDF, e não na
                    página do evento.
                  </Typography>
                </Box>

                <input
                  ref={arquivoRef}
                  hidden
                  type="file"
                  accept="image/png,image/jpeg"
                  onChange={(e) => aoEscolher(e.target.files?.[0])}
                />
              </Stack>
            )}
          </Paper>
        );
      }}
    />
  );
}
