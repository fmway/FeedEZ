#include "ESP8266WiFi.h"
#include <WebSocketsClient.h>

WebSocketsClient ws;
bool state;
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  digitalWrite(LED_BUILTIN, LOW);
  Serial.begin(9600);
  while (!Serial) {}
  WiFi.hostname("FeedEZ");
  // WiFi.begin("LAB. PERIKANAN");
  WiFi.begin("LAB. PERIKANAN");
  // while (WiFi.status() != WL_CONNECTED) {}
  ws.beginSSL("feedez.deno.dev", 443, "/ws/device");
  ws.onEvent([] (WStype_t type, uint8_t * payload, size_t length) {
    switch (type) {
      case WStype_CONNECTED:
      {
        digitalWrite(LED_BUILTIN, HIGH);
        Serial.println("Connected!!!");
        break;
      }
      case WStype_DISCONNECTED:
      {
        digitalWrite(LED_BUILTIN, LOW);
        Serial.println("Disconnected!!!");
        break;
      }
      case WStype_TEXT:
      {
        String data = "";
        for (size_t i = 0; i < length; i++)
          data += (char)payload[i];
        Serial.println(data);
        break;
      }
      default: 
       {}
    }
  });
}
void loop() {
  ws.loop();
  if (Serial.available()) {
    auto data = Serial.readStringUntil('\n');
    data.trim();
    ws.sendTXT(data);
  }
}