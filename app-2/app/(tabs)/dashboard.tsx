import React, { useState, useEffect } from 'react';
import { View, Text, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const router = useRouter();
  const [dateInfo, setDateInfo] = useState('');
  const [feedTime, setFeedTime] = useState('14:00');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const dayNames = ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"];
      const monthNames = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
      const day = dayNames[now.getDay()];
      const date = now.getDate();
      const month = monthNames[now.getMonth()];
      const year = now.getFullYear();
      let hours = now.getHours();
      let minutes = now.getMinutes();
      let seconds = now.getSeconds();
      if (hours < 10) hours = Number("0" + hours);
      if (minutes < 10) minutes = Number("0" + minutes);
      if (seconds < 10) seconds = Number("0" + seconds);

      setDateInfo(`${day}, ${date} ${month} ${year}\n${hours}:${minutes}:${seconds}`);
    };

    const intervalId = setInterval(updateDateTime, 1000);
    updateDateTime();
    return () => clearInterval(intervalId);
  }, []);

  const feedNow = () => {
    Alert.alert('Info', 'Pakan diberikan sekarang!');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>FeedEZ</Text>
      <View style={styles.dateInfoContainer}>
        <Text style={styles.dateInfo}>{dateInfo}</Text>
      </View>
      <Text style={styles.title}>Pakan Selanjutnya</Text>
      <Text style={styles.feedTime}>{feedTime}</Text>

      <TouchableOpacity style={[styles.button, styles.feedButton]} onPress={feedNow}>
        <Text style={styles.buttonText}>Jalankan Sekarang</Text>
      </TouchableOpacity>

      {/* Pindah ke /schedule */}
      <TouchableOpacity
        style={[styles.button, styles.scheduleButton]}
        onPress={() => router.push('/(tabs)/schedule')}
      >
        <Text style={styles.buttonText}>Lihat Jadwal</Text>
      </TouchableOpacity>

      {/* Pindah ke /settings */}
      <TouchableOpacity
        style={[styles.button, styles.settingsButton]}
        onPress={() => router.push('/(tabs)/settings')}
      >
        <Text style={styles.buttonText}>Pengaturan</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9f5e9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    position: 'absolute',
    top: 10,
    left: 10,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#5cb85c',
  },
  dateInfoContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 12,
  },
  dateInfo: {
    color: '#fff',
    textAlign: 'right',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 10,
    textAlign: 'center',
  },
  feedTime: {
    fontSize: 48,
    fontWeight: '700',
    marginVertical: 20,
  },
  button: {
    width: '80%',
    padding: 15,
    marginVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  feedButton: {
    backgroundColor: '#d9534f',
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
  },
});
