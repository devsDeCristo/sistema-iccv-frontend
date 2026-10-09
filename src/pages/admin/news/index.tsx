import { Box, Button, InputAdornment, Paper, TextField } from '@mui/material';
import { Add, Close, Search } from '@mui/icons-material';
import { useState } from 'react';
import { PageStyle } from '../../../components/pageStyle';
import { Header } from '../../../components/header';
import { superficieSx } from '../../../components/listPageStyles';
import { CalendarioDeDisparos } from '../../../features/news/components/calendarioDeDisparos';
import { NewsAdminList } from '../../../features/news/components/newsAdminList';
import { NewsFormModal } from '../../../features/news/components/newsFormModal';
import { News } from '../../../features/news/types';
import { WhatsappOfflineAlert } from '../../../features/settings/whatsapp/components/whatsappOfflineAlert';

/** Mural de notícias: é daqui que sai o feed da tela de eventos. */
function NewsAdmin() {
  const [busca, setBusca] = useState('');
  const [emEdicao, setEmEdicao] = useState<News | null>(null);
  const [formAberto, setFormAberto] = useState(false);

  const abrirNova = () => {
    setEmEdicao(null);
    setFormAberto(true);
  };

  const abrirEdicao = (news: News) => {
    setEmEdicao(news);
    setFormAberto(true);
  };

  const styles = {
    boxFiltro: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      width: '100%',
      gap: 2,
      marginY: 2,
      padding: 2,
      ...superficieSx,
    },
    campo: {
      width: { xs: '100%', sm: '380px' },
    },
    botao: {
      width: { xs: '100%', sm: 'fit-content' },
      borderRadius: 2,
    },
  };

  return (
    <PageStyle>
      <Header
        title="Notícias"
        description="Avisos que aparecem no mural dos inscritos"
      />

      <WhatsappOfflineAlert />

      <Paper sx={styles.boxFiltro}>
        <TextField
          placeholder="Pesquisar por título ou chamada"
          variant="outlined"
          size="small"
          value={busca}
          sx={styles.campo}
          onChange={(evento) => setBusca(evento.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ fontSize: 20, color: 'text.secondary' }} />
              </InputAdornment>
            ),
            endAdornment: busca ? (
              <InputAdornment position="end">
                <Close
                  sx={{ fontSize: 18, cursor: 'pointer' }}
                  onClick={() => setBusca('')}
                />
              </InputAdornment>
            ) : null,
          }}
        />

        <Button
          variant="contained"
          startIcon={<Add />}
          sx={styles.botao}
          onClick={abrirNova}
        >
          Nova notícia
        </Button>
      </Paper>

      {/* lado a lado em tela larga: a lista ocupa o resto e o calendário fica
          na largura dele; em tela menor, o calendário desce para baixo */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: 'flex-start',
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
          <NewsAdminList search={busca} onEdit={abrirEdicao} />
        </Box>
        <Box sx={{ width: { xs: '100%', lg: 352 }, flexShrink: 0 }}>
          <CalendarioDeDisparos />
        </Box>
      </Box>

      <NewsFormModal
        open={formAberto}
        news={emEdicao}
        onClose={() => setFormAberto(false)}
      />
    </PageStyle>
  );
}

export { NewsAdmin };
