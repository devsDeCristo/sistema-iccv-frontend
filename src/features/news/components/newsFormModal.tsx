import {
  Box,
  Button,
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
import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import ReactQuillEditor from '../../../components/reactQuillEditor';
import { campoBuscaSx } from '../../../components/listPageStyles';
import { useSaveNews } from '../api/saveNews';
import { News } from '../types';

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
