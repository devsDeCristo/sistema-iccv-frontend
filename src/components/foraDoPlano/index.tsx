import { Link } from 'react-router-dom';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import { PageStyle } from '../pageStyle';
import { Header } from '../header';
import { ModuloDaIgreja, ROTULO_DO_MODULO } from '../../constants/modulos';
import { useRole } from '../../hooks/useRole';
import { ChurchScopeBar } from '../../features/settings/shared/churchScopeBar';
import { useIgrejaSelecionada } from '../../features/settings/shared/useIgrejaSelecionada';

/**
 * A tela de um módulo que a igreja não tem no plano.
 *
 * Com `churchId`, é a igreja escolhida no seletor que não tem: a tela mostra
 * o seletor no topo, para trocar de igreja ali mesmo, e diz de qual igreja se
 * trata — vale também para o super admin, que alcança todos os módulos mas vê
 * cada igreja como ela é. Sem `churchId`, nenhuma igreja da pessoa tem o
 * módulo.
 *
 * O caminho para conseguir o módulo: o super admin troca o plano em Igrejas;
 * quem trabalha na igreja vê os planos em Meus planos.
 */
function ForaDoPlano({
  modulo,
  churchId,
}: {
  modulo: ModuloDaIgreja;
  churchId?: string;
}) {
  const nome = ROTULO_DO_MODULO[modulo];
  const { isSuperAdmin } = useRole();
  const escopo = useIgrejaSelecionada(true, true);
  const igreja = escopo.igrejas.find((i) => i.id === churchId)?.name;

  return (
    <PageStyle>
      <Header title={nome} acaoAoLado>
        {churchId && (
          <ChurchScopeBar escopo={escopo} oQueMuda={`o módulo ${nome}`} />
        )}
      </Header>
      <Paper
        sx={{
          border: 1,
          borderStyle: 'dashed',
          borderColor: 'divider',
          borderRadius: 3,
          boxShadow: 'none',
          p: { xs: 3, md: 5 },
        }}
      >
        <Stack alignItems="center" textAlign="center" gap={1.5}>
          <Box
            sx={{
              display: 'grid',
              placeItems: 'center',
              width: 52,
              height: 52,
              borderRadius: '50%',
              color: 'text.disabled',
              bgcolor: 'action.hover',
            }}
          >
            <LockOutlined />
          </Box>
          <Typography fontWeight={700} fontSize={17}>
            {churchId
              ? `${igreja ?? 'Esta igreja'} não tem o módulo ${nome}`
              : `O plano da sua igreja não inclui o módulo ${nome}`}
          </Typography>
          <Typography variant="body2" color="text.secondary" maxWidth={460}>
            {isSuperAdmin
              ? 'O plano de cada igreja se escolhe em Igrejas.'
              : 'Veja o que cada plano inclui em Meus planos. Para mudar, fale com quem administra o sistema.'}
          </Typography>
          <Button
            component={Link}
            to={isSuperAdmin ? '/admin/igrejas' : '/admin/meus-planos'}
            variant="contained"
            sx={{ mt: 1, textTransform: 'none' }}
          >
            {isSuperAdmin ? 'Mudar o plano' : 'Ver planos'}
          </Button>
        </Stack>
      </Paper>
    </PageStyle>
  );
}

export { ForaDoPlano };
