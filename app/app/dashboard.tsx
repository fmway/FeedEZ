import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Alert, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  Animated 
} from 'react-native';
import { Link } from 'expo-router';
import { MyText } from '@/components/MyText';

export default function DashboardScreen() {
  const [dateInfo, setDateInfo] = useState('');
  const [feedTime, setFeedTime] = useState('00:00');
  const [speedLevel, setSpeedLevel] = useState('Level 1');
  // Jadwal pakan: array of { hour, minute }
  const [schedules, setSchedules] = useState<{ hour: number; minute: number }[]>([]);
  // Durasi pemberian pakan (detik)
  const [duration, setDuration] = useState(0);
  // Indikator apakah pakan sedang berjalan (LED)
  const [isFeedingActive, setIsFeedingActive] = useState(false);
  // Simulasi status alat pakan
  const [deviceOnline, setDeviceOnline] = useState(true);

  // Update tanggal dan waktu setiap detik
  useEffect(() => {
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
  }, []);

  // Ambil data dari endpoint /settings
  useEffect(() => {
    fetch("https://feedez.deno.dev/settings")
      .then(response => response.json())
      .then(data => {
        // Data diharapkan: { schedules: [{ hour, minute }], speed: number, duration: number }
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
  }, []);

  // Hitung jadwal pakan selanjutnya
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

  // Cek status pakan setiap detik dan update indikator LED
  useEffect(() => {
    const checkFeedingStatus = () => {
      if (!deviceOnline) {
        setIsFeedingActive(false);
        return;
      }
      const now = new Date();
      let feedingActive = false;
      schedules.forEach(sch => {
        const scheduledTime = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          sch.hour,
          sch.minute
        );
        const feedEndTime = new Date(scheduledTime.getTime() + duration * 1000);
        if (now >= scheduledTime && now < feedEndTime) {
          feedingActive = true;
        }
      });
      setIsFeedingActive(feedingActive);
    };

    const intervalId = setInterval(checkFeedingStatus, 1000);
    return () => clearInterval(intervalId);
  }, [schedules, duration, deviceOnline]);

  const feedNow = () => {
    Alert.alert('Info', 'Pakan diberikan sekarang!');
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <MyText style={styles.logo}>FeedEZ</MyText>
        <MyText style={styles.dateInfo}>{dateInfo}</MyText>
      </View>
      {/* Main Content Container */}
      <View style={styles.mainContent}>
        <View style={styles.infoCard}>
          {/* LED Indicator di pojok kanan atas card */}
          <View style={styles.ledIndicatorContainer}>
            <View
              style={[
                styles.ledIndicator,
                { backgroundColor: isFeedingActive ? '#00FF00' : '#FF0000' },
              ]}
            />
          </View>
          <MyText style={styles.cardTitle}>Pakan Selanjutnya</MyText>
          <MyText style={styles.feedTime}>{feedTime}</MyText>
          <View style={styles.separator} />
          <MyText style={styles.cardTitle}>Speed</MyText>
          <MyText style={styles.speedText}>{speedLevel}</MyText>
          <TouchableOpacity style={[styles.button, styles.feedButton]} onPress={feedNow}>
            <MyText style={styles.buttonText}>Jalankan Sekarang</MyText>
          </TouchableOpacity>
        </View>
      </View>
      {/* Footer - Navigasi */}
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    top: -25,
    paddingBottom: 10,
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
    padding: 20,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  feedTime: {
    fontSize: 56,
    fontWeight: '700',
    marginVertical: 10,
    color: '#d9534f',
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
    padding: 15,
    marginVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  feedButton: {
    backgroundColor: '#d9534f',
  },
  navButton: {
    width: '40%',
    padding: 12,
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
