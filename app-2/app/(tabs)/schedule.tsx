import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  FlatList
} from 'react-native';
import { useRouter } from 'expo-router';

interface ScheduleItem {
  day: string;
  pagi: string;
  siang: string;
  malam: string;
}

const initialSchedule: ScheduleItem[] = [
  { day: 'Senin',  pagi: '08:00', siang: '14:00', malam: '20:00' },
  { day: 'Selasa', pagi: '08:00', siang: '14:00', malam: '20:00' },
  // ...
];

export default function ScheduleScreen() {
  const router = useRouter();
  const [schedule, setSchedule] = useState<ScheduleItem[]>(initialSchedule);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRows, setSelectedRows] = useState<{ [index: number]: boolean }>({});

  const toggleEditSchedule = () => {
    if (isEditing) {
      Alert.alert('Info', 'Jadwal telah diperbarui!');
    }
    setIsEditing(!isEditing);
  };

  const updateTime = (dayIndex: number, meal: 'pagi' | 'siang' | 'malam', newTime: string) => {
    setSchedule((prev) =>
      prev.map((item, idx) => {
        if (idx === dayIndex) return { ...item, [meal]: newTime };
        return item;
      })
    );
  };

  const toggleSelectRow = (index: number) => {
    setSelectedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const renderItem = ({ item, index }: { item: ScheduleItem; index: number }) => (
    <View style={styles.scheduleRow}>
      <TouchableOpacity
        onPress={() => toggleSelectRow(index)}
        style={[styles.checkButton, selectedRows[index] && styles.checkButtonChecked]}
      >
        <Text style={styles.checkButtonText}>{selectedRows[index] ? '✓' : ''}</Text>
      </TouchableOpacity>

      <Text style={styles.scheduleCell}>{item.day}</Text>
      {['pagi','siang','malam'].map((meal) =>
        isEditing ? (
          <TextInput
            key={meal}
            style={styles.scheduleInput}
            value={item[meal as keyof ScheduleItem]}
            onChangeText={(text) => {
              if (selectedRows[index]) {
                // Sinkron ke row lain yang dicentang
                setSchedule((prev) =>
                  prev.map((rowItem, rowIndex) => {
                    if (selectedRows[rowIndex]) {
                      return { ...rowItem, [meal]: text };
                    }
                    return rowItem;
                  })
                );
              } else {
                updateTime(index, meal as 'pagi' | 'siang' | 'malam', text);
              }
            }}
          />
        ) : (
          <Text key={meal} style={styles.scheduleCell}>
            {item[meal as keyof ScheduleItem]}
          </Text>
        )
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jadwal Pakan</Text>

      <View style={styles.scheduleHeader}>
        <Text style={[styles.scheduleCell, { flex: 0.5 }]}></Text>
        <Text style={styles.scheduleCell}>Hari</Text>
        <Text style={styles.scheduleCell}>Pagi</Text>
        <Text style={styles.scheduleCell}>Siang</Text>
        <Text style={styles.scheduleCell}>Malam</Text>
      </View>

      <FlatList
        data={schedule}
        keyExtractor={(item) => item.day}
        renderItem={renderItem}
      />

      <TouchableOpacity style={[styles.button, styles.editButton]} onPress={toggleEditSchedule}>
        <Text style={styles.buttonText}>{isEditing ? 'Simpan Jadwal' : 'Edit Jadwal'}</Text>
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
  scheduleHeader: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 10,
    justifyContent: 'space-around',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'space-around',
    marginVertical: 5,
  },
  scheduleCell: {
    flex: 1,
    textAlign: 'center',
  },
  scheduleInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    textAlign: 'center',
    padding: 5,
    marginHorizontal: 2,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 10,
    textAlign: 'center',
  },
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
  checkButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#5cb85c',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  checkButtonChecked: {
    backgroundColor: '#5cb85c',
  },
  checkButtonText: {
    color: '#fff',
  },
});
