import { StyleSheet } from '@react-pdf/renderer';

const stylesPdfRooms = StyleSheet.create({
  body: {
    padding: 20,
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badge: {
    width: '9.5cm', // 2 por linha
    height: '13.5cm', // 2 por coluna
    marginBottom: 10,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DBDBDB',
    position: 'relative',
  },
  imageBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    opacity: 0.5,
  },
  headerBadge: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  image: {
    height: 40,
  },
  imageEvent: {
    height: 160,
    objectFit: 'contain',
  },
  textName: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
    textTransform: 'capitalize',
    marginTop: 10,
  },
});

export { stylesPdfRooms };
