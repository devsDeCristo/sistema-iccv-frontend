import { StyleSheet } from '@react-pdf/renderer';
const stylesPdfRooms = StyleSheet.create({
  body: {
    paddingTop: 25,
    paddingHorizontal: 25,
    // paddingBottom: '80px',
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
    fontSize: 18,
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
  badge: {
    //width: '50%',
    borderWidth: 1,
    borderColor: '#DBDBDB',
    //padding: 3,
    width: '8.5cm',
    height: '12.5cm',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: '20px',
    marginTop: '20px',
  },
  image: { height: 90 },
  imageEvent: {
    height: 120,
    width: '60%',
    objectFit: 'cover',
  },
});
export { stylesPdfRooms };
