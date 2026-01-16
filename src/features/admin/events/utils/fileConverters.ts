/**
 * Converte um File para Base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Converte um File SVG para string de texto XML
 */
export const svgFileToText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Comprime SVG removendo espaços desnecessários e comentários
 */
export const compressSvg = (svgText: string): string => {
  return svgText
    .replace(/<!--[\s\S]*?-->/g, '') // Remove comentários
    .replace(/\s+/g, ' ') // Substitui múltiplos espaços por um
    .replace(/> </g, '><') // Remove espaços entre tags
    .trim();
};

/**
 * Valida o tamanho do arquivo
 */
export const validateFileSize = (
  file: File,
  maxSizeInMB: number = 5
): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size <= maxSizeInBytes;
};

/**
 * Formata tamanho em bytes para string legível
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Cria um FormData com os arquivos para envio multipart
 */
export const createFormDataWithFiles = (
  data: Record<string, any>,
  fileFields: { fieldName: string; file: File | undefined }[]
): FormData => {
  const formData = new FormData();

  // Adiciona campos normais
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(
        key,
        typeof value === 'object' ? JSON.stringify(value) : value
      );
    }
  });

  // Adiciona arquivos
  fileFields.forEach(({ fieldName, file }) => {
    if (file) {
      formData.append(fieldName, file);
    }
  });

  return formData;
};

/**
 * Converte uma string SVG de volta para um objeto File
 */
export const svgTextToFile = (
  svgText: string,
  fileName: string = 'image.svg'
): File => {
  // Cria um Blob a partir da string SVG
  const blob = new Blob([svgText], { type: 'image/svg+xml' });

  // Converte o Blob para File
  const file = new File([blob], fileName, { type: 'image/svg+xml' });

  return file;
};

/**
 * Converte Base64 para File
 */
export const base64ToFile = (
  base64String: string,
  fileName: string = 'image.svg'
): File => {
  // Remove o prefixo "data:image/svg+xml;base64," se existir
  const base64Data = base64String.includes('base64,')
    ? base64String.split('base64,')[1]
    : base64String;

  // Decodifica Base64
  const byteString = atob(base64Data);

  // Cria array de bytes
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }

  // Cria Blob e depois File
  const blob = new Blob([uint8Array], { type: 'image/svg+xml' });
  const file = new File([blob], fileName, { type: 'image/svg+xml' });

  return file;
};
