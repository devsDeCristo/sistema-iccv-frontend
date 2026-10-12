import { useEffect, useState } from 'react';
import { Alert, Button, Stack, TextField } from '@mui/material';

import { ResponsiveModal } from '../../../../../components/responsiveModal';
import { TesourariaNaLista } from '../modelo';
import { useCriarTesouraria } from '../api';

interface Props {
  open: boolean;
  /** A igreja da tela */
  churchId: string | null;
  onClose: () => void;
  onCriada: (tesouraria: TesourariaNaLista) => void;
}

/**
 * Nova tesouraria de congregação. Ainda não há cadastro de congregações:
 * criar a tesouraria cria a congregação junto, só com o nome e o local.
 */
function ModalNovaCongregacao({ open, churchId, onClose, onCriada }: Props) {
  const criarNaApi = useCriarTesouraria();
  const [nome, setNome] = useState('');
  const [local, setLocal] = useState('');

  useEffect(() => {
    if (!open) return;
    setNome('');
    setLocal('');
  }, [open]);

  const criar = () =>
    churchId &&
    criarNaApi.mutate(
      {
        churchId,
        kind: 'CONGREGATION',
        name: nome.trim(),
        location: local.trim() || undefined,
      },
      { onSuccess: (nova) => onCriada(nova as TesourariaNaLista) }
    );

  return (
    <ResponsiveModal
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      title="Nova congregação"
      actions={
        <>
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={criar}
            disabled={!nome.trim() || !churchId || criarNaApi.isLoading}
          >
            {criarNaApi.isLoading ? 'Criando…' : 'Criar'}
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        <Alert severity="info">
          Por enquanto a congregação é criada junto com a tesouraria. O cadastro
          de congregações, com os membros, vem depois.
        </Alert>
        <TextField
          size="small"
          label="Nome"
          required
          autoFocus
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Congregação Vila Nova"
          inputProps={{ maxLength: 80 }}
        />
        <TextField
          size="small"
          label="Local"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          placeholder="Bairro, distrito ou cidade"
          helperText="Opcional"
          inputProps={{ maxLength: 80 }}
        />
      </Stack>
    </ResponsiveModal>
  );
}

export { ModalNovaCongregacao };
