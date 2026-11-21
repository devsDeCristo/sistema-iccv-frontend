import { ReactNode } from 'react';
import { alpha, Box, Stack, Typography, useTheme } from '@mui/material';
import { CheckCircle, Work } from '@mui/icons-material';
import { corDoModulo } from '../../../constants/identidadeDosModulos';
import { sombraDeCartao } from '../../../components/listPageStyles';
import { formatarData, formatarSalario, prazo } from '../formulario';
import { Oportunidade } from '../types';

/** Uma informação curta com ícone */
export function Info({
  icone,
  children,
}: {
  icone: ReactNode;
  children: ReactNode;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={0.75}
      sx={{ minWidth: 0, '& svg': { fontSize: 16, color: 'text.secondary' } }}
    >
      {icone}
      <Typography noWrap sx={{ fontSize: 13, fontWeight: 600, minWidth: 0 }}>
        {children}
      </Typography>
    </Stack>
  );
}

/** A logo num quadrado: `contain` sobre branco, nunca cortada nem esticada */
export function LogoDaVaga({
  vaga,
  tamanho,
}: {
  vaga: Pick<Oportunidade, 'imagemUrl' | 'company'>;
  tamanho: number;
}) {
  const theme = useTheme();
  const cor = corDoModulo(theme, 'oportunidades');
  return (
    <Box
      sx={{
        width: tamanho,
        height: tamanho,
        flexShrink: 0,
        borderRadius: 2,
        overflow: 'hidden',
        display: 'grid',
        placeItems: 'center',
        backgroundColor: vaga.imagemUrl ? '#fff' : alpha(cor, 0.16),
        boxShadow: vaga.imagemUrl ? '0 4px 14px rgba(0,0,0,0.18)' : 'none',
      }}
    >
      {vaga.imagemUrl ? (
        <Box
          component="img"
          src={vaga.imagemUrl}
          alt={`Logo de ${vaga.company}`}
          sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      ) : (
        <Work sx={{ fontSize: tamanho * 0.5, color: alpha(cor, 0.7) }} />
      )}
    </Box>
  );
}

/** A faixa tingida do módulo com a logo quadrada no meio */
export function ImagemDaVaga({
  vaga,
  altura,
}: {
  vaga: Pick<Oportunidade, 'imagemUrl' | 'company'>;
  altura: number;
}) {
  const theme = useTheme();
  const cor = corDoModulo(theme, 'oportunidades');
  return (
    <Box
      sx={{
        height: altura,
        display: 'grid',
        placeItems: 'center',
        backgroundColor: alpha(cor, theme.palette.mode === 'dark' ? 0.16 : 0.1),
      }}
    >
      <LogoDaVaga vaga={vaga} tamanho={Math.round(altura * 0.72)} />
    </Box>
  );
}

/** Corta o texto em `linhas` linhas, com reticências */
const cortar = (linhas: number) => ({
  display: '-webkit-box',
  WebkitLineClamp: linhas,
  WebkitBoxOrient: 'vertical' as const,
  overflow: 'hidden',
  overflowWrap: 'anywhere' as const,
});

/** Os valores anotados no contrato, como à máquina */
const MAQUINA = 'ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace';

/** Um campo do contrato: o rótulo em versalete e o valor sobre a linha pontilhada */
function Campo({
  rotulo,
  suave,
  linha,
  children,
}: {
  rotulo: string;
  suave: string;
  linha: string;
  children: ReactNode;
}) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography
        sx={{
          fontSize: 9,
          fontWeight: 800,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: suave,
        }}
      >
        {rotulo}
      </Typography>
      <Typography
        sx={{
          fontFamily: MAQUINA,
          fontSize: 13.5,
          fontWeight: 600,
          pb: 0.375,
          borderBottom: `1px dotted ${linha}`,
          ...cortar(1),
        }}
      >
        {children}
      </Typography>
    </Box>
  );
}

/** A situação no pé da página: uma pílula na cor dela, com ✓ quando pede */
export function EtiquetaDaVaga({
  rotulo,
  cor,
  check,
}: {
  rotulo: string;
  cor: string;
  check?: boolean;
}) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      gap={0.5}
      sx={{
        flexShrink: 0,
        alignSelf: 'flex-start',
        px: 1.25,
        py: 0.5,
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 800,
        color: cor,
        backgroundColor: alpha(cor, 0.14),
        '& svg': { fontSize: 13 },
      }}
    >
      {check && <CheckCircle />}
      {rotulo}
    </Stack>
  );
}

/**
 * Uma vaga na vitrine do membro, como a página de "contrato de trabalho" da
 * carteira: o fundo de segurança, no
 * lugar da foto 3x4 um crachá pequeno com a logo (a miniatura do crachá dos
 * detalhes, com a fita na cor dela) e, anotados, quem contrata, o cargo,
 * o local e a remuneração, com a assinatura do empregador em branco. No pé, a
 * situação: o prazo quando está acabando, a candidatura enviada ou a vaga
 * encerrada (a página toda apaga). O card inteiro abre o crachá dos detalhes.
 *
 * Em "Minhas propostas" o pé é outro (`rodape`: a situação da proposta e as
 * opções dela) e o card não abre nada sozinho (sem `onAbrir`): quem age são
 * os botões do pé.
 *
 * O papel acompanha o tema, como a folha de Solicitações.
 */
export function CardDaVaga({
  vaga,
  interessei = false,
  onAbrir,
  rodape,
}: {
  vaga: Oportunidade;
  interessei?: boolean;
  /** sem ele, o card não é clicável */
  onAbrir?: () => void;
  /** no lugar da assinatura e da situação */
  rodape?: ReactNode;
}) {
  const theme = useTheme();
  const escuro = theme.palette.mode === 'dark';
  const cor = corDoModulo(theme, 'oportunidades');
  // a fita do crachá: a cor da logo, como no crachá dos detalhes
  const fita = vaga.cor ?? cor;
  // o fundo do ingresso de Eventos (o Paper do tema)
  const papel = theme.palette.background.paper;
  const texto = escuro ? '#EEF0F3' : '#16181D';
  const suave = alpha(texto, 0.55);
  const linha = alpha(texto, 0.35);
  const salario = formatarSalario(vaga.salario);
  const ate = vaga.encerrada ? null : prazo(vaga.closesAt);
  const perto = !!ate && /hoje|amanhã|Faltam/.test(ate);

  // a situação no pé: encerrada, candidatura enviada ou o prazo acabando;
  // fora isso, só a data final, discreta
  const situacao = vaga.encerrada
    ? { rotulo: 'Encerrada', cor: theme.palette.error.main }
    : interessei
      ? { rotulo: 'Candidatura enviada', cor, check: true }
      : perto
        ? { rotulo: ate, cor: theme.palette.warning.main }
        : null;

  return (
    <Box
      component="article"
      {...(onAbrir && {
        role: 'button',
        tabIndex: 0,
        'aria-label': `Ver a vaga ${vaga.title}, ${vaga.company}`,
        onClick: onAbrir,
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onAbrir();
          }
        },
      })}
      sx={{
        height: '100%',
        minHeight: 220,
        display: 'flex',
        borderRadius: '10px',
        filter: sombraDeCartao(theme),
        color: texto,
        transition: 'transform .2s, filter .2s',
        ...(vaga.encerrada && { opacity: 0.7 }),
        ...(onAbrir && {
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-2px)',
            filter: `${sombraDeCartao(theme)} drop-shadow(0 0 1px ${alpha(cor, 0.8)})`,
          },
        }),
        '&:focus-visible': {
          outline: `2px solid ${theme.palette.primary.main}`,
          outlineOffset: 2,
        },
        '@media (prefers-reduced-motion: reduce)': {
          transition: 'none',
          '&:hover': { transform: 'none' },
        },
      }}
    >
      <Stack
        gap={1.5}
        sx={{
          flex: 1,
          minWidth: 0,
          position: 'relative',
          borderRadius: '10px',
          px: 2.25,
          pt: 2,
          pb: 2.25,
          backgroundColor: papel,
          // o fundo de segurança: arcos finos saindo do canto de cima
          backgroundImage: `repeating-radial-gradient(circle at 100% 0, transparent 0 9px, ${alpha(cor, escuro ? 0.05 : 0.08)} 9px 10px)`,
        }}
      >
        {/*
          no lugar da foto 3x4, um crachá pequeno preso no canto: a miniatura
          do crachá que abre nos detalhes, com a fita na cor da logo
        */}
        <Stack
          aria-hidden
          alignItems="center"
          sx={{
            position: 'absolute',
            top: 0,
            right: 6,
            width: 74,
            transform: 'rotate(4deg)',
            transformOrigin: 'top center',
          }}
        >
          {/* a fita e o mosquetão */}
          <Box
            sx={{
              width: 14,
              height: 14,
              backgroundColor: fita,
              backgroundImage: `repeating-linear-gradient(0deg, transparent 0 4px, ${alpha('#000', 0.12)} 4px 5px)`,
              boxShadow: `inset 2px 0 0 ${alpha('#fff', 0.18)}, inset -2px 0 0 ${alpha('#000', 0.14)}`,
            }}
          />
          <Box
            sx={{
              width: 8,
              height: 14,
              mt: '-3px',
              borderRadius: 4,
              position: 'relative',
              zIndex: 1,
              background:
                'linear-gradient(90deg, #8E949E, #E3E6EA 45%, #A2A8B1)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
            }}
          />
          {/* a face do crachá: o rasgo, a logo e a faixa na cor dela */}
          <Stack
            alignItems="center"
            sx={{
              width: 74,
              height: 92,
              mt: '-6px',
              pt: 1,
              borderRadius: '8px',
              overflow: 'hidden',
              // um tom abaixo do card, como card dentro de card
              backgroundColor: theme.palette.background.default,
              border: escuro ? `1px solid ${alpha('#fff', 0.1)}` : 'none',
              boxShadow: '0 4px 10px rgba(0,0,0,0.35)',
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 5,
                borderRadius: 3,
                backgroundColor: escuro ? '#0B0C10' : alpha('#16181D', 0.22),
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.45)',
              }}
            />
            <Box
              sx={{
                width: 46,
                height: 46,
                mt: 0.75,
                p: vaga.imagemUrl ? 0.5 : 0,
                borderRadius: 1.5,
                display: 'grid',
                placeItems: 'center',
                // a logo sobre branco, como a `LogoDaVaga`: no escuro, logo
                // escura ou transparente sumiria no papel
                backgroundColor: vaga.imagemUrl ? '#fff' : alpha(fita, 0.16),
              }}
            >
              {vaga.imagemUrl ? (
                <Box
                  component="img"
                  src={vaga.imagemUrl}
                  alt=""
                  sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              ) : (
                <Work sx={{ fontSize: 26, color: fita }} />
              )}
            </Box>
            <Box sx={{ mt: 'auto', width: '100%', height: 5, bgcolor: fita }} />
          </Stack>
        </Stack>

        <Typography
          sx={{
            pr: 12,
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
          }}
        >
          Contrato de trabalho
        </Typography>
        <Box sx={{ pr: 12 }}>
          <Campo rotulo="Empregador" suave={suave} linha={linha}>
            {vaga.company}
          </Campo>
        </Box>
        <Box sx={{ pr: 12 }}>
          <Campo rotulo="Cargo" suave={suave} linha={linha}>
            {vaga.title}
          </Campo>
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            columnGap: 1.5,
          }}
        >
          <Campo rotulo="Local" suave={suave} linha={linha}>
            {vaga.location || '—'}
          </Campo>
          <Campo rotulo="Remuneração" suave={suave} linha={linha}>
            {salario || 'A combinar'}
          </Campo>
        </Box>

        {rodape ? (
          <Box sx={{ mt: 'auto' }}>{rodape}</Box>
        ) : (
          <Stack
            direction="row"
            alignItems="flex-end"
            justifyContent="space-between"
            gap={1.5}
            sx={{ mt: 'auto' }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ height: 20, borderBottom: `1px solid ${linha}` }} />
              <Typography sx={{ mt: 0.5, fontSize: 9.5, color: suave }}>
                Assinatura do empregador
              </Typography>
            </Box>
            {situacao ? (
              <EtiquetaDaVaga {...situacao} />
            ) : (
              vaga.closesAt && (
                <Typography sx={{ flexShrink: 0, fontSize: 11, color: suave }}>
                  até {formatarData(vaga.closesAt).slice(0, 5)}
                </Typography>
              )
            )}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
