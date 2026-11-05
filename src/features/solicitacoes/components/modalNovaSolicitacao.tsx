import { useState } from 'react';
import {
  alpha,
  Box,
  Button,
  ButtonBase,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import { Link as LinkIcon } from '@mui/icons-material';
import { ResponsiveModal } from '../../../components/responsiveModal';
import { useCriarSolicitacao } from '../api';
import { MINISTERIOS } from '../constants';
import { ICONE_DO_MINISTERIO } from '../ministerios';

const VAZIO = { ministerio: '', titulo: '', descricao: '', link: '' };

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
 * O membro pede à igreja dele: escolhe o ministério num card, diz o que
 * precisa e por quê. O link do produto é opcional. Os cards usam a cor do
 * módulo (a tela abre com `TemaDoModulo`).
 */
function ModalNovaSolicitacao({ open, igreja, onClose }: Props) {
  const theme = useTheme();
  const cor = theme.palette.secondary.main;
  const [dados, setDados] = useState(VAZIO);
  const criar = useCriarSolicitacao();

  const linkOk = linkValido(dados.link);
  const pronto =
    !!dados.ministerio &&
    !!dados.titulo.trim() &&
    !!dados.descricao.trim() &&
    linkOk;

  const fechar = () => {
    setDados(VAZIO);
    onClose();
  };

  const campo =
    (nome: keyof typeof VAZIO) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setDados((atual) => ({ ...atual, [nome]: e.target.value }));

  const enviar = () =>
    criar.mutate(
      {
        ministerio: dados.ministerio,
        titulo: dados.titulo,
        descricao: dados.descricao,
        ...(dados.link.trim() && { link: dados.link.trim() }),
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
          label="O que precisa"
          placeholder="Ex.: pedestal de microfone"
          value={dados.titulo}
          onChange={campo('titulo')}
          inputProps={{ maxLength: 120 }}
          required
        />
        <TextField
          label="Por que precisa"
          placeholder="Conte para que vai servir e se é urgente"
          value={dados.descricao}
          onChange={campo('descricao')}
          inputProps={{ maxLength: 2000 }}
          multiline
          minRows={4}
          required
        />
        <TextField
          label="Link do produto (opcional)"
          placeholder="https://"
          value={dados.link}
          onChange={campo('link')}
          error={!linkOk}
          helperText={
            linkOk
              ? 'Se já viu o produto em alguma loja, cole o endereço aqui'
              : 'O link precisa começar com http:// ou https://'
          }
          inputProps={{ maxLength: 500, inputMode: 'url' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LinkIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>
    </ResponsiveModal>
  );
}

export { ModalNovaSolicitacao };
