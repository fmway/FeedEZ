import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { DateTimePickerAndroid, DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';

// Fungsi untuk membagi array jadi chunk berukuran 'size'
function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export default function ScheduleScreen() {
  const router = useRouter();

  // times: array jam, misalnya ["08:00", "14:00", "20:00", ...]
  const [times, setTimes] = useState<string[]>(["00:00", "00:00", "00:00"]);
  const [isEditing, setIsEditing] = useState(false);
  const [schedule, setSchedule] = useState<{ hour: number, minute: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('');

  useEffect(() => {
    fetch("https://feedez.deno.dev/settings")
    .then(x => x.json())
    .then(x => {
      if (x.schedules) {
        setSchedule(x.schedules as { hour: number, minute: number }[]);
        setTimeout(() => setLoading(false), 750);
      }
      console.log(x)
    })
  }, [])

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

  useEffect(() => {
    setTimes(schedule.map(x => `${String(x.hour).padStart(2, "0")}:${String(x.minute).padStart(2, "0")}`))
  }, [schedule])

  const CHUNK_SIZE = 4;

  const toggleEditSchedule = () => {
    if (isEditing) {
      fetch("https://feedez.deno.dev/settings", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schedules: times.map(x => {
            const [ hour, minute ] = x.split(":").map(y => parseInt(y));
            return { hour, minute }
          })
        })
      })
      .then(x => x.json())
      .then(x => {
        Alert.alert("Info", "Jadwal telah diperbarui!");
      })
    }
    setIsEditing(!isEditing);
  };

  const addNewSchedule = () => {
    setTimes(prev => [...prev, "00:00"]);
  };

  const removeSchedule = (colIndex: number) => {
    Alert.alert(
      "Konfirmasi",
      `Hapus Jadwal ${colIndex + 1}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya, Hapus",
          style: "destructive",
          onPress: () => {
            setTimes(prev => {
              const newTimes = [...prev];
              newTimes.splice(colIndex, 1);
              return newTimes;
            });
          },
        },
      ]
    );
  };

  const updateTime = (colIndex: number, newTime: string) => {
    setTimes(prev => {
      const newTimes = [...prev];
      newTimes[colIndex] = newTime;
      return newTimes;
    });
  };

  const chunkedTimes = chunkArray(times, CHUNK_SIZE);

  const renderHeaderRow = (chunk: string[], rowIndex: number) => {
    return (
      <View key={`header-row-${rowIndex}`} style={styles.headerRow}>
        {chunk.map((_, i) => {
          const colIndex = rowIndex * CHUNK_SIZE + i;
          if (isEditing) {
            return (
              <View key={`header-${colIndex}`} style={styles.headerCellWithDelete}>
                <Text style={styles.headerText}>Jadwal {colIndex + 1}</Text>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => removeSchedule(colIndex)}
                >
                  <Text style={styles.deleteButtonText}>X</Text>
                </TouchableOpacity>
              </View>
            );
          } else {
            return (
              <Text key={`header-${colIndex}`} style={styles.headerCell}>
                Jadwal {colIndex + 1}
              </Text>
            );
          }
        })}
      </View>
    );
  };

  const renderDataRow = (chunk: string[], rowIndex: number) => {
    return (
      <View key={`data-row-${rowIndex}`} style={styles.dataRow}>
        {chunk.map((time, i) => {
          const colIndex = rowIndex * CHUNK_SIZE + i;

          const showTimePicker = () => {
            DateTimePickerAndroid.open({
              value: new Date(),
              mode: "time",
              is24Hour: true,
              onChange: (event: DateTimePickerEvent, selectedDate?: Date) => {
                // Hanya update waktu jika pengguna klik OK (event.type === 'set')
                if (event.type === 'set' && selectedDate) {
                  const hours = selectedDate.getHours().toString().padStart(2, "0");
                  const minutes = selectedDate.getMinutes().toString().padStart(2, "0");
                  updateTime(colIndex, `${hours}:${minutes}`);
                }
                // Jika event.type === 'dismissed', jangan update waktu
              },
            });
          };

          if (isEditing) {
            return (
              <TouchableOpacity
                key={`time-${colIndex}`}
                style={styles.cellInput}
                onPress={showTimePicker}
              >
                <Text style={{ textAlign: "center" }}>{time}</Text>
              </TouchableOpacity>
            );
          } else {
            return (
              <Text key={`time-${colIndex}`} style={styles.cell}>
                {time}
              </Text>
            );
          }
        })}
      </View>
    );
  };

  const renderTable = () => {
    return (
      <View style={styles.table}>
        {chunkedTimes.map((chunk, rowIndex) => {
          return (
            <View key={`table-row-${rowIndex}`}>
              {renderHeaderRow(chunk, rowIndex)}
              {renderDataRow(chunk, rowIndex)}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jadwal Pakan</Text>

      {isEditing && (
        <TouchableOpacity style={styles.addButton} onPress={addNewSchedule}>
          <Text style={styles.addButtonText}>+ Tambah Jadwal</Text>
        </TouchableOpacity>
      )}

      {renderTable()}

      <TouchableOpacity style={[styles.button, styles.editButton]} onPress={toggleEditSchedule}>
        <Text style={styles.buttonText}>{isEditing ? "Simpan Jadwal" : "Edit Jadwal"}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.settingsButton]}
        onPress={() => {
          if (isEditing) {
            setIsEditing(false);
          } else {
            router.back();
          }
        }}
      >
        <Text style={styles.buttonText}>Kembali</Text>
      </TouchableOpacity>
      <Modal transparent visible={loading}>
              <View style={styles.overlay}>
                <Text style={styles.overlayText}>{loadingText}</Text>
              </View>
      </Modal>
    </View>
  );
}

// ============== StyleSheet ==============
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e9f5e9",
    justifyContent: "center",
    alignItems: "center",
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
    fontWeight: 'bold',
    color: '#333',
  },
  
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: "#5cb85c",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 5,
    marginVertical: 10,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  table: {
    borderWidth: 1,
    borderColor: "#ddd",
    width: "90%",
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#5cb85c",
  },
  headerCell: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    textAlign: "center",
    color: "white",
    fontWeight: "bold",
  },
  headerCellWithDelete: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 5,
    paddingVertical: 8,
  },
  headerText: {
    color: "white",
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "red",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  dataRow: {
    flexDirection: "row",
  },
  cell: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    textAlign: "center",
  },
  cellInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    textAlign: "center",
    backgroundColor: "#fff",
  },
  button: {
    width: "80%",
    padding: 15,
    marginVertical: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#f0ad4e",
  },
  settingsButton: {
    backgroundColor: "#6c757d",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
});
