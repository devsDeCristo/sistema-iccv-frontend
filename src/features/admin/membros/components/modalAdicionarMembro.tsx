import { useEffect, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { ResponsiveModal } from '../../../../components/responsiveModal';
import { UserAvatar } from '../../../../components/userAvatar';
import { buscaValida, useAdicionarMembro, useBuscarPessoas } from '../api';
import { PessoaEncontrada } from '../types';

/** A situação da pessoa, numa linha: por que dá ou não dá para colocar */
function situacao(p: PessoaEncontrada, churchId: string) {
  if (p.membroDe?.id === churchId) return 'Já é membro desta igreja';
  if (p.membroDe) return `Membro de ${p.membroDe.name}`;
  if (p.pediuEsta) return 'Pediu para entrar nesta igreja';
  if (p.outraIgreja) return `Disse ser de: ${p.outraIgreja}`;
  return 'Sem igreja';
}

interface Props {
  open: boolean;
  churchId: string;
  onClose: () => void;
}

/**
 * Coloca uma pessoa do sistema como membro. A busca é pelo CPF completo ou
 * por pelo menos dois nomes — o sistema é de todas as igrejas, e um nome só
 * traria gente demais. Quem já é membro de outra igreja aparece, mas não dá
 * para escolher: lá precisam tirá-la antes.
 */
function ModalAdicionarMembro({ open, churchId, onClose }: Props) {
  const adicionar = useAdicionarMembro();
  const [busca, setBusca] = useState('');
  const [buscaEnviada, setBuscaEnviada] = useState('');
  const [pessoa, setPessoa] = useState<PessoaEncontrada | null>(null);

  useEffect(() => {
    if (!open) return;
    setBusca('');
    setBuscaEnviada('');
    setPessoa(null);
  }, [open]);

  // a busca vai para o servidor: espera a pessoa parar de digitar
  useEffect(() => {
    const id = setTimeout(() => setBuscaEnviada(busca), 300);
    return () => clearTimeout(id);
  }, [busca]);

  const { data: encontradas = [], isFetching } = useBuscarPessoas(
    open ? churchId : null,
    buscaEnviada
  );

  const enviar = () =>
    pessoa &&
    adicionar.mutate({ churchId, id: pessoa.id }, { onSuccess: onClose });

  return (
    <ResponsiveModal
      open={open}
      onClose={onClose}
      disableClose={adicionar.isLoading}
      maxWidth="sm"
      fullWidth
      title="Adicionar membro"
      actions={
        <>
          <Button
            onClick={onClose}
            disabled={adicionar.isLoading}
            color="inherit"
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={enviar}
            disabled={adicionar.isLoading || !pessoa}
          >
            {adicionar.isLoading ? 'Adicionando…' : 'Adicionar'}
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          Busque pelo CPF completo ou por pelo menos dois nomes (ex.: Maria
          Souza). Quem já é membro de outra igreja precisa ser tirado de lá
          antes.
        </Typography>
        <Autocomplete
          size="small"
          options={encontradas}
          value={pessoa}
          onChange={(_, valor) => setPessoa(valor)}
          inputValue={busca}
          onInputChange={(_, valor) => setBusca(valor)}
          // a lista já vem filtrada do servidor
          filterOptions={(x) => x}
          loading={isFetching}
          getOptionLabel={(o) => o.fullName}
          getOptionDisabled={(o) => !!o.membroDe}
          isOptionEqualToValue={(o, v) => o.id === v.id}
          noOptionsText={
            buscaValida(busca)
              ? 'Ninguém encontrado'
              : 'Digite o CPF completo ou dois nomes'
          }
          loadingText="Buscando…"
          renderOption={(props, o) => (
            <Box component="li" {...props} key={o.id}>
              <Stack direction="row" spacing={1.25} alignItems="center">
                <UserAvatar
                  name={o.fullName}
                  photoUrl={o.profilePhotoUrl}
                  disablePreview
                  sx={{ width: 28, height: 28, fontSize: 12 }}
                />
                <Box>
                  <Typography fontSize={14}>{o.fullName}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {o.cpf} · {situacao(o, churchId)}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Pessoa"
              placeholder="CPF ou nome e sobrenome"
              autoFocus
            />
          )}
        />
      </Stack>
    </ResponsiveModal>
  );
}

export { ModalAdicionarMembro };
