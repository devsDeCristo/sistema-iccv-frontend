import { useEffect, useRef, useState } from 'react';
import { Box, FormHelperText, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface CodeInputProps {
  /** Só os dígitos já preenchidos; buracos no meio são preservados na exibição. */
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: boolean;
  errorMessage?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

const paraCaixas = (valor: string, tamanho: number) =>
  Array.from({ length: tamanho }, (_, i) => valor[i] ?? '');

/**
 * Campo de código em caixas separadas, uma por dígito.
 *
 * As caixas são a fonte da verdade enquanto o usuário digita — é o que permite
 * apagar um dígito do meio sem os outros escorregarem de posição. Para fora vai
 * só a string de dígitos, que é o que o formulário valida.
 */
function CodeInput({
  value,
  onChange,
  length = 8,
  error = false,
  errorMessage,
  disabled = false,
  autoFocus = false,
}: CodeInputProps) {
  const theme = useTheme();
  const referencias = useRef<Array<HTMLInputElement | null>>([]);
  const [caixas, setCaixas] = useState<string[]>(() =>
    paraCaixas(value, length)
  );
  /** Último texto que este componente entregou para fora. */
  const ultimoEmitido = useRef(value);

  useEffect(() => {
    // Só reage quando o valor vem de fora (reset do formulário). O que o
    // próprio componente emitiu já está desenhado, e reescrever aqui apagaria
    // um buraco no meio ('1', '', '3' emite "13" e voltaria como '1','3').
    if (value !== ultimoEmitido.current) {
      ultimoEmitido.current = value;
      setCaixas(paraCaixas(value, length));
    }
  }, [value, length]);

  function foca(indice: number) {
    referencias.current[Math.max(0, Math.min(indice, length - 1))]?.focus();
  }

  function aplica(proximas: string[]) {
    const texto = proximas.join('');

    ultimoEmitido.current = texto;
    setCaixas(proximas);
    onChange(texto);
  }

  /** Escreve `digitos` a partir de `inicio` e devolve onde o cursor deve parar. */
  function preenche(inicio: number, digitos: string) {
    const proximas = [...caixas];
    let posicao = inicio;

    for (let i = 0; i < digitos.length && posicao < length; i++, posicao++) {
      proximas[posicao] = digitos[i];
    }

    aplica(proximas);
    foca(posicao);
  }

  function aoDigitar(valorDigitado: string, indice: number) {
    const digitos = valorDigitado.replace(/\D/g, '');

    if (!digitos) return; // apagar é tratado no keydown

    // Teclado de celular que despeja o código inteiro de uma vez (autofill).
    if (digitos.length >= length) {
      preenche(0, digitos.slice(0, length));
      return;
    }

    preenche(indice, digitos.slice(-1));
  }

  function aoTeclar(
    evento: React.KeyboardEvent<HTMLInputElement>,
    indice: number
  ) {
    const proximas = [...caixas];

    if (evento.key === 'Backspace') {
      evento.preventDefault();

      // Caixa cheia: apaga o próprio dígito e fica onde está. Caixa vazia:
      // volta uma e apaga a de trás — que é como todo campo de código se
      // comporta.
      if (proximas[indice]) {
        proximas[indice] = '';
        aplica(proximas);
        return;
      }

      if (indice > 0) {
        proximas[indice - 1] = '';
        aplica(proximas);
        foca(indice - 1);
      }

      return;
    }

    if (evento.key === 'Delete') {
      evento.preventDefault();
      proximas[indice] = '';
      aplica(proximas);
      return;
    }

    if (evento.key === 'ArrowLeft' && indice > 0) {
      evento.preventDefault();
      foca(indice - 1);
    }

    if (evento.key === 'ArrowRight' && indice < length - 1) {
      evento.preventDefault();
      foca(indice + 1);
    }
  }

  function aoColar(
    evento: React.ClipboardEvent<HTMLInputElement>,
    indice: number
  ) {
    const colado = evento.clipboardData.getData('text').replace(/\D/g, '');

    if (!colado) return;

    evento.preventDefault();

    // Código inteiro colado em qualquer caixa preenche o campo do começo; um
    // pedaço menor entra a partir da caixa onde o usuário estava.
    preenche(colado.length >= length ? 0 : indice, colado);
  }

  const estiloCaixa = (preenchida: boolean) => ({
    flex: '1 1 0',
    minWidth: 0,
    height: { xs: 48, sm: 56 },
    padding: 0,
    textAlign: 'center' as const,
    fontFamily: 'inherit',
    fontSize: { xs: '1.125rem', sm: '1.375rem' },
    fontWeight: 600,
    color: 'text.primary',
    backgroundColor: 'transparent',
    border: '1px solid',
    borderColor: error
      ? 'error.main'
      : preenchida
      ? 'primary.main'
      : 'divider',
    borderRadius: 2,
    outline: 'none',
    caretColor: theme.palette.primary.main,
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
    '&:focus': {
      borderColor: error ? 'error.main' : 'primary.main',
      boxShadow: `0 0 0 3px ${alpha(
        error ? theme.palette.error.main : theme.palette.primary.main,
        0.18
      )}`,
    },
    '&:disabled': { opacity: 0.6 },
  });

  return (
    <Box>
      <Box sx={{ display: 'flex', gap: { xs: 0.75, sm: 1 }, width: '100%' }}>
        {caixas.map((digito, indice) => (
          <Box
            key={indice}
            component="input"
            type="text"
            inputMode="numeric"
            // o iOS oferece o código do e-mail para colar quando o campo se diz
            // "one-time-code"
            autoComplete={indice === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            disabled={disabled}
            autoFocus={autoFocus && indice === 0}
            aria-label={`Dígito ${indice + 1} de ${length}`}
            value={digito}
            ref={(elemento: HTMLInputElement | null) => {
              referencias.current[indice] = elemento;
            }}
            // seleciona o que já está na caixa: digitar por cima substitui, em
            // vez de esbarrar no maxLength
            onFocus={(evento: React.FocusEvent<HTMLInputElement>) =>
              evento.target.select()
            }
            onChange={(evento: React.ChangeEvent<HTMLInputElement>) =>
              aoDigitar(evento.target.value, indice)
            }
            onKeyDown={(evento: React.KeyboardEvent<HTMLInputElement>) =>
              aoTeclar(evento, indice)
            }
            onPaste={(evento: React.ClipboardEvent<HTMLInputElement>) =>
              aoColar(evento, indice)
            }
            sx={estiloCaixa(!!digito)}
          />
        ))}
      </Box>

      {errorMessage ? (
        <FormHelperText error sx={{ mx: 1.75, mt: 0.75 }}>
          {errorMessage}
        </FormHelperText>
      ) : null}
    </Box>
  );
}

export { CodeInput };
