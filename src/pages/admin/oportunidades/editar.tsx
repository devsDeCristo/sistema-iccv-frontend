import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Box, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';

import { PageStyle } from '../../../components/pageStyle';
import { Header } from '../../../components/header';
import { useIgrejaSelecionada } from '../../../features/settings/shared/useIgrejaSelecionada';
import {
  caminhoNoPainel,
  useImagemDaOportunidade,
  useOportunidadesDaIgreja,
  useSalvarOportunidade,
} from '../../../features/oportunidades/api';
import { FormularioDaVaga } from '../../../features/oportunidades/components/formularioDaVaga';
import { DadosDaOportunidade } from '../../../features/oportunidades/types';

/**
 * Publicar ou editar uma vaga, no painel. Editar serve também para ajustar a
 * proposta de um membro antes de aprovar. Página, e não modal: com o editor
 * do formulário, não cabia.
 */
function EditarOportunidade() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { churchId } = useIgrejaSelecionada();
  const { data: vagas, isLoading } = useOportunidadesDaIgreja(churchId);
  const salvar = useSalvarOportunidade();
  const imagemApi = useImagemDaOportunidade();
  const existente = useMemo(() => vagas?.find((v) => v.id === id), [vagas, id]);
  const pendente = existente?.status === 'PENDING';

  if (id && isLoading) {
    return (
      <PageStyle>
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </PageStyle>
    );
  }
  if (id && !existente) {
    return (
      <PageStyle>
        <Header
          title="Editar oportunidade"
          modulo="oportunidades"
          pageBack="/admin/oportunidades"
          buttonBack
        />
        <Alert severity="info">
          Oportunidade não encontrada na igreja escolhida.
        </Alert>
      </PageStyle>
    );
  }

  const enviar = (
    dados: DadosDaOportunidade,
    imagem: File | null | undefined
  ) =>
    churchId &&
    salvar.mutate(
      {
        churchId,
        id,
        dados,
        aviso: id ? 'Oportunidade salva' : 'Oportunidade publicada',
      },
      {
        onSuccess: async (vaga) => {
          if (imagem !== undefined) {
            await imagemApi
              .mutateAsync({
                caminho: caminhoNoPainel(churchId, vaga.id),
                imagem,
              })
              .catch(() =>
                toast.error(
                  'A vaga foi salva, mas a imagem não subiu. Tente de novo.'
                )
              );
          }
          navigate(
            pendente
              ? '/admin/oportunidades?aba=pendentes'
              : '/admin/oportunidades'
          );
        },
      }
    );

  return (
    <PageStyle>
      <Header
        title={
          id
            ? pendente
              ? 'Revisar proposta'
              : 'Editar oportunidade'
            : 'Cadastrar oportunidade'
        }
        modulo="oportunidades"
        description={existente?.title}
        pageBack="/admin/oportunidades"
        buttonBack
      />

      {!churchId ? (
        <Alert severity="info">
          Escolha no topo da página de qual igreja é a vaga.
        </Alert>
      ) : (
        <>
          {pendente && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Proposta de {existente?.proposedBy?.fullName ?? 'um membro'},
              ainda fora do ar. Ajuste o que precisar e salve; depois aprove ou
              recuse na lista de pendentes.
            </Alert>
          )}
          <FormularioDaVaga
            inicial={existente}
            onEnviar={enviar}
            onCancelar={() => navigate('/admin/oportunidades')}
            ocupado={salvar.isLoading || imagemApi.isLoading}
            textoDoBotao={id ? 'Salvar' : 'Publicar'}
          />
        </>
      )}
    </PageStyle>
  );
}

export { EditarOportunidade };
