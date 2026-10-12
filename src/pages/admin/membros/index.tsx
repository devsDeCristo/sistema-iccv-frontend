import { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  useTheme,
} from '@mui/material';
import {
  Add,
  FamilyRestroom,
  HowToReg,
  People,
  PersonOutline,
  Search,
} from '@mui/icons-material';

import { PageStyle } from '../../../components/pageStyle';
import { NavTabs } from '../../../components/navTabs';
import { Header } from '../../../components/header';
import { ConfirmModal } from '../../../components/ConfirmModal';
import { StatusCards } from '../../../components/statusCards';
import {
  barraLarguraCheiaNoCelularSx,
  superficieSx,
} from '../../../components/listPageStyles';
import { ChurchScopeBar } from '../../../features/settings/shared/churchScopeBar';
import { useIgrejaSelecionada } from '../../../features/settings/shared/useIgrejaSelecionada';
import {
  useAceitarPedido,
  useDesfazerFamilia,
  useGetMembros,
  useRecusarPedido,
  useRemoverMembro,
  useTirarDaFamilia,
} from '../../../features/admin/membros/api';
import { ListaDeMembros } from '../../../features/admin/membros/components/listaDeMembros';
import { ListaDePedidos } from '../../../features/admin/membros/components/listaDePedidos';
import { ModalAdicionarMembro } from '../../../features/admin/membros/components/modalAdicionarMembro';
import { ModalFamilia } from '../../../features/admin/membros/components/modalFamilia';
import { Familia, Membro } from '../../../features/admin/membros/types';
import { ModalPermissaoEmMassa } from '../../../features/admin/users/components/modalPermissaoEmMassa';
import { useRole } from '../../../hooks/useRole';
import { Role } from '../../../constants/roles';

type Confirmacao =
  { tipo: 'remover'; membro: Membro } | { tipo: 'desfazer'; familia: Familia };

/**
 * Os membros da igreja — o recorte, entre todos os usuários do sistema, de
 * quem é dela — e as famílias. Os dizimistas da tesouraria saem daqui.
 *
 * Uma pessoa é membro de uma igreja só. Ela entra pelo pedido feito na
 * inscrição (aba Pedidos) ou porque o admin da igreja a coloca. É também aqui
 * que o admin dá a um membro o perfil de admin ou de tesouraria na igreja.
 *
 * A tesouraria da igreja e o tesoureiro(a) de um evento dela só consultam: a
 * mesma tela, sem os pedidos, sem marcar e sem o menu de cada um.
 */
function Membros() {
  const theme = useTheme();
  const { isSuperAdmin, perfilNaIgreja } = useRole();
  // as igrejas que administra, e as que só consulta (tesouraria, tesoureiro)
  const escopo = useIgrejaSelecionada(true, undefined, true);
  const churchId = escopo.churchId;
  const somenteLeitura =
    !isSuperAdmin && (!churchId || perfilNaIgreja(churchId) !== Role.ADMIN);

  const [aba, setAba] = useState<'membros' | 'pedidos'>('membros');
  const [busca, setBusca] = useState('');
  const [filtroFamilia, setFiltroFamilia] = useState<'todos' | 'com' | 'sem'>(
    'todos'
  );
  const [adicionando, setAdicionando] = useState(false);
  const [juntando, setJuntando] = useState<Membro[] | null>(null);
  const [renomeando, setRenomeando] = useState<Familia | null>(null);
  const [confirmando, setConfirmando] = useState<Confirmacao | null>(null);
  const [dandoPermissao, setDandoPermissao] = useState<Membro[] | null>(null);

  const { data, isFetching } = useGetMembros(churchId);
  const aceitar = useAceitarPedido();
  const recusar = useRecusarPedido();
  const remover = useRemoverMembro();
  const tirar = useTirarDaFamilia();
  const desfazer = useDesfazerFamilia();

  const membros = useMemo(() => data?.membros ?? [], [data]);
  const familias = data?.familias ?? [];
  const pendentes = data?.pendentes ?? [];

  // a lista de uma igreja é curta: filtrar aqui poupa ida ao servidor
  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const digitos = termo.replace(/\D/g, '');
    return membros.filter(
      (m) =>
        (filtroFamilia === 'todos' ||
          (filtroFamilia === 'com') === !!m.family) &&
        (!termo ||
          m.fullName.toLowerCase().includes(termo) ||
          m.family?.name.toLowerCase().includes(termo) ||
          (digitos.length >= 3 && m.cpf.includes(digitos)))
    );
  }, [membros, busca, filtroFamilia]);

  return (
    <PageStyle>
      <Header
        title="Membros"
        description="Quem é da igreja, em famílias"
        acaoAoLado
      >
        <ChurchScopeBar escopo={escopo} oQueMuda="os membros" />
      </Header>

      {escopo.precisaEscolher ? (
        <Alert severity="info">
          Escolha no topo da página de qual igreja são os membros: cada igreja
          tem os seus.
        </Alert>
      ) : escopo.semIgreja ? (
        <Alert severity="info">
          Você não é admin nem tesouraria de nenhuma igreja. Os membros são por
          igreja, e quem cuida deles é quem a administra.
        </Alert>
      ) : (
        <>
          <StatusCards
            isLoading={!data}
            // quem só consulta não vê os pedidos
            cards={[
              {
                title: 'Membros',
                value: membros.length,
                subtitle: 'Na igreja',
                icon: <People sx={{ fontSize: 20 }} />,
                color: theme.palette.chips.info,
              },
              {
                title: 'Famílias',
                value: familias.length,
                subtitle: `${membros.filter((m) => m.family).length} membros em família`,
                icon: <FamilyRestroom sx={{ fontSize: 20 }} />,
                color: theme.palette.chips.success,
              },
              {
                title: 'Sem família',
                value: membros.filter((m) => !m.family).length,
                subtitle: 'Membros ainda soltos',
                icon: <PersonOutline sx={{ fontSize: 20 }} />,
                color: theme.palette.chips.pending,
              },
              ...(somenteLeitura
                ? []
                : [
                    {
                      title: 'Pedidos',
                      value: pendentes.length,
                      subtitle: 'Escolheram a igreja na inscrição',
                      icon: <HowToReg sx={{ fontSize: 20 }} />,
                      color: theme.palette.chips.alert,
                    },
                  ]),
            ]}
          />

          {somenteLeitura && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Só consulta: quem mexe nos membros é o admin da igreja.
            </Alert>
          )}

          {!somenteLeitura && (
            <NavTabs
              fullWidth
              value={aba}
              onChange={setAba}
              sx={{ mb: 2 }}
              options={[
                {
                  value: 'membros',
                  label: 'Membros',
                  icon: <People fontSize="small" />,
                },
                {
                  value: 'pedidos',
                  // a contagem no rótulo: é o que diz que há gente esperando
                  label: pendentes.length
                    ? `Pedidos (${pendentes.length})`
                    : 'Pedidos',
                  icon: <HowToReg fontSize="small" />,
                },
              ]}
            />
          )}

          {aba === 'membros' ? (
            <>
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
                  <TextField
                    size="small"
                    placeholder="Nome, CPF ou família"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    sx={{ width: 280 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search
                            sx={{ fontSize: 20, color: 'text.secondary' }}
                          />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    select
                    size="small"
                    label="Família"
                    value={filtroFamilia}
                    onChange={(e) =>
                      setFiltroFamilia(e.target.value as typeof filtroFamilia)
                    }
                    sx={{ width: 160 }}
                  >
                    <MenuItem value="todos">Todos</MenuItem>
                    <MenuItem value="com">Em família</MenuItem>
                    <MenuItem value="sem">Sem família</MenuItem>
                  </TextField>

                  <Box sx={{ flex: 1 }} />

                  {!somenteLeitura && (
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => setAdicionando(true)}
                      sx={{
                        textTransform: 'none',
                        width: { xs: '100%', sm: 'auto' },
                      }}
                    >
                      Adicionar membro
                    </Button>
                  )}
                </Stack>
              </Paper>

              <ListaDeMembros
                membros={visiveis}
                familias={familias}
                carregando={isFetching}
                somenteLeitura={somenteLeitura}
                onPermissao={setDandoPermissao}
                onJuntar={setJuntando}
                onRenomear={setRenomeando}
                onDesfazer={(familia) =>
                  setConfirmando({ tipo: 'desfazer', familia })
                }
                onTirarDaFamilia={(membro) =>
                  churchId && tirar.mutate({ churchId, id: membro.id })
                }
                onRemover={(membro) =>
                  setConfirmando({ tipo: 'remover', membro })
                }
              />
            </>
          ) : (
            <ListaDePedidos
              pendentes={pendentes}
              carregando={isFetching}
              ocupado={aceitar.isLoading || recusar.isLoading}
              onAceitar={(p) =>
                churchId && aceitar.mutate({ churchId, id: p.id })
              }
              onRecusar={(p) =>
                churchId && recusar.mutate({ churchId, id: p.id })
              }
            />
          )}

          {churchId && (
            <>
              <ModalAdicionarMembro
                open={adicionando}
                churchId={churchId}
                onClose={() => setAdicionando(false)}
              />
              <ModalFamilia
                open={!!juntando || !!renomeando}
                churchId={churchId}
                escolhidos={juntando ?? []}
                familias={familias}
                renomeando={renomeando}
                onClose={() => {
                  setJuntando(null);
                  setRenomeando(null);
                }}
              />
              <ModalPermissaoEmMassa
                open={!!dandoPermissao}
                userIds={dandoPermissao?.map((m) => m.id) ?? []}
                igrejaFixa={churchId}
                onClose={() => setDandoPermissao(null)}
                onConcluir={() => setDandoPermissao(null)}
              />
            </>
          )}

          <ConfirmModal
            open={!!confirmando}
            onClose={() => setConfirmando(null)}
            title={
              confirmando?.tipo === 'remover'
                ? 'Deixar de ser membro?'
                : 'Desfazer a família?'
            }
            message={
              confirmando?.tipo === 'remover'
                ? `${confirmando.membro.fullName} deixa de ser membro desta igreja: sai da família e da lista de dizimistas. Os lançamentos dele continuam no livro-caixa, e ele pode ser colocado em outra igreja.`
                : `As pessoas da ${confirmando?.familia.name} continuam membros, só deixam de estar juntas.`
            }
            confirmLabel={
              confirmando?.tipo === 'remover' ? 'Tirar da igreja' : 'Desfazer'
            }
            onConfirm={() => {
              if (churchId && confirmando?.tipo === 'remover') {
                remover.mutate({ churchId, id: confirmando.membro.id });
              }
              if (churchId && confirmando?.tipo === 'desfazer') {
                desfazer.mutate({ churchId, id: confirmando.familia.id });
              }
              setConfirmando(null);
            }}
          />
        </>
      )}
    </PageStyle>
  );
}

export { Membros };
