import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SettingsScreen from '../screens/ProfileSetting';
import EditVeteriScreen from '../screens/EditVeteriScreen';
import LoginScreen from '../screens/LoginScreen'; 
const Stack = createNativeStackNavigator();

const SettingsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="SettingsMain" component={SettingsScreen} />
    <Stack.Screen name="EditedProfileScreen" component={EditVeteriScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
  </Stack.Navigator>
);

export default SettingsStack;