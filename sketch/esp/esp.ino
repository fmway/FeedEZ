#include "ESP8266WiFi.h"
#include <WebSocketsClient.h>

WebSocketsClient ws;
bool state;
void setup() {
  Serial.begin(9600);
  while (!Serial) {}
  WiFi.hostname("FeedEZ");
  WiFi.begin("A34", "1122334455");
  // while (WiFi.status() != WL_CONNECTED) {}
  ws.beginSSL("studious-guacamole-q7qg7qrrq9x7c4gv-8000.app.github.dev", 443, "/ws/device");
  ws.onEvent([] (WStype_t type, uint8_t * payload, size_t length) {
    switch (type) {
      case WStype_CONNECTED:
        Serial.println("Connected!!!");
        break;
      case WStype_DISCONNECTED:
        Serial.println("Disconnected!!!");
        break;
      case WStype_TEXT:
      {
        String data = "";
        for (size_t i = 0; i < length; i++)
          data += (char)payload[i];
        Serial.println(String() + "Receive data: " + data);
        break;
      }
      default: 
       {}
    }
  });
}
void loop() {
  ws.loop();
}

// #include <Arduino.h>
// #include <ESP8266WiFi.h>
// #include <WebSocketsClient.h>

// #include <Hash.h>

// WebSocketsClient

// #define USE_SERIAL Serial1

// void webSocketEvent(WStype_t type, uint8_t * payload, size_t length) {

// 	switch(type) {
// 		case WStype_DISCONNECTED:
// 			USE_SERIAL.printf("[WSc] Disconnected!\n");
// 			break;
// 		case WStype_CONNECTED: {
// 			USE_SERIAL.printf("[WSc] Connected to url: %s\n", payload);

// 			// send message to server when Connected
// 			webSocket.sendTXT("Connected");
// 		}
// 			break;
// 		case WStype_TEXT:
// 			USE_SERIAL.printf("[WSc] get text: %s\n", payload);

// 			// send message to server
// 			// webSocket.sendTXT("message here");
// 			break;
// 		case WStype_BIN:
// 			USE_SERIAL.printf("[WSc] get binary length: %u\n", length);
// 			hexdump(payload, length);

// 			// send data to server
// 			// webSocket.sendBIN(payload, length);
// 			break;
//         case WStype_PING:
//             // pong will be send automatically
//             USE_SERIAL.printf("[WSc] get ping\n");
//             break;
//         case WStype_PONG:
//             // answer to a ping we send
//             USE_SERIAL.printf("[WSc] get pong\n");
//             break;
//     }

// }

// void setup() {
//   Serial.begin(9600);

// 	while (!Serial) {}
//   WiFi.

// 	for(uint8_t t = 4; t > 0; t--) {
// 		USE_SERIAL.printf("[SETUP] BOOT WAIT %d...\n", t);
// 		USE_SERIAL.flush();
// 		delay(1000);
// 	}

// 	WiFiMulti.addAP("SSID", "passpasspass");

// 	//WiFi.disconnect();
// 	while(WiFiMulti.run() != WL_CONNECTED) {
// 		delay(100);
// 	}

// 	// server address, port and URL
// 	webSocket.begin("192.168.0.123", 81, "/");

// 	// event handler
// 	webSocket.onEvent(webSocketEvent);

// 	// use HTTP Basic Authorization this is optional remove if not needed
// 	webSocket.setAuthorization("user", "Password");

// 	// try ever 5000 again if connection has failed
// 	webSocket.setReconnectInterval(5000);
  
//   // start heartbeat (optional)
//   // ping server every 15000 ms
//   // expect pong from server within 3000 ms
//   // consider connection disconnected if pong is not received 2 times
//   webSocket.enableHeartbeat(15000, 3000, 2);

// }

// void loop() {
// 	webSocket.loop();
// }
