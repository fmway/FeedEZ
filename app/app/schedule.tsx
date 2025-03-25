import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { DateTimePickerAndroid, DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';

// Fungsi untuk membagi array menjadi chunk dengan ukuran tertentu
function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

export default function ScheduleScreen() {
  const router = useRouter();

  // State "times" selalu memiliki 12 elemen. Setiap elemen berupa string "hh:mm" atau "" jika belum diatur.
  const [times, setTimes] = useState<string[]>(Array(12).fill(""));
  const [isEditing, setIsEditing] = useState(false);
  const [schedule, setSchedule] = useState<{ hour: number, minute: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('');

  // Ambil data jadwal dari server dan isi array "times"
  useEffect(() => {
    fetch("https://feedez.deno.dev/settings")
      .then(x => x.json())
      .then(x => {
        if (x.schedules) {
          const fetched = (x.schedules as { hour: number, minute: number }[])
            .map(sch => `${String(sch.hour).padStart(2, "0")}:${String(sch.minute).padStart(2, "0")}`);
          const newTimes = [...fetched];
          while (newTimes.length < 12) {
            newTimes.push("");
          }
          setTimes(newTimes);
          setSchedule(x.schedules);
          setTimeout(() => setLoading(false), 750);
        }
      })
      .catch(err => console.error(err));
  }, []);

  // Efek loading (typing effect)
  useEffect(() => {
    const text = "Loading...";
    let index = 0;
    const interval = setInterval(() => {
      setLoadingText(text.slice(0, index + 1));
      index++;
      if (index === text.length) {
        index = 0;
      }
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Fungsi untuk mengupdate waktu pada sel tertentu
  const updateTime = (cellIndex: number, newTime: string) => {
    setTimes(prev => {
      const newTimes = [...prev];
      newTimes[cellIndex] = newTime;
      return newTimes;
    });
  };

  // Fungsi untuk membuka time picker dan mengupdate sel yang ditekan
  const showTimePicker = (cellIndex: number) => {
    DateTimePickerAndroid.open({
      value: new Date(),
      mode: "time",
      is24Hour: true,
      onChange: (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (event.type === 'set' && selectedDate) {
          const hours = selectedDate.getHours().toString().padStart(2, "0");
          const minutes = selectedDate.getMinutes().toString().padStart(2, "0");
          updateTime(cellIndex, `${hours}:${minutes}`);
        }
      },
    });
  };

  // Array "times" selalu berukuran 12, jadi bagi ke dalam 4 baris dengan 3 kolom
  const CHUNK_SIZE = 3;
  const chunkedTimes = chunkArray(times, CHUNK_SIZE);

  const toggleEditSchedule = () => {
    if (isEditing) {
      // Saat menyimpan, filter hanya sel yang terisi untuk dikirim ke server
      const schedulesToSave = times
        .filter(time => time !== "")
        .map(x => {
          const [hour, minute] = x.split(":").map(y => parseInt(y));
          return { hour, minute };
        });
      fetch("https://feedez.deno.dev/settings", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schedules: schedulesToSave,
        })
      })
        .then(x => x.json())
        .then(x => {
          Alert.alert("Info", "Jadwal telah diperbarui!");
        });
    }
    setIsEditing(!isEditing);
  };

  // Hapus jadwal: set sel menjadi kosong
  const removeSchedule = (cellIndex: number) => {
    Alert.alert(
      "Konfirmasi",
      `Hapus Jadwal ${cellIndex + 1}?`,
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Ya, Hapus",
          style: "destructive",
          onPress: () => {
            updateTime(cellIndex, "");
          },
        },
      ]
    );
  };

  // Render header untuk tiap baris (selalu 3 kolom)
  const renderHeaderRow = (rowIndex: number) => {
    return (
      <View key={`header-row-${rowIndex}`} style={styles.headerRow}>
        {Array.from({ length: 3 }).map((_, i) => {
          const cellIndex = rowIndex * 3 + i;
          return (
            <View key={`header-${cellIndex}`} style={styles.headerCell}>
              <Text style={styles.headerText}>Jadwal {cellIndex + 1}</Text>
              {isEditing && times[cellIndex] !== "" && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => removeSchedule(cellIndex)}
                >
                  <Text style={styles.deleteButtonText}>X</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  // Render baris data (sel) untuk tiap baris
  const renderDataRow = (rowData: string[], rowIndex: number) => {
    return (
      <View key={`data-row-${rowIndex}`} style={styles.dataRow}>
        {rowData.map((time, i) => {
          const cellIndex = rowIndex * 3 + i;
          if (isEditing) {
            return (
              <TouchableOpacity
                key={`cell-${cellIndex}`}
                style={styles.cellInput}
                onPress={() => showTimePicker(cellIndex)}
              >
                <Text style={styles.cellText}>
                  {time !== "" ? time : "Atur"}
                </Text>
              </TouchableOpacity>
            );
          } else {
            return (
              <View key={`cell-${cellIndex}`} style={styles.cell}>
                <Text style={styles.cellText}>{time}</Text>
              </View>
            );
          }
        })}
      </View>
    );
  };

  // Render keseluruhan tabel (grid tetap 12 sel)
  const renderTable = () => {
    return (
      <View style={styles.tableContainer}>
        {chunkedTimes.map((rowData, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.tableRow}>
            {renderHeaderRow(rowIndex)}
            {renderDataRow(rowData, rowIndex)}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Jadwal Pakan</Text>

        {/* Container tabel tetap berukuran 12 sel */}
        <View style={styles.card}>
          {renderTable()}
        </View>

        {/* Tombol aksi tetap di bawah */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.button, styles.editButton]} onPress={toggleEditSchedule}>
            <Text style={styles.buttonText}>{isEditing ? "Simpan Jadwal" : "Edit Jadwal"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.backButton]}
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
        </View>
      </ScrollView>

      <Modal transparent visible={loading}>
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>{loadingText}</Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e9f5e9",
  },
  scrollContainer: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    top:15,
    fontSize: 22,
    fontWeight: "700",
    color: "#5cb85c",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    top: 30,
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 5,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 20,
  },
  tableContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
  },
  tableRow: {
    marginBottom: 0,
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#5cb85c",
  },
  headerCell: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 10,
    alignItems: "center",
    position: "relative",
  },
  headerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  deleteButton: {
    backgroundColor: "red",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    right: 2,
    top: 2,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  dataRow: {
    flexDirection: "row",
  },
  cell: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 12,
    alignItems: "center",
  },
  cellInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  cellText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  buttonContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
    top:45,
  },
  button: {
    width: "80%",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 8,
  },
  editButton: {
    backgroundColor: "#f0ad4e",
  },
  backButton: {
    backgroundColor: "#6c757d",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
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
});
