import { Link } from '@mui/material';
import { OpenInNew } from '@mui/icons-material';

/** "Ver produto", abrindo a loja em outra aba. A API só guarda http(s). */
function LinkDoProduto({ link }: { link: string }) {
  return (
    <Link
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      underline="hover"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        fontSize: 13,
        fontWeight: 500,
        width: 'fit-content',
      }}
    >
      Ver produto
      <OpenInNew sx={{ fontSize: 14 }} />
    </Link>
  );
}

export { LinkDoProduto };
