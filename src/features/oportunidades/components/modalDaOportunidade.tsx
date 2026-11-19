import { useEffect, useState } from 'react';
import { Button, Stack, TextField } from '@mui/material';
import { ResponsiveModal } from '../../../components/responsiveModal';
import { useSalvarOportunidade } from '../api';
import { DadosDaOportunidade, OportunidadeDaIgreja } from '../types';

const VAZIO: DadosDaOportunidade = {
  titulo: '',
  empresa: '',
  descricao: '',
  local: '',
};

interface Props {
  open: boolean;
  churchId: string;
  /** a vaga em edição; sem ela, publica uma nova */
  oportunidade: OportunidadeDaIgreja | null;
  onClose: () => void;
}

/**
 * Publica ou edita uma vaga. Os obrigatórios levam o asterisco pelo rótulo
 * (`InputLabelProps.required`), e não pelo `required` do campo, que acendia o
 * balão nativo do navegador fora de qualquer envio.
 */
function ModalDaOportunidade({ open, churchId, oportunidade, onClose }: Props) {
  const [dados, setDados] = useState(VAZIO);
  const salvar = useSalvarOportunidade();

  useEffect(() => {
    if (!open) return;
    setDados(
      oportunidade
        ? {
            titulo: oportunidade.title,
            empresa: oportunidade.company,
            descricao: oportunidade.description,
            local: oportunidade.location ?? '',
          }
        : VAZIO
    );
  }, [open, oportunidade]);

  const pronto =
    !!dados.titulo.trim() && !!dados.empresa.trim() && !!dados.descricao.trim();

  const campo =
    (nome: keyof DadosDaOportunidade) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setDados((atual) => ({ ...atual, [nome]: e.target.value }));

  const enviar = () =>
    salvar.mutate(
      {
        churchId,
        id: oportunidade?.id,
        dados,
        aviso: oportunidade ? 'Oportunidade salva' : 'Oportunidade publicada',
      },
      { onSuccess: onClose }
    );

  return (
    <ResponsiveModal
      open={open}
      onClose={onClose}
      disableClose={salvar.isLoading}
      maxWidth="sm"
      fullWidth
      title={oportunidade ? 'Editar oportunidade' : 'Nova oportunidade'}
      actions={
        <>
          <Button onClick={onClose} disabled={salvar.isLoading} color="inherit">
            Cancelar
          </Button>
          <Button
            variant="contained"
            disabled={!pronto || salvar.isLoading}
            onClick={enviar}
          >
            {salvar.isLoading
              ? 'Salvando…'
              : oportunidade
                ? 'Salvar'
                : 'Publicar'}
          </Button>
        </>
      }
    >
      <Stack spacing={2} sx={{ pt: 1 }}>
        <TextField
          label="Vaga"
          placeholder="Ex.: Auxiliar administrativo"
          value={dados.titulo}
          onChange={campo('titulo')}
          InputLabelProps={{ required: true }}
          inputProps={{ maxLength: 120 }}
        />
        <TextField
          label="Quem oferece"
          placeholder="A própria igreja ou a empresa de um membro"
          value={dados.empresa}
          onChange={campo('empresa')}
          InputLabelProps={{ required: true }}
          inputProps={{ maxLength: 120 }}
        />
        <TextField
          label="Local"
          placeholder="Cidade, bairro ou “Remoto”"
          value={dados.local}
          onChange={campo('local')}
          inputProps={{ maxLength: 120 }}
        />
        <TextField
          label="Descrição"
          placeholder="Atividades, requisitos, horário, salário…"
          value={dados.descricao}
          onChange={campo('descricao')}
          InputLabelProps={{ required: true }}
          inputProps={{ maxLength: 4000 }}
          multiline
          minRows={5}
        />
      </Stack>
    </ResponsiveModal>
  );
}

export { ModalDaOportunidade };
