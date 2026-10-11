import { useEffect, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';

import { ResponsiveModal } from '../../../../components/responsiveModal';
import { InputDatePicker } from '../../../../components/inputDatePicker';
import { UserAvatar } from '../../../../components/userAvatar';
import { formatCPF, formatCurrency } from '../../../../utils';
import {
  useAtualizarDizimista,
  useBuscarUsuarios,
  useCriarDizimista,
} from '../api';
import { Dizimista, UsuarioEncontrado } from '../types';

/** "2024-03-01" → Date à meia-noite local */
const paraData = (dia: string) => {
  const [a, m, d] = dia.split('-').map(Number);
  return new Date(a, m - 1, d);
};

interface Props {
  open: boolean;
  churchId: string;
  /** null: adicionar um dizimista */
  dizimista: Dizimista | null;
  onClose: () => void;
}

/**
 * Adicionar um dizimista é escolher um usuário que já tem cadastro — pelo
 * nome ou pelo CPF — e, se quiser, desde quando ele dizima. Na edição a pessoa
 * não muda: muda a data, a observação e se está ativo.
 */
function ModalDizimista({ open, churchId, dizimista, onClose }: Props) {
  const criar = useCriarDizimista();
  const atualizar = useAtualizarDizimista();
  const salvando = criar.isLoading || atualizar.isLoading;

  const [busca, setBusca] = useState('');
  const [buscaEnviada, setBuscaEnviada] = useState('');
  const [usuario, setUsuario] = useState<UsuarioEncontrado | null>(null);
  const [desde, setDesde] = useState<Date | null>(null);
  const [observacao, setObservacao] = useState('');
  const [ativo, setAtivo] = useState(true);
  // o dízimo combinado, em centavos (0 = sem valor): mesma máscara do lançamento
  const [centavos, setCentavos] = useState(0);

  useEffect(() => {
    if (!open) return;
    setBusca('');
    setBuscaEnviada('');
    setUsuario(null);
    setDesde(dizimista?.since ? paraData(dizimista.since) : null);
    setObservacao(dizimista?.notes ?? '');
    setCentavos(
      dizimista?.expectedAmount ? Math.round(dizimista.expectedAmount * 100) : 0
    );
    setAtivo(dizimista?.active ?? true);
  }, [open, dizimista]);

  // a busca vai para o servidor: espera a pessoa parar de digitar
  useEffect(() => {
    const id = setTimeout(() => setBuscaEnviada(busca), 300);
    return () => clearTimeout(id);
  }, [busca]);

  const { data: encontrados = [], isFetching: buscando } = useBuscarUsuarios(
    open && !dizimista ? churchId : null,
    buscaEnviada
  );

  const dataValida = !desde || !Number.isNaN(desde.getTime());
  const pronto = (dizimista || usuario) && dataValida;

  const enviar = () => {
    const since = desde ? format(desde, 'yyyy-MM-dd') : null;
    if (dizimista) {
      atualizar.mutate(
        {
          churchId,
          id: dizimista.id,
          active: ativo,
          since,
          notes: observacao.trim() || null,
          expectedAmount: centavos ? centavos / 100 : null,
        },
        { onSuccess: onClose }
      );
      return;
    }
    criar.mutate(
      {
        churchId,
        userId: (usuario as UsuarioEncontrado).id,
        ...(since ? { since } : {}),
        ...(observacao.trim() ? { notes: observacao.trim() } : {}),
        ...(centavos ? { expectedAmount: centavos / 100 } : {}),
      },
      { onSuccess: onClose }
    );
  };

  return (
    <ResponsiveModal
      open={open}
      onClose={onClose}
      disableClose={salvando}
      maxWidth="sm"
      fullWidth
      title={dizimista ? 'Editar dizimista' : 'Adicionar dizimista'}
      actions={
        <>
          <Button onClick={onClose} disabled={salvando} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={enviar}
            disabled={salvando || !pronto}
          >
            {salvando ? 'Salvando…' : dizimista ? 'Salvar' : 'Adicionar'}
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        {dizimista ? (
          <Stack direction="row" spacing={1.5} alignItems="center">
            <UserAvatar
              name={dizimista.user.fullName}
              photoUrl={dizimista.user.profilePhotoUrl}
              disablePreview
              sx={{ width: 40, height: 40 }}
            />
            <Box>
              <Typography fontWeight={600}>
                {dizimista.user.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                CPF {formatCPF(dizimista.user.cpf)}
              </Typography>
            </Box>
          </Stack>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary">
              O dizimista é sempre um usuário do sistema. Quem ainda não tem
              cadastro precisa se cadastrar antes.
            </Typography>
            <Autocomplete
              size="small"
              options={encontrados}
              value={usuario}
              onChange={(_, valor) => setUsuario(valor)}
              inputValue={busca}
              onInputChange={(_, valor) => setBusca(valor)}
              // a lista já vem filtrada do servidor
              filterOptions={(x) => x}
              loading={buscando}
              getOptionLabel={(o) => o.fullName}
              getOptionDisabled={(o) => o.jaDizimista}
              isOptionEqualToValue={(o, v) => o.id === v.id}
              noOptionsText={
                busca.trim().length < 3
                  ? 'Digite 3 letras do nome ou o CPF completo'
                  : 'Ninguém encontrado com esse nome ou CPF'
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
                        {o.jaDizimista ? ' · já é dizimista' : ''}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Usuário"
                  placeholder="Nome ou CPF"
                  required
                  autoFocus
                />
              )}
            />
          </>
        )}

        <TextField
          label="Valor do dízimo"
          size="small"
          fullWidth
          value={centavos ? formatCurrency(centavos / 100) : ''}
          placeholder="R$ 0,00"
          onChange={(evento) =>
            setCentavos(
              Number(evento.target.value.replace(/\D/g, '').slice(0, 13)) || 0
            )
          }
          inputProps={{ inputMode: 'numeric' }}
          helperText={
            centavos
              ? `Na importação do banco, um Pix dele de ${formatCurrency(
                  centavos / 100
                )} é dízimo; outro valor é oferta`
              : 'Opcional. Sem valor, todo Pix dele entra como dízimo'
          }
        />

        <InputDatePicker
          label="Dizimista desde"
          value={desde}
          onChange={(valor) => setDesde(valor as Date | null)}
          disableFuture
          slotProps={{
            textField: { size: 'small', helperText: 'Opcional' },
            field: { clearable: true },
          }}
        />

        <TextField
          label="Observação"
          size="small"
          multiline
          minRows={2}
          value={observacao}
          onChange={(evento) => setObservacao(evento.target.value)}
          inputProps={{ maxLength: 500 }}
        />

        {dizimista && (
          <>
            <FormControlLabel
              control={
                <Switch
                  checked={ativo}
                  onChange={(evento) => setAtivo(evento.target.checked)}
                />
              }
              label={<Typography variant="body2">Dizimista ativo</Typography>}
            />
            {!ativo && (
              <Alert severity="info" sx={{ py: 0 }}>
                Inativo, sai da contagem de ativos e o Pix dele deixa de virar
                dízimo na importação do banco. O histórico de dízimos fica.
              </Alert>
            )}
          </>
        )}
      </Stack>
    </ResponsiveModal>
  );
}

export { ModalDizimista };
