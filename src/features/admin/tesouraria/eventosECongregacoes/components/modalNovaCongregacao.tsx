import { useEffect, useState } from 'react';
import { Alert, Button, Stack, TextField } from '@mui/material';
import { toast } from 'react-toastify';

import { ResponsiveModal } from '../../../../../components/responsiveModal';
import {
  criarTesourariaDeCongregacao,
  TesourariaDeCongregacao,
} from '../dados';

interface Props {
  open: boolean;
  onClose: () => void;
  onCriada: (tesouraria: TesourariaDeCongregacao) => void;
}

/**
 * Nova tesouraria de congregação. Ainda não há cadastro de congregações:
 * criar a tesouraria cria a congregação junto, só com o nome e o local.
 */
function ModalNovaCongregacao({ open, onClose, onCriada }: Props) {
  const [nome, setNome] = useState('');
  const [local, setLocal] = useState('');

  useEffect(() => {
    if (!open) return;
    setNome('');
    setLocal('');
  }, [open]);

  const criar = () => {
    const nova = criarTesourariaDeCongregacao({
      nome: nome.trim(),
      local: local.trim() || null,
    });
    toast.success('Congregação criada, com a sua tesouraria');
    onCriada(nova);
  };

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
          <Button variant="contained" onClick={criar} disabled={!nome.trim()}>
            Criar
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
