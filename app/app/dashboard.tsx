import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Alert,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Link } from 'expo-router';
import { MyText } from '@/components/MyText';
import { useWebSocket } from './_layout';

const FEED_START_TIME_KEY = 'feedStartTime';

export default function DashboardScreen() {
  const [feedTime, setFeedTime] = useState('00:00');
  const [speedLevel, setSpeedLevel] = useState('Level 1');
  const [schedules, setSchedules] = useState<{ hour: number; minute: number }[]>([]);
  const [duration, setDuration] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [feedStartTime, setFeedStartTime] = useState<number | null>(null);
  const { data, useCmd } = useWebSocket();

  const rippleAnim = useRef(new Animated.Value(0)).current;
  const bgColorAnim = useRef(new Animated.Value(0)).current;
  const statusAnim = useRef(new Animated.Value(0)).current;

  const fetchData = () => {
    fetch("https://feedez.deno.dev/settings")
      .then(response => response.json())
      .then(data => {
        if (data) {
          if (data.schedules) {
            setSchedules(data.schedules);
          }
          if (data.speed !== undefined) {
            setSpeedLevel(`Level ${data.speed}`);
          }
          if (data.duration !== undefined) {
            setDuration(data.duration);
          }
        }
      })
      .catch(err => console.error("Error fetching settings:", err));
  };

  // Ambil feedStartTime yang tersimpan saat mount
  useEffect(() => {
    const loadFeedStartTime = async () => {
      try {
        const storedTime = await AsyncStorage.getItem(FEED_START_TIME_KEY);
        if (storedTime) {
          setFeedStartTime(Number(storedTime));
        }
      } catch (err) {
        console.error("Error loading feed start time:", err);
      }
    };
    loadFeedStartTime();
    fetchData();
    useCmd((ws) => {
      ws.send(JSON.stringify({ cmd: "getStatusRun" }));
    });
  }, []);

  useEffect(() => {
    if (data && Object.hasOwn(data, "cmd") && typeof data.cmd === 'string') {
      if (data.cmd === "refresh") {
        fetchData();
      }
    }
    if (data && Object.hasOwn(data, "isOnline") && typeof data.isOnline === 'boolean') {
      Animated.timing(statusAnim, {
        toValue: data.isOnline ? 1 : 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [data]);

  useEffect(() => {
    const updateNextFeedTime = () => {
      if (schedules.length === 0) {
        setFeedTime("00:00");
        return;
      }
      const now = new Date();
      let candidate: Date | null = null;
      schedules.forEach(sch => {
        const candidateTime = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          sch.hour,
          sch.minute
        );
        if (candidateTime > now) {
          if (candidate === null || candidateTime < candidate) {
            candidate = candidateTime;
          }
        }
      });
      if (candidate === null) {
        const sorted = [...schedules].sort((a, b) => {
          if (a.hour === b.hour) return a.minute - b.minute;
          return a.hour - b.hour;
        });
        const earliest = sorted[0];
        candidate = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1,
          earliest.hour,
          earliest.minute
        );
      }
      const hoursStr = candidate.getHours().toString().padStart(2, "0");
      const minutesStr = candidate.getMinutes().toString().padStart(2, "0");
      setFeedTime(`${hoursStr}:${minutesStr}`);
    };

    updateNextFeedTime();
    const intervalId = setInterval(updateNextFeedTime, 1000);
    return () => clearInterval(intervalId);
  }, [schedules]);

  // Hitung countdown berdasarkan feedStartTime yang tersimpan
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (data && data.isOnline) {
      let timeout = data.timeout! as number;
      timer = setInterval(() => {
        if (timeout <= 0) {
          setRemainingTime(0);
          clearInterval(timer!);
        } else {
          setRemainingTime(timeout);
          timeout--;
        }
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [data, feedStartTime, duration]);

  const feedNow = () => {
    if (data && data.isOnline) {
      useCmd((ws) => {
        ws.send(JSON.stringify({ cmd: "stop" }));
      });
      // Alert.alert('Info', 'Pakan dihentikan!');
    } else {
      // Alert.alert('Info', 'Pakan diberikan sekarang!');
      useCmd((ws) => {
        ws.send(JSON.stringify({ cmd: "start" }));
      });
      // Set feedStartTime saat pakan dimulai
      const now = Date.now();
      setFeedStartTime(now);
      AsyncStorage.setItem(FEED_START_TIME_KEY, now.toString()).catch(err =>
        console.error("Error storing feed start time:", err)
      );
    }
  };

  useEffect(() => {
    if (data && Object.hasOwn(data, "isOnline") && data.isOnline) {
      Animated.parallel([
        Animated.timing(rippleAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bgColorAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(rippleAnim, {
          toValue: 0,
          duration: 500,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(bgColorAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [data, rippleAnim, bgColorAnim]);

  const cardBackgroundColor = bgColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgb(255, 222, 222)', 'rgb(220, 255, 209)'],
  });

  const rippleScale = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 4],
  });
  const rippleOpacity = rippleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0],
  });

  const formatCountdown = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.mainContent}>
        <Animated.View style={[styles.infoCard, { backgroundColor: cardBackgroundColor }]}>
          <Animated.View
            style={[
              styles.ripple,
              {
                transform: [{ scale: rippleScale }],
                opacity: rippleOpacity,
              },
            ]}
          />
          <View style={styles.ledIndicatorContainer}>
            <View
              style={[
                styles.ledIndicator,
                { backgroundColor: data && data.isOnline ? '#00FF00' : '#FF0000' },
              ]}
            />
          </View>
          <View style={styles.feedInfoContainer}>
  <MyText style={styles.cardTitle}>
    {data && data.isOnline ? "Pakan Sedang Diberikan" : "Pakan Selanjutnya"}
  </MyText>
  <MyText style={styles.feedTime}>
    {data && data.isOnline ? (remainingTime) : feedTime}
  </MyText>
</View>

          <View style={styles.separator} />
          <MyText style={styles.cardTitle}>Speed</MyText>
          <MyText style={styles.speedText}>{speedLevel}</MyText>
          <TouchableOpacity style={[styles.button, styles.feedButton]} onPress={feedNow}>
            <MyText style={styles.buttonText}>
              {data && data.isOnline ? "Berhenti" : "Jalankan Sekarang"}
            </MyText>
          </TouchableOpacity>
        </Animated.View>
      </View>
      <View style={styles.footerContainer}>
        <Link href={"/schedule"} style={[styles.navButton, styles.scheduleButton]}>
          <MyText style={styles.buttonText}>Lihat Jadwal</MyText>
        </Link>
        <Link href="/settings" style={[styles.navButton, styles.settingsButton]}>
          <MyText style={styles.buttonText}>Pengaturan</MyText>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#e9f5e9',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  footerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    width: '100%',
    borderRadius: 16,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  ripple: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#00FF00',
    top: 10,
    right: 10,
  },
  ledIndicatorContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  ledIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  feedInfoContainer: {
    alignItems: 'center',
  },
  statusContainer: {
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  feedTime: {
    fontSize: 54,
    fontWeight: '700',
    color: '#d9534f',
    textAlign: 'center',
    marginVertical: 5,
  },
  statusText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#5cb85c',
    textAlign: 'center',
    marginBottom: 5,
  },
  countdownText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgb(0, 0, 0)',
    textAlign: 'center',
  },
  speedText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6c757d',
    marginVertical: 5,
  },
  separator: {
    width: '60%',
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 15,
  },
  button: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  feedButton: {
    backgroundColor: '#d9534f',
  },
  navButton: {
    width: '40%',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  scheduleButton: {
    backgroundColor: '#5cb85c',
  },
  settingsButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
