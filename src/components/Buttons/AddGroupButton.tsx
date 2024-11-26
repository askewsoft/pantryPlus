import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { observer } from 'mobx-react-lite';

const AddGroupButton = () => {
  return (
    <MaterialIcons.Button
      name="add-circle"
      size={24}
      color="white"
      backgroundColor="purple"
      borderRadius={0}
      iconStyle={{ paddingRight: 0, paddingLeft: 0, paddingBottom: 0, paddingTop: 0 }}
      onPress={() => {}}
    />
  )
}

export default observer(AddGroupButton);