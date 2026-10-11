import { useEffect, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Button,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
} from '@mui/material';
import { format } from 'date-fns';

import { ResponsiveModal } from '../../../../components/responsiveModal';
import { InputDatePicker } from '../../../../components/inputDatePicker';
import { formatCurrency } from '../../../../utils';
import { useSalvarLancamento } from '../api';
import {
  CATEGORIAS_POR_TIPO,
  ROTULO_DA_CATEGORIA,
  ROTULO_DA_FORMA,
} from '../constants';
import {
  Categoria,
  Dizimista,
  FormaDePagamento,
  Lancamento,
  TipoDeLancamento,
} from '../types';

/** "2026-10-03" ↔ Date à meia-noite local, sem passar por UTC */
const paraData = (dia: string) => {
  const [a, m, d] = dia.split('-').map(Number);
  return new Date(a, m - 1, d);
};

interface Props {
  open: boolean;
  churchId: string;
  /** null: novo lançamento */
  lancamento: Lancamento | null;
  /** quem pode ser ligado ao lançamento */
  dizimistas: Dizimista[];
  onClose: () => void;
}

/**
 * Novo lançamento, ou a edição de um. No importado do banco, tipo, valor,
 * data e forma ficam travados (são o que o extrato diz); categoria, descrição
 * e dizimista mudam — é para isso que o financeiro abre o importado.
 */
function ModalLancamento({
  open,
  churchId,
  lancamento,
  dizimistas,
  onClose,
}: Props) {
  const theme = useTheme();
  const salvar = useSalvarLancamento();

  const [tipo, setTipo] = useState<TipoDeLancamento>('INCOME');
  const [categoria, setCategoria] = useState<Categoria>('TITHE');
  // o valor em centavos: a pessoa digita só números, como em app de banco
  const [centavos, setCentavos] = useState(0);
  const [data, setData] = useState<Date | null>(new Date());
  const [descricao, setDescricao] = useState('');
  const [forma, setForma] = useState<FormaDePagamento | ''>('');
  const [dizimistaId, setDizimistaId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTipo(lancamento?.type ?? 'INCOME');
    setCategoria(lancamento?.category ?? 'TITHE');
    setCentavos(lancamento ? Math.round(lancamento.amount * 100) : 0);
    setData(lancamento ? paraData(lancamento.date) : new Date());
    setDescricao(lancamento?.description ?? '');
    setForma(lancamento?.method ?? '');
    setDizimistaId(lancamento?.user?.id ?? null);
  }, [open, lancamento]);

  const importado = lancamento?.source === 'PLUGGY';
  const entrada = tipo === 'INCOME';

  const trocarTipo = (novo: TipoDeLancamento) => {
    setTipo(novo);
    setCategoria(CATEGORIAS_POR_TIPO[novo][0]);
    // saída não tem dizimista
    if (novo === 'EXPENSE') setDizimistaId(null);
  };

  // os dizimistas são os membros da igreja
  const opcoes = dizimistas.map((d) => ({ id: d.id, nome: d.fullName }));
  // quem já estava ligado continua na lista mesmo se deixou de ser membro
  const escolhido =
    opcoes.find((o) => o.id === dizimistaId) ??
    (dizimistaId && lancamento?.user
      ? { id: lancamento.user.id, nome: lancamento.user.fullName }
      : null);

  const dataValida = !!data && !Number.isNaN(data.getTime());
  const pronto = centavos > 0 && dataValida && descricao.trim().length > 0;

  const enviar = () => {
    const dados = importado
      ? {
          category: categoria,
          description: descricao.trim(),
          userId: entrada ? dizimistaId : null,
        }
      : {
          type: tipo,
          category: categoria,
          amount: centavos / 100,
          date: format(data as Date, 'yyyy-MM-dd'),
          description: descricao.trim(),
          method: forma || null,
          userId: entrada ? dizimistaId : null,
        };
    salvar.mutate(
      { churchId, id: lancamento?.id, dados },
      { onSuccess: onClose }
    );
  };

  return (
    <ResponsiveModal
      open={open}
      onClose={onClose}
      disableClose={salvar.isLoading}
      maxWidth="sm"
      fullWidth
      title={lancamento ? 'Editar lançamento' : 'Novo lançamento'}
      actions={
        <>
          <Button onClick={onClose} disabled={salvar.isLoading} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={enviar}
            disabled={salvar.isLoading || !pronto}
          >
            {salvar.isLoading ? 'Salvando…' : 'Salvar'}
          </Button>
        </>
      }
    >
      <Stack spacing={2}>
        {importado && (
          <Alert severity="info">
            Importado do banco ({lancamento?.bankAccount ?? 'Pluggy'}
            {lancamento?.payerName ? `, de ${lancamento.payerName}` : ''}).
            Valor, data, tipo e forma vêm do extrato e não mudam; categoria,
            descrição e dizimista sim.
          </Alert>
        )}

        <ToggleButtonGroup
          exclusive
          fullWidth
          size="small"
          value={tipo}
          disabled={importado}
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
            disabled={importado}
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
            disabled={importado}
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
            onChange={(evento) =>
              setCategoria(evento.target.value as Categoria)
            }
          >
            {CATEGORIAS_POR_TIPO[tipo].map((c) => (
              <MenuItem key={c} value={c}>
                {ROTULO_DA_CATEGORIA[c]}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Forma"
            size="small"
            fullWidth
            disabled={importado}
            value={forma}
            onChange={(evento) =>
              setForma(evento.target.value as FormaDePagamento | '')
            }
          >
            <MenuItem value="">Não informada</MenuItem>
            {(Object.keys(ROTULO_DA_FORMA) as FormaDePagamento[]).map((f) => (
              <MenuItem key={f} value={f}>
                {ROTULO_DA_FORMA[f]}
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
            entrada ? 'Dízimo de outubro' : 'Conta de luz de setembro'
          }
        />

        {entrada && (
          <Autocomplete
            size="small"
            options={opcoes}
            value={escolhido}
            onChange={(_, valor) => setDizimistaId(valor?.id ?? null)}
            getOptionLabel={(o) => o.nome}
            isOptionEqualToValue={(o, v) => o.id === v.id}
            noOptionsText="Nenhum membro nesta igreja"
            renderInput={(params) => (
              <TextField
                {...params}
                label="Dizimista"
                helperText={
                  categoria === 'TITHE'
                    ? 'Ligado ao dizimista, o dízimo conta no total do ano dele'
                    : 'Opcional: quem contribuiu'
                }
              />
            )}
          />
        )}
      </Stack>
    </ResponsiveModal>
  );
}

export { ModalLancamento };
