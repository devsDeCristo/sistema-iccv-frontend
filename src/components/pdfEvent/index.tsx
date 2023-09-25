//import React from "react";
import { Page, Text, View, Document, Font, StyleSheet, Image, } from '@react-pdf/renderer';
interface PdfProps {
  data: object[];
}
import logoIccv from "../../assets/ic-logo.png";
import logoCursilho from "../../assets/logo-cursilho.jpeg";
const styles = StyleSheet.create({
  body: {
   paddingTop: 35,
   paddingBottom: 65,
   paddingHorizontal: 35,
 },
  page: {
   fontFamily: "Times-Roman",
   padding: 40,
 },
 header: {
  gap:"10px",
   fontSize: 12,
   marginBottom: 20,
   textAlign: 'center',
   alignItems:"center",
   justifyContent:"center",
   flexDirection: "row",
   color: 'grey',
   marginTop: 10,
 },
 section: {
   fontFamily: "Times-Roman",
   marginBottom: 10,
 },
 title: {
   fontSize: 24,
   textAlign: 'center',
   fontFamily: 'Oswald',
   marginBottom: 10,
 },
 text: {
   fontFamily: "Times-Roman",
   fontSize: 12,
   marginBottom: 5,
 },
 subtitle: {
   fontFamily: "Times-Roman",
   fontSize: 10,
   marginBottom: 5,
 },
 table: {
   fontFamily: "Times-Roman",
  // display: "table",
   width: "auto",
   marginBottom: 10,
 },
 tableRow: {
   fontFamily: "Times-Roman",
   flexDirection: "row",
 },
 tableCell: {
   fontFamily: "Times-Roman",
   width: "25%",
   borderWidth: 1,
   borderColor: "#000",
   padding: 5,
   fontSize: 11,
 },
 cell: {
   fontFamily: "Times-Roman",
   width: "30%",
   borderWidth: 1,
   borderColor: "#000",
   padding: 5,
   fontSize: 11,
   flexDirection: "row",
 },
 image: { width: 70 , height: 70},
 imageEvent: { width: 70 , height: 70,borderRadius:45},
 divider: {
   marginTop: "10px",
   borderTop: "2px dashed #bbb",
   marginBottom: "20px",
 },
 footer: {
   position: "absolute",
   fontSize: 12,
   bottom: 30,
   left: 40,
   right: 0,
   color: "grey",
 },
 footerText: {
   fontFamily: "Times-Roman",
   fontSize: 10,
 },
 tabelaTitle: { fontFamily: "Times-Bold", fontSize: 12 },
});
Font.register({
  family: 'Oswald',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf'
});

// Create Document Component
function PdfEvent({ data }: PdfProps) {
  return (
    <Document>
      <Page orientation="landscape" style={styles.body}>
            <View style={styles.header}> 
              <Image style={styles.imageEvent} src={logoCursilho} />
              <Text style={styles.title}>
                4° CURSILHO FEMININO DE CRISTANDADE
              </Text>  
              <Image style={styles.image} src={logoIccv} />
            </View>
            <View style={styles.section}>
              <View style={styles.table}>
                <View style={styles.tableRow}>
                  {data.map((user) => (
                    <View style={styles.cell}>
                      <View style={styles.image} />
                      <View style={{ flexDirection: "column" }}>                      
                        <Text style={styles.text}>Nome:{" "}{(user as any).fullName}</Text>
                        <Text style={styles.text}>Data Nasc:{" "}{new Date((user as any).birthday).toLocaleDateString()}</Text>
                        <Text style={styles.text}>Email:{" "}{(user as any).email}</Text>
                        <Text style={styles.text}>Celular:{" "}{(user as any).cellphone}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            </View>
      </Page>
  </Document>
  );
}

export default PdfEvent;

  
