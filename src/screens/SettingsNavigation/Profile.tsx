import { View, Text } from 'react-native';
import { observer } from 'mobx-react-lite';

import { domainStore } from '@/stores/DomainStore';
import { styles as sharedStyles } from './styles';
import InfoButton from '@/components/Buttons/InfoButton';
import { Tooltip } from '@/consts/Tooltip';

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
        <InfoButton tooltipId={Tooltip.nickname} />
        <Text style={sharedStyles.label}>Nickname</Text>
        {/* TODO: implement edit toggle to TextInput */}
        <Text style={sharedStyles.value} numberOfLines={1} ellipsizeMode='tail'>{user?.nickname}</Text>
      </View>
      <View style={sharedStyles.propertyContainer}>
        <InfoButton tooltipId={Tooltip.email} />
        <Text style={sharedStyles.label}>Email</Text>
        {/* TODO: implement edit toggle to TextInput */}
        <Text style={sharedStyles.value} numberOfLines={1} ellipsizeMode='tail'>{user?.email}</Text>
      </View>
    </View>
  );
}

export default observer(Profile);