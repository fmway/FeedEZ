import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  const [currentSpeed, setCurrentSpeed] = useState<number>(1);

  const saveSettings = () => {
    Alert.alert('Info', `Pengaturan disimpan! Kecepatan pelontar: Level ${currentSpeed}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pengaturan Pelontar Pakan</Text>
      <Text>Pilih kecepatan pelontar:</Text>

      <View style={styles.speedContainer}>
        <TouchableOpacity
          style={styles.arrowButton}
          onPress={() => setCurrentSpeed(Math.max(1, currentSpeed - 1))}
        >
          <Text style={styles.arrowButtonText}>◀</Text>
        </TouchableOpacity>

        <Text style={styles.speedDisplay}>Level {currentSpeed}</Text>

        <TouchableOpacity
          style={styles.arrowButton}
          onPress={() => setCurrentSpeed(Math.min(5, currentSpeed + 1))}
        >
          <Text style={styles.arrowButtonText}>▶</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.button, styles.settingsButton]} onPress={saveSettings}>
        <Text style={styles.buttonText}>Simpan Pengaturan</Text>
      </TouchableOpacity>

      {/* Kembali ke halaman sebelumnya */}
      <TouchableOpacity style={[styles.button, styles.settingsButton]} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Kembali</Text>
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
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 10,
    textAlign: 'center',
  },
  speedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  arrowButton: {
    backgroundColor: 'orange',
    padding: 10,
    borderRadius: 25,
    marginHorizontal: 20,
  },
  arrowButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  speedDisplay: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    width: '80%',
    padding: 15,
    marginVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  settingsButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
