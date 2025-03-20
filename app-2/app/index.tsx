import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MyText } from '@/components/MyText';

export default function ConnectionScreen() {
  const router = useRouter();
  const [serial, setSerial] = useState('');
  const [password, setPassword] = useState('');
  const [connecting, setConnecting] = useState(false);

  const connectDevice = () => {
    if (!serial.trim()) {
      Alert.alert('Error', 'Silakan masukkan ID alat Anda.');
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
    setTimeout(() => {
      setConnecting(false);
      router.replace('/dashboard');
    }, 3000);
  };

  return (
    <View style={styles.container}>
      <MyText style={styles.title}>Login FeedEZ</MyText>

      <TextInput
        style={styles.input}
        placeholder="Masukkan ID"
        placeholderTextColor="#999"
        value={serial}
        onChangeText={setSerial}
      />

      <TextInput
        style={styles.input}
        placeholder="Masukkan password"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={[styles.button, styles.connectButton]} onPress={connectDevice}>
        <MyText style={styles.buttonText}>Hubungkan Alat</MyText>
      </TouchableOpacity>

      <Modal transparent visible={connecting}>
        <View style={styles.overlay}>
          <MyText style={styles.overlayText}>Menghubungkan...</MyText>
        </View>
      </Modal>
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
    height: 50,  // Pastikan cukup tinggi
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 10,
    fontFamily: 'Poppins',
    paddingHorizontal: 15, 
    backgroundColor: '#fff',
    fontSize: 16,
    lineHeight: 22,  // Agar teks tidak terpotong
    textAlignVertical: 'center', // Untuk Android
    paddingVertical: 12, // Tambahkan padding agar teks tidak kepotong
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
