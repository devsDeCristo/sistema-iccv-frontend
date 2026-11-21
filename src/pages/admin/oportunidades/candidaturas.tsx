import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, Box, CircularProgress } from '@mui/material';

import { PageStyle } from '../../../components/pageStyle';
import { Header } from '../../../components/header';
import { useIgrejaSelecionada } from '../../../features/settings/shared/useIgrejaSelecionada';
import {
  caminhoNoPainel,
  useOportunidadesDaIgreja,
} from '../../../features/oportunidades/api';
import { PaginaDeCandidaturas } from '../../../features/oportunidades/components/paginaDeCandidaturas';

/** As candidaturas de uma vaga da igreja escolhida no painel */
function CandidaturasDaVaga() {
  const { id } = useParams();
  const { churchId } = useIgrejaSelecionada();
  const { data: vagas, isLoading } = useOportunidadesDaIgreja(churchId);
  const vaga = useMemo(() => vagas?.find((v) => v.id === id), [vagas, id]);

  return (
    <PageStyle>
      <Header
        title="Candidaturas"
        modulo="oportunidades"
        description={
          vaga ? [vaga.title, vaga.company].join(' · ') : 'Vaga da igreja'
        }
        pageBack="/admin/oportunidades"
        buttonBack
      />
      {isLoading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : !churchId || !vaga ? (
        <Alert severity="info">Vaga não encontrada na igreja escolhida.</Alert>
      ) : (
        <PaginaDeCandidaturas
          vaga={vaga}
          caminho={caminhoNoPainel(churchId, vaga.id)}
        />
      )}
    </PageStyle>
  );
}

export { CandidaturasDaVaga };
