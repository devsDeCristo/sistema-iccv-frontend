import { useReducer, useState } from 'react';
import { Alert, Button, Paper, Stack, Typography } from '@mui/material';
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
import { useRole } from '../../../../hooks/useRole';
import { listarTesourarias } from '../../../../features/admin/tesouraria/eventosECongregacoes/dados';
import { AvisoNaoAlocados } from '../../../../features/admin/tesouraria/eventosECongregacoes/components/avisoNaoAlocados';
import { ListaDeTesourarias } from '../../../../features/admin/tesouraria/eventosECongregacoes/components/listaDeTesourarias';
import { ModalNovaTesouraria } from '../../../../features/admin/tesouraria/eventosECongregacoes/components/modalNovaTesouraria';

/**
 * As tesourarias de evento da igreja. Só existe tesouraria de evento que foi
 * criada aqui — ligada a um evento do sistema ou a um que não está nele, como
 * um jantar. MVP: dados de exemplo (`eventosECongregacoes/dados.ts`).
 *
 * O tesoureiro(a) completo de um evento também entra, e vê só a tesouraria
 * dos eventos dele — sem criar nenhuma.
 */
function TesourariaDeEventos() {
  const navigate = useNavigate();
  const escopo = useIgrejaSelecionada(true, 'TREASURY');
  const { soTesoureiroDeEvento, eventTreasurers } = useRole();
  const [criando, setCriando] = useState(false);
  // os dados de exemplo mudam fora do React: isto só pede um novo desenho
  const [, redesenhar] = useReducer((n: number) => n + 1, 0);

  const abrir = (id: string) => navigate(`/admin/tesouraria/eventos/${id}`);
  const dosEventosDele = new Set(
    eventTreasurers.filter((t) => t.kind === 'COMPLETO').map((t) => t.eventId)
  );
  const tesourarias = listarTesourarias().filter(
    (t) =>
      !soTesoureiroDeEvento || (!!t.eventoId && dosEventosDele.has(t.eventoId))
  );

  const lista = (
    <ListaDeTesourarias
      tesourarias={tesourarias.map((t) => ({
        id: t.id,
        nome: t.nome,
        // evento do sistema e fora dele: ícone e legenda, não só cor
        icone: t.eventoId ? <Event /> : <Celebration />,
        detalhes: [
          { icone: <CalendarMonth />, texto: t.periodo },
          t.eventoId
            ? { icone: <LinkIcon />, texto: 'Evento do sistema' }
            : { icone: <LinkOff />, texto: 'Fora do sistema' },
        ],
      }))}
      vazio={
        soTesoureiroDeEvento
          ? {
              titulo: 'Nenhuma tesouraria dos seus eventos',
              texto:
                'Aqui aparecem as tesourarias dos eventos em que você é tesoureiro(a) completo. Nesta demonstração os eventos são de exemplo, então nenhum é seu.',
            }
          : {
              titulo: 'Nenhuma tesouraria de evento',
              texto:
                'Crie a primeira: para um evento do sistema ou para um fora dele, como um jantar de confraternização.',
            }
      }
      onAbrir={abrir}
    />
  );

  return (
    <PageStyle>
      <Header
        title="Tesouraria de eventos"
        description="Cada evento com a sua tesouraria"
        acaoAoLado
      >
        {/* o tesoureiro(a) do evento não escolhe igreja: os eventos são dele */}
        {!soTesoureiroDeEvento && (
          <ChurchScopeBar escopo={escopo} oQueMuda="a tesouraria" />
        )}
      </Header>

      {soTesoureiroDeEvento ? (
        lista
      ) : escopo.precisaEscolher ? (
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
          <AvisoNaoAlocados conta="EVENTOS" />

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
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ flex: 1, minWidth: 220 }}
              >
                Um evento só tem tesouraria se ela for criada aqui — para um
                evento do sistema ou para um fora dele, como um jantar.
              </Typography>
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

          {lista}

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
