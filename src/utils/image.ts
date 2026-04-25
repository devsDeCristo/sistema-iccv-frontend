import { API_URL } from '../config/env';

export async function imageUrlToDataUrl(
  url?: string | null
): Promise<string | null> {
  if (!url) return null;

  if (url.startsWith('data:')) {
    return url;
  }

  const normalizedUrl = url.startsWith('http')
    ? url
    : new URL(url, API_URL).toString();

  try {
    const response = await fetch(normalizedUrl);

    if (!response.ok) {
      return null;
    }

    const blob = await response.blob();

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}