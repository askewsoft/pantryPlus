import { View, Text } from 'react-native';
import { observer } from 'mobx-react-lite';

import { domainStore } from '@/stores/DomainStore';
import { styles as sharedStyles } from './styles';
import InfoButton from '@/components/Buttons/InfoButton';

const onNicknameChange = (nickname: string) => {
  domainStore.user?.setNickName(nickname);
};

const onEmailChange = (email: string) => {
  domainStore.user?.setEmail(email);
};

const Profile = () => {
  const { user } = domainStore;
  return (
    <View style={sharedStyles.container}>
      <View style={sharedStyles.propertyContainer}>
        <InfoButton />
        <Text style={sharedStyles.label}>Nickname</Text>
        {/* TODO: implement edit toggle to TextInput */}
        <Text style={sharedStyles.value} numberOfLines={1} ellipsizeMode='tail'>{user?.nickname}</Text>
      </View>
      <View style={sharedStyles.propertyContainer}>
        <InfoButton />
        <Text style={sharedStyles.label}>Email</Text>
        {/* TODO: implement edit toggle to TextInput */}
        <Text style={sharedStyles.value} numberOfLines={1} ellipsizeMode='tail'>{user?.email}</Text>
      </View>
    </View>
  );
}

export default observer(Profile);