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
import {
  criarTesouraria,
  EVENTOS_DO_SISTEMA,
  listarTesourarias,
  TesourariaDeEvento,
} from '../dados';

interface Props {
  open: boolean;
  onClose: () => void;
  onCriada: (tesouraria: TesourariaDeEvento) => void;
}

/**
 * Nova tesouraria de evento. Ou ela se liga a um evento cadastrado no sistema
 * (um por tesouraria), ou é de um evento que não está no sistema — um jantar,
 * uma rifa —, e aí leva só o nome e a data.
 */
function ModalNovaTesouraria({ open, onClose, onCriada }: Props) {
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

  // um evento do sistema tem uma tesouraria só
  const comTesouraria = new Set(listarTesourarias().map((t) => t.eventoId));
  const evento = EVENTOS_DO_SISTEMA.find((e) => e.id === eventoId);
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
            helperText="Um evento cadastrado tem uma tesouraria só"
          >
            {EVENTOS_DO_SISTEMA.map((e) => (
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
