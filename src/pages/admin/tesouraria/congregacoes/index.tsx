import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material';
import { Add, HolidayVillage, PlaceOutlined } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { PageStyle } from '../../../../components/pageStyle';
import { Header } from '../../../../components/header';
import {
  barraLarguraCheiaNoCelularSx,
  superficieSx,
} from '../../../../components/listPageStyles';
import { ChurchScopeBar } from '../../../../features/settings/shared/churchScopeBar';
import { useIgrejaSelecionada } from '../../../../features/settings/shared/useIgrejaSelecionada';
import { useTesourarias } from '../../../../features/admin/tesouraria/eventosECongregacoes/api';
import { AvisoNaoAlocados } from '../../../../features/admin/tesouraria/eventosECongregacoes/components/avisoNaoAlocados';
import { ListaDeTesourarias } from '../../../../features/admin/tesouraria/eventosECongregacoes/components/listaDeTesourarias';
import { ModalNovaCongregacao } from '../../../../features/admin/tesouraria/eventosECongregacoes/components/modalNovaCongregacao';

/**
 * As tesourarias das congregações da igreja, uma por congregação. Por
 * enquanto criar a tesouraria cria a congregação junto. O fluxo está em
 * `docs/tesouraria-congregacoes.md`.
 */
function TesourariaDeCongregacoes() {
  const navigate = useNavigate();
  const escopo = useIgrejaSelecionada(true);
  const [criando, setCriando] = useState(false);
  const { data: tesourarias, isLoading } = useTesourarias(
    escopo.churchId,
    'CONGREGATION'
  );

  const abrir = (id: string) =>
    navigate(`/admin/tesouraria/congregacoes/${id}`);

  return (
    <PageStyle>
      <Header
        title="Tesouraria das congregações"
        description="Cada congregação com a sua tesouraria"
        acaoAoLado
      >
        <ChurchScopeBar escopo={escopo} oQueMuda="a tesouraria" />
      </Header>

      {escopo.precisaEscolher ? (
        <Alert severity="info">
          Escolha no topo da página de qual igreja é a tesouraria: cada igreja
          tem a sua.
        </Alert>
      ) : escopo.semIgreja ? (
        <Alert severity="info">
          Você não é admin nem tesouraria de nenhuma igreja. A tesouraria é por
          igreja.
        </Alert>
      ) : (
        <>
          <AvisoNaoAlocados tipo="CONGREGATION" />

          <Paper
            sx={{
              ...superficieSx,
              ...barraLarguraCheiaNoCelularSx,
              p: 2,
              mb: 2,
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
            >
              <Box sx={{ flex: 1, minWidth: 220 }}>
                <Typography variant="body2" color="text.secondary">
                  Cada congregação tem a sua tesouraria. Por enquanto, criar a
                  tesouraria cria também a congregação.
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCriando(true)}
                sx={{
                  textTransform: 'none',
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                Nova congregação
              </Button>
            </Stack>
          </Paper>

          {isLoading ? (
            <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} />
          ) : (
            <ListaDeTesourarias
              tesourarias={(tesourarias ?? []).map((t) => ({
                id: t.id,
                nome: t.nome,
                icone: <HolidayVillage />,
                detalhes: [
                  {
                    icone: <PlaceOutlined />,
                    texto: t.local ?? 'Sem local',
                  },
                ],
                fechamento: t.fechamento,
                resumo: t.resumo,
              }))}
              vazio={{
                titulo: 'Nenhuma congregação',
                texto:
                  'Crie a primeira: a congregação nasce junto com a sua tesouraria.',
              }}
              onAbrir={abrir}
            />
          )}

          <ModalNovaCongregacao
            open={criando}
            churchId={escopo.churchId}
            onClose={() => setCriando(false)}
            onCriada={() => setCriando(false)}
          />
        </>
      )}
    </PageStyle>
  );
}

export { TesourariaDeCongregacoes };
