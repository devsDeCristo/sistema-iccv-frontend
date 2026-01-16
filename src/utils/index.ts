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