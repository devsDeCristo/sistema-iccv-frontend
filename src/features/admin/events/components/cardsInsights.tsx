import { ReactNode } from "react";
import { useGetInsights } from "../api/getInsights";
import { Box, CardContent, Typography, Card, Grid } from "@mui/material";
import { EventAvailable, EventNote, People } from "@mui/icons-material";

const styles = {
  gridContainer: {
    mb: 2
  },
  card: {
    position: "relative"
  },
  title: {
    fontSize: "17px",
    fontWeight: 500
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
  const { data } = useGetInsights();

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
      <Grid item xs={12} sm={6} md={3}>
        <CardTemplate
          title="Total de Eventos"
          data={data?.totalEvents || 0}
          subtitle="Eventos cadastrados"
          icon={<EventAvailable />}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <CardTemplate
          title="Eventos Ativos"
          data={data?.totalEventsActive || 0}
          subtitle="Eventos atualmente ativos"
          icon={<EventNote />}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <CardTemplate
          title="Tempo médio para lotar vagas"
          data={data?.timeToFillHours || 0}
          subtitle="Horas"
          icon={<People />}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <CardTemplate
          title="Média trimestral de eventos"
          data={data?.eventsInCurrentQuarter || 0}
          subtitle="Eventos"
          icon={<People />}
        />
      </Grid>
    </Grid>
  );
};
