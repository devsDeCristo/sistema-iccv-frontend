import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Backdrop,
  Box,
  CircularProgress,
  Button,
  ButtonBase,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import { Add, Check } from '@mui/icons-material';
import Swal from 'sweetalert2';

import {
  methodPaymentOptions,
  PAYMENT_STATUS_COLOR,
  statusPaymentOptions,
} from '../../admin/events/constants';
import {
  ehPagamentoForaDoSite,
  usePostCreateCheckoutEvent,
} from '../../admin/events/api/postCreateCheckoutEvent';
import { ResponsiveModal } from '../../../components/responsiveModal';
import {
  EscolhaDePagamento,
  FormaDePagamento,
  OpcoesDaForma,
} from '../../events/components/escolhaDaForma';
import { useEstiloDeIngresso } from '../../events/components/ingresso';
import { TaxaDeServico, avisoDaTaxa } from '../../events/taxaDeServico';
import CustomChip from '../../../components/customChip';
import { PaymentProductItem } from '../../admin/events/types';
import { descreverItem } from '../../admin/events/products';
import { formatCurrency } from '../../../utils';

interface ItemDePagamento {
  /** identifica o item na seleção: inscrição e compra avulsa não colidem */
  key: string;
  /** ingresso: vai para o checkout pela regra */
  roleId?: string;
  /** compra avulsa de produto: vai para o checkout pelo id do pagamento */
  paymentId?: string;
  method: string;
  tipo: 'WAITLIST' | 'REGISTERED';
  status: string;
  name: string;
  groupName: string;
  /** produtos comprados junto deste ingresso: são pagos com ele */
  products?: PaymentProductItem[];
  /** o cobrado de fato; sem pagamento ainda, o preço do ingresso */
  amount?: number | null;
  /** o preço do ingresso sozinho (inscrição); a linha dele no detalhe */
  price?: number | null;
}

interface ModalPaymentProps {
  open: boolean;
  handleClose: () => void;
  payments: ItemDePagamento[] | null;
  userId: string;
  eventId: string;
  eventName?: string;
  /** a cor do evento, a mesma do ingresso no cartão */
  cor?: string;
  /** a taxa de serviço que a igreja repassa; nula sem repasse */
  taxaDeServico?: TaxaDeServico | null;
}

/**
 * O que ainda não dá para levar ao checkout: pago, em análise, lista de
 * espera (a vaga não saiu) e cobrança já aberta numa forma escolhida.
 */
const resolvido = (item: ItemDePagamento) =>
  item.status === 'PAID' ||
  item.status === 'IN_ANALYSIS' ||
  item.tipo === 'WAITLIST' ||
  (item.status === 'WAITING' && item.method !== 'OTHER');

/**
 * Escolher o que pagar do evento, no desenho do módulo: cada pagamento é um
 * ingresso (corpo, picote e canhoto, como no cartão de Minhas Inscrições), com
 * a cor do evento, o valor no canhoto e o total no botão.
 *
 * Seleção múltipla (inscrição e compras avulsas saem num checkout só), e o
 * que está em aberto já vem marcado — o caso comum é pagar tudo. O que não
 * dá para pagar aparece, apagado, para a pessoa entender por que ficou de
 * fora.
 */
export function ModalPayment({
  open,
  handleClose,
  payments,
  userId,
  eventId,
  eventName,
  cor,
  taxaDeServico,
}: ModalPaymentProps) {
  const theme = useTheme();
  const destaque = cor ?? theme.palette.primary.main;

  const itens = useMemo(() => payments ?? [], [payments]);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [gerando, setGerando] = useState(false);

  /**
   * A pergunta "Como você quer pagar?" como etapa deste modal, e não num
   * alerta por cima dele: só um modal ativo por vez. O checkout espera a
   * resposta numa promessa, que a etapa resolve.
   */
  const [escolha, setEscolha] = useState<EscolhaDePagamento | null>(null);
  const responderEscolha = useRef<
    ((forma: FormaDePagamento | null) => void) | null
  >(null);

  const perguntarForma = (pergunta: EscolhaDePagamento) =>
    new Promise<FormaDePagamento | null>((resolver) => {
      responderEscolha.current = resolver;
      setEscolha(pergunta);
    });

  const responder = (forma: FormaDePagamento | null) => {
    responderEscolha.current?.(forma);
    responderEscolha.current = null;
    setEscolha(null);
  };

  // fechar no meio da pergunta é desistir dela
  const fechar = () => {
    if (escolha) responder(null);
    handleClose();
  };

  // a cada abertura, o que está em aberto já vem marcado
  useEffect(() => {
    if (open) {
      setSelecionados(itens.filter((i) => !resolvido(i)).map((i) => i.key));
    }
  }, [open, itens]);

  const { mutate: criarCheckout } = usePostCreateCheckoutEvent({
    onSuccess: (data: any) => {
      // quitado pelo desconto não tem link
      if (data.link) window.open(data.link, '_blank', 'noopener,noreferrer');
      setGerando(false);
      if (data.paid) handleClose();
    },
    onError: (erro) => {
      setGerando(false);

      /**
       * Igreja que não recebe pelo site: aviso, não erro. Vai em modal com a
       * saída escrita — o valor continua devido e se acerta com a organização.
       */
      if (ehPagamentoForaDoSite(erro)) {
        Swal.fire({
          title: 'Pagamento fora do site',
          text: 'Esta igreja não recebe pagamento pelo site. O valor é combinado diretamente com a organização do evento.',
          icon: 'info',
          confirmButtonText: 'Entendi',
        });
      }
    },
  });

  const escolhidos = itens.filter((i) => selecionados.includes(i.key));
  const total = escolhidos.reduce(
    (soma, i) => soma + (Number(i.amount) || 0),
    0
  );

  const pagar = () => {
    setGerando(true);
    criarCheckout({
      data: {
        roleId: escolhidos.flatMap((item) => item.roleId ?? []),
        paymentIds: escolhidos.flatMap((item) => item.paymentId ?? []),
      },
      eventId,
      userId,
      escolher: perguntarForma,
    });
  };

  // o ingresso dos modais de pagamento, o mesmo das opções da forma
  const { raio, papel, styles } = useEstiloDeIngresso(destaque);

  const alternar = (item: ItemDePagamento) =>
    setSelecionados((atual) =>
      atual.includes(item.key)
        ? atual.filter((k) => k !== item.key)
        : [...atual, item.key]
    );

  const rotuloDoStatus = (status: string) =>
    statusPaymentOptions.find((o) => o.value === status)?.label || status;

  return (
    <>
      {/*
      Gerando o pagamento, a página inteira espera: são segundos falando com o
      gateway, e um clique em outro lugar no meio disso só confundia. Não é
      outro modal (não tem ação nenhuma), e some na etapa da escolha, quando é
      a pessoa quem precisa agir.
    */}
      <Backdrop
        open={gerando && !escolha}
        sx={{
          zIndex: theme.zIndex.modal + 1,
          flexDirection: 'column',
          gap: 2,
          color: theme.palette.common.white,
          backdropFilter: 'blur(3px)',
        }}
      >
        <CircularProgress color="inherit" />
        <Box textAlign="center">
          <Typography fontWeight={700} fontSize={18}>
            Gerando pagamento…
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.85 }}>
            {total > 0 ? `${formatCurrency(total)} · ` : ''}o link abre em uma
            nova aba
          </Typography>
        </Box>
      </Backdrop>

      <ResponsiveModal
        open={open}
        onClose={fechar}
        // gerando, trava; na pergunta, fechar é desistir dela
        disableClose={gerando && !escolha}
        maxWidth="sm"
        title={
          <Box>
            <Typography fontWeight={700} fontSize={18}>
              {escolha ? 'Como você quer pagar?' : 'O que você quer pagar?'}
            </Typography>
            {eventName && (
              <Typography variant="body2" color="text.secondary">
                {eventName}
              </Typography>
            )}
          </Box>
        }
        actions={
          escolha ? (
            <Button onClick={() => responder(null)} color="inherit">
              Voltar
            </Button>
          ) : (
            <>
              <Button onClick={handleClose} disabled={gerando} color="inherit">
                Cancelar
              </Button>
              <Button
                variant="contained"
                disabled={!escolhidos.length || gerando}
                onClick={pagar}
              >
                {gerando
                  ? 'Gerando pagamento…'
                  : total > 0
                    ? `Pagar ${formatCurrency(total)}`
                    : 'Pagar'}
              </Button>
            </>
          )
        }
      >
        {escolha ? (
          // a mesma pergunta da inscrição e da loja (`OpcoesDaForma`)
          <OpcoesDaForma
            escolha={escolha}
            total={total}
            onEscolher={(forma) => responder(forma)}
          />
        ) : (
          <Stack spacing={1.25}>
            {itens.map((item) => {
              const bloqueado = resolvido(item);
              const marcado = selecionados.includes(item.key);

              // o ingresso entra na lista como mais um item comprado, do mesmo
              // jeito do painel do evento: assim a inscrição com camisa e a
              // compra avulsa de camisa se leem igual
              const ingresso = [item.groupName, item.name]
                .filter(Boolean)
                .join(' — ');
              const linhas: { texto: string; valor?: number }[] = [
                ...(item.paymentId
                  ? []
                  : [
                      {
                        texto: `Ingresso${ingresso ? ` ${ingresso}` : ''}`,
                        valor: item.price ?? undefined,
                      },
                    ]),
                ...(item.products ?? []).map((produto) => ({
                  texto: descreverItem(produto),
                  valor: produto.unitPrice * produto.quantity,
                })),
              ];
              // o que as linhas somam e o cobrado não batem: é o desconto
              const somaDasLinhas = linhas.reduce(
                (soma, linha) => soma + (linha.valor ?? 0),
                0
              );
              const desconto =
                item.amount != null && linhas.every((l) => l.valor != null)
                  ? Math.round((somaDasLinhas - Number(item.amount)) * 100) /
                    100
                  : 0;
              const forma = methodPaymentOptions.find(
                (o) => o.value === item.method
              )?.label;

              return (
                <ButtonBase
                  key={item.key}
                  role="checkbox"
                  aria-checked={marcado}
                  // a onda do clique é retangular e passaria por cima dos furos
                  disableRipple
                  disabled={bloqueado}
                  onClick={() => alternar(item)}
                  sx={{
                    ...styles.ingresso,
                    '&.Mui-disabled': { opacity: 0.55 },
                    '&.Mui-focusVisible': {
                      outline: `2px solid ${destaque}`,
                      outlineOffset: 3,
                      borderRadius: `${raio}px`,
                    },
                  }}
                >
                  {/* o corpo do ingresso: o que é e em que pé está */}
                  <Box sx={{ ...styles.principal, ...papel }}>
                    <Typography fontWeight={700}>
                      {item.paymentId ? item.name : 'Inscrição'}
                    </Typography>

                    <Stack spacing={0.25} mt={0.5}>
                      {linhas.map((linha) => (
                        <Stack
                          key={linha.texto}
                          direction="row"
                          justifyContent="space-between"
                          spacing={1}
                        >
                          <Typography variant="body2" color="text.secondary">
                            {linha.texto}
                          </Typography>
                          {linha.valor != null && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ whiteSpace: 'nowrap' }}
                            >
                              {formatCurrency(linha.valor)}
                            </Typography>
                          )}
                        </Stack>
                      ))}
                      {desconto > 0 && (
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          spacing={1}
                        >
                          <Typography variant="body2" color="success.main">
                            Desconto
                          </Typography>
                          <Typography
                            variant="body2"
                            color="success.main"
                            sx={{ whiteSpace: 'nowrap' }}
                          >
                            − {formatCurrency(desconto)}
                          </Typography>
                        </Stack>
                      )}
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={0.75}
                      mt={1}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      {item.tipo === 'WAITLIST' ? (
                        <CustomChip
                          size="small"
                          label="Lista de espera"
                          customColor={theme.palette.chips.alert}
                        />
                      ) : (
                        <CustomChip
                          size="small"
                          label={rotuloDoStatus(item.status)}
                          customColor={PAYMENT_STATUS_COLOR(
                            item.status as any,
                            theme
                          )}
                        />
                      )}
                      {item.paymentId && (
                        <CustomChip
                          size="small"
                          label="Compra avulsa"
                          customColor={theme.palette.info.main}
                        />
                      )}
                      {forma &&
                        item.method !== 'OTHER' &&
                        item.tipo !== 'WAITLIST' && (
                          <CustomChip
                            size="small"
                            label={forma}
                            customColor={theme.palette.info.main}
                          />
                        )}
                    </Stack>
                  </Box>

                  {/* o canhoto, depois do picote: a marcação e o valor */}
                  <Box sx={{ ...styles.canhoto, ...papel }}>
                    <Box
                      sx={{
                        ...styles.selo,
                        ...(marcado && {
                          color: theme.palette.getContrastText(destaque),
                          backgroundColor: destaque,
                        }),
                      }}
                    >
                      {marcado ? (
                        <Check sx={{ fontSize: 20 }} />
                      ) : (
                        <Add sx={{ fontSize: 20 }} />
                      )}
                    </Box>
                    {item.amount != null && (
                      <Typography
                        fontWeight={700}
                        fontSize={15}
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        {formatCurrency(Number(item.amount))}
                      </Typography>
                    )}
                  </Box>
                </ButtonBase>
              );
            })}

            {/* o total do que está marcado, além do botão */}
            {escolhidos.length > 0 && (
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="baseline"
                sx={{ pt: 1, px: 0.5 }}
              >
                <Typography color="text.secondary">
                  {escolhidos.length === 1
                    ? '1 pagamento marcado'
                    : `${escolhidos.length} pagamentos marcados`}
                </Typography>
                <Box textAlign="right">
                  <Typography fontWeight={700} fontSize={18}>
                    Total {formatCurrency(total)}
                  </Typography>
                  {/* a taxa entra conforme a forma, escolhida em seguida */}
                  {avisoDaTaxa(taxaDeServico) && (
                    <Typography variant="caption" color="text.secondary">
                      {avisoDaTaxa(taxaDeServico)}
                    </Typography>
                  )}
                </Box>
              </Stack>
            )}
          </Stack>
        )}
      </ResponsiveModal>
    </>
  );
}
