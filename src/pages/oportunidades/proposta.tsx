import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';

import { PageStyle } from '../../components/pageStyle';
import { Header } from '../../components/header';
import { getStoredUser } from '../../auth/session';
import {
  caminhoDaProposta,
  useImagemDaOportunidade,
  useMinhasPropostas,
  useSalvarProposta,
} from '../../features/oportunidades/api';
import { FormularioDaVaga } from '../../features/oportunidades/components/formularioDaVaga';
import { DadosDaOportunidade } from '../../features/oportunidades/types';

const VOLTAR = '/oportunidades?aba=propostas';

/**
 * Propor uma vaga (`/oportunidades/propor`) ou editar a proposta pendente
 * (`/oportunidades/propostas/:id`). O mesmo formulário do admin; a proposta
 * vai para a igreja do cadastro da pessoa e só aparece aos membros depois que
 * o admin aprova.
 */
function Proposta() {
  const { id } = useParams();
  const navigate = useNavigate();
  const igreja = getStoredUser()?.memberChurch;
  const podeVer = !!igreja?.modulos?.includes('OPPORTUNITIES');
  const { data: propostas, isLoading } = useMinhasPropostas(podeVer && !!id);
  const salvar = useSalvarProposta();
  const imagemApi = useImagemDaOportunidade();
  const existente = useMemo(
    () => propostas?.find((p) => p.id === id),
    [propostas, id]
  );

  const cabecalho = (
    <Header
      title={id ? 'Editar proposta' : 'Propor vaga'}
      modulo="oportunidades"
      description={
        id
          ? existente?.title
          : `Sugira uma vaga para os membros da ${igreja?.name ?? 'igreja'}`
      }
      pageBack={VOLTAR}
      buttonBack
    />
  );

  if (!podeVer) {
    return (
      <PageStyle>
        {cabecalho}
        <Alert severity="info">
          {igreja
            ? `A ${igreja.name} ainda não divulga oportunidades por aqui.`
            : 'As oportunidades são só para os membros da igreja.'}
        </Alert>
      </PageStyle>
    );
  }
  if (id && isLoading) {
    return (
      <PageStyle>
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </PageStyle>
    );
  }
  // só a pendente é editável: decidida, o admin é quem cuida
  if (id && existente?.status !== 'PENDING') {
    return (
      <PageStyle>
        {cabecalho}
        <Alert severity="info">
          {existente
            ? 'Esta proposta já foi decidida pelo admin e não pode mais ser editada.'
            : 'Proposta não encontrada.'}
        </Alert>
      </PageStyle>
    );
  }

  const enviar = (
    dados: DadosDaOportunidade,
    imagem: File | null | undefined
  ) =>
    salvar.mutate(
      { id, dados },
      {
        onSuccess: async (proposta) => {
          if (imagem !== undefined) {
            await imagemApi
              .mutateAsync({ caminho: caminhoDaProposta(proposta.id), imagem })
              .catch(() =>
                toast.error(
                  'A proposta foi salva, mas a imagem não subiu. Tente de novo.'
                )
              );
          }
          navigate(VOLTAR);
        },
      }
    );

  return (
    <PageStyle>
      {cabecalho}
      <Alert severity="info" sx={{ mb: 2 }}>
        A proposta vai para o administrador da {igreja?.name ?? 'igreja'}, que
        pode ajustar, aprovar ou recusar. Ela só aparece aos membros depois de
        aprovada. Aprovada, você passa a ver quem se candidatou — nome, celular,
        e-mail, currículo e respostas —, para usar só no processo desta vaga.
      </Alert>
      <FormularioDaVaga
        inicial={existente}
        onEnviar={enviar}
        onCancelar={() => navigate(VOLTAR)}
        ocupado={salvar.isLoading || imagemApi.isLoading}
        textoDoBotao={id ? 'Salvar proposta' : 'Enviar proposta'}
      />
    </PageStyle>
  );
}

export { Proposta };
