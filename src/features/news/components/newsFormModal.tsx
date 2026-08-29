import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  AddPhotoAlternateOutlined,
  Close,
  DeleteOutline,
  ImageOutlined,
} from '@mui/icons-material';
import { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import ReactQuillEditor from '../../../components/reactQuillEditor';
import { campoBuscaSx } from '../../../components/listPageStyles';
import { useWhatsappConectado } from '../../settings/whatsapp/useWhatsappConectado';
import { useGetNewsWhatsappGroups } from '../api/getWhatsappGroups';
import { useSaveNews } from '../api/saveNews';
import { News, WhatsappTargetGroup } from '../types';

/** Limite do arquivo, o mesmo da capa do evento. */
const TAMANHO_MAXIMO = 2 * 1024 * 1024;

interface NewsFormModalProps {
  open: boolean;
  /** Notícia em edição; ausente é criação */
  news?: News | null;
  onClose: () => void;
}

/**
 * Bloco do formulário.
 *
 * O rótulo segue a régua das tabelas — 11px, caixa alta, espaçado — porque é o
 * que separa as partes sem precisar de mais uma linha de moldura: o formulário
 * é longo, e sem esses cortes ele vira uma pilha de campos soltos.
 */
function Secao({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <Box>
      <Typography
        sx={{
          mb: 1.5,
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
          color: 'text.secondary',
        }}
      >
        {titulo}
      </Typography>

      {children}
    </Box>
  );
}

function NewsFormModal({ open, news, onClose }: NewsFormModalProps) {
  const theme = useTheme();
  const inputArquivo = useRef<HTMLInputElement>(null);

  const [titulo, setTitulo] = useState('');
  const [chamada, setChamada] = useState('');
  const [texto, setTexto] = useState('');
  const [publicada, setPublicada] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [imagemAtual, setImagemAtual] = useState<string | null>(null);
  const [removerImagem, setRemoverImagem] = useState(false);
  const [destinos, setDestinos] = useState<WhatsappTargetGroup[]>([]);
  const [arrastando, setArrastando] = useState(false);
  const [erros, setErros] = useState<{ titulo?: boolean; texto?: boolean }>({});

  // a lista só é buscada com o modal aberto: é tela de admin, não vale manter
  // consulta viva atrás dela
  const { data: grupos } = useGetNewsWhatsappGroups({ enabled: open });

  const { semNumero } = useWhatsappConectado();

  const listaGrupos = useMemo(() => grupos ?? [], [grupos]);

  // reabrir o modal precisa recarregar o formulário: sem isto a segunda edição
  // abriria com os dados da primeira
  useEffect(() => {
    if (!open) return;

    setTitulo(news?.title || '');
    setChamada(news?.summary || '');
    setTexto(news?.content || '');
    setPublicada(!!news?.isPublished);
    setImagemAtual(news?.imageUrl || null);
    setArquivo(null);
    setRemoverImagem(false);
    setErros({});
  }, [open, news]);

  // os destinos só podem ser marcados depois que a lista de grupos chega
  useEffect(() => {
    if (!open) return;

    const marcados = news?.groups?.map((destino) => destino.groupRoleId) ?? [];

    setDestinos(listaGrupos.filter((grupo) => marcados.includes(grupo.id)));
  }, [open, news, listaGrupos]);

  // a prévia do arquivo escolhido é um endereço temporário do navegador, e
  // precisa ser devolvido: criar um por render vazava um a cada tecla digitada
  const [previaLocal, setPreviaLocal] = useState<string | null>(null);
  useEffect(() => {
    if (!arquivo) {
      setPreviaLocal(null);
      return undefined;
    }

    const endereco = URL.createObjectURL(arquivo);
    setPreviaLocal(endereco);

    return () => URL.revokeObjectURL(endereco);
  }, [arquivo]);

  const { mutate: salvar, isLoading } = useSaveNews({
    onSuccess: () => onClose(),
  });

  const previa = previaLocal ?? imagemAtual;

  // o texto do editor vem como HTML: vazio ainda é "<p><br></p>"
  const textoVazio = !texto.replace(/<(.|\n)*?>/g, '').trim();

  const escolherArquivo = (escolhido?: File | null) => {
    if (!escolhido) return;

    if (!escolhido.type.startsWith('image/')) {
      toast.error('Escolha um arquivo de imagem.');
      return;
    }

    if (escolhido.size > TAMANHO_MAXIMO) {
      toast.error('A imagem não deve passar de 2MB.');
      return;
    }

    setArquivo(escolhido);
    setRemoverImagem(false);
  };

  /**
   * O que acontece com o WhatsApp ao salvar. Fica no rodapé porque é
   * consequência de duas escolhas distantes uma da outra no formulário — os
   * grupos e a chave de publicação —, e a regra de quando o envio sai não é
   * óbvia: notícia já publicada não reenvia sozinha.
   */
  const resumoDoEnvio = () => {
    if (!destinos.length) return 'Nenhum grupo marcado: não sai no WhatsApp.';

    if (semNumero) return 'Sem número conectado: nada sai no WhatsApp agora.';

    if (!publicada) return 'Como rascunho, nada é enviado.';

    if (news?.isPublished) {
      return 'Já publicada: salvar não reenvia. Use o Reenviar na lista.';
    }

    return `Ao salvar, sai para ${destinos.length} grupo(s) no WhatsApp.`;
  };

  const enviar = () => {
    const problemas = { titulo: !titulo.trim(), texto: textoVazio };

    if (problemas.titulo || problemas.texto) {
      setErros(problemas);
      return;
    }

    salvar({
      id: news?.id,
      data: {
        title: titulo.trim(),
        summary: chamada.trim() || undefined,
        content: texto,
        isPublished: publicada,
        imageFile: arquivo,
        removeImage: removerImagem,
        groupRoleIds: destinos.map((grupo) => grupo.id),
      },
    });
  };

  const styles = {
    solta: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1,
      p: 4,
      borderRadius: 3,
      border: '1px dashed',
      borderColor: arrastando ? 'primary.main' : 'divider',
      backgroundColor: arrastando
        ? alpha(theme.palette.primary.main, 0.06)
        : 'transparent',
      textAlign: 'center' as const,
      cursor: 'pointer',
      transition: 'background-color .15s, border-color .15s',
      '&:hover': { backgroundColor: theme.palette.background.hover },
    },
    botaoSobreImagem: {
      borderRadius: 2,
      textTransform: 'none',
      color: '#FFFFFF',
      backgroundColor: alpha('#000000', 0.55),
      backdropFilter: 'blur(4px)',
      '&:hover': { backgroundColor: alpha('#000000', 0.72) },
    },
    // o Quill traz a própria moldura; aqui só se pinta a dele quando há erro
    editor: {
      '& .ql-toolbar, & .ql-container': erros.texto
        ? { borderColor: theme.palette.error.main }
        : {},
    },
    publicacao: {
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      p: 2,
      borderRadius: 3,
      border: '1px solid',
      borderColor: publicada
        ? alpha(theme.palette.chips.success, 0.4)
        : theme.palette.divider,
      backgroundColor: publicada
        ? alpha(theme.palette.chips.success, 0.07)
        : 'transparent',
    },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      {/* `component="div"`: o padrão do MUI é um h2, e o subtítulo abaixo do
          título é um parágrafo — parágrafo dentro de h2 é aninhamento inválido */}
      <DialogTitle component="div" sx={{ py: 2 }}>
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          gap={2}
        >
          <Box>
            <Typography sx={{ fontSize: '1.125rem', fontWeight: 600 }}>
              {news ? 'Editar notícia' : 'Nova notícia'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aparece no mural dos inscritos e, se você marcar grupos, também no
              WhatsApp.
            </Typography>
          </Box>

          <IconButton size="small" onClick={onClose} aria-label="Fechar">
            <Close fontSize="small" />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        <Stack gap={3}>
          <Secao titulo="Conteúdo">
            <Stack gap={2.5}>
              <TextField
                label="Título"
                size="small"
                value={titulo}
                onChange={(evento) => {
                  setTitulo(evento.target.value);
                  if (erros.titulo)
                    setErros((atual) => ({ ...atual, titulo: false }));
                }}
                error={erros.titulo}
                helperText={
                  erros.titulo
                    ? 'Dê um título para a notícia.'
                    : `${titulo.length}/140`
                }
                inputProps={{ maxLength: 140 }}
                sx={campoBuscaSx(theme)}
              />

              <TextField
                label="Chamada"
                size="small"
                multiline
                minRows={2}
                value={chamada}
                onChange={(evento) => setChamada(evento.target.value)}
                inputProps={{ maxLength: 280 }}
                helperText={`Resumo de uma linha, mostrado no mural · ${chamada.length}/280`}
                sx={campoBuscaSx(theme)}
              />

              <Box sx={styles.editor}>
                <ReactQuillEditor
                  value={texto}
                  onChange={(valor) => {
                    setTexto(valor);
                    if (erros.texto)
                      setErros((atual) => ({ ...atual, texto: false }));
                  }}
                />

                {erros.texto && (
                  <Typography
                    variant="caption"
                    color="error"
                    sx={{ display: 'block', mt: 1 }}
                  >
                    Escreva o texto da notícia.
                  </Typography>
                )}
              </Box>
            </Stack>
          </Secao>

          <Divider />

          <Secao titulo="Imagem">
            <input
              ref={inputArquivo}
              hidden
              type="file"
              accept="image/*"
              onChange={(evento) => {
                escolherArquivo(evento.target.files?.[0]);
                // permite escolher o mesmo arquivo de novo depois de remover
                evento.target.value = '';
              }}
            />

            {previa ? (
              <Box
                sx={{
                  position: 'relative',
                  borderRadius: 3,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Box
                  component="img"
                  src={previa}
                  alt="Prévia da imagem"
                  sx={{
                    display: 'block',
                    width: '100%',
                    maxHeight: 260,
                    objectFit: 'cover',
                  }}
                />

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ position: 'absolute', right: 12, bottom: 12 }}
                >
                  <Button
                    size="small"
                    startIcon={<ImageOutlined />}
                    sx={styles.botaoSobreImagem}
                    onClick={() => inputArquivo.current?.click()}
                  >
                    Trocar
                  </Button>
                  <Button
                    size="small"
                    startIcon={<DeleteOutline />}
                    sx={styles.botaoSobreImagem}
                    onClick={() => {
                      setArquivo(null);
                      setImagemAtual(null);
                      setRemoverImagem(true);
                    }}
                  >
                    Remover
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Box
                sx={styles.solta}
                onClick={() => inputArquivo.current?.click()}
                onDragOver={(evento) => {
                  evento.preventDefault();
                  setArrastando(true);
                }}
                onDragLeave={() => setArrastando(false)}
                onDrop={(evento) => {
                  evento.preventDefault();
                  setArrastando(false);
                  escolherArquivo(evento.dataTransfer.files?.[0]);
                }}
              >
                <AddPhotoAlternateOutlined
                  sx={{ fontSize: 40, color: 'text.disabled' }}
                />
                <Typography variant="body2">
                  Arraste uma imagem aqui ou clique para escolher
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Até 2MB. Vai junto da mensagem no WhatsApp, como foto com
                  legenda.
                </Typography>
              </Box>
            )}
          </Secao>

          <Divider />

          <Secao titulo="Envio no WhatsApp">
            <Autocomplete
              multiple
              size="small"
              // sem número conectado a escolha não leva a nada: o disparo só
              // gravaria falha em cada grupo. Os já marcados continuam à vista,
              // porque a notícia em edição pode ter sido montada antes da queda
              disabled={semNumero}
              options={listaGrupos}
              value={destinos}
              onChange={(_, valor) => setDestinos(valor)}
              isOptionEqualToValue={(opcao, valor) => opcao.id === valor.id}
              getOptionLabel={(grupo) => grupo.name}
              // agrupa por evento: o mesmo nome de grupo aparece em vários
              // cursilhos, e sem o cabeçalho não dá para saber qual é qual
              groupBy={(grupo) =>
                grupo.event.status === 'TEST'
                  ? `${grupo.event.name} (em teste)`
                  : grupo.event.name
              }
              renderTags={(valor, getTagProps) =>
                valor.map((grupo, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={grupo.id}
                    size="small"
                    label={`${grupo.event.name} / ${grupo.name}`}
                  />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder={
                    destinos.length
                      ? ''
                      : semNumero
                        ? 'Sem número conectado'
                        : 'Nenhum grupo escolhido'
                  }
                  sx={campoBuscaSx(theme)}
                />
              )}
            />

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 1 }}
            >
              A lista traz os grupos com link preenchido, de eventos ativos ou
              em teste. As mensagens saem uma de cada vez, com intervalo entre
              elas.
            </Typography>

            {semNumero && (
              <Alert severity="warning" sx={{ mt: 1.5, borderRadius: 2 }}>
                Nenhum número conectado ao WhatsApp, então não dá para escolher
                grupos agora. Conecte em Configurações → Disparadores; a notícia
                pode ser salva do mesmo jeito.
              </Alert>
            )}

            {!semNumero && !listaGrupos.length && (
              <Alert severity="info" sx={{ mt: 1.5, borderRadius: 2 }}>
                Nenhum grupo disponível. Preencha o link do grupo de WhatsApp no
                cadastro do evento, na aba de inscrições.
              </Alert>
            )}
          </Secao>

          <Divider />

          <Secao titulo="Publicação">
            <Box sx={styles.publicacao}>
              <Switch
                checked={publicada}
                onChange={(evento) => setPublicada(evento.target.checked)}
              />

              <Box>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600 }}>
                  {publicada ? 'Publicada' : 'Rascunho'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {publicada
                    ? 'Aparece no mural dos inscritos assim que você salvar.'
                    : 'Só o admin vê. Nada é enviado enquanto estiver assim.'}
                </Typography>
              </Box>
            </Box>
          </Secao>
        </Stack>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ flex: 1, mr: 1 }}
        >
          {resumoDoEnvio()}
        </Typography>

        <Button
          onClick={onClose}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          disabled={isLoading}
          onClick={enviar}
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          {news ? 'Salvar' : 'Criar notícia'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export { NewsFormModal };
