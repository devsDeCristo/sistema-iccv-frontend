import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { ResponsiveModal } from '../../../../components/responsiveModal';
import { MODULOS, ModuloDaIgreja } from '../../../../constants/modulos';
import { Plano, useSalvarPlano } from '../api';
import { formatCurrency } from '../../../../utils';

interface Props {
  open: boolean;
  /** null: plano novo */
  plano: Plano | null;
  onClose: () => void;
}

/**
 * Criar ou editar um plano: o nome, uma descrição curta e os módulos que ele
 * libera. Mudar os módulos vale na hora para as igrejas do plano.
 *
 * Os limites que vierem depois (quantidade de eventos e etc.) entram aqui,
 * abaixo dos módulos.
 */
function ModalPlano({ open, plano, onClose }: Props) {
  const salvar = useSalvarPlano();
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  // em centavos, como o valor do dízimo: digita só números
  const [centavos, setCentavos] = useState(0);
  const [modulos, setModulos] = useState<ModuloDaIgreja[]>([]);
  const [erroDoNome, setErroDoNome] = useState('');

  useEffect(() => {
    if (!open) return;
    setNome(plano?.name ?? '');
    setDescricao(plano?.description ?? '');
    setCentavos(Math.round((plano?.price ?? 0) * 100));
    setModulos(plano?.modules ?? []);
    setErroDoNome('');
  }, [open, plano]);

  const alternar = (modulo: ModuloDaIgreja) =>
    setModulos((atuais) =>
      atuais.includes(modulo)
        ? atuais.filter((m) => m !== modulo)
        : [...atuais, modulo]
    );

  const enviar = () => {
    if (nome.trim().length < 2) {
      setErroDoNome('Dê um nome ao plano');
      return;
    }
    salvar.mutate(
      {
        id: plano?.id,
        name: nome.trim(),
        description: descricao.trim() || null,
        price: centavos / 100,
        // na ordem do menu, e não na ordem em que foram marcados
        modules: MODULOS.map((m) => m.value).filter((m) => modulos.includes(m)),
      },
      { onSuccess: onClose }
    );
  };

  const emUso = plano?._count.churches ?? 0;

  return (
    <ResponsiveModal
      open={open}
      onClose={onClose}
      disableClose={salvar.isLoading}
      maxWidth="sm"
      fullWidth
      title={plano ? 'Editar plano' : 'Novo plano'}
      actions={
        <>
          <Button onClick={onClose} disabled={salvar.isLoading} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={enviar}
            disabled={salvar.isLoading}
          >
            {salvar.isLoading ? 'Salvando…' : plano ? 'Salvar' : 'Criar'}
          </Button>
        </>
      }
    >
      <Stack spacing={2.5}>
        <TextField
          autoFocus
          size="small"
          label="Nome"
          placeholder="Ex.: Completo, Básico"
          value={nome}
          onChange={(e) => {
            setNome(e.target.value);
            setErroDoNome('');
          }}
          error={!!erroDoNome}
          helperText={erroDoNome}
          inputProps={{ maxLength: 60 }}
        />
        <TextField
          size="small"
          label="Valor mensal"
          value={formatCurrency(centavos / 100)}
          onChange={(e) =>
            setCentavos(
              Number(e.target.value.replace(/\D/g, '').slice(0, 10)) || 0
            )
          }
          inputProps={{ inputMode: 'numeric' }}
          helperText={
            centavos
              ? 'Quanto a igreja paga por mês neste plano'
              : 'Zero: o plano aparece como gratuito'
          }
        />
        <TextField
          size="small"
          label="Descrição (opcional)"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          multiline
          minRows={2}
          inputProps={{ maxLength: 300 }}
        />

        <Box>
          <Typography fontWeight={600} fontSize={14}>
            Módulos que o plano libera
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {emUso
              ? `Vale na hora para ${emUso} ${
                  emUso === 1 ? 'igreja' : 'igrejas'
                } deste plano. O que sai do plano some do painel delas; nada é apagado.`
              : 'O que não estiver marcado some do painel das igrejas do plano.'}
          </Typography>
          <Stack sx={{ mt: 1 }}>
            {MODULOS.map((modulo) => (
              <FormControlLabel
                key={modulo.value}
                sx={{ alignItems: 'flex-start', mr: 0, py: 0.25 }}
                control={
                  <Checkbox
                    size="small"
                    checked={modulos.includes(modulo.value)}
                    onChange={() => alternar(modulo.value)}
                    sx={{ pt: 0.5 }}
                  />
                }
                label={
                  <Box sx={{ pt: 0.5 }}>
                    <Typography fontSize={14}>{modulo.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {modulo.ajuda}
                    </Typography>
                  </Box>
                }
              />
            ))}
          </Stack>
        </Box>
      </Stack>
    </ResponsiveModal>
  );
}

export { ModalPlano };
