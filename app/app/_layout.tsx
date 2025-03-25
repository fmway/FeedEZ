import { Slot } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { SafeAreaView, StatusBar, Platform, StyleSheet } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar'
import 'react-native-reanimated';

// Mencegah splash screen menghilang sebelum loading selesai
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    Poppins: require('../assets/fonts/Poppins-Regular.ttf'),
  });

  NavigationBar.setBackgroundColorAsync('#e9f5e9');
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={'dark-content'} backgroundColor={'#e9f5e9'} />
      <Slot />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9f5e',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 40, // Hindari tabrakan status bar
  },
});
