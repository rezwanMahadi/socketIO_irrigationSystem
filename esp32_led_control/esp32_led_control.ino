#include <WiFi.h>
#include <SocketIOclient.h>  // Note: correct capitalization
#include <ArduinoJson.h>

// WiFi credentials
const char* ssid = "DazzelVolt";     // Replace with your WiFi name
const char* password = "245025.Pa$$word"; // Replace with your WiFi password

// Socket.IO server address and port - Heroku deployment
const char* socketio_server = "irrigation-sys-v2-0a9f2f7f5b6e.herokuapp.com"; // Your actual Heroku app name
const uint16_t socketio_port = 443; // HTTPS port for Heroku

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
      Serial.println("[IOc] Disconnected from socket.io server");
      break;
      
    case sIOtype_CONNECT:
      Serial.println("[IOc] Connected to socket.io server");
      // Join default namespace
      socketIO.send(sIOtype_CONNECT, "/");
      break;
      
    case sIOtype_EVENT:
      {
        // Parse the message to determine the event
        DynamicJsonDocument doc(1024);
        DeserializationError error = deserializeJson(doc, payload, length);
        
        if (error) {
          Serial.print("[IOc] JSON parsing failed: ");
          Serial.println(error.c_str());
          return;
        }
        
        String eventName = doc[0].as<String>();
        Serial.printf("[IOc] Received event: %s\n", eventName.c_str());
        
        if(eventName == "ledState") {
          // Handle LED state update event
          bool newState = doc[1].as<bool>();
          Serial.printf("[IOc] LED state update: %s\n", newState ? "ON" : "OFF");
          
          // Update LED state and physical LED
          ledState = newState;
          digitalWrite(LED_PIN, ledState ? HIGH : LOW);
        }
      }
      break;
      
    case sIOtype_ACK:
      Serial.printf("[IOc] ACK: %s\n", payload);
      break;
      
    case sIOtype_ERROR:
      Serial.printf("[IOc] ERROR: %s\n", payload);
      break;
      
    case sIOtype_BINARY_EVENT:
    case sIOtype_BINARY_ACK:
      Serial.println("[IOc] Binary event/ack received");
      break;
      
    default:
      Serial.printf("[IOc] Unknown event type: %d\n", type);
      break;
  }
}

void setup() {
  Serial.begin(115200);
  Serial.println("ESP32 LED Control - Socket.IO Client");
  
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
  
  // Setup Socket.IO connection
  Serial.printf("Connecting to Heroku Socket.IO server: %s:%d\n", socketio_server, socketio_port);
  
  // server address, port and URL path - use SSL for Heroku
  socketIO.beginSSL(socketio_server, socketio_port, "/socket.io/?EIO=4");
  
  // Set callback function
  socketIO.onEvent(socketIOEvent);
  
  Serial.println("Setup complete, waiting for Socket.IO connection...");
}

void loop() {
  socketIO.loop();
  
  // Send heartbeat to keep connection alive
  unsigned long currentMillis = millis();
  if(currentMillis - lastHeartbeat > heartbeatInterval) {
    lastHeartbeat = currentMillis;
    
    // Send current LED state to synchronize with server
    DynamicJsonDocument doc(512);
    JsonArray array = doc.to<JsonArray>();
    array.add("ledStatus");
    array.add(ledState);
    
    String output;
    serializeJson(doc, output);
    
    Serial.printf("[IOc] Sending heartbeat: %s\n", output.c_str());
    socketIO.sendEVENT(output);
  }
  
  // Small delay to prevent overwhelming the CPU
  delay(10);
}