import { useReducer, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Add,
  CalendarMonth,
  Celebration,
  Event,
  Link as LinkIcon,
  LinkOff,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

import { PageStyle } from '../../../../components/pageStyle';
import { Header } from '../../../../components/header';
import {
  barraLarguraCheiaNoCelularSx,
  superficieSx,
} from '../../../../components/listPageStyles';
import { ChurchScopeBar } from '../../../../features/settings/shared/churchScopeBar';
import { useIgrejaSelecionada } from '../../../../features/settings/shared/useIgrejaSelecionada';
import { formatCurrency } from '../../../../utils';
import {
  aDistribuir,
  listarTesourarias,
  saldoDe,
} from '../../../../features/admin/financeiro/tesouraria/dados';
import { ListaDeTesourarias } from '../../../../features/admin/financeiro/tesouraria/components/listaDeTesourarias';
import { ModalNovaTesouraria } from '../../../../features/admin/financeiro/tesouraria/components/modalNovaTesouraria';

/**
 * As tesourarias de evento da igreja. Só existe tesouraria de evento que foi
 * criada aqui — ligada a um evento do sistema ou a um que não está nele, como
 * um jantar. MVP: dados de exemplo (`tesouraria/dados.ts`).
 */
function TesourariaDeEventos() {
  const navigate = useNavigate();
  const theme = useTheme();
  const escopo = useIgrejaSelecionada(true);
  const [criando, setCriando] = useState(false);
  // os dados de exemplo mudam fora do React: isto só pede um novo desenho
  const [, redesenhar] = useReducer((n: number) => n + 1, 0);

  const abrir = (id: string) => navigate(`/admin/tesouraria/eventos/${id}`);
  const livres = aDistribuir('EVENTOS');

  return (
    <PageStyle>
      <Header
        title="Tesouraria de eventos"
        description="Cada evento com a sua tesouraria"
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
          Você não é admin nem financeiro de nenhuma igreja. A tesouraria é por
          igreja.
        </Alert>
      ) : (
        <>
          <Alert severity="info" sx={{ mb: 2 }}>
            Tela de demonstração: os números são de exemplo, e o que for criado
            ou distribuído aqui some ao recarregar a página.
          </Alert>

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
                  Um evento só tem tesouraria se ela for criada aqui — para um
                  evento do sistema ou para um fora dele, como um jantar.
                </Typography>
                {/* o extrato é distribuído dentro de cada tesouraria */}
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {livres.length
                    ? `${livres.length} ${
                        livres.length === 1 ? 'movimento' : 'movimentos'
                      } a distribuir na conta de Eventos (${formatCurrency(
                        saldoDe(livres)
                      )})`
                    : 'Todo o extrato da conta de Eventos já está em algum evento'}
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
                Nova tesouraria
              </Button>
            </Stack>
          </Paper>

          <ListaDeTesourarias
            tesourarias={listarTesourarias().map((t) => ({
              id: t.id,
              nome: t.nome,
              // evento do sistema e fora dele: ícone e legenda, não só cor
              icone: t.eventoId ? <Event /> : <Celebration />,
              cor:
                t.situacao === 'ABERTA'
                  ? theme.palette.chips.success
                  : theme.palette.chips.default,
              etiqueta: t.situacao === 'ABERTA' ? 'Aberta' : 'Encerrada',
              detalhes: [
                { icone: <CalendarMonth />, texto: t.periodo },
                t.eventoId
                  ? { icone: <LinkIcon />, texto: 'Evento do sistema' }
                  : { icone: <LinkOff />, texto: 'Fora do sistema' },
              ],
            }))}
            vazio={{
              titulo: 'Nenhuma tesouraria de evento',
              texto:
                'Crie a primeira: para um evento do sistema ou para um fora dele, como um jantar de confraternização.',
            }}
            onAbrir={abrir}
          />

          <ModalNovaTesouraria
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

export { TesourariaDeEventos };
