import { useEffect, useState } from 'react';
import {
  Button,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

import { ResponsiveModal } from '../../../../../components/responsiveModal';
import { InputDatePicker } from '../../../../../components/inputDatePicker';
import { useGetEvents } from '../../../events/api/getEvents';
import { Event } from '../../../events/types';
import {
  criarTesouraria,
  listarTesourarias,
  TesourariaDeEvento,
} from '../dados';

/** "13/02 a 16/02/2027", ou o dia só */
const periodoDo = (evento: Event) => {
  const de = format(new Date(evento.startDate), 'dd/MM/yyyy');
  const ate = format(new Date(evento.endDate), 'dd/MM/yyyy');
  return de === ate ? de : `${de.slice(0, 5)} a ${ate}`;
};

interface Props {
  open: boolean;
  /** A igreja da tela: os eventos cadastrados dela */
  churchId: string | null;
  onClose: () => void;
  onCriada: (tesouraria: TesourariaDeEvento) => void;
}

/**
 * Nova tesouraria de evento. Ou ela se liga a um evento cadastrado no sistema
 * (um por tesouraria), ou é de um evento que não está no sistema — um jantar,
 * uma rifa —, e aí leva só o nome e a data.
 */
function ModalNovaTesouraria({ open, churchId, onClose, onCriada }: Props) {
  const [tipo, setTipo] = useState<'SISTEMA' | 'FORA'>('SISTEMA');
  const [eventoId, setEventoId] = useState('');
  const [nome, setNome] = useState('');
  const [data, setData] = useState<Date | null>(null);

  useEffect(() => {
    if (!open) return;
    setTipo('SISTEMA');
    setEventoId('');
    setNome('');
    setData(null);
  }, [open]);

  // os eventos cadastrados de verdade: é com eles que os tesoureiros(as) do
  // evento funcionam
  const { data: doPainel, isLoading } = useGetEvents(
    { painel: true },
    { enabled: open }
  );
  const eventos = ((doPainel as Event[] | undefined) ?? [])
    .filter((e) => !churchId || e.church?.id === churchId)
    .map((e) => ({ id: e.id, nome: e.name, periodo: periodoDo(e) }));

  // um evento do sistema tem uma tesouraria só
  const comTesouraria = new Set(listarTesourarias().map((t) => t.eventoId));
  const evento = eventos.find((e) => e.id === eventoId);
  const dataValida = !data || !Number.isNaN(data.getTime());
  const pronto = tipo === 'SISTEMA' ? !!evento : !!nome.trim() && dataValida;

  const criar = () => {
    const nova = criarTesouraria(
      tipo === 'SISTEMA' && evento
        ? { nome: evento.nome, eventoId: evento.id, periodo: evento.periodo }
        : {
            nome: nome.trim(),
            eventoId: null,
            periodo: data ? format(data, 'dd/MM/yyyy') : 'Sem data',
          }
    );
    toast.success('Tesouraria criada');
    onCriada(nova);
  };

  return (
    <ResponsiveModal
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      title="Nova tesouraria de evento"
      actions={
        <>
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button variant="contained" onClick={criar} disabled={!pronto}>
            Criar
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          value={tipo}
          onChange={(_, novo) => novo && setTipo(novo)}
        >
          <ToggleButton value="SISTEMA" sx={{ textTransform: 'none' }}>
            Evento do sistema
          </ToggleButton>
          <ToggleButton value="FORA" sx={{ textTransform: 'none' }}>
            Evento fora do sistema
          </ToggleButton>
        </ToggleButtonGroup>

        {tipo === 'SISTEMA' ? (
          <TextField
            select
            size="small"
            label="Evento"
            value={eventoId}
            onChange={(e) => setEventoId(e.target.value)}
            helperText={
              isLoading
                ? 'Carregando os eventos…'
                : eventos.length
                  ? 'Um evento cadastrado tem uma tesouraria só'
                  : 'Nenhum evento cadastrado nesta igreja'
            }
          >
            {eventos.map((e) => (
              <MenuItem
                key={e.id}
                value={e.id}
                disabled={comTesouraria.has(e.id)}
              >
                <Stack>
                  <Typography fontSize={14}>{e.nome}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {e.periodo}
                    {comTesouraria.has(e.id) ? ' · já tem tesouraria' : ''}
                  </Typography>
                </Stack>
              </MenuItem>
            ))}
          </TextField>
        ) : (
          <>
            <TextField
              size="small"
              label="Nome"
              required
              autoFocus
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Jantar de confraternização"
              inputProps={{ maxLength: 80 }}
            />
            <InputDatePicker
              label="Data"
              value={data}
              onChange={(valor) => setData(valor as Date | null)}
              slotProps={{
                textField: { size: 'small', helperText: 'Opcional' },
                field: { clearable: true },
              }}
            />
          </>
        )}
      </Stack>
    </ResponsiveModal>
  );
}

export { ModalNovaTesouraria };
