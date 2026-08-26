export function stringToColor(string: string) {
  let hash = 0;
  let i;

  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = '#';

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }

  return color;
}
export function stringAvatar(name: string) {
  const firstName = name?.split(' ')?.[0][0];
  const lastName = name?.split(' ')?.[1];
  return {
    sx: {
      bgcolor: stringToColor(name),
      width: 24,
      height: 24,
      fontSize: 11,
    },
    children: `${firstName}${lastName ? lastName[0] : ''}`,
  };
}

export function formatDate(date: Date) {
  return new Date(date).toLocaleDateString('pt-BR', {
    timeZone: 'UTC',
  });
}

export function formatDateTime(date?: Date | string | null) {
  if (!date) return '';
  return new Date(date).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Conectores de nome brasileiro. Não contam como palavra na regra das duas
 * palavras do crachá, mas continuam impressos: "Maria de Fatima" sai inteiro, e
 * as duas palavras são "Maria" e "Fatima".
 */
const NAME_CONNECTORS = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);

const isConnector = (word: string) => NAME_CONNECTORS.has(word.toLowerCase());

/**
 * Reduz o nome às duas primeiras palavras de verdade, para o crachá.
 *
 * Percorre o nome até fechar a segunda palavra que não é conector e corta ali,
 * levando junto o que estava no meio. Por isso "Jose da Silva" sai completo e
 * "Joao Pedro da Silva Santos" sai só "Joao Pedro".
 *
 * Conector sobrando no fim é descartado, senão "Maria de" fica pendurado. Nome
 * feito só de conectores devolve as duas primeiras palavras como vieram, para
 * sobrar algo impresso em vez de crachá vazio.
 */
export function limitToTwoNames(value: string): string {
  const words = (value ?? '').trim().split(/\s+/).filter(Boolean);

  let nomes = 0;
  let corte = 0;
  for (let i = 0; i < words.length; i++) {
    if (!isConnector(words[i])) nomes += 1;
    if (nomes === 2) {
      corte = i + 1;
      break;
    }
  }
  // não fechou duas: sem nome nenhum fica com as duas primeiras palavras, com
  // uma só fica com o nome todo e a poda abaixo tira o conector pendurado
  if (corte === 0) corte = nomes === 0 ? 2 : words.length;

  const escolhidas = words.slice(0, corte);
  // a poda não vale quando não há nome nenhum: aí sobraria só um conector
  const temNome = escolhidas.some((word) => !isConnector(word));
  while (
    temNome &&
    escolhidas.length > 1 &&
    isConnector(escolhidas[escolhidas.length - 1])
  ) {
    escolhidas.pop();
  }

  return escolhidas.join(' ');
}

/** Aplica no nome a formatação escolhida na hora de gerar crachás/envelopes */
export function formatNameCase(
  value: string,
  nameCase: 'upper' | 'lower' | 'capitalize'
): string {
  const name = (value ?? '').trim();
  if (!name) return '';

  if (nameCase === 'upper') return name.toUpperCase();
  if (nameCase === 'lower') return name.toLowerCase();

  const capitalizado = name
    .toLowerCase()
    .replace(/(^|\s|')([a-zà-ú])/g, (_, prefix, letter) => prefix + letter.toUpperCase());

  // em português o conector fica minúsculo: "Maria de Fatima", não
  // "Maria De Fatima". No começo do nome ele é maiúsculo como qualquer palavra
  return capitalizado
    .split(' ')
    .map((word, index) =>
      index > 0 && isConnector(word) ? word.toLowerCase() : word
    )
    .join(' ');
}

/**
 * Valor em reais no padrão brasileiro: `R$ 1.234,50`.
 *
 * Existia em três formatos diferentes na tela de pagamentos — `R$ 1234.50`,
 * `R$1234,50` e sem separador de milhar —, nenhum deles o do país.
 */
export const formatCurrency = (value?: number | null): string =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);

export const removeMask = (value: string): string => {
  return value.replace(/\D/g, '');
};

export const formatCPF = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

export const formatZipCode = (value?: string): string => {
  return value
    ? value
        .replace(/\D/g, '')
        .replace(/^(\d{5})(\d)/, '$1-$2')
        .slice(0, 9)
    : '';
};

export const formatPhoneNumber = (value: string): string => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .replace(/(-\d{4})(\d+?)$/, '$1');
};

export const onlyNumber = (value: string): string => {
  return value.replace(/\D/g, '');
};

export const formatState = (value: string): string => {
  return value.replace(/[^\p{L}]/gu, '').slice(0, 2);
};


export function sanitizePrice(input: string): number | null{
  if (!input) return null

  // normaliza vírgula para ponto
  let v = input.replace(',', '');

  // remove qualquer caractere que não seja dígito ou ponto (remove '-' e letras)
  v = v.replace(/[^0-9.]/g, '');
  
  return Number(v);

}

export function sanitizeInteger(input: string): string {
  if (input === null || input === undefined) return '';
  const v = String(input).replace(/\D/g, '');
  // remove zeros à esquerda (mas deixa '0' se for zero)
  return v.replace(/^0+(?=\d)/, '');
}

export function formatBRNumber(value: number, decimals = 2): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '';
  // se for inteiro, não força casas decimais
  const hasDecimal = Math.round(value) !== value;
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: hasDecimal ? Math.min(decimals, 2) : 0,
    maximumFractionDigits: decimals,
  }).format(value);
}