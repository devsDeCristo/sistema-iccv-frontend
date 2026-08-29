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
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { AddPhotoAlternateOutlined, Delete } from '@mui/icons-material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import ReactQuillEditor from '../../../components/reactQuillEditor';
import { campoBuscaSx } from '../../../components/listPageStyles';
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

  // a lista só é buscada com o modal aberto: é tela de admin, não vale manter
  // consulta viva atrás dela
  const { data: grupos } = useGetNewsWhatsappGroups({ enabled: open });

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
  }, [open, news]);

  // os destinos só podem ser marcados depois que a lista de grupos chega
  useEffect(() => {
    if (!open) return;

    const marcados = news?.groups?.map((destino) => destino.groupRoleId) ?? [];

    setDestinos(listaGrupos.filter((grupo) => marcados.includes(grupo.id)));
  }, [open, news, listaGrupos]);

  const { mutate: salvar, isLoading } = useSaveNews({
    onSuccess: () => onClose(),
  });

  const previa = arquivo ? URL.createObjectURL(arquivo) : imagemAtual;

  // o texto do editor vem como HTML: vazio ainda é "<p><br></p>"
  const textoVazio = !texto.replace(/<(.|\n)*?>/g, '').trim();

  const enviar = () => {
    if (!titulo.trim()) {
      toast.error('Dê um título para a notícia.');
      return;
    }

    if (textoVazio) {
      toast.error('Escreva o texto da notícia.');
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

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 600 }}>
        {news ? 'Editar notícia' : 'Nova notícia'}
      </DialogTitle>

      <DialogContent>
        <Stack gap={2.5} sx={{ pt: 0.5 }}>
          <TextField
            label="Título"
            size="small"
            value={titulo}
            onChange={(evento) => setTitulo(evento.target.value)}
            inputProps={{ maxLength: 140 }}
            sx={campoBuscaSx(theme)}
          />

          <TextField
            label="Chamada (aparece no feed)"
            size="small"
            multiline
            minRows={2}
            value={chamada}
            onChange={(evento) => setChamada(evento.target.value)}
            inputProps={{ maxLength: 280 }}
            helperText={`${chamada.length}/280`}
            sx={campoBuscaSx(theme)}
          />

          <Box>
            <Typography sx={{ mb: 1, fontSize: '0.875rem', fontWeight: 500 }}>
              Imagem
            </Typography>

            <input
              ref={inputArquivo}
              hidden
              type="file"
              accept="image/*"
              onChange={(evento) => {
                const escolhido = evento.target.files?.[0] || null;

                if ((escolhido?.size || 0) > TAMANHO_MAXIMO) {
                  toast.error('A imagem não deve passar de 2MB.');
                  return;
                }

                setArquivo(escolhido);
                setRemoverImagem(false);
              }}
            />

            {previa ? (
              <Stack direction="row" gap={2} alignItems="flex-start">
                <Box
                  component="img"
                  src={previa}
                  alt="Prévia da imagem"
                  sx={{
                    width: 200,
                    height: 120,
                    objectFit: 'cover',
                    borderRadius: 2,
                  }}
                />
                <Stack gap={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                    onClick={() => inputArquivo.current?.click()}
                  >
                    Trocar imagem
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<Delete />}
                    sx={{ borderRadius: 2, textTransform: 'none' }}
                    onClick={() => {
                      setArquivo(null);
                      setImagemAtual(null);
                      setRemoverImagem(true);
                    }}
                  >
                    Remover
                  </Button>
                </Stack>
              </Stack>
            ) : (
              <Button
                variant="outlined"
                startIcon={<AddPhotoAlternateOutlined />}
                sx={{ borderRadius: 2, textTransform: 'none' }}
                onClick={() => inputArquivo.current?.click()}
              >
                Escolher imagem
              </Button>
            )}
          </Box>

          <Box>
            <Typography sx={{ mb: 1, fontSize: '0.875rem', fontWeight: 500 }}>
              Texto
            </Typography>
            <ReactQuillEditor value={texto} onChange={setTexto} />
          </Box>

          <Box>
            <Typography sx={{ mb: 1, fontSize: '0.875rem', fontWeight: 500 }}>
              Enviar nos grupos do WhatsApp
            </Typography>

            <Autocomplete
              multiple
              size="small"
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
                    destinos.length ? '' : 'Nenhum grupo — não envia no WhatsApp'
                  }
                  sx={campoBuscaSx(theme)}
                />
              )}
            />

            <Typography
              sx={{ mt: 0.75, fontSize: '0.75rem' }}
              color="text.secondary"
            >
              A lista traz os grupos com link preenchido, de eventos ativos ou em
              teste. A mensagem sai quando a notícia for publicada, com um
              intervalo entre um grupo e outro.
            </Typography>

            {!listaGrupos.length && (
              <Alert severity="info" sx={{ mt: 1.5 }}>
                Nenhum grupo disponível. Preencha o link do grupo de WhatsApp no
                cadastro do evento, na aba de inscrições.
              </Alert>
            )}
          </Box>

          <FormControlLabel
            control={
              <Switch
                checked={publicada}
                onChange={(evento) => setPublicada(evento.target.checked)}
              />
            }
            label={
              publicada
                ? 'Publicada — aparece no feed dos inscritos'
                : 'Rascunho — só o admin vê'
            }
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
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
