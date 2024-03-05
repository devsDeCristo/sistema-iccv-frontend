import { Text, View } from '@react-pdf/renderer';
import { FooterProps } from './types';
import { stylesPdf } from './styles';

function FooterPdf({ text }: FooterProps) {
  return (
    <View style={stylesPdf.footer} fixed>
      <Text>{text}</Text>
      <Text>{'Igreja de Cristo no Brasil'}</Text>
    </View>
  );
}
export { FooterPdf };
