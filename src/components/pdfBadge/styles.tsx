import { StyleSheet } from '@react-pdf/renderer';
const stylesPdfRooms = StyleSheet.create({
  body: {
    paddingVertical: 0,
    paddingHorizontal: 10,
  },
  page: {
    padding: 40,
  },
  text: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    padding: 3,
    width: '100%',
  },
  textName: {
    fontSize: 24,
    padding: 3,
    fontFamily: 'Helvetica-Bold',
    maxWidth: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    textAlign: 'center',
  },
  container: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: -1,
    flexWrap: 'wrap',
  },
  headerBadge: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  badge: {
    borderWidth: 1,
    borderColor: '#DBDBDB',
    width: '11cm',
    height: '15cm',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '70px',
    marginTop: '20px',
  },
  image: { height: 60 },
  imageEvent: {
    height: 140,
    width: '85%',
    objectFit: 'cover',
  },
});
export { stylesPdfRooms };
