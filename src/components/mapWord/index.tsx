import { Box } from '@mui/material';
import { useMemo } from 'react';

const GoogleMap = ({ linkMap }: { linkMap: string }) => {
  // const latitudeLongitude = useMemo(() => {
  //   // Extrai a latitude e longitude do link do Google Maps
  //   return linkMap
  //     .split('@')[1]
  //     .split(',')[0]
  //     .concat(',', linkMap.split('@')[1].split(',')[1]);
  // }, [linkMap]);
  // console.log(linkMap);

  return (
    <Box
      className="mapouter dark:invert-95 "
      sx={{
        position: 'relative',
        textAlign: 'right',
        width: '100%',
        height: '450px',
      }}
    >
      <iframe
        width="100%"
        height="100%"
        style={{ border: 0 }}
        // allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        // src={linkMap}
        src="https://www.google.com/maps?q=-5.8637462,-35.2898057&z=17&output=embed%22"
        // src="https://www.google.com/maps/embed/v1/place?q=Av.%20Trindade%2C%20254%20%E2%80%93%2015%C2%BA%20Andar%20%E2%80%93%201516%20Bethaville%20I%20Barueri%20(SP)&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8"
        // src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&center=${latitudeLongitude}&zoom=15&maptype=satellite`}
      ></iframe>

      <a
        href="https://norsumediagroup.com/embed-google-map-website-free"
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'none' }}
      >
        Embed Map on Website for Free
      </a>
    </Box>
  );
};

export default GoogleMap;
