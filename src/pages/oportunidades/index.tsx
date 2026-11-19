import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  BusinessOutlined,
  CheckCircle,
  PlaceOutlined,
  Work,
} from '@mui/icons-material';

import { PageStyle } from '../../components/pageStyle';
import { Header } from '../../components/header';
import { superficieSx } from '../../components/listPageStyles';
import { getStoredUser } from '../../auth/session';
import {
  useInteresse,
  useOportunidadesAbertas,
} from '../../features/oportunidades/api';
import { OportunidadeDoMembro } from '../../features/oportunidades/types';

function Card({ vaga }: { vaga: OportunidadeDoMembro }) {
  const interesse = useInteresse();
  const info = (icone: React.ReactNode, texto: string) => (
    <Stack
      direction="row"
      alignItems="center"
      gap={0.5}
      sx={{ minWidth: 0, '& svg': { fontSize: 16, color: 'text.secondary' } }}
    >
      {icone}
      <Typography noWrap sx={{ fontSize: 13, fontWeight: 600 }}>
        {texto}
      </Typography>
    </Stack>
  );

  return (
    <Paper sx={{ ...superficieSx, p: 2.5 }} component="article">
      <Stack spacing={1.25} sx={{ height: '100%' }}>
        <Typography sx={{ fontSize: 17, fontWeight: 700 }}>
          {vaga.title}
        </Typography>
        <Stack direction="row" flexWrap="wrap" columnGap={2} rowGap={0.5}>
          {info(<BusinessOutlined />, vaga.company)}
          {vaga.location && info(<PlaceOutlined />, vaga.location)}
        </Stack>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ whiteSpace: 'pre-line', overflowWrap: 'anywhere', flex: 1 }}
        >
          {vaga.description}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Publicada em {new Date(vaga.createdAt).toLocaleDateString('pt-BR')}
        </Typography>
        <Button
          variant={vaga.interessei ? 'outlined' : 'contained'}
          startIcon={vaga.interessei ? <CheckCircle /> : undefined}
          disabled={interesse.isLoading}
          onClick={() =>
            interesse.mutate({ id: vaga.id, quer: !vaga.interessei })
          }
          sx={{ textTransform: 'none' }}
        >
          {vaga.interessei ? 'Retirar interesse' : 'Tenho interesse'}
        </Button>
      </Stack>
    </Paper>
  );
}

/**
 * As vagas de emprego que a igreja de que a pessoa é membro publicou. A barra
 * lateral só mostra esta tela a quem é membro de uma igreja com o módulo; quem
 * chegar pelo endereço sem isso lê o motivo.
 */
function Oportunidades() {
  const igreja = getStoredUser()?.memberChurch;
  const podeVer = !!igreja?.modulos.includes('OPPORTUNITIES');
  const { data, isLoading } = useOportunidadesAbertas(podeVer);

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
      ) : (
        <>
          <Alert severity="info" sx={{ mb: 2 }}>
            Ao demonstrar interesse, a igreja repassa seu nome, celular e e-mail
            a quem oferece a vaga.
          </Alert>
          {isLoading ? (
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
                <Card key={vaga.id} vaga={vaga} />
              ))}
            </Box>
          )}
        </>
      )}
    </PageStyle>
  );
}

export { Oportunidades };
