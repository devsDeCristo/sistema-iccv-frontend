import { Image, Text, View } from '@react-pdf/renderer';
import { stylesPdf } from './styles';
import { UserRectangleProps } from './types';

function UserRectangle({ user }: UserRectangleProps) {
  return (
    <View style={stylesPdf.cell} wrap={false}>
      {user.profilePhotoUrl ? (
        <Image
          style={stylesPdf.imagePhoto}
          src={user.profilePhotoUrl}
          source={''}
        />
      ) : (
        <View style={stylesPdf.imagePhoto} />
      )}
      <View style={stylesPdf.columnUser}>
        <Text style={stylesPdf.textName}>{user.fullName}</Text>
        <Text style={stylesPdf.text}>
          Data Nasc: {new Date(user.birthday).toLocaleDateString()}
        </Text>
        <Text style={stylesPdf.text}>Email: {user.email}</Text>
        <Text style={stylesPdf.text}>Celular: {user.cellphone}</Text>
      </View>
    </View>
  );
}
export { UserRectangle };
