import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Button,
  ScrollView,
  TextInput,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { MyText } from '@/components/MyText';
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

  // State untuk feedback saat saving
  const [saving, setSaving] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current; // nilai dari 0 sampai 1

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

  // Feedback saving menggunakan progress bar animasi
  const saveSettings = () => {
    setSaving(true);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start(() => {
      onSubmit();
      setSaving(false);
      progressAnim.setValue(0);
    });
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
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.card}>
        <MyText style={styles.title}>Pengaturan Pelontar Pakan</MyText>

        <MyText style={styles.label}>Pilih kecepatan pelontar:</MyText>
        <View style={styles.speedContainer}>
          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() => setCurrentSpeed(Math.max(1, currentSpeed - 1))}
          >
            <Text style={styles.arrowButtonText}>◀</Text>
          </TouchableOpacity>

          <MyText style={styles.speedDisplay}>Level {currentSpeed}</MyText>

          <TouchableOpacity
            style={styles.arrowButton}
            onPress={() => setCurrentSpeed(Math.min(5, currentSpeed + 1))}
          >
            <Text style={styles.arrowButtonText}>▶</Text>
          </TouchableOpacity>
        </View>

        <MyText style={styles.label}>Durasi pemberian pakan (mm:ss):</MyText>
        <TouchableOpacity style={styles.durationDisplay} onPress={showPicker}>
          <MyText style={styles.durationText}>{formatTime(duration)}</MyText>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.saveButton]} onPress={saveSettings}>
          <MyText style={styles.buttonText}>Simpan Pengaturan</MyText>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.backButton]} onPress={() => router.back()}>
          <MyText style={styles.buttonText}>Kembali</MyText>
        </TouchableOpacity>

        {/* Progress Bar Feedback */}
        {saving && (
          <View style={styles.progressContainer}>
            <Animated.View
              style={[
                styles.progressBar,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          </View>
        )}
      </View>

      {/* Modal kustom untuk memilih durasi */}
      <Modal transparent visible={isPickerVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MyText style={styles.modalTitle}>Pilih Durasi (mm:ss)</MyText>
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
              <MyText style={styles.separator}>:</MyText>
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
      <Modal transparent visible={loading} animationType="fade">
        <View style={styles.overlay}>
          <MyText style={styles.overlayText}>{loadingText}</MyText>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#e9f5e9',
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#5cb85c',
    marginBottom: 15,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  speedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginVertical: 20,
    width: '100%',
  },
  arrowButton: {
    backgroundColor: '#f0ad4e',
    padding: 12,
    borderRadius: 30,
    width: 50,
    alignItems: 'center',
  },
  arrowButtonText: {
    fontSize: 24,
    color: '#fff',
  },
  speedDisplay: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#555',
  },
  durationDisplay: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f7f7f7',
    marginVertical: 20,
    alignItems: 'center',
  },
  durationText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#d9534f',
  },
  button: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  saveButton: {
    backgroundColor: '#5cb85c',
  },
  backButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
    borderRadius: 12,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
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
    color: '#333',
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
  progressContainer: {
    marginTop: 20,
    width: '100%',
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#5cb85c',
  },
});
