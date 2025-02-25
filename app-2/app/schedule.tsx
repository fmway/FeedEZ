import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';

interface ScheduleItem {
  day: string;
  pagi: string;
  siang: string;
  malam: string;
}

// Data awal
const initialSchedule: ScheduleItem[] = [
  { day: 'Senin',  pagi: '08:00', siang: '14:00', malam: '20:00' },
  { day: 'Selasa', pagi: '08:00', siang: '14:00', malam: '20:00' },
  { day: 'Rabu',   pagi: '08:00', siang: '14:00', malam: '20:00' },
  { day: 'Kamis',  pagi: '08:00', siang: '14:00', malam: '20:00' },
  { day: 'Jumat',  pagi: '08:00', siang: '14:00', malam: '20:00' },
  { day: 'Sabtu',  pagi: '08:00', siang: '14:00', malam: '20:00' },
  { day: 'Minggu', pagi: '08:00', siang: '14:00', malam: '20:00' },
];

export default function ScheduleScreen() {
  const router = useRouter();

  // State untuk data jadwal
  const [schedule, setSchedule] = useState<ScheduleItem[]>(initialSchedule);
  // Mode edit
  const [isEditing, setIsEditing] = useState(false);
  // Menyimpan status “dicentang” per baris
  const [selectedRows, setSelectedRows] = useState<{ [index: number]: boolean }>({});

  // Toggle antara Edit Jadwal dan Simpan Jadwal
  const toggleEditSchedule = () => {
    if (isEditing) {
      Alert.alert('Info', 'Jadwal telah diperbarui!');
    }
    setIsEditing(!isEditing);
  };

  // Fungsi mengupdate satu sel (pagi/siang/malam) pada baris tertentu
  const updateTime = (dayIndex: number, meal: 'pagi' | 'siang' | 'malam', newTime: string) => {
    setSchedule((prev) =>
      prev.map((item, idx) => {
        if (idx === dayIndex) {
          return { ...item, [meal]: newTime };
        }
        return item;
      })
    );
  };

  // Toggle centang baris
  const toggleSelectRow = (index: number) => {
    setSelectedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Cek All: jika semua sudah dicentang, maka uncheck semua. Jika belum semua, check semua.
  const toggleSelectAll = () => {
    const allSelected = schedule.every((_, idx) => selectedRows[idx]);
    if (allSelected) {
      // Uncheck all
      setSelectedRows({});
    } else {
      // Check all
      const newSelection: { [index: number]: boolean } = {};
      schedule.forEach((_, idx) => {
        newSelection[idx] = true;
      });
      setSelectedRows(newSelection);
    }
  };

  // Render satu baris dalam tabel
  const renderTableRow = (item: ScheduleItem, index: number) => {
    return (
      <View style={styles.tableRow} key={item.day}>
        {/* Kolom Hari */}
        <Text style={styles.tableCell}>{item.day}</Text>

        {/* Kolom Pagi */}
        {isEditing ? (
          <TextInput
            style={styles.tableCellInput}
            value={item.pagi}
            onChangeText={(text) => {
              // Jika baris dicentang, sinkron ke baris lain yang juga dicentang
              if (selectedRows[index]) {
                setSchedule((prev) =>
                  prev.map((rowItem, rowIdx) => {
                    if (selectedRows[rowIdx]) {
                      return { ...rowItem, pagi: text };
                    }
                    return rowItem;
                  })
                );
              } else {
                updateTime(index, 'pagi', text);
              }
            }}
          />
        ) : (
          <Text style={styles.tableCell}>{item.pagi}</Text>
        )}

        {/* Kolom Siang */}
        {isEditing ? (
          <TextInput
            style={styles.tableCellInput}
            value={item.siang}
            onChangeText={(text) => {
              if (selectedRows[index]) {
                setSchedule((prev) =>
                  prev.map((rowItem, rowIdx) => {
                    if (selectedRows[rowIdx]) {
                      return { ...rowItem, siang: text };
                    }
                    return rowItem;
                  })
                );
              } else {
                updateTime(index, 'siang', text);
              }
            }}
          />
        ) : (
          <Text style={styles.tableCell}>{item.siang}</Text>
        )}

        {/* Kolom Malam */}
        {isEditing ? (
          <TextInput
            style={styles.tableCellInput}
            value={item.malam}
            onChangeText={(text) => {
              if (selectedRows[index]) {
                setSchedule((prev) =>
                  prev.map((rowItem, rowIdx) => {
                    if (selectedRows[rowIdx]) {
                      return { ...rowItem, malam: text };
                    }
                    return rowItem;
                  })
                );
              } else {
                updateTime(index, 'malam', text);
              }
            }}
          />
        ) : (
          <Text style={styles.tableCell}>{item.malam}</Text>
        )}
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Jadwal Pakan</Text>

      {/* Tabel: Hanya kolom Hari, Pagi, Siang, Malam */}
      <View style={styles.table}>
        {/* Header */}
        <View style={styles.tableRowHeader}>
          <Text style={styles.tableHeaderCell}>Hari</Text>
          <Text style={styles.tableHeaderCell}>Pagi</Text>
          <Text style={styles.tableHeaderCell}>Siang</Text>
          <Text style={styles.tableHeaderCell}>Malam</Text>
        </View>

        {/* Body */}
        {schedule.map((item, index) => renderTableRow(item, index))}
      </View>

      {/* Checkbox di luar tabel, hanya tampil saat edit */}
      {isEditing && (
        <View style={styles.checkboxContainer}>
          {/* Tombol “Cek All” */}
          <View style={styles.checkboxHeader}>
            <Text style={{ fontWeight: 'bold', marginRight: 10 }}>Pilih Baris:</Text>
            <TouchableOpacity style={styles.checkAllButton} onPress={toggleSelectAll}>
              <Text style={styles.checkAllButtonText}>Cek All</Text>
            </TouchableOpacity>
          </View>

          {/* Daftar checkbox per baris */}
          {schedule.map((item, index) => (
            <View key={item.day} style={styles.checkboxRow}>
              <TouchableOpacity
                style={[styles.checkButton, selectedRows[index] && styles.checkButtonChecked]}
                onPress={() => toggleSelectRow(index)}
              >
                <Text style={styles.checkButtonText}>{selectedRows[index] ? '✓' : ''}</Text>
              </TouchableOpacity>
              <Text style={styles.checkboxLabel}>{item.day}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Tombol Edit / Simpan */}
      <TouchableOpacity style={[styles.button, styles.editButton]} onPress={toggleEditSchedule}>
        <Text style={styles.buttonText}>{isEditing ? 'Simpan Jadwal' : 'Edit Jadwal'}</Text>
      </TouchableOpacity>

        {/* Tombol Kembali */}
        <TouchableOpacity
        style={[styles.button, styles.settingsButton]}
        onPress={() => {
          // Jika sedang edit, matikan edit agar “kembali” ke tampilan lihat jadwal
          if (isEditing) {
            setIsEditing(false);
          } else {
            // Jika tidak edit, kembali ke screen sebelumnya
            router.back();
          }
        }}
      >
        <Text style={styles.buttonText}>Kembali</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ====================== StyleSheet ======================
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#e9f5e9',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 10,
    textAlign: 'center',
  },

  // Tabel
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    marginVertical: 10,
  },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#5cb85c',
  },
  tableHeaderCell: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    textAlign: 'center',
  },
  tableCellInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 8,
    textAlign: 'center',
    backgroundColor: '#fff',
  },

  // Bagian checkbox di luar tabel
  checkboxContainer: {
    width: '100%',
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
  },
  checkboxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    paddingHorizontal: 10,
  },
  checkAllButton: {
    backgroundColor: '#5cb85c',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
  },
  checkAllButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
    paddingHorizontal: 10,
  },
  checkButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#5cb85c',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkButtonChecked: {
    backgroundColor: '#5cb85c',
  },
  checkButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  checkboxLabel: {
    fontSize: 16,
  },

  // Tombol
  button: {
    width: '80%',
    padding: 15,
    marginVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#f0ad4e',
  },
  settingsButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
