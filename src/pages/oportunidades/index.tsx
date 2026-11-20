import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Search, Work } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';

import { PageStyle } from '../../components/pageStyle';
import { Header } from '../../components/header';
import { getStoredUser } from '../../auth/session';
import {
  barraLarguraCheiaNoCelularSx,
  superficieSx,
} from '../../components/listPageStyles';
import {
  Intervalo,
  SeletorDeIntervalo,
} from '../../components/seletorDeIntervalo';
import { useOportunidadesAbertas } from '../../features/oportunidades/api';
import { CardDaVaga } from '../../features/oportunidades/components/cardDaVaga';
import { ModalDetalhesDaVaga } from '../../features/oportunidades/components/modalDetalhesDaVaga';
import { OportunidadeDoMembro } from '../../features/oportunidades/types';

/**
 * As vagas de emprego que a igreja de que a pessoa é membro publicou. A barra
 * lateral só mostra esta tela a quem é membro de uma igreja com o módulo; quem
 * chegar pelo endereço sem isso lê o motivo.
 *
 * A vaga aberta no modal fica no endereço (`?vaga=<id>`): a notificação e o
 * voltar da página de candidatura caem direto nela.
 */
/** Para a busca: sem acento e sem caixa, "Gestão" acha "gestao" */
const semAcento = (texto: string) =>
  texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

function Oportunidades() {
  const igreja = getStoredUser()?.memberChurch;
  const podeVer = !!igreja?.modulos.includes('OPPORTUNITIES');
  const { data, isLoading } = useOportunidadesAbertas(podeVer);
  const [params, setParams] = useSearchParams();
  const aberta = data?.find((v) => v.id === params.get('vaga')) ?? null;
  const [busca, setBusca] = useState('');
  const [periodo, setPeriodo] = useState<Intervalo>({ de: null, ate: null });

  // filtro na tela: a lista é a das vagas da igreja, já inteira aqui
  const filtradas = useMemo(() => {
    const termo = semAcento(busca.trim());
    // `semHora` traz as duas pontas no começo do dia: o fim vale o dia todo
    const ate = periodo.ate && new Date(periodo.ate.getTime() + 86_400_000);
    return (data ?? []).filter((vaga) => {
      const publicada = new Date(vaga.createdAt);
      return (
        (!termo ||
          semAcento(`${vaga.title} ${vaga.company}`).includes(termo)) &&
        (!periodo.de || publicada >= periodo.de) &&
        (!ate || publicada < ate)
      );
    });
  }, [data, busca, periodo]);

  // agrupadas pelo mês de publicação, como o histórico de eventos agrupa
  // por ano; a API já manda das mais novas para as mais antigas
  const porMes = useMemo(() => {
    const meses = new Map<string, OportunidadeDoMembro[]>();
    filtradas.forEach((vaga) => {
      const mes = new Date(vaga.createdAt).toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
        timeZone: 'America/Sao_Paulo',
      });
      const titulo = mes.charAt(0).toUpperCase() + mes.slice(1);
      meses.set(titulo, [...(meses.get(titulo) ?? []), vaga]);
    });
    return [...meses.entries()];
  }, [filtradas]);

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
        <>
          <Paper
            sx={{
              ...superficieSx,
              ...barraLarguraCheiaNoCelularSx,
              p: 2,
              mb: 3,
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
            >
              <TextField
                placeholder="Pesquisar vaga por nome"
                size="small"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                sx={{ width: { xs: '100%', sm: 300 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
              <SeletorDeIntervalo
                label="Publicada entre"
                value={periodo}
                onChange={setPeriodo}
                semHora
                semInicio="qualquer data"
                semFim="hoje"
                disableFuture
              />
            </Stack>
          </Paper>

          {!porMes.length && (
            <Typography
              color="text.secondary"
              textAlign="center"
              sx={{ py: 4 }}
            >
              Nenhuma vaga com esse nome ou nesse período.
            </Typography>
          )}

          <Stack gap={4}>
            {porMes.map(([mes, vagas]) => (
              <Box key={mes}>
                {/* o mesmo título de grupo do histórico de eventos */}
                <Stack
                  direction="row"
                  alignItems="baseline"
                  gap={1}
                  sx={{ mb: 1.5 }}
                >
                  <Typography sx={{ fontSize: '1.125rem', fontWeight: 700 }}>
                    {mes}
                  </Typography>
                  <Typography
                    sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}
                  >
                    {vagas.length === 1 ? '1 vaga' : `${vagas.length} vagas`}
                  </Typography>
                </Stack>
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
                  {vagas.map((vaga) => (
                    <CardDaVaga
                      key={vaga.id}
                      vaga={vaga}
                      interessei={vaga.interessei}
                      onAbrir={() => abrir(vaga.id)}
                    />
                  ))}
                </Box>
              </Box>
            ))}
          </Stack>
        </>
      )}

      <ModalDetalhesDaVaga vaga={aberta} onClose={() => abrir(null)} />
    </PageStyle>
  );
}

export { Oportunidades };
