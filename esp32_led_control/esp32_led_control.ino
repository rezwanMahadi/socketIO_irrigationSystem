#include <WiFi.h>
#include <SocketIOclient.h>
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";     // Replace with your WiFi name
const char* password = "YOUR_WIFI_PASSWORD"; // Replace with your WiFi password

// WebSocket server address and port
const char* websocket_server = "YOUR_SERVER_IP"; // Replace with your server IP
const uint16_t websocket_port = 3000;

// Built-in LED pin - ESP32 usually has built-in LED on GPIO 2
const int LED_PIN = 2;

bool ledState = false;
unsigned long lastHeartbeat = 0;
const unsigned long heartbeatInterval = 30000; // 30 seconds

SocketIOclient socketIO;

// Callback function when socket receives an event
void socketIOEvent(socketIOmessageType_t type, uint8_t * payload, size_t length) {
  switch(type) {
    case sIOtype_DISCONNECT:
      Serial.println("Disconnected from socket.io server");
      break;
      
    case sIOtype_CONNECT:
      Serial.println("Connected to socket.io server");
      // Join default namespace
      socketIO.send(sIOtype_CONNECT, "/");
      break;
      
    case sIOtype_EVENT:
      // Parse the message to determine the event
      DynamicJsonDocument doc(1024);
      deserializeJson(doc, payload, length);
      
      if(doc[0].as<String>() == "ledState") {
        // Handle LED state update event
        bool newState = doc[1].as<bool>();
        Serial.print("Received LED state: ");
        Serial.println(newState ? "ON" : "OFF");
        
        // Update LED state and physical LED
        ledState = newState;
        digitalWrite(LED_PIN, ledState ? HIGH : LOW);
      }
      break;
  }
}

void setup() {
  Serial.begin(115200);
  Serial.println("ESP32 LED Control - WebSocket Client");
  
  // Initialize LED pin
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  
  Serial.print("Connected to WiFi, IP address: ");
  Serial.println(WiFi.localIP());
  
  // Connect to WebSocket server
  String serverAddress = String(websocket_server) + ":" + String(websocket_port);
  Serial.print("Connecting to WebSocket server: ");
  Serial.println(serverAddress);
  
  socketIO.begin(websocket_server, websocket_port);
  socketIO.onEvent(socketIOEvent);
}

void loop() {
  socketIO.loop();
  
  // Send a heartbeat to keep connection alive
  unsigned long currentMillis = millis();
  if(currentMillis - lastHeartbeat > heartbeatInterval) {
    lastHeartbeat = currentMillis;
    
    // Send a ping event
    socketIO.send(sIOtype_PING, "");
    
    // Also send current LED state to make sure it's synchronized
    DynamicJsonDocument doc(1024);
    JsonArray array = doc.to<JsonArray>();
    array.add("ledStatus");
    array.add(ledState);
    
    String output;
    serializeJson(doc, output);
    socketIO.sendEVENT(output);
  }
} 