#include "main.h"
#include "Arduino.h"
#include "SoftwareSerial.h"

// Inisialisasi komunikasi serial ke ESP8266 (RX di D2, TX di D3)
SoftwareSerial espSerial(5, 4);

// Fungsi untuk mengirim AT Command dan menunggu respons
bool sendCommand(String cmd, String res, int timeout) {
  espSerial.println(cmd);
  long int time = millis();
  while ((millis() - time) < timeout) {
    while (espSerial.available()) {
      String response = espSerial.readString();
      Serial.println(response); // Tampilkan respons di Serial Monitor
      if (response.indexOf(res) != -1) {
        return true; // Respons sesuai
      }
    }
  }
  return false; // Timeout
}

void sendHTTPRequest() {
  Serial.println("Menghubungi example.com...");

  // Buka koneksi ke example.com di port 80 (HTTP)
  if (sendCommand("AT+CIPSTART=\"TCP\",\"example.com\",80", "CONNECT", 5000)) {
    Serial.println("Koneksi berhasil!");

    // Kirim HTTP GET request
    String httpRequest = "GET / HTTP/1.1\r\n";
    httpRequest += "Host: example.com\r\n";
    httpRequest += "Connection: close\r\n\r\n";

    // Kirim panjang data ke ESP8266
    sendCommand("AT+CIPSEND=" + String(httpRequest.length()), ">", 5000);

    // Kirim isi request
    espSerial.print(httpRequest);
    Serial.println("Request terkirim!");

    // Tunggu dan tampilkan respons dari server
    delay(5000);
    while (espSerial.available()) {
      Serial.write(espSerial.read());
    }

    // Tutup koneksi
    sendCommand("AT+CIPCLOSE", "OK", 3000);
  } else {
    Serial.println("Koneksi gagal!");
  }
}

void setup() {
  Serial.begin(9600);       // Untuk komunikasi ke Serial Monitor
  espSerial.begin(115200);  // Untuk komunikasi ke ESP8266 (sesuaikan baudrate)

  delay(2000);
  Serial.println("Menghubungkan ke Open WiFi...");

  // Tes koneksi ke ESP8266
  sendCommand("AT", "OK", 3000);

  // Atur ESP8266 sebagai Station (client WiFi)
  sendCommand("AT+CWMODE=1", "OK", 3000);

  sendCommand("AT+CWLAP", "OK", 10000);

  // Putuskan koneksi sebelumnya dan hapus auto-connect
  sendCommand("AT+CWQAP", "OK", 5000);        // Disconnect dari WiFi lama
  sendCommand("AT+CWJAP=\"\",\"\"", "OK", 5000); // Hapus koneksi tersimpan
  sendCommand("AT+CWQAP", "OK", 5000);        // Disconnect dari WiFi lama

  // Hubungkan ke Open WiFi (tanpa password)
  /*sendCommand("AT+CWJAP=\"A34\", \"1122334455\"", "OK", 15000);*/
  /*sendCommand("AT+CWJAP=\"pok\", \"gondalgandil\"", "OK", 15000);*/
  sendCommand("AT+CWJAP=\"LAB. PERIKANAN\", \"\"", "OK", 15000);

  // Cek alamat IP lokal yang diberikan oleh router
  sendCommand("AT+CIFSR", "OK", 3000);
  /**/
  /*// Kirim request ke example.com*/
  sendHTTPRequest();
}

void loop() {
  // Tampilkan respons dari ESP8266 di Serial Monitor
  if (espSerial.available()) {
    Serial.write(espSerial.read());
  }
}

