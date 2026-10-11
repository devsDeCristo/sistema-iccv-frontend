import { useEffect, useState } from 'react';
import { Box, Button, Stack, TextField, Typography } from '@mui/material';

import { ResponsiveModal } from '../../../../components/responsiveModal';
import { UserAvatar } from '../../../../components/userAvatar';
import { formatCPF, formatCurrency } from '../../../../utils';
import { useDefinirValorDoDizimo } from '../api';
import { Dizimista } from '../types';

interface Props {
  churchId: string;
  /** o membro cujo valor se edita; null fecha a janela */
  dizimista: Dizimista | null;
  onClose: () => void;
}

/**
 * O valor do dízimo de um membro. Não há cadastro de dizimista — todo membro é
 * um dizimista em potencial —, e este valor é o que se ajusta: na importação
 * do banco, um Pix dele com exatamente este valor é dízimo; com outro valor,
 * oferta. Sem valor, todo Pix dele entra como dízimo.
 */
function ModalDizimista({ churchId, dizimista, onClose }: Props) {
  const salvar = useDefinirValorDoDizimo();
  // em centavos (0 = sem valor): a mesma máscara do lançamento
  const [centavos, setCentavos] = useState(0);

  useEffect(() => {
    if (!dizimista) return;
    setCentavos(
      dizimista.titheAmount ? Math.round(dizimista.titheAmount * 100) : 0
    );
  }, [dizimista]);

  const enviar = () =>
    dizimista &&
    salvar.mutate(
      {
        churchId,
        userId: dizimista.id,
        titheAmount: centavos ? centavos / 100 : null,
      },
      { onSuccess: onClose }
    );

  return (
    <ResponsiveModal
      open={!!dizimista}
      onClose={onClose}
      disableClose={salvar.isLoading}
      maxWidth="xs"
      fullWidth
      title="Valor do dízimo"
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
            {salvar.isLoading ? 'Salvando…' : 'Salvar'}
          </Button>
        </>
      }
    >
      {dizimista && (
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <UserAvatar
              name={dizimista.fullName}
              photoUrl={dizimista.profilePhotoUrl}
              disablePreview
              sx={{ width: 40, height: 40 }}
            />
            <Box>
              <Typography fontWeight={600}>{dizimista.fullName}</Typography>
              <Typography variant="caption" color="text.secondary">
                CPF {formatCPF(dizimista.cpf)}
              </Typography>
            </Box>
          </Stack>

          <TextField
            label="Valor do dízimo"
            size="small"
            fullWidth
            autoFocus
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
                : 'Sem valor, todo Pix dele entra como dízimo'
            }
          />
        </Stack>
      )}
    </ResponsiveModal>
  );
}

export { ModalDizimista };
