import { useState } from 'react';
import {
  Alert,
  Button,
  Paper,
  Skeleton,
  Stack,
  Typography,
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
import {
  useIgrejaDaTesouraria,
  useTesourarias,
} from '../../../../features/admin/tesouraria/eventosECongregacoes/api';
import { AvisoNaoAlocados } from '../../../../features/admin/tesouraria/eventosECongregacoes/components/avisoNaoAlocados';
import { ListaDeTesourarias } from '../../../../features/admin/tesouraria/eventosECongregacoes/components/listaDeTesourarias';
import { ModalNovaTesouraria } from '../../../../features/admin/tesouraria/eventosECongregacoes/components/modalNovaTesouraria';

/**
 * As tesourarias de evento da igreja. Só existe tesouraria de evento que foi
 * criada aqui — ligada a um evento do sistema ou a um que não está nele, como
 * um jantar.
 *
 * O tesoureiro(a) completo de um evento também entra, e vê só a tesouraria
 * dos eventos dele — sem criar nenhuma.
 */
function TesourariaDeEventos() {
  const navigate = useNavigate();
  // o tesoureiro(a) do evento não escolhe igreja: a API já devolve só as
  // tesourarias dos eventos dele
  const { escopo, churchId, soTesoureiroDeEvento } = useIgrejaDaTesouraria();
  const [criando, setCriando] = useState(false);
  const { data: tesourarias, isLoading } = useTesourarias(churchId, 'EVENT');

  const abrir = (id: string) => navigate(`/admin/tesouraria/eventos/${id}`);

  const lista = isLoading ? (
    <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} />
  ) : (
    <ListaDeTesourarias
      tesourarias={(tesourarias ?? []).map((t) => ({
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
        fechamento: t.fechamento,
        resumo: t.resumo,
      }))}
      vazio={
        soTesoureiroDeEvento
          ? {
              titulo: 'Nenhuma tesouraria dos seus eventos',
              texto:
                'Aqui aparecem as tesourarias dos eventos em que você é tesoureiro(a) completo, quando a igreja cria uma para o evento.',
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
          <AvisoNaoAlocados tipo="EVENT" />

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
            churchId={escopo.churchId}
            onClose={() => setCriando(false)}
            onCriada={() => setCriando(false)}
          />
        </>
      )}
    </PageStyle>
  );
}

export { TesourariaDeEventos };
