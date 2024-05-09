import { StyleSheet } from '@react-pdf/renderer';
const stylesPdfRooms = StyleSheet.create({
  body: {
    paddingTop: 25,
    paddingHorizontal: 25,
    paddingBottom: '80px',
  },
  page: {
    padding: 40,
  },
  header: {
    gap: '10px',
    fontSize: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'column',
    // backgroundColor: '#f8d2f8',
    paddingHorizontal: '20px',
    borderRadius: '8px',
    height: '125px',
  },
  text: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    padding: 3,
    width: '100%',
  },
  textName: {
    fontSize: 9,
    padding: 3,
    fontFamily: 'Helvetica-Bold',
    maxWidth: '100%',
    display: 'flex',
    flexWrap: 'wrap',
    textAlign: 'center',
  },
  row: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 1,
  },
  cell: {
    width: '50%',
    borderWidth: 1,
    borderColor: '#000',
    //padding: 3,
    height: '300px',
    display: 'flex',
    flexDirection: 'column',
  },
  image: { height: 90 },
  imageEvent: {
    width: '70%',
    height: '100%',
    objectFit: 'cover',
  },
});
export { stylesPdfRooms };
