import { useReducer, useState } from 'react';
import { Alert, Box, Button, Paper, Stack, Typography } from '@mui/material';
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
import { listarTesourariasDeCongregacao } from '../../../../features/admin/tesouraria/eventosECongregacoes/dados';
import { AvisoNaoAlocados } from '../../../../features/admin/tesouraria/eventosECongregacoes/components/avisoNaoAlocados';
import { ListaDeTesourarias } from '../../../../features/admin/tesouraria/eventosECongregacoes/components/listaDeTesourarias';
import { ModalNovaCongregacao } from '../../../../features/admin/tesouraria/eventosECongregacoes/components/modalNovaCongregacao';

/**
 * As tesourarias das congregações da igreja, uma por congregação. Por
 * enquanto criar a tesouraria cria a congregação junto. MVP: dados de exemplo
 * (`tesouraria/dados.ts`); o fluxo está em `docs/tesouraria-congregacoes.md`.
 */
function TesourariaDeCongregacoes() {
  const navigate = useNavigate();
  const escopo = useIgrejaSelecionada(true, 'TREASURY');
  const [criando, setCriando] = useState(false);
  // os dados de exemplo mudam fora do React: isto só pede um novo desenho
  const [, redesenhar] = useReducer((n: number) => n + 1, 0);

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
          <Alert severity="info" sx={{ mb: 2 }}>
            Tela de demonstração: os números são de exemplo, e o que for criado,
            distribuído ou fechado aqui some ao recarregar a página.
          </Alert>
          <AvisoNaoAlocados conta="CONGREGACOES" />

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

          <ListaDeTesourarias
            tesourarias={listarTesourariasDeCongregacao().map((t) => ({
              id: t.id,
              nome: t.congregacao.nome,
              icone: <HolidayVillage />,
              detalhes: [
                {
                  icone: <PlaceOutlined />,
                  texto: t.congregacao.local ?? 'Sem local',
                },
              ],
            }))}
            vazio={{
              titulo: 'Nenhuma congregação',
              texto:
                'Crie a primeira: a congregação nasce junto com a sua tesouraria.',
            }}
            onAbrir={abrir}
          />

          <ModalNovaCongregacao
            open={criando}
            onClose={() => setCriando(false)}
            onCriada={() => {
              setCriando(false);
              redesenhar();
            }}
          />
        </>
      )}
    </PageStyle>
  );
}

export { TesourariaDeCongregacoes };
