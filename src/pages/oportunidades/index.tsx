import { Alert, Box, CircularProgress, Stack, Typography } from '@mui/material';
import { Work } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';

import { PageStyle } from '../../components/pageStyle';
import { Header } from '../../components/header';
import { getStoredUser } from '../../auth/session';
import { useOportunidadesAbertas } from '../../features/oportunidades/api';
import { CardDaVaga } from '../../features/oportunidades/components/cardDaVaga';
import { ModalDetalhesDaVaga } from '../../features/oportunidades/components/modalDetalhesDaVaga';

/**
 * As vagas de emprego que a igreja de que a pessoa é membro publicou. A barra
 * lateral só mostra esta tela a quem é membro de uma igreja com o módulo; quem
 * chegar pelo endereço sem isso lê o motivo.
 *
 * A vaga aberta no modal fica no endereço (`?vaga=<id>`): a notificação e o
 * voltar da página de candidatura caem direto nela.
 */
function Oportunidades() {
  const igreja = getStoredUser()?.memberChurch;
  const podeVer = !!igreja?.modulos.includes('OPPORTUNITIES');
  const { data, isLoading } = useOportunidadesAbertas(podeVer);
  const [params, setParams] = useSearchParams();
  const aberta = data?.find((v) => v.id === params.get('vaga')) ?? null;

  const abrir = (id: string | null) =>
    setParams(id ? { vaga: id } : {}, { replace: !id });

  return (
    <PageStyle>
      <Header
        title="Oportunidades"
        modulo="oportunidades"
        description={
          podeVer
            ? `Vagas de emprego divulgadas pela ${igreja?.name}`
            : 'Vagas de emprego divulgadas pela igreja'
        }
      />

      {!podeVer ? (
        <Alert severity="info">
          {igreja
            ? `A ${igreja.name} ainda não divulga oportunidades por aqui.`
            : 'As oportunidades são só para os membros da igreja.'}
        </Alert>
      ) : isLoading ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      ) : !data?.length ? (
        <Stack alignItems="center" spacing={1} sx={{ py: 6 }}>
          <Work sx={{ fontSize: 40, color: 'text.disabled' }} />
          <Typography color="text.secondary" textAlign="center">
            Nenhuma vaga aberta no momento.
          </Typography>
        </Stack>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(3, minmax(0, 1fr))',
            },
            gap: 2,
          }}
        >
          {data.map((vaga) => (
            <CardDaVaga
              key={vaga.id}
              vaga={vaga}
              interessei={vaga.interessei}
              onAbrir={() => abrir(vaga.id)}
            />
          ))}
        </Box>
      )}

      <ModalDetalhesDaVaga vaga={aberta} onClose={() => abrir(null)} />
    </PageStyle>
  );
}

export { Oportunidades };
