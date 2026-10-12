import {
  Alert,
  Box,
  Card,
  Chip,
  Skeleton,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  AutoAwesome,
  CheckCircle,
  Diversity3,
  LockOutlined,
  SupportAgent,
  WorkspacePremium,
} from '@mui/icons-material';

import { PageStyle } from '../../../components/pageStyle';
import { Header } from '../../../components/header';
import { MODULOS, ModuloDaIgreja } from '../../../constants/modulos';
import { ChurchScopeBar } from '../../settings/shared/churchScopeBar';
import { useIgrejaSelecionada } from '../../settings/shared/useIgrejaSelecionada';
import { PlanoVisivel, useGetPlanoDaIgreja } from './api';
import { formatCurrency } from '../../../utils';

/** O preço em destaque: "R$ 249,90" grande e "/mês" pequeno; ou "Grátis" */
function Preco({ price, grande = false }: { price: number; grande?: boolean }) {
  if (!price) {
    return (
      <Typography sx={{ fontSize: grande ? 34 : 24, fontWeight: 800 }}>
        Grátis
      </Typography>
    );
  }
  return (
    <Stack direction="row" alignItems="baseline" spacing={0.5}>
      <Typography
        sx={{
          fontSize: grande ? 34 : 24,
          fontWeight: 800,
          lineHeight: 1.1,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {formatCurrency(price)}
      </Typography>
      <Typography color="text.secondary" fontSize={14}>
        /mês
      </Typography>
    </Stack>
  );
}

/**
 * "Meus planos": o plano da igreja, em destaque, e todos os planos lado a lado
 * para comparar. Para quem trabalha na igreja (admin e tesouraria); trocar de
 * plano é com quem administra o sistema.
 */
function MeusPlanos() {
  const theme = useTheme();
  const escopo = useIgrejaSelecionada(true);
  const { data, isLoading } = useGetPlanoDaIgreja(escopo.churchId);
  const atual = data?.atual ?? null;
  const verde = theme.palette.chips.success;
  const doAtual = new Set<ModuloDaIgreja>(atual?.modules ?? []);

  const destaque = (plano: PlanoVisivel) => (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        p: { xs: 2.5, sm: 3.5 },
        mb: 4,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `0 0 0 1px ${alpha(theme.palette.primary.main, 0.35)}`,
        backgroundImage: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.22
        )}, ${alpha(theme.palette.primary.main, 0.04)} 60%)`,
      }}
    >
      {/* o ícone grande e apagado no canto, de fundo */}
      <WorkspacePremium
        sx={{
          position: 'absolute',
          right: -24,
          top: -24,
          fontSize: 180,
          color: alpha(theme.palette.primary.main, 0.08),
        }}
      />
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        justifyContent="space-between"
        sx={{ position: 'relative' }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Chip
            size="small"
            icon={<AutoAwesome sx={{ fontSize: 14 }} />}
            label="Seu plano"
            color="primary"
            sx={{ fontWeight: 700, mb: 1.5 }}
          />
          <Typography sx={{ fontSize: 30, fontWeight: 800, lineHeight: 1.15 }}>
            {plano.name}
          </Typography>
          {plano.description && (
            <Typography color="text.secondary" sx={{ mt: 0.75, maxWidth: 560 }}>
              {plano.description}
            </Typography>
          )}
        </Box>
        <Box sx={{ flexShrink: 0 }}>
          <Preco price={plano.price} grande />
        </Box>
      </Stack>

      <Stack
        direction="row"
        flexWrap="wrap"
        useFlexGap
        gap={1}
        sx={{ mt: 3, position: 'relative' }}
      >
        {/* Membros não é módulo: toda igreja tem, com ou sem plano */}
        <Chip
          icon={<Diversity3 sx={{ fontSize: 16 }} />}
          label="Membros"
          sx={{
            bgcolor: alpha(verde, 0.14),
            '& .MuiChip-icon': { color: verde },
          }}
        />
        {MODULOS.map((modulo) =>
          doAtual.has(modulo.value) ? (
            <Chip
              key={modulo.value}
              icon={<CheckCircle sx={{ fontSize: 16 }} />}
              label={modulo.label}
              sx={{
                bgcolor: alpha(verde, 0.14),
                '& .MuiChip-icon': { color: verde },
              }}
            />
          ) : (
            <Chip
              key={modulo.value}
              icon={<LockOutlined sx={{ fontSize: 15 }} />}
              label={modulo.label}
              variant="outlined"
              sx={{ color: 'text.disabled', borderStyle: 'dashed' }}
            />
          )
        )}
      </Stack>
    </Card>
  );

  const cartao = (plano: PlanoVisivel) => {
    const eOAtual = plano.id === atual?.id;
    // o que este plano tem e o seu não: é o que faz alguém querer trocar
    const aMais = plano.modules.filter((m) => !doAtual.has(m)).length;
    return (
      <Card
        key={plano.id}
        elevation={0}
        sx={{
          borderRadius: 3,
          p: 2.5,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: eOAtual
            ? `0 0 0 2px ${theme.palette.primary.main}`
            : `0 0 0 1px ${theme.palette.divider}`,
          bgcolor: eOAtual
            ? alpha(theme.palette.primary.main, 0.05)
            : 'background.paper',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography fontWeight={800} fontSize={18} sx={{ flex: 1 }} noWrap>
            {plano.name}
          </Typography>
          {eOAtual ? (
            <Chip size="small" color="primary" label="Atual" />
          ) : (
            aMais > 0 && (
              <Chip
                size="small"
                label={`+${aMais} ${aMais === 1 ? 'módulo' : 'módulos'}`}
                sx={{
                  bgcolor: alpha(verde, 0.16),
                  color: verde,
                  fontWeight: 700,
                }}
              />
            )
          )}
        </Stack>
        <Box sx={{ mt: 1 }}>
          <Preco price={plano.price} />
        </Box>
        {plano.description && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {plano.description}
          </Typography>
        )}

        <Stack spacing={0.75} sx={{ mt: 2 }}>
          {MODULOS.map((modulo) => {
            const tem = plano.modules.includes(modulo.value);
            // sem plano, tudo seria "a mais": o selo do cartão basta
            const novo =
              !!atual && tem && !eOAtual && !doAtual.has(modulo.value);
            return (
              <Stack
                key={modulo.value}
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ color: tem ? 'text.primary' : 'text.disabled' }}
              >
                {tem ? (
                  <CheckCircle sx={{ fontSize: 18, color: verde }} />
                ) : (
                  <LockOutlined sx={{ fontSize: 17 }} />
                )}
                <Typography fontSize={14} fontWeight={novo ? 700 : 400}>
                  {modulo.label}
                </Typography>
                {novo && (
                  <Typography variant="caption" sx={{ color: verde }}>
                    a mais que o seu
                  </Typography>
                )}
              </Stack>
            );
          })}
        </Stack>
      </Card>
    );
  };

  return (
    <PageStyle>
      <Header
        title="Meus planos"
        description="O que a sua igreja usa no sistema"
        acaoAoLado
      >
        <ChurchScopeBar escopo={escopo} oQueMuda="o plano" />
      </Header>

      {escopo.precisaEscolher ? (
        <Alert severity="info">
          Escolha no topo da página de qual igreja quer ver o plano.
        </Alert>
      ) : isLoading || escopo.carregando ? (
        <Stack spacing={3}>
          <Skeleton variant="rounded" height={220} sx={{ borderRadius: 4 }} />
          <Skeleton variant="rounded" height={280} sx={{ borderRadius: 3 }} />
        </Stack>
      ) : (
        <>
          {atual ? (
            destaque(atual)
          ) : (
            <Alert severity="warning" sx={{ mb: 4, borderRadius: 3 }}>
              <b>Sua igreja ainda não tem plano.</b> Por enquanto ela usa só o
              básico: Início e Membros. Os planos abaixo mostram o que cada um
              libera.
            </Alert>
          )}

          {!!data?.planos.length && (
            <>
              <Typography fontWeight={800} fontSize={18}>
                Compare os planos
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Do mais em conta ao mais completo.
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    lg: 'repeat(3, 1fr)',
                    xl: 'repeat(4, 1fr)',
                  },
                }}
              >
                {data.planos.map(cartao)}
              </Box>
            </>
          )}

          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{
              mt: 4,
              p: 2,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.text.primary, 0.04),
            }}
          >
            <SupportAgent sx={{ color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              Para mudar de plano, fale com quem administra o sistema.
            </Typography>
          </Stack>
        </>
      )}
    </PageStyle>
  );
}

export { MeusPlanos };
