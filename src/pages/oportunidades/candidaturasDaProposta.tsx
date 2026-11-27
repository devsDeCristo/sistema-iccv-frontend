import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Box, CircularProgress } from '@mui/material';

import { PageStyle } from '../../components/pageStyle';
import { Header } from '../../components/header';
import { getStoredUser } from '../../auth/session';
import {
  caminhoDaProposta,
  useMinhasPropostas,
} from '../../features/oportunidades/api';
import { PaginaDeCandidaturas } from '../../features/oportunidades/components/paginaDeCandidaturas';

/**
 * As candidaturas de uma vaga que a pessoa propôs, depois de aprovada. A API
 * só entrega os candidatos enquanto ela for membro da igreja da vaga.
 */
function CandidaturasDaProposta() {
  const { id } = useParams();
  const igreja = getStoredUser()?.memberChurch;
  const podeVer = !!igreja?.modulos?.includes('OPPORTUNITIES');
  const { data: propostas, isLoading } = useMinhasPropostas(podeVer);
  const vaga = useMemo(
    () => propostas?.find((p) => p.id === id && p.status === 'APPROVED'),
    [propostas, id]
  );

  return (
    <PageStyle>
      <Header
        title="Candidaturas"
        modulo="oportunidades"
        description={
          vaga ? [vaga.title, vaga.company].join(' · ') : 'Sua vaga proposta'
        }
        pageBack="/oportunidades?aba=propostas"
        buttonBack
      />
      {!podeVer ? (
        <Alert severity="info">
          As oportunidades são só para os membros da igreja.
        </Alert>
      ) : isLoading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : !vaga ? (
        <Alert severity="info">
          Os candidatos aparecem aqui depois que o admin aprova a proposta.
        </Alert>
      ) : (
        <PaginaDeCandidaturas
          vaga={vaga}
          caminho={caminhoDaProposta(vaga.id)}
        />
      )}
    </PageStyle>
  );
}

export { CandidaturasDaProposta };
