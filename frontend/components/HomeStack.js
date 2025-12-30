import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import TemperatureScreen from '../screens/TemperatureScreen';
import HeartBeatScreen from '../screens/HeartBeatScreen';
import BehaviourScreen from '../screens/BehaviourScreen';
import EmergencyScreen from '../screens/EmergencyScreen';
import PetProfileScreen from '../screens/PetProfileScreen';
import PetCheckScreen from '../screens/PetCheckScreen';
import ExploreNewFeature from '../components/ExploreNewFeature';
import FindVenterScreen from '../screens/FindVenterScreen';
import EditVeteriScreen from '../screens/EditVeteriScreen';
import AddVeterScreen from '../screens/AddVeterScreen';
import InfoVeteriScreen from '../screens/InfoVeteriScreen';
import PetActivitiesScreen from '../screens/PetActivitiesScreen';
import CatEmotionScreen from '../screens/CatEmotionScreen';
import CatEmotionHistoryScreen from '../screens/CatEmotionHistoryScreen';
import DogEmotionScreen from '../screens/DogEmotionScreen';
import DogEmotionHistoryScreen from '../screens/DogEmotionHistoryScreen';
const Stack = createNativeStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="TemperatureScreen" component={TemperatureScreen} />
      <Stack.Screen name="HeartBeatScreen" component={HeartBeatScreen} />
      <Stack.Screen name="BehaviourScreen" component={BehaviourScreen} />
      <Stack.Screen name="EmergencyScreen" component={EmergencyScreen} />
      <Stack.Screen name="PetProfileScreen" component={PetProfileScreen} />
      <Stack.Screen name="PetCheckScreen" component={PetCheckScreen} />
      <Stack.Screen name="MedicalAdvice" component={ExploreNewFeature} />
      <Stack.Screen name="FindVenterScreen" component={FindVenterScreen} />
      <Stack.Screen name="EditVeteriScreen" component={EditVeteriScreen} />
      <Stack.Screen name="AddVeterScreen" component={AddVeterScreen} />
      <Stack.Screen name="InfoVeteriScreen" component={InfoVeteriScreen} />
      <Stack.Screen name="PetActivitiesScreen" component={PetActivitiesScreen} />
      <Stack.Screen name="CatEmotionScreen" component={CatEmotionScreen} />
      <Stack.Screen name="CatEmotionHistoryScreen" component={CatEmotionHistoryScreen} />
      <Stack.Screen name="DogEmotionScreen" component={DogEmotionScreen} />
      <Stack.Screen name="DogEmotionHistoryScreen" component={DogEmotionHistoryScreen} />

    </Stack.Navigator>
  );
};

export default HomeStack;
