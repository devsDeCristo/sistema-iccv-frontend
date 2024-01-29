import {
  Page,
  Text,
  View,
  Document,
  Font,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';
interface PdfProps {
  data: object[];
  textFooter: string;
}
interface UserRectangleProps {
  user: object;
}
interface HeaderProps {}
interface FooterProps {
  text: string;
}
import logoIccv from '../../assets/logo-iccv.png';
import logoEvento from '../../assets/4-curs-fem.png';
import logoCursilho from '../../assets/logo-cursilho.png';
import Borboleta from '../../assets/borboleta.png';
const styles = StyleSheet.create({
  body: {
    paddingTop: 25,
    //paddingBottom: 65,
    paddingHorizontal: 25,
  },
  page: {
    padding: 40,
  },
  header: {
    gap: '10px',
    fontSize: 12,
    //marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    backgroundColor: '#f8d2f8',
    paddingHorizontal: '20px',
    borderRadius: '8px',
  },
  footer: {
    position: 'relative',
    gap: '5px',
    fontSize: 12,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    backgroundColor: '#f8d2f8',
    padding: '10px',
    borderRadius: '8px',
  },
  title: {
    fontSize: 15,
    //textAlign: 'left',
    fontFamily: 'Helvetica',
    //marginBottom: 10,
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
  rectangleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cell: {
    width: '24%',
    borderWidth: 1,
    borderColor: '#000',
    padding: 5,
    display: 'flex',
    flexDirection: 'row',
  },
  decuria: {
    margin: 6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flexDirection: 'row',
  },
  image: { height: 60 },
  imageEvent: {
    width: '30%',
    height: '100%',
    objectFit: 'cover',
  },

  imageDecuria: { height: 30 },
});
Font.register({
  family: 'Helvetica',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf',
});
const UserRectangle = ({ user }: UserRectangleProps) => {
  return (
    <View style={styles.cell}>
      {(user as any).profilePhotoUrl ? (
        <Image
          style={styles.image}
          src={(user as any).profilePhotoUrl}
          source={''}
        />
      ) : null}
      <View
        style={{
          flexDirection: 'column',
          width: '70%',
          justifyContent: 'center',
        }}
      >
        <Text style={styles.textName}>{(user as any).fullName}</Text>
        <Text style={styles.text}>
          Data Nasc: {new Date((user as any).birthday).toLocaleDateString()}
        </Text>
        <Text style={styles.text}>Email: {(user as any).email}</Text>
        <Text style={styles.text}>Celular: {(user as any).cellphone}</Text>
      </View>
    </View>
  );
};
const HeaderPdf = () => {
  return (
    <View style={styles.header} fixed>
      <Image style={styles.image} src={logoIccv} />
      <Image style={styles.imageEvent} src={logoEvento} />
      <Image style={styles.image} src={logoCursilho} />
    </View>
  );
};
const FooterPdf = ({ text }: FooterProps) => {
  return (
    <View style={styles.footer} fixed>
      <Text>{text}</Text>
      <Text>{'Igreja de Cristo no Brasil'}</Text>
    </View>
  );
};
// Create Document Component
function PdfEvent({ data, textFooter }: PdfProps) {
  return (
    <Document>
      <Page orientation="landscape" style={styles.body}>
        <HeaderPdf />
        <View fixed style={styles.decuria}>
          {' '}
          <Image style={styles.imageDecuria} src={Borboleta} />
          <Text style={styles.title}>Decúria Amor</Text>
        </View>
        <View style={styles.rectangleRow}>
          {data.map((user) => (
            <UserRectangle user={user} />
          ))}
        </View>
        <FooterPdf text={textFooter} />
      </Page>
    </Document>
  );
}

export default PdfEvent;
