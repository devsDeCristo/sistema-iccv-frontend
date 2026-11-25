import { useRef, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';

import { ResponsiveModal } from '../../../components/responsiveModal';
import {
  EscolhaDePagamento,
  FormaDePagamento,
  OpcoesDaForma,
} from './escolhaDaForma';

/**
 * A pergunta num modal próprio, para as telas que não têm um aberto na hora
 * (a inscrição e a loja). Devolve:
 *
 * - `perguntar`: o que vai no `escolher` do `usePostCreateCheckoutEvent`; a
 *   promessa resolve com a forma, ou `null` se a pessoa voltar ou fechar;
 * - `perguntando`: para esconder a tela de espera enquanto a pergunta está
 *   aberta — só um modal ativo por vez, e ali é a pessoa quem age;
 * - `modal`: o elemento a renderizar na tela.
 */
export function useEscolhaDaForma(subtitulo?: string) {
  const [escolha, setEscolha] = useState<EscolhaDePagamento | null>(null);
  const [total, setTotal] = useState<number | undefined>();
  const resolver = useRef<((forma: FormaDePagamento | null) => void) | null>(
    null
  );

  const responder = (forma: FormaDePagamento | null) => {
    resolver.current?.(forma);
    resolver.current = null;
    setEscolha(null);
  };

  const perguntar = (pergunta: EscolhaDePagamento, valor?: number) =>
    new Promise<FormaDePagamento | null>((resolve) => {
      resolver.current = resolve;
      setTotal(valor);
      setEscolha(pergunta);
    });

  const modal = (
    <ResponsiveModal
      open={!!escolha}
      onClose={() => responder(null)}
      maxWidth="sm"
      title={
        <Box>
          <Typography fontWeight={700} fontSize={18}>
            Como você quer pagar?
          </Typography>
          {subtitulo && (
            <Typography variant="body2" color="text.secondary">
              {subtitulo}
            </Typography>
          )}
        </Box>
      }
      actions={
        <Button onClick={() => responder(null)} color="inherit">
          Voltar
        </Button>
      }
    >
      {escolha && (
        <OpcoesDaForma
          escolha={escolha}
          total={total}
          onEscolher={(forma) => responder(forma)}
        />
      )}
    </ResponsiveModal>
  );

  return { perguntar, perguntando: !!escolha, modal };
}
