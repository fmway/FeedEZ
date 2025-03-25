import React, { useState } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MyText } from '@/components/MyText';

export default function DeviceListScreen() {
  const router = useRouter();
  const [devices, setDevices] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newDeviceId, setNewDeviceId] = useState('');

  const addDevice = () => {
    if (!newDeviceId.trim()) {
      Alert.alert('Error', 'Silakan masukkan ID alat.');
      return;
    }
    // Jika device sudah ada, jangan tambahkan lagi
    if (devices.includes(newDeviceId.trim())) {
      Alert.alert('Info', 'Device sudah terdaftar.');
      return;
    }
    setDevices(prev => [...prev, newDeviceId.trim()]);
    setNewDeviceId('');
    setModalVisible(false);
  };

  const openDashboard = (deviceId: string) => {
    // Navigasi ke dashboard khusus untuk device yang dipilih
    router.push(`/dashboard?deviceId=${deviceId}`);
  };

  const renderItem = ({ item }: { item: string }) => (
    <TouchableOpacity style={styles.deviceItem} onPress={() => openDashboard(item)}>
      <MyText style={styles.deviceText}>Alat ID: {item}</MyText>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <MyText style={styles.title}>Daftar Device</MyText>
      <FlatList
        data={devices}
        keyExtractor={(item) => item}
        renderItem={renderItem}
        ListEmptyComponent={
          <MyText style={styles.emptyText}>Belum ada device terdaftar.</MyText>
        }
        contentContainerStyle={devices.length === 0 && styles.emptyContainer}
      />
      {/* Tombol Plus */}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <MyText style={styles.addButtonText}>+</MyText>
      </TouchableOpacity>

      {/* Modal untuk memasukkan device ID */}
      <Modal transparent visible={modalVisible} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <MyText style={styles.modalTitle}>Masukkan ID Device</MyText>
            <TextInput
              style={styles.modalInput}
              placeholder="ID Device"
              placeholderTextColor="#999"
              value={newDeviceId}
              onChangeText={setNewDeviceId}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setNewDeviceId('');
                  setModalVisible(false);
                }}
              >
                <MyText style={styles.buttonText}>Batal</MyText>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={addDevice}>
                <MyText style={styles.buttonText}>Simpan</MyText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e9f5e9',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#5cb85c',
    textAlign: 'center',
    marginBottom: 20,
  },
  deviceItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  deviceText: {
    fontSize: 18,
    color: '#333',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  addButton: {
    backgroundColor: '#4CAF50',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 40,
    right: 20,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 32,
    lineHeight: 68,
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
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  modalInput: {
    width: '100%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
  },
  saveButton: {
    backgroundColor: '#5cb85c',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
