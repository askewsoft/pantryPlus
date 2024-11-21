import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const AddListButton = () => {
  return (
    <MaterialIcons.Button
      name="add-circle"
      size={30}
      color="white"
      backgroundColor="purple"
      borderRadius={20}
      iconStyle={{ paddingRight: 0, paddingLeft: 10, paddingBottom: 10, paddingTop: 5 }}
      onPress={() => {}}
    />
  )
}

export default AddListButton;