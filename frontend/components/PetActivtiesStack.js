import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PetActivitiesScreen from '../screens/PetActivitiesScreen';
import PetCheckScreen from '../screens/PetCheckScreen';

const Stack = createNativeStackNavigator();

const PetActivitiesStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="PetActivitiesScreen" component={PetActivitiesScreen} />
    <Stack.Screen name="PetCheckScreen" component={PetCheckScreen} />
    
  </Stack.Navigator>
);

export default PetActivitiesStack;
