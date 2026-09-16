import { useCallback, useRef, useState } from 'react';

/** O que o ViaCEP devolve e nos interessa, já com os nomes que o formulário usa. */
export interface EnderecoDoCep {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

export type ResultadoBuscaCep =
  | { status: 'ok'; endereco: EnderecoDoCep }
  | { status: 'nao-encontrado' }
  | { status: 'falhou' }
  /** CEP incompleto ou consulta superada por outra mais nova: ninguém age. */
  | { status: 'ignorado' };

/**
 * Consulta de endereço por CEP no ViaCEP — serviço público, sem chave e sem
 * cadastro, que é o que já sustenta o formulário de eventos.
 *
 * Duas coisas que o uso direto do `fetch` não dá e que importam aqui:
 *
 * - **Corrida.** Quem digita o CEP dispara uma consulta a cada tecla depois do
 *   oitavo dígito (corrigir o último número, por exemplo). Sem ordenação, a
 *   resposta lenta do CEP antigo chega depois da rápida do novo e escreve o
 *   endereço errado por cima. O contador descarta tudo o que não é da última
 *   chamada.
 * - **Falha separada de "não existe".** São reações diferentes: CEP inexistente
 *   é erro de quem digitou; ViaCEP fora do ar não é, e nesse caso o cadastro
 *   precisa seguir com o endereço preenchido à mão.
 */
export function useBuscaCep() {
  const [buscando, setBuscando] = useState(false);
  /** Ordem da última consulta disparada; respostas mais velhas são descartadas. */
  const ultimaBusca = useRef(0);

  const buscar = useCallback(
    async (cep: string): Promise<ResultadoBuscaCep> => {
      const digitos = cep.replace(/\D/g, '');

      if (digitos.length !== 8) return { status: 'ignorado' };

      const daVez = ++ultimaBusca.current;
      setBuscando(true);

      try {
        const resposta = await fetch(
          `https://viacep.com.br/ws/${digitos}/json/`
        );

        if (daVez !== ultimaBusca.current) return { status: 'ignorado' };

        if (!resposta.ok) return { status: 'falhou' };

        const dados = await resposta.json();

        // o ViaCEP responde 200 com `{ "erro": true }` para CEP inexistente, e
        // em parte das respostas o valor vem como a string "true"
        if (dados?.erro) return { status: 'nao-encontrado' };

        return {
          status: 'ok',
          endereco: {
            // logradouro vem vazio nos municípios de CEP único: lá a rua é
            // digitada à mão, e é por isso que cada campo é tratado separado
            street: dados.logradouro || '',
            neighborhood: dados.bairro || '',
            city: dados.localidade || '',
            state: dados.uf || '',
          },
        };
      } catch {
        return { status: 'falhou' };
      } finally {
        if (daVez === ultimaBusca.current) setBuscando(false);
      }
    },
    []
  );

  return { buscar, buscando };
}
