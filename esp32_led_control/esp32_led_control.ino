#include <Arduino.h>
#include <ArduinoJson.h>
#include <DallasTemperature.h>
#include <LiquidCrystal_I2C.h>
#include <OneWire.h>
#include <SocketIOclient.h>
#include <WiFi.h>
#include <Wire.h>

// WiFi credentials
const char *ssid = "DazzleVolt";          // Replace with your WiFi name
const char *password = "245025.Pa$$word"; // Replace with your WiFi password

// const char *ssid = "Alpha";              // Replace with your WiFi name
// const char *password = "245025.asdfjkl"; // Replace with your WiFi password

// Socket.IO server address and port - Heroku deployment
const char *socketio_server =
    "irrigation-sys-v2-0a9f2f7f5b6e.herokuapp.com"; // Your actual Heroku app
                                                    // name
const uint16_t socketio_port = 443;                 // HTTPS port for Heroku

// Device configuration
const char *deviceId =
    "ESP32-IRRIGATION-001"; // Unique identifier for this device
const char *deviceType = "Irrigation Controller";

// Built-in LED pin - ESP32 usually has built-in LED on GPIO 2
const int LED_PIN = 2;
const int SOIL_MOISTURE_PIN = 34;
const int ONE_WIRE_BUS = 4;
const int ECHO_PIN = 18;
const int TRIG_PIN = 5;
const int PUMP_1 = 12;
const int PUMP_2 = 14;

bool ledState = false;
bool isRegistered = false;
unsigned long lastHeartbeat = 0;
unsigned long lastPinHeartbeat = 0;
const unsigned long heartbeatInterval = 30000;   // 30 seconds
const unsigned long pinheartbeatInterval = 1000; // 1 second
bool pinState = false;
int waterLevelValue = 0;
int SOIL_MOISTURE_VALUE = 0;
bool selectedPumpMode = false;

SocketIOclient socketIO;
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);
LiquidCrystal_I2C lcd(0x27, 16, 2);

void wifiConnect() {
  WiFi.begin(ssid, password);
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Connecting WiFi");
  lcd.setCursor(0, 1);
  lcd.print("Please wait");
  lcd.setCursor(11, 1);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    lcd.print(".");
  }
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Connected WiFi");
  lcd.setCursor(0, 1);
  lcd.print(WiFi.localIP());
  Serial.println();
  Serial.print("Connected to WiFi, IP address: ");
  Serial.println(WiFi.localIP());
  delay(2000);
  lcd.clear();
}

// Register device with custom ID
void registerDevice() {
  if (!isRegistered) {
    DynamicJsonDocument doc(512);
    JsonArray array = doc.to<JsonArray>();
    array.add("registerDevice");

    JsonObject deviceInfo = array.createNestedObject();
    deviceInfo["deviceId"] = deviceId;
    deviceInfo["deviceType"] = deviceType;

    String output;
    serializeJson(doc, output);

    Serial.printf("[IOc] Registering device: %s\n", output.c_str());
    socketIO.sendEVENT(output);
    isRegistered = true;
  }
}

// Send device heartbeat
void sendHeartbeat() {
  DynamicJsonDocument doc(512);
  JsonArray array = doc.to<JsonArray>();
  array.add("deviceHeartbeat");
  array.add(deviceId);

  String output;
  serializeJson(doc, output);

  Serial.printf("[IOc] Sending heartbeat: %s\n", output.c_str());
  socketIO.sendEVENT(output);
}

// Callback function when socket receives an event
void socketIOEvent(socketIOmessageType_t type, uint8_t *payload,
                   size_t length) {
  switch (type) {
  case sIOtype_DISCONNECT:
    Serial.println("[IOc] Disconnected from socket.io server");
    isRegistered = false;
    break;

  case sIOtype_CONNECT:
    Serial.println("[IOc] Connected to socket.io server");
    // Join default namespace
    socketIO.send(sIOtype_CONNECT, "/");
    // Register device after connection established
    delay(1000); // Small delay to ensure connection is fully established
    registerDevice();
    break;

  case sIOtype_EVENT: {
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

    if (eventName == "ledState") {
      // Handle LED state update event
      bool newState = doc[1].as<bool>();
      Serial.printf("LED state update: %s\n", newState ? "ON" : "OFF");

      // Update LED state and physical LED
      ledState = newState;
      digitalWrite(LED_PIN, ledState ? HIGH : LOW);
    }
  } break;

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

float getTemperature() {
  sensors.requestTemperatures();
  return sensors.getTempCByIndex(0);
}

int waterLevel() {
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  long duration = pulseIn(ECHO_PIN, HIGH);
  int distance = duration * 0.034 / 2;
  return distance;
}

void autoPumpControl() {
  if (selectedPumpMode) {
    digitalWrite(PUMP_1, HIGH);
    digitalWrite(PUMP_2, HIGH);
  }
  return;
}

void setup() {
  Serial.begin(115200);
  Serial.println("ESP32 LED Control - Socket.IO Client");

  sensors.begin();
  lcd.init();
  lcd.backlight();

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("SMART IRRIGATION");
  lcd.setCursor(0, 1);
  lcd.print("SYSTEM");
  delay(2000);

  // Initialize LED pin
  pinMode(LED_PIN, OUTPUT);
  pinMode(SOIL_MOISTURE_PIN, INPUT);
  digitalWrite(LED_PIN, LOW);
  pinMode(ECHO_PIN, INPUT);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(PUMP_1, OUTPUT);
  pinMode(PUMP_2, OUTPUT);
  digitalWrite(PUMP_1, LOW);
  digitalWrite(PUMP_2, LOW);

  // Connect to WiFi
  WiFi.begin(ssid, password);
  wifiConnect();

  // Setup Socket.IO connection
  Serial.printf("Connecting to Heroku Socket.IO server: %s:%d\n",
                socketio_server, socketio_port);

  // server address, port and URL path - use SSL for Heroku
  socketIO.beginSSL(socketio_server, socketio_port, "/socket.io/?EIO=4");

  // Set callback function
  socketIO.onEvent(socketIOEvent);

  Serial.println("Setup complete, waiting for Socket.IO connection...");
}

void loop() {
  while (WiFi.status() == WL_CONNECTED) {
    socketIO.loop();
    autoPumpControl();

    // Send heartbeat to keep connection alive
    unsigned long currentMillis = millis();
    if (currentMillis - lastHeartbeat > heartbeatInterval) {
      lastHeartbeat = currentMillis;

      if (isRegistered) {
        // Send heartbeat with device ID
        sendHeartbeat();
      } else if (socketIO.isConnected()) {
        // Try to register again if connected but not registered
        registerDevice();
      }
    }

    if (millis() - lastPinHeartbeat > pinheartbeatInterval) {
      lastPinHeartbeat = millis();

      SOIL_MOISTURE_VALUE = analogRead(SOIL_MOISTURE_PIN);
      SOIL_MOISTURE_VALUE = map(SOIL_MOISTURE_VALUE, 0, 4095, 100, 0);
      float temperature = getTemperature();
      waterLevelValue = waterLevel();
      waterLevelValue = map(waterLevelValue, 17, 4, 0, 100);

      if (isRegistered) {
        // Send heartbeat with device ID
        sendHeartbeat();

        // Send current LED state to synchronize with server
        DynamicJsonDocument doc(1024);
        JsonArray array = doc.to<JsonArray>();
        array.add("sensorsData_controllingStatus");

        JsonObject statusValues = array.createNestedObject();
        statusValues["soilMoisture"] = SOIL_MOISTURE_VALUE;
        statusValues["temperature"] = temperature;
        statusValues["waterLevel"] = waterLevelValue;
        statusValues["newLedState"] = ledState;
        statusValues["selectedPumpMode"] = selectedPumpMode;

        String output;
        serializeJson(doc, output);

        Serial.printf("[IOc] Sending sensors data: %s\n", output.c_str());
        socketIO.sendEVENT(output);
      } else if (socketIO.isConnected()) {
        // Try to register again if connected but not registered
        registerDevice();
      }
    }

    // Small delay to prevent overwhelming the CPU
    delay(10);
  }
  wifiConnect();
}