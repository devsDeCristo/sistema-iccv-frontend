import { useEffect, useState } from 'react';
import {
  Button,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from '@mui/material';
import { format } from 'date-fns';

import { ResponsiveModal } from '../../../../../components/responsiveModal';
import { InputDatePicker } from '../../../../../components/inputDatePicker';
import { formatCurrency } from '../../../../../utils';
import { ROTULO_DA_FORMA } from '../../constants';
import { CATEGORIAS, TipoDoLancamento } from '../modelo';
import { useNovoLancamentoDaTesouraria } from '../api';

interface Props {
  open: boolean;
  churchId: string;
  tesourariaId: string;
  onClose: () => void;
  onSalvo: () => void;
}

/**
 * Lançamento manual na tesouraria do evento — o mesmo desenho do "Novo
 * lançamento" da Administrativa. Entra a conciliar, como o pagamento com
 * baixa manual: quando o dinheiro aparecer no banco, a Conciliação liga os
 * dois; se nunca for aparecer (dinheiro em espécie), fica "não consta no
 * banco".
 */
function ModalLancamentoDoEvento({
  open,
  churchId,
  tesourariaId,
  onClose,
  onSalvo,
}: Props) {
  const theme = useTheme();
  const lancar = useNovoLancamentoDaTesouraria();
  const [tipo, setTipo] = useState<TipoDoLancamento>('INCOME');
  const [categoria, setCategoria] = useState(CATEGORIAS.EVENT.INCOME[0]);
  // o valor em centavos: a pessoa digita só números, como em app de banco
  const [centavos, setCentavos] = useState(0);
  const [data, setData] = useState<Date | null>(new Date());
  const [descricao, setDescricao] = useState('');
  const [forma, setForma] = useState('');

  useEffect(() => {
    if (!open) return;
    setTipo('INCOME');
    setCategoria(CATEGORIAS.EVENT.INCOME[0]);
    setCentavos(0);
    setData(new Date());
    setDescricao('');
    setForma('');
  }, [open]);

  const trocarTipo = (novo: TipoDoLancamento) => {
    setTipo(novo);
    setCategoria(CATEGORIAS.EVENT[novo][0]);
  };

  const dataValida = !!data && !Number.isNaN(data.getTime());
  const pronto = centavos > 0 && dataValida && descricao.trim().length > 0;

  const salvar = () =>
    lancar.mutate(
      {
        churchId,
        id: tesourariaId,
        type: tipo,
        category: categoria,
        description: descricao.trim(),
        amount: centavos / 100,
        date: format(data as Date, 'yyyy-MM-dd'),
        method: forma || undefined,
      },
      { onSuccess: onSalvo }
    );

  return (
    <ResponsiveModal
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      title="Novo lançamento"
      actions={
        <>
          <Button onClick={onClose} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={salvar}
            disabled={!pronto || lancar.isLoading}
          >
            Salvar
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
          onChange={(_, novo) => novo && trocarTipo(novo)}
        >
          <ToggleButton
            value="INCOME"
            sx={{
              textTransform: 'none',
              '&.Mui-selected': { color: theme.palette.chips.success },
            }}
          >
            Entrada
          </ToggleButton>
          <ToggleButton
            value="EXPENSE"
            sx={{
              textTransform: 'none',
              '&.Mui-selected': { color: theme.palette.chips.canceled },
            }}
          >
            Saída
          </ToggleButton>
        </ToggleButtonGroup>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Valor"
            size="small"
            required
            fullWidth
            value={formatCurrency(centavos / 100)}
            onChange={(evento) =>
              setCentavos(
                Number(evento.target.value.replace(/\D/g, '').slice(0, 13)) || 0
              )
            }
            inputProps={{ inputMode: 'numeric' }}
          />
          <InputDatePicker
            label="Data"
            value={data}
            onChange={(valor) => setData(valor as Date | null)}
            slotProps={{ textField: { size: 'small', required: true } }}
          />
        </Stack>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            select
            label="Categoria"
            size="small"
            fullWidth
            value={categoria}
            onChange={(evento) => setCategoria(evento.target.value)}
          >
            {CATEGORIAS.EVENT[tipo].map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Forma"
            size="small"
            fullWidth
            value={forma}
            onChange={(evento) => setForma(evento.target.value)}
          >
            <MenuItem value="">Não informada</MenuItem>
            {Object.entries(ROTULO_DA_FORMA).map(([valor, rotulo]) => (
              <MenuItem key={valor} value={valor}>
                {rotulo}
              </MenuItem>
            ))}
          </TextField>
        </Stack>

        <TextField
          label="Descrição"
          size="small"
          required
          fullWidth
          value={descricao}
          onChange={(evento) => setDescricao(evento.target.value)}
          inputProps={{ maxLength: 200 }}
          placeholder={
            tipo === 'INCOME'
              ? 'Venda de bolos no intervalo'
              : 'Gelo e descartáveis'
          }
        />
      </Stack>
    </ResponsiveModal>
  );
}

export { ModalLancamentoDoEvento };
