import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PetProfileScreen from '../screens/PetProfileScreen';
import AddPetScreen from '../screens/AddPetScreen';
import EditedPetScreen from '../screens/EditedPetScreen';

const Stack = createNativeStackNavigator();

const PetProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PetProfileScreen" component={PetProfileScreen} />
    <Stack.Screen name="AddPetScreen" component={AddPetScreen} />
    <Stack.Screen name="EditedPetScreen" component={EditedPetScreen} />

  </Stack.Navigator>
);

export default PetProfileStack;
