import { Box, BoxProps, CircularProgress } from '@mui/material';

function Loading(props: BoxProps) {
  return (
    <Box
      display="flex"
      width="100%"
      height="100%"
      alignItems="center"
      justifyContent="center"
      {...props}
    >
      <CircularProgress color="secondary" />
    </Box>
  );
}

export { Loading };
