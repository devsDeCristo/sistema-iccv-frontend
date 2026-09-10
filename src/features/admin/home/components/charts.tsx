import {
  alpha,
  Box,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';

/**
 * Cor das séries dos gráficos.
 *
 * Uma série por gráfico, então não há paleta categórica a separar — o que
 * precisa passar é a faixa de luminosidade sobre o papel de cada tema e o
 * contraste contra ele. Os dois valores foram verificados no validador de
 * paleta (claro sobre #F8F8F8, escuro sobre #0F172A); o azul do tema claro é o
 * mesmo `AZUL_VIVO` que o resto do sistema usa como destaque, e o escuro é um
 * passo acima porque o cheio afunda no papel quase preto.
 */
const corDaSerie = (escuro: boolean) => (escuro ? '#3B82F6' : '#2563EB');

/**
 * Par de séries do gráfico de entradas: sucesso e falha.
 *
 * Verde e vermelho seria a leitura óbvia, e é justamente o par que não passa:
 * em deuteranopia os dois ficam a ΔE 7,6 um do outro — indistinguíveis. Azul e
 * âmbar ficam em 32,8 no mesmo teste, e ainda mantêm a falha em cor quente,
 * que é o que se procura na tela. Os dois validados nos dois papéis.
 */
const corDoSucesso = (escuro: boolean) => (escuro ? '#3B82F6' : '#2563EB');
const COR_DA_FALHA = '#D97706';

/** Altura da área de plotagem. Fixa: as colunas comparam entre si, não entre gráficos. */
const ALTURA = 132;

export interface PontoNoTempo {
  key: string;
  label: string;
  /** Texto do tooltip — a data por extenso, que o eixo não tem espaço de mostrar */
  titulo: string;
  total: number;
}

interface ColunasNoTempoProps {
  pontos: PontoNoTempo[];
  /** Nome da grandeza, para o tooltip: "inscrições", "ações" */
  unidade: string;
}

/**
 * Série no tempo em colunas.
 *
 * Colunas e não linha porque o eixo é discreto — meses e dias fechados, não
 * uma medida contínua amostrada. A linha ligaria pontos que não têm nada entre
 * eles.
 *
 * Só o pico ganha rótulo. Número em cima de toda coluna vira uma segunda
 * fileira de texto que ninguém lê; o resto está no tooltip.
 */
export function ColunasNoTempo({ pontos, unidade }: ColunasNoTempoProps) {
  const theme = useTheme();
  const escuro = theme.palette.mode === 'dark';
  const cor = corDaSerie(escuro);

  const maximo = Math.max(...pontos.map((ponto) => ponto.total), 1);
  const indiceDoPico = pontos.findIndex((ponto) => ponto.total === maximo);

  return (
    <Box>
      <Box sx={{ position: 'relative', height: ALTURA }}>
        {/* grade recessiva: fio de 1px, sólido, um passo fora do papel */}
        {[0, 0.5, 1].map((fracao) => (
          <Box
            key={fracao}
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: `${fracao * 100}%`,
              height: '1px',
              bgcolor: theme.palette.divider,
            }}
          />
        ))}

        <Stack
          direction="row"
          alignItems="flex-end"
          // 2px de papel separando colunas vizinhas
          gap="2px"
          sx={{ position: 'relative', height: '100%' }}
        >
          {pontos.map((ponto, indice) => {
            const altura = (ponto.total / maximo) * 100;
            const ehPico = indice === indiceDoPico && ponto.total > 0;

            return (
              <Tooltip
                key={ponto.key}
                title={`${ponto.titulo}: ${ponto.total} ${unidade}`}
                arrow
              >
                <Box
                  sx={{
                    flex: 1,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    // alvo de mouse maior que a marca: coluna baixa é difícil
                    // de acertar se só a barra responde
                    cursor: 'default',
                    '&:hover .marca': { bgcolor: cor, opacity: 1 },
                  }}
                >
                  <Box
                    className="marca"
                    sx={{
                      position: 'relative',
                      width: '100%',
                      maxWidth: 24,
                      // coluna zerada vira um fio, para o buraco na série
                      // continuar visível em vez de sumir
                      height:
                        ponto.total === 0 ? '2px' : `${Math.max(altura, 3)}%`,
                      bgcolor: ponto.total === 0 ? theme.palette.divider : cor,
                      opacity: ehPico ? 1 : 0.82,
                      // ponta arredondada, base quadrada na linha de base
                      borderRadius: '4px 4px 0 0',
                      transition: theme.transitions.create(['opacity'], {
                        duration: theme.transitions.duration.shortest,
                      }),
                    }}
                  >
                    {ehPico && (
                      <Typography
                        sx={{
                          position: 'absolute',
                          bottom: '100%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          mb: 0.5,
                          fontSize: 11,
                          fontWeight: 700,
                          lineHeight: 1,
                          whiteSpace: 'nowrap',
                          // o texto usa tinta de texto; a cor da série fica na
                          // marca embaixo dele
                          color: 'text.primary',
                        }}
                      >
                        {ponto.total}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Tooltip>
            );
          })}
        </Stack>
      </Box>

      {/* eixo: rótulo em uma coluna sim, outra não, para não empilhar texto */}
      <Stack direction="row" gap="2px" sx={{ mt: 0.75 }}>
        {pontos.map((ponto, indice) => (
          <Box
            key={ponto.key}
            sx={{ flex: 1, textAlign: 'center', minWidth: 0 }}
          >
            <Typography
              noWrap
              sx={{
                fontSize: 10.5,
                color: 'text.secondary',
                /*
                  Um rótulo sim, outro não — contando da direita para a
                  esquerda. Ancorado à esquerda, uma série de tamanho par
                  escondia justamente o último ponto, que é o de hoje e o
                  único que costuma ter movimento.
                */
                visibility:
                  pontos.length > 8 && (pontos.length - 1 - indice) % 2 === 1
                    ? 'hidden'
                    : 'visible',
              }}
            >
              {ponto.label}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

export interface LinhaDeRanking {
  key: string;
  label: string;
  value: number;
  /** Linha de apoio abaixo do nome */
  detalhe?: string;
  /** Avatar à esquerda, quando a linha é uma pessoa */
  avatar?: React.ReactNode;
}

interface BarrasRankingProps {
  linhas: LinhaDeRanking[];
  /** Sufixo do valor na ponta da barra */
  unidade?: string;
  vazio: string;
}

/**
 * Comparação de magnitude entre poucos itens nomeados.
 *
 * Barras deitadas porque os nomes são longos — nome de igreja e nome de pessoa
 * não cabem sob uma coluna sem girar o texto.
 */
export function BarrasRanking({ linhas, unidade, vazio }: BarrasRankingProps) {
  const theme = useTheme();
  const escuro = theme.palette.mode === 'dark';
  const cor = corDaSerie(escuro);

  if (!linhas.length) {
    return (
      <Typography
        color="text.secondary"
        fontSize={13.5}
        sx={{ py: 3, textAlign: 'center' }}
      >
        {vazio}
      </Typography>
    );
  }

  const maximo = Math.max(...linhas.map((linha) => linha.value), 1);

  return (
    <Stack gap={1.75}>
      {linhas.map((linha) => (
        <Stack key={linha.key} direction="row" alignItems="center" gap={1.5}>
          {linha.avatar}

          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Stack
              direction="row"
              alignItems="baseline"
              justifyContent="space-between"
              gap={1}
            >
              <Typography
                noWrap
                sx={{ fontSize: 13.5, fontWeight: 600, minWidth: 0 }}
              >
                {linha.label}
              </Typography>
              <Typography
                sx={{
                  flexShrink: 0,
                  fontSize: 13,
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {linha.value}
                {unidade ? (
                  <Box
                    component="span"
                    sx={{ ml: 0.5, fontWeight: 400, color: 'text.secondary' }}
                  >
                    {unidade}
                  </Box>
                ) : null}
              </Typography>
            </Stack>

            <Box
              sx={{
                mt: 0.5,
                height: 8,
                borderRadius: '2px',
                bgcolor: alpha(cor, escuro ? 0.2 : 0.14),
              }}
            >
              <Box
                sx={{
                  width: `${Math.max((linha.value / maximo) * 100, 2)}%`,
                  height: '100%',
                  bgcolor: cor,
                  // ponta arredondada, base quadrada na origem
                  borderRadius: '2px 4px 4px 2px',
                }}
              />
            </Box>

            {linha.detalhe && (
              <Typography
                sx={{ mt: 0.4, fontSize: 11.5, color: 'text.secondary' }}
              >
                {linha.detalhe}
              </Typography>
            )}
          </Box>
        </Stack>
      ))}
    </Stack>
  );
}

export interface PontoEmpilhado {
  key: string;
  label: string;
  titulo: string;
  success: number;
  failure: number;
}

interface ColunasEmpilhadasProps {
  pontos: PontoEmpilhado[];
  vazio: string;
}

/** Chave da legenda: o quadrado da cor e o nome da série. */
function ItemDaLegenda({ cor, nome }: { cor: string; nome: string }) {
  return (
    <Stack direction="row" alignItems="center" gap={0.75}>
      <Box
        sx={{
          width: 10,
          height: 10,
          borderRadius: '2px',
          bgcolor: cor,
          flexShrink: 0,
        }}
      />
      {/* o texto usa tinta de texto; quem carrega a identidade é o quadrado */}
      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
        {nome}
      </Typography>
    </Stack>
  );
}

/**
 * Duas séries empilhadas por dia — o total da coluna é o que aconteceu no dia,
 * e a divisão diz como terminou.
 *
 * Empilhado e não lado a lado porque a pergunta é de composição: "quantas
 * tentativas houve e quantas falharam". Barras separadas responderiam duas
 * perguntas independentes e esconderiam o total.
 *
 * Com duas séries a legenda é obrigatória: ninguém deve depender de casar cor
 * de memória.
 */
export function ColunasEmpilhadas({ pontos, vazio }: ColunasEmpilhadasProps) {
  const theme = useTheme();
  const escuro = theme.palette.mode === 'dark';
  const corSucesso = corDoSucesso(escuro);

  const totais = pontos.map((ponto) => ponto.success + ponto.failure);
  const maximo = Math.max(...totais, 1);
  const vazioDeVerdade = totais.every((total) => total === 0);

  if (vazioDeVerdade) {
    return (
      <Typography
        color="text.secondary"
        fontSize={13.5}
        sx={{ py: 5, textAlign: 'center' }}
      >
        {vazio}
      </Typography>
    );
  }

  return (
    <Box>
      <Stack direction="row" gap={2} sx={{ mb: 1.5 }}>
        <ItemDaLegenda cor={corSucesso} nome="Entrou" />
        <ItemDaLegenda cor={COR_DA_FALHA} nome="Falhou" />
      </Stack>

      <Box sx={{ position: 'relative', height: ALTURA }}>
        {[0, 0.5, 1].map((fracao) => (
          <Box
            key={fracao}
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: `${fracao * 100}%`,
              height: '1px',
              bgcolor: theme.palette.divider,
            }}
          />
        ))}

        <Stack
          direction="row"
          alignItems="flex-end"
          gap="2px"
          sx={{ position: 'relative', height: '100%' }}
        >
          {pontos.map((ponto) => {
            const total = ponto.success + ponto.failure;
            const altura = (total / maximo) * 100;

            return (
              <Tooltip
                key={ponto.key}
                arrow
                title={
                  total === 0
                    ? `${ponto.titulo}: nenhuma tentativa`
                    : `${ponto.titulo}: ${ponto.success} entrou · ${ponto.failure} falhou`
                }
              >
                <Box
                  sx={{
                    flex: 1,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    cursor: 'default',
                  }}
                >
                  <Stack
                    // 2px de papel entre os dois pedaços da pilha, a mesma
                    // separação que existe entre colunas vizinhas
                    gap="2px"
                    justifyContent="flex-end"
                    sx={{
                      width: '100%',
                      maxWidth: 24,
                      height: total === 0 ? '2px' : `${Math.max(altura, 3)}%`,
                    }}
                  >
                    {total === 0 && (
                      <Box sx={{ flex: 1, bgcolor: theme.palette.divider }} />
                    )}

                    {ponto.failure > 0 && (
                      <Box
                        sx={{
                          flexGrow: ponto.failure,
                          minHeight: 3,
                          bgcolor: COR_DA_FALHA,
                          // topo da pilha: ponta arredondada
                          borderRadius: '4px 4px 0 0',
                        }}
                      />
                    )}

                    {ponto.success > 0 && (
                      <Box
                        sx={{
                          flexGrow: ponto.success,
                          minHeight: 3,
                          bgcolor: corSucesso,
                          // quadrado na base; só arredonda se for o pedaço de
                          // cima, quando não houve falha nenhuma no dia
                          borderRadius: ponto.failure > 0 ? '0' : '4px 4px 0 0',
                        }}
                      />
                    )}
                  </Stack>
                </Box>
              </Tooltip>
            );
          })}
        </Stack>
      </Box>

      <Stack direction="row" gap="2px" sx={{ mt: 0.75 }}>
        {pontos.map((ponto, indice) => (
          <Box
            key={ponto.key}
            sx={{ flex: 1, textAlign: 'center', minWidth: 0 }}
          >
            <Typography
              noWrap
              sx={{
                fontSize: 10.5,
                color: 'text.secondary',
                /*
                  Um rótulo sim, outro não — contando da direita para a
                  esquerda. Ancorado à esquerda, uma série de tamanho par
                  escondia justamente o último ponto, que é o de hoje e o
                  único que costuma ter movimento.
                */
                visibility:
                  pontos.length > 8 && (pontos.length - 1 - indice) % 2 === 1
                    ? 'hidden'
                    : 'visible',
              }}
            >
              {ponto.label}
            </Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
