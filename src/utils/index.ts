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
