import React, { createContext, useContext, useEffect, useState } from 'react';
import { Slot } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { MyText } from '@/components/MyText';
import * as SecureStore from 'expo-secure-store';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Definisikan context untuk WebSocket
interface SocketContextProps {
  data: Record<string, unknown>,
  useCmd: (fn: (ws: WebSocket, data: SocketContextProps['data']) => void) => void,
  token: string,
}

export const WebSocketContext = createContext<SocketContextProps>({
  data: {},
  useCmd(fn) {},
  token: "xxx",
});

export const useWebSocket = () => useContext(WebSocketContext);

export default function RootLayout() {
  const [loaded] = useFonts({
    Poppins: require('../assets/fonts/Poppins-Regular.ttf'),
  });
  const [dateInfo, setDateInfo] = useState('');
  const [data, setData] = useState({} as Record<string, unknown>);
  const [ws, setWs] = useState<WebSocket>();
  const [token, setToken] = useState("");

  const useCmd: SocketContextProps['useCmd'] = (fn) => {
    fn(ws!, data);
  }

  useEffect(() => {
    SecureStore.getItemAsync("token").then(token => {
      if (token) {
        setToken(token);
        console.log("setToken: ", token);
      } else {
        fetch("https://feedez.deno.dev/token")
          .then(req => req.json())
          .then(data => {
            if (Object.hasOwn(data, "token") && typeof data.token === 'string') {
              setToken(data.token);
              SecureStore.setItemAsync("token", data.token);
              console.log("data token: ", data.token);
            }
          })
      }
    });
  }, [])

  // Inisialisasi WebSocket di level layout
  useEffect(() => {
    if (!token) {
      const ws = new WebSocket("wss://feedez.deno.dev/ws/client");
      ws.onopen = () => {
        console.log("WebSocket connection opened");
      };
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          // Misalnya, periksa properti isOnline
          console.log(e.data)
          setData(data);
        } catch (err) {
          console.error("Error parsing WebSocket data:", err);
        }
      };
      ws.onerror = (e) => {
        console.error("WebSocket error:", e);
      };
      ws.onclose = (e) => {
        console.log("WebSocket connection closed:", e.code, e.reason);
      };
      setWs(ws);
      return () => {
        ws.close();
      };
    }
  }, [token]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
    const updateDateTime = () => {
      const now = new Date();
      const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      const day = dayNames[now.getDay()];
      const date = now.getDate();
      const month = monthNames[now.getMonth()];
      const year = now.getFullYear();
      const hoursStr = now.getHours().toString().padStart(2, '0');
      const minutesStr = now.getMinutes().toString().padStart(2, '0');
      const secondsStr = now.getSeconds().toString().padStart(2, '0');
      setDateInfo(`${day}, ${date} ${month} ${year}\n${hoursStr}:${minutesStr}:${secondsStr}`);
    };

    const intervalId = setInterval(updateDateTime, 1000);
    updateDateTime();
    return () => clearInterval(intervalId);
  }, [loaded]);

  NavigationBar.setBackgroundColorAsync('#e9f5e9');

  if (!loaded) {
    return null;
  }

  return (
    <WebSocketContext.Provider value={{ data, useCmd, token }}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={'dark-content'} backgroundColor={'#fff'} />
        <View style={styles.headerContainer}>
          <MyText style={styles.logo}>FeedEZ</MyText>
          <MyText style={styles.dateInfo}>{dateInfo}</MyText>
        </View>
        <Slot />
      </SafeAreaView>
    </WebSocketContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9f5e9',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    zIndex: 10,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5cb85c',
  },
  dateInfo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'right',
  },
});
