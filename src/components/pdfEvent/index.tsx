//import React from "react";
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
const styles = StyleSheet.create({
  body: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 35,
  },
  page: {
    padding: 40,
  },
  header: {
    gap: '10px',
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    backgroundColor: '#f8d2f8',
    //color: 'grey',
    paddingHorizontal: '20px',
    borderRadius: '10px',
    //marginTop: 10,
  },
  footer: {
    gap: '5px',
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    backgroundColor: '#f8d2f8',
    padding: '10px',
    borderRadius: '10px',
    //marginTop: 10,
  },
  section: {
    marginBottom: 10,
  },
  title: {
    fontSize: 15,
    textAlign: 'center',
    fontFamily: 'Helvetica',
    marginBottom: 10,
  },
  text: {
    fontSize: 8,
    marginBottom: 5,
  },
  textName: {
    fontSize: 8,
    marginBottom: 5,
    fontFamily: 'Helvetica-Bold',
  },
  subtitle: {
    fontSize: 8,
    marginBottom: 5,
  },
  table: {
    // display: "table",
    width: 'auto',
    marginBottom: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    width: '25%',
    borderWidth: 1,
    borderColor: '#000',
    padding: 5,
    fontSize: 11,
  },
  cell: {
    family: 'Helvetica',
    width: '25%',
    borderWidth: 1,
    borderColor: '#000',
    padding: 5,
    fontSize: 11,
    flexDirection: 'row',
  },
  image: { height: 60 },
  imageEvent: {
    width: 180,
    height: '100%', // Ajusta a altura da imagem (ajuste conforme necessário)
    objectFit: 'cover',
  },
  divider: {
    marginTop: '10px',
    borderTop: '2px dashed #bbb',
    marginBottom: '20px',
  },
  footerText: {
    fontSize: 10,
  },
  tabelaTitle: { fontFamily: 'Helvetica', fontSize: 12 },
});
Font.register({
  family: 'Helvetica',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf',
});
const UserRectangle = ({ user }: UserRectangleProps) => {
  return (
    <View style={styles.cell}>
      <Image style={styles.image} src={(user as any).profilePhotoUrl} />
      <View style={{ flexDirection: 'column' }}>
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
    <View style={styles.header}>
      <Image style={styles.image} src={logoIccv} />
      <Image style={styles.imageEvent} src={logoEvento} />
      <Image style={styles.image} src={logoCursilho} />
    </View>
  );
};
const FooterPdf = ({ text }: FooterProps) => {
  return (
    <View style={styles.footer}>
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
        <View style={styles.section}>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              {data.map((user) => (
                <UserRectangle user={user} />
              ))}
            </View>
          </View>
        </View>
        <FooterPdf text={textFooter} />
      </Page>
    </Document>
  );
}

export default PdfEvent;
