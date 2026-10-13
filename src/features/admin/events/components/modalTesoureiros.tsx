import { useEffect, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { DeleteOutline } from '@mui/icons-material';

import { ResponsiveModal } from '../../../../components/responsiveModal';
import { UserAvatar } from '../../../../components/userAvatar';
import { buscaValida, useBuscarPessoas } from '../../membros/api';
import { PessoaEncontrada } from '../../membros/types';
import {
  TipoDeTesoureiro,
  useGetTesoureiros,
  useRemoverTesoureiro,
  useSalvarTesoureiro,
} from '../api/tesoureiros';

const TIPOS: { valor: TipoDeTesoureiro; rotulo: string; ajuda: string }[] = [
  {
    valor: 'BASICO',
    rotulo: 'Básico',
    ajuda: 'Vê só a aba Tesouraria deste evento',
  },
  {
    valor: 'COMPLETO',
    rotulo: 'Completo',
    ajuda: 'Vê também Tesouraria › Eventos, com os eventos dele',
  },
];

const seletorDoTipo = (
  valor: TipoDeTesoureiro,
  aoMudar: (tipo: TipoDeTesoureiro) => void,
  desligado = false
) => (
  <TextField
    select
    size="small"
    label="Tipo"
    value={valor}
    disabled={desligado}
    onChange={(e) => aoMudar(e.target.value as TipoDeTesoureiro)}
    sx={{ width: 140, flexShrink: 0 }}
  >
    {TIPOS.map((t) => (
      <MenuItem key={t.valor} value={t.valor}>
        {t.rotulo}
      </MenuItem>
    ))}
  </TextField>
);

interface Props {
  open: boolean;
  eventId: string;
  churchId: string;
  onClose: () => void;
}

/**
 * Os tesoureiros(as) do evento: quem cuida da tesouraria dele sem ser admin
 * nem tesouraria da igreja. O admin da igreja do evento escolhe a pessoa (a
 * mesma busca de Membros: CPF completo ou dois nomes) e o tipo. Qualquer
 * perfil entra: o vínculo só soma, e vale o maior.
 */
function ModalTesoureiros({ open, eventId, churchId, onClose }: Props) {
  const { data: tesoureiros = [], isLoading } = useGetTesoureiros(
    eventId,
    open
  );
  const salvar = useSalvarTesoureiro(eventId);
  const remover = useRemoverTesoureiro(eventId);
  const ocupado = salvar.isLoading || remover.isLoading;

  const [busca, setBusca] = useState('');
  const [buscaEnviada, setBuscaEnviada] = useState('');
  const [pessoa, setPessoa] = useState<PessoaEncontrada | null>(null);
  const [tipo, setTipo] = useState<TipoDeTesoureiro>('BASICO');

  useEffect(() => {
    if (!open) return;
    setBusca('');
    setBuscaEnviada('');
    setPessoa(null);
    setTipo('BASICO');
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

  const adicionar = () =>
    pessoa &&
    salvar.mutate(
      { userId: pessoa.id, kind: tipo },
      {
        onSuccess: () => {
          setPessoa(null);
          setBusca('');
        },
      }
    );

  return (
    <ResponsiveModal
      open={open}
      onClose={onClose}
      disableClose={ocupado}
      maxWidth="sm"
      fullWidth
      title="Tesoureiros(as) do evento"
      actions={
        <Button onClick={onClose} disabled={ocupado} color="inherit">
          Fechar
        </Button>
      }
    >
      <Stack spacing={2}>
        <Typography variant="body2" color="text.secondary">
          Quem cuida da tesouraria deste evento sem ser admin nem tesouraria da
          igreja. <b>Básico</b> vê só a aba Tesouraria deste evento;{' '}
          <b>completo</b> vê também Tesouraria › Eventos, com os eventos dele.
        </Typography>

        {isLoading ? (
          <Box sx={{ display: 'grid', placeItems: 'center', py: 2 }}>
            <CircularProgress size={24} />
          </Box>
        ) : !tesoureiros.length ? (
          <Typography variant="body2" color="text.secondary">
            Nenhum tesoureiro(a) neste evento ainda.
          </Typography>
        ) : (
          <Stack divider={<Divider flexItem />} spacing={1}>
            {tesoureiros.map((t) => (
              <Stack
                key={t.id}
                direction="row"
                spacing={1.25}
                alignItems="center"
              >
                <UserAvatar
                  name={t.fullName}
                  photoUrl={t.profilePhotoUrl}
                  disablePreview
                  sx={{ width: 32, height: 32, fontSize: 13 }}
                />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography fontSize={14} fontWeight={600} noWrap>
                    {t.fullName}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    noWrap
                    component="div"
                  >
                    {t.email}
                  </Typography>
                </Box>
                {seletorDoTipo(
                  t.kind,
                  (kind) => salvar.mutate({ userId: t.id, kind }),
                  ocupado
                )}
                <Tooltip title="Tirar de tesoureiro(a)">
                  <span>
                    <IconButton
                      size="small"
                      color="error"
                      aria-label={`Tirar ${t.fullName} de tesoureiro(a)`}
                      disabled={ocupado}
                      onClick={() => remover.mutate(t.id)}
                    >
                      <DeleteOutline fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>
            ))}
          </Stack>
        )}

        <Divider />

        <Typography fontWeight={600} fontSize={14}>
          Adicionar
        </Typography>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ sm: 'flex-start' }}
        >
          <Autocomplete
            size="small"
            sx={{ flex: 1 }}
            options={encontradas}
            value={pessoa}
            onChange={(_, valor) => setPessoa(valor)}
            inputValue={busca}
            onInputChange={(_, valor) => setBusca(valor)}
            // a lista já vem filtrada do servidor
            filterOptions={(x) => x}
            loading={isFetching}
            getOptionLabel={(o) => o.fullName}
            getOptionDisabled={(o) => tesoureiros.some((t) => t.id === o.id)}
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
                      {o.cpf}
                      {tesoureiros.some((t) => t.id === o.id)
                        ? ' · já é tesoureiro(a) deste evento'
                        : ''}
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
              />
            )}
          />
          {seletorDoTipo(tipo, setTipo, ocupado)}
          <Button
            variant="contained"
            onClick={adicionar}
            disabled={!pessoa || ocupado}
            sx={{ flexShrink: 0, height: 40 }}
          >
            Adicionar
          </Button>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          {TIPOS.find((t) => t.valor === tipo)?.ajuda}
        </Typography>
      </Stack>
    </ResponsiveModal>
  );
}

export { ModalTesoureiros };
