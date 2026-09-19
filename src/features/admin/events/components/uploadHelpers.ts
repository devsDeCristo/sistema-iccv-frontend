import { useEffect, useState } from 'react';

/**
 * URL de objeto do arquivo escolhido, revogada quando o arquivo troca ou o
 * componente sai de cena — o `useMemo` de antes criava um blob novo e nunca
 * soltava o anterior.
 */
export function usePreviaArquivo(arquivos?: File[] | null) {
  const arquivo = arquivos?.[0];
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!arquivo) {
      setUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(arquivo);
    setUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [arquivo]);

  return url;
}

export function formatarTamanho(bytes?: number) {
  if (!bytes) return null;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
