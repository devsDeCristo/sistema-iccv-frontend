import { useState } from 'react';
import {
  alpha,
  Box,
  Button,
  ButtonBase,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { Add, DeleteOutline, Link as LinkIcon } from '@mui/icons-material';
import { ResponsiveModal } from '../../../components/responsiveModal';
import { useCriarSolicitacao } from '../api';
import { MINISTERIOS } from '../constants';
import { ICONE_DO_MINISTERIO } from '../ministerios';

const VAZIO = { ministerio: '', titulo: '', descricao: '' };
type Produto = { nome: string; quantidade: string; link: string };
const PRODUTO_VAZIO: Produto = { nome: '', quantidade: '1', link: '' };
/** O mesmo teto da API */
const MAX_PRODUTOS = 20;

const quantidadeValida = (q: string) => /^\d{1,3}$/.test(q) && Number(q) >= 1;

/** A API só aceita http(s): é o que vira link clicável na tela */
const linkValido = (link: string) =>
  !link.trim() || /^https?:\/\/\S+$/i.test(link.trim());

interface Props {
  open: boolean;
  /** a igreja de que a pessoa é membro: é para ela que o pedido vai */
  igreja: string;
  onClose: () => void;
}

/**
 * O membro pede à igreja dele: escolhe o ministério num card, dá um título ao
 * pedido, diz por quê e lista os produtos (nome, quantidade e, opcional, o
 * link da loja) — um pedido pode ter vários. Os cards usam a cor do módulo (a
 * tela abre com `TemaDoModulo`).
 *
 * Os obrigatórios levam o asterisco pelo rótulo (`InputLabelProps.required`),
 * e não pelo `required` do campo: esse acendia o balão nativo do navegador,
 * "Preencha este campo.", fora de qualquer envio de formulário.
 */
function ModalNovaSolicitacao({ open, igreja, onClose }: Props) {
  const theme = useTheme();
  const cor = theme.palette.secondary.main;
  const [dados, setDados] = useState(VAZIO);
  const [produtos, setProdutos] = useState<Produto[]>([PRODUTO_VAZIO]);
  const criar = useCriarSolicitacao();

  const pronto =
    !!dados.ministerio &&
    !!dados.titulo.trim() &&
    !!dados.descricao.trim() &&
    produtos.every(
      (p) =>
        !!p.nome.trim() && quantidadeValida(p.quantidade) && linkValido(p.link)
    );

  const fechar = () => {
    setDados(VAZIO);
    setProdutos([PRODUTO_VAZIO]);
    onClose();
  };

  const mudarProduto =
    (i: number, nome: keyof Produto) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setProdutos((atual) =>
        atual.map((p, j) => (j === i ? { ...p, [nome]: e.target.value } : p))
      );

  const campo =
    (nome: keyof typeof VAZIO) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setDados((atual) => ({ ...atual, [nome]: e.target.value }));

  const enviar = () =>
    criar.mutate(
      {
        ministerio: dados.ministerio,
        titulo: dados.titulo,
        descricao: dados.descricao,
        produtos: produtos.map((p) => ({
          nome: p.nome.trim(),
          quantidade: Number(p.quantidade),
          ...(p.link.trim() && { link: p.link.trim() }),
        })),
      },
      { onSuccess: fechar }
    );

  return (
    <ResponsiveModal
      open={open}
      onClose={fechar}
      disableClose={criar.isLoading}
      maxWidth="sm"
      fullWidth
      title="Nova solicitação"
      actions={
        <>
          <Button onClick={fechar} disabled={criar.isLoading} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={!pronto || criar.isLoading}
            onClick={enviar}
          >
            {criar.isLoading ? 'Enviando…' : 'Enviar'}
          </Button>
        </>
      }
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          O pedido vai para a {igreja}, e você acompanha a resposta por aqui.
        </Typography>

        <Stack spacing={1}>
          <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
            Ministério que está pedindo
          </Typography>
          <Box
            role="radiogroup"
            aria-label="Ministério que está pedindo"
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(96px, 1fr))',
              gap: 1,
            }}
          >
            {MINISTERIOS.map((m) => {
              const ativo = dados.ministerio === m;
              return (
                <ButtonBase
                  key={m}
                  role="radio"
                  aria-checked={ativo}
                  onClick={() =>
                    setDados((atual) => ({ ...atual, ministerio: m }))
                  }
                  sx={{
                    flexDirection: 'column',
                    gap: 0.75,
                    py: 1.5,
                    px: 1,
                    borderRadius: 2,
                    border: `1px solid ${ativo ? cor : theme.palette.divider}`,
                    bgcolor: ativo ? alpha(cor, 0.1) : 'transparent',
                    color: ativo ? cor : 'text.secondary',
                    transition: theme.transitions.create([
                      'background-color',
                      'border-color',
                      'color',
                    ]),
                    '&:hover': {
                      borderColor: ativo ? cor : alpha(cor, 0.5),
                      bgcolor: alpha(cor, ativo ? 0.14 : 0.05),
                    },
                    '&.Mui-focusVisible': {
                      outline: `2px solid ${cor}`,
                      outlineOffset: 2,
                    },
                    '& svg': { fontSize: 22 },
                  }}
                >
                  {ICONE_DO_MINISTERIO[m]}
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      lineHeight: 1.2,
                      textAlign: 'center',
                      fontWeight: ativo ? 600 : 500,
                      color: ativo ? 'text.primary' : 'text.secondary',
                    }}
                  >
                    {m}
                  </Typography>
                </ButtonBase>
              );
            })}
          </Box>
        </Stack>

        <TextField
          label="Título do pedido"
          placeholder="Ex.: microfones para o culto jovem"
          value={dados.titulo}
          onChange={campo('titulo')}
          inputProps={{ maxLength: 120 }}
          InputLabelProps={{ required: true }}
        />
        <TextField
          label="Por que precisa"
          placeholder="Conte para que vai servir e se é urgente"
          value={dados.descricao}
          onChange={campo('descricao')}
          inputProps={{ maxLength: 2000 }}
          InputLabelProps={{ required: true }}
          multiline
          minRows={3}
        />

        <Stack spacing={1}>
          <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
            Produtos
          </Typography>
          {produtos.map((p, i) => {
            const linkOk = linkValido(p.link);
            return (
              <Stack
                key={i}
                spacing={1.5}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="flex-start">
                  <TextField
                    size="small"
                    label="Produto"
                    placeholder="Ex.: microfone sem fio"
                    value={p.nome}
                    onChange={mudarProduto(i, 'nome')}
                    inputProps={{ maxLength: 120 }}
                    InputLabelProps={{ required: true }}
                    sx={{ flex: 1, minWidth: 0 }}
                  />
                  <TextField
                    size="small"
                    label="Qtd."
                    value={p.quantidade}
                    onChange={mudarProduto(i, 'quantidade')}
                    error={!quantidadeValida(p.quantidade)}
                    inputProps={{ inputMode: 'numeric', maxLength: 3 }}
                    InputLabelProps={{ required: true }}
                    sx={{ width: 76, flex: 'none' }}
                  />
                  {produtos.length > 1 && (
                    <IconButton
                      aria-label={`Tirar ${p.nome || 'este produto'}`}
                      onClick={() =>
                        setProdutos((atual) => atual.filter((_, j) => j !== i))
                      }
                      sx={{ mt: 0.25 }}
                    >
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  )}
                </Stack>
                <TextField
                  size="small"
                  label="Link do produto (opcional)"
                  placeholder="https://"
                  value={p.link}
                  onChange={mudarProduto(i, 'link')}
                  error={!linkOk}
                  helperText={
                    linkOk
                      ? ''
                      : 'O link precisa começar com http:// ou https://'
                  }
                  inputProps={{ maxLength: 500, inputMode: 'url' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkIcon
                          sx={{ fontSize: 18, color: 'text.secondary' }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>
            );
          })}
          {produtos.length < MAX_PRODUTOS && (
            <Button
              startIcon={<Add />}
              onClick={() => setProdutos((atual) => [...atual, PRODUTO_VAZIO])}
              sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
            >
              Adicionar produto
            </Button>
          )}
        </Stack>
      </Stack>
    </ResponsiveModal>
  );
}

export { ModalNovaSolicitacao };
