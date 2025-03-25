import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
  Button,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { Setting } from '@/constants/model';

export default function SettingsScreen() {
  const router = useRouter();
  const [currentSpeed, setCurrentSpeed] = useState<number>(1);
  // Default 6 menit = 360 detik
  const [duration, setDuration] = useState<number>(360);
  const [isPickerVisible, setPickerVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('');

  // State untuk custom duration picker
  const [selectedMinutes, setSelectedMinutes] = useState<number>(Math.floor(duration / 60));
  const [selectedSeconds, setSelectedSeconds] = useState<number>(duration % 60);

  useEffect(() => {
    fetch("https://feedez.deno.dev/settings")
      .then(x => x.json())
      .then(x => {
        const setting = x as Setting;
        setCurrentSpeed(setting.speed);
        setDuration(setting.duration);
        setSelectedMinutes(Math.floor(setting.duration / 60));
        setSelectedSeconds(setting.duration % 60);
        setTimeout(() => setLoading(false), 750);
      });
  }, []);

  // Efek Loading Per Huruf (Typing Effect)
  useEffect(() => {
    const text = "Loading...";
    let index = 0;
    const interval = setInterval(() => {
      setLoadingText(text.slice(0, index + 1));
      index++;
      if (index === text.length) {
        index = 0; // Reset untuk looping efek
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const showPicker = () => setPickerVisible(true);
  const hidePicker = () => setPickerVisible(false);

  // Konfirmasi pilihan durasi dari Picker
  const handleConfirm = () => {
    const totalSeconds = selectedMinutes * 60 + selectedSeconds;
    setDuration(totalSeconds);
    hidePicker();
  };

  const saveSettings = () => {
    Alert.alert(
      'Info',
      `Pengaturan disimpan!\nKecepatan pelontar: Level ${currentSpeed}\nDurasi pemberian pakan: ${formatTime(duration)}`
    );
    onSubmit();
  };

  const onSubmit = async () => {
    const request = await fetch('https://feedez.deno.dev/settings', {
      headers: {
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        duration,
        speed: currentSpeed,
      }),
      method: 'POST',
    });
    const respons = await request.json();
    console.log(respons);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pengaturan Pelontar Pakan</Text>

      <Text style={styles.label}>Pilih kecepatan pelontar:</Text>
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

      <Text style={styles.label}>Durasi pemberian pakan (mm:ss):</Text>
      <TouchableOpacity style={styles.durationDisplay} onPress={showPicker}>
        <Text style={styles.durationText}>{formatTime(duration)}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.settingsButton]} onPress={saveSettings}>
        <Text style={styles.buttonText}>Simpan Pengaturan</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.settingsButton]} onPress={() => router.back()}>
        <Text style={styles.buttonText}>Kembali</Text>
      </TouchableOpacity>

      {/* Modal kustom untuk memilih durasi */}
      <Modal transparent visible={isPickerVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pilih Durasi (mm:ss)</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedMinutes}
                style={styles.picker}
                onValueChange={(itemValue) => setSelectedMinutes(itemValue)}
              >
                {Array.from({ length: 61 }, (_, i) => i).map((num) => (
                  <Picker.Item key={num} label={num.toString()} value={num} />
                ))}
              </Picker>
              <Text style={styles.separator}>:</Text>
              <Picker
                selectedValue={selectedSeconds}
                style={styles.picker}
                onValueChange={(itemValue) => setSelectedSeconds(itemValue)}
              >
                {Array.from({ length: 60 }, (_, i) => i).map((num) => (
                  <Picker.Item key={num} label={num.toString()} value={num} />
                ))}
              </Picker>
            </View>
            <View style={styles.modalButtons}>
              <Button title="Batal" onPress={hidePicker} />
              <Button title="OK" onPress={handleConfirm} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Loading dengan Efek Mengetik */}
      <Modal transparent visible={loading}>
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>{loadingText}</Text>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  picker: {
    width: 100,
    height: 150,
  },
  separator: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%',
    justifyContent: 'space-around',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 10,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginTop: 10,
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
  durationDisplay: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginVertical: 20,
    backgroundColor: '#f0f0f0',
  },
  durationText: {
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