import { useEffect, useState } from 'react';
import {
  Button,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { ResponsiveModal } from '../../../../components/responsiveModal';
import { useJuntarEmFamilia, useRenomearFamilia } from '../api';
import { Familia, Membro } from '../types';

/** "Família Souza", pelo último nome do primeiro escolhido */
const nomeSugerido = (pessoas: Membro[]) => {
  const sobrenome = pessoas[0]?.fullName.trim().split(/\s+/).pop();
  return sobrenome ? `Família ${sobrenome}` : '';
};

interface Props {
  open: boolean;
  churchId: string;
  /** juntar: os membros escolhidos na tabela */
  escolhidos: Membro[];
  familias: Familia[];
  /** renomear: a família; sem ela, a janela junta os escolhidos */
  renomeando?: Familia | null;
  onClose: () => void;
}

/**
 * Juntar membros numa família — nova, com um nome, ou uma que já existe — ou
 * renomear uma família. Quem já estava em outra família sai dela; família
 * que fica vazia some sozinha.
 */
function ModalFamilia({
  open,
  churchId,
  escolhidos,
  familias,
  renomeando,
  onClose,
}: Props) {
  const juntar = useJuntarEmFamilia();
  const renomear = useRenomearFamilia();
  const salvando = juntar.isLoading || renomear.isLoading;

  const [destino, setDestino] = useState<'nova' | 'existente'>('nova');
  const [nome, setNome] = useState('');
  const [familiaId, setFamiliaId] = useState('');

  useEffect(() => {
    if (!open) return;
    setDestino('nova');
    setNome(renomeando?.name ?? nomeSugerido(escolhidos));
    setFamiliaId(familias[0]?.id ?? '');
    // os escolhidos só valem na abertura: ao fechar a tabela já limpa
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, renomeando]);

  const pronto = renomeando
    ? !!nome.trim()
    : destino === 'nova'
      ? !!nome.trim()
      : !!familiaId;

  const enviar = () => {
    if (renomeando) {
      renomear.mutate(
        { churchId, id: renomeando.id, nome: nome.trim() },
        { onSuccess: onClose }
      );
      return;
    }
    juntar.mutate(
      {
        churchId,
        userIds: escolhidos.map((m) => m.id),
        ...(destino === 'nova' ? { nome: nome.trim() } : { familiaId }),
      },
      { onSuccess: onClose }
    );
  };

  const campoDoNome = (
    <TextField
      label="Nome da família"
      size="small"
      fullWidth
      autoFocus
      value={nome}
      onChange={(evento) => setNome(evento.target.value)}
      inputProps={{ maxLength: 80 }}
    />
  );

  return (
    <ResponsiveModal
      open={open}
      onClose={onClose}
      disableClose={salvando}
      maxWidth="xs"
      fullWidth
      title={renomeando ? 'Renomear família' : 'Juntar em família'}
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
            {salvando ? 'Salvando…' : 'Salvar'}
          </Button>
        </>
      }
    >
      {renomeando ? (
        campoDoNome
      ) : (
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            {escolhidos.map((m) => m.fullName).join(', ')}.
            {escolhidos.some((m) => m.family)
              ? ' Quem já está em outra família sai dela.'
              : ''}
          </Typography>

          <RadioGroup
            value={destino}
            onChange={(evento) =>
              setDestino(evento.target.value as typeof destino)
            }
          >
            <FormControlLabel
              value="nova"
              control={<Radio size="small" />}
              label="Nova família"
            />
            <FormControlLabel
              value="existente"
              control={<Radio size="small" />}
              label="Família que já existe"
              disabled={!familias.length}
            />
          </RadioGroup>

          {destino === 'nova' ? (
            campoDoNome
          ) : (
            <TextField
              select
              label="Família"
              size="small"
              fullWidth
              value={familiaId}
              onChange={(evento) => setFamiliaId(evento.target.value)}
            >
              {familias.map((f) => (
                <MenuItem key={f.id} value={f.id}>
                  {f.name} ({f.membros})
                </MenuItem>
              ))}
            </TextField>
          )}
        </Stack>
      )}
    </ResponsiveModal>
  );
}

export { ModalFamilia };
