import { Box, useTheme } from '@mui/material';

const getEmbedUrl = (url?: string | null): string | null => {
  if (!url) return null;

  // Já é um link de embed
  if (url.includes('google.com/maps/embed')) {
    return url;
  }

  try {
    const encodedUrl = encodeURIComponent(url);
    return `https://www.google.com/maps?q=${encodedUrl}&output=embed`;
  } catch {
    return null;
  }
};
interface GoogleMapProps {
  linkMap: string;
  height?: number | string;
  width?: number | string;
}
const GoogleMap = ({ linkMap, height = 300, width = 400 }: GoogleMapProps) => {
  const embedUrl = getEmbedUrl(linkMap);
  const theme = useTheme();

  return (
    <Box
      className="mapouter dark:invert-95 "
      sx={{
        position: 'relative',
        textAlign: 'right',
        width: '100%',
        height: 'fit-content',
        ...(theme.palette.mode === 'dark' && { filter: 'invert(95%)' }),
      }}
    >
      {!embedUrl ? (
        <div
          style={{
            height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px dashed #ccc',
            borderRadius: 8,
          }}
        >
          Informe um link válido do Google Maps
        </div>
      ) : (
        <>
          <iframe
            title="Google Maps Preview"
            src={embedUrl}
            width={width}
            height={height}
            style={{ border: 0, borderRadius: 8 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          <a
            href="https://norsumediagroup.com/embed-google-map-website-free"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'none' }}
          >
            Embed Map on Website for Free
          </a>
        </>
      )}
    </Box>
  );
};

export default GoogleMap;
