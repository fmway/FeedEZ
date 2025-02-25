import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function ConnectionScreen() {
  const router = useRouter();

  const [serial, setSerial] = useState('');
  const [password, setPassword] = useState('');
  const [connecting, setConnecting] = useState(false);

  const connectDevice = () => {
    if (!serial.trim()) {
      Alert.alert('Error', 'Silakan masukkan serial number alat Anda.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Error', 'Silakan masukkan password untuk alat Anda.');
      return;
    }
    if (password !== '1234') {
      Alert.alert('Error', 'Password salah!');
      return;
    }
    setConnecting(true);

    // Setelah 3 detik, ganti rute ke "/dashboard"
    setTimeout(() => {
      setConnecting(false);
      router.replace('/dashboard');
    }, 3000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Masukkan Serial Number Alat Anda</Text>
      <TextInput
        style={styles.input}
        placeholder="Contoh: FEEDER123"
        value={serial}
        onChangeText={setSerial}
      />
      <TextInput
        style={styles.input}
        placeholder="Masukkan password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={[styles.button, styles.connectButton]} onPress={connectDevice}>
        <Text style={styles.buttonText}>Hubungkan Alat</Text>
      </TouchableOpacity>

      <Modal transparent visible={connecting}>
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>Menghubungkan...</Text>
        </View>
      </Modal>
    </View>
  );
}

// Contoh style
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9f5e9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayText: {
    fontSize: 24,
    color: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 10,
    textAlign: 'center',
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#fff',
  },
  button: {
    width: '80%',
    padding: 15,
    marginVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  connectButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
