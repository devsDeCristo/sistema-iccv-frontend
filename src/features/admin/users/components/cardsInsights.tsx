import { ReactNode } from "react";
import { useGetInsightsUsers } from "../api/getInsights";
import { Box, CardContent, Typography, Card, Grid } from "@mui/material";
import { EventAvailable, People, Person, WidthFull } from "@mui/icons-material";

const styles = {
  gridContainer: {
    mb: 2
  },
  card: {
    position: "relative",
    height: "100%",
  },
  title: {
    fontSize: "17px",
    fontWeight: 500,
    width: "90%"
  },
  value: {
    fontSize: "22px",
    fontWeight: 700
  },
  subtitle: {
    fontSize: "15px"
  },
  iconContainer: {
    position: "absolute",
    top: 10,
    right: 10
  }
};

export const CardsInsights = () => {
  const { data } = useGetInsightsUsers();

  const CardTemplate = ({
    title,
    data,
    subtitle,
    icon
  }: {
    title: string;
    data: any;
    subtitle: string;
    icon: ReactNode;
  }) => {
    return (
      <Card sx={styles.card}>
        <CardContent>
          <Typography sx={styles.title}>{title}</Typography>
          <Typography sx={styles.value}>{data}</Typography>
          <Typography sx={styles.subtitle} color="text.secondary">
            {subtitle}
          </Typography>
          <Box sx={styles.iconContainer}>{icon}</Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Grid container justifyContent="space-between" sx={styles.gridContainer} spacing={2}>
      <Grid item xs={12} sm={6} md={4}>
        <CardTemplate
          title="Total de Usuários"
          data={data?.totalUsers || 0}
          subtitle="Usuários cadastrados"
          icon={<Person />}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <CardTemplate
          title="Usuários com Participação em Eventos no Ano"
          data={data?.usersWithEvents || 0}
          subtitle="Usuários atualmente ativos"
          icon={<EventAvailable />}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <CardTemplate
          title="Total de Usuários Administradores"
          data={data?.totalUsersAdmin || 0}
          subtitle="Usuários com permissão de administrador"
          icon={<People />}
        />
      </Grid>
      
    </Grid>
  );
};
