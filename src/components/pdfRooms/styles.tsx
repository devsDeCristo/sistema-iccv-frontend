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
    flexDirection: 'row',
    // backgroundColor: '#f8d2f8',
    paddingHorizontal: '20px',
    borderRadius: '8px',
    height: '125px',
  },
  title: {
    fontSize: 15,
    fontFamily: 'Helvetica',
  },
  text: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    marginBottom: 5,
    width: '100%',
  },
  textName: {
    fontSize: 9,
    marginBottom: 5,
    fontFamily: 'Helvetica-Bold',
    maxWidth: '100%',
    display: 'flex',
    flexWrap: 'wrap',
  },
  containerRow: {
    //flexDirection: 'row',
    //flexWrap: 'wrap',
    width: 'auto',
    gap: -1,
    marginBottom: '200px',
  },
  row: {
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: -1,
  },
  cell: {
    width: '45%',
    borderWidth: 1,
    borderColor: '#000',
    //padding: 3,
    display: 'flex',
    flexDirection: 'row',
  },
  decuria: {
    margin: 6,
    marginTop: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
  },
  image: { height: 90 },
  imageEvent: {
    width: '17%',
    height: '100%',
    objectFit: 'cover',
  },
});
export { stylesPdfRooms };
