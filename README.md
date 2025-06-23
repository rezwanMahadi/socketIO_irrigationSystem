# ESP32 LED Control via WebSockets

This project demonstrates how to control an ESP32's built-in LED through a Next.js web interface using WebSockets. The system allows for real-time control of the LED from any web browser.

## Project Structure

```
irrigation_control/
├── src/                   # Next.js application
├── esp32_led_control/     # Arduino code for ESP32
├── server.js              # WebSocket and Next.js server
├── package.json           # Project dependencies
└── README.md              # This file
```

## Prerequisites

- Node.js (v18+ recommended)
- Arduino IDE
- ESP32 development board
- WiFi connection

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure ESP32

1. Open the `esp32_led_control/esp32_led_control.ino` file in Arduino IDE
2. Install the required libraries:
   - Arduino IDE > Tools > Manage Libraries...
   - Search and install:
     - `WebSockets` by Markus Sattler 
     - `SocketIoClient` (or ArduinoWebsockets)
     - `ArduinoJson` by Benoit Blanchon
3. Modify the WiFi and server settings:
   ```cpp
   const char* ssid = "YOUR_WIFI_SSID";  // Replace with your WiFi name
   const char* password = "YOUR_WIFI_PASSWORD"; // Replace with your WiFi password
   const char* websocket_server = "YOUR_SERVER_IP"; // Replace with your server's IP address
   const uint16_t websocket_port = 3000; // Default port is 3000
   ```
4. Upload the code to your ESP32

### 3. Run the Next.js App

```bash
npm run dev
```

This will start both the WebSocket server and Next.js app on http://localhost:3000

## Usage

1. Open a web browser and navigate to http://localhost:3000
2. You should see the ESP32 LED Control interface
3. If everything is configured correctly:
   - Connection Status should show "Connected"
   - The LED status should reflect the current state of the ESP32's built-in LED
4. Click the "Turn LED ON/OFF" button to control the LED

## How It Works

1. The Next.js web application serves the user interface
2. A Socket.IO server manages WebSocket connections between clients
3. When you click the button on the web interface:
   - A WebSocket message is sent to the server
   - The server broadcasts the message to all connected clients (including the ESP32)
   - The ESP32 receives the message and changes the LED state accordingly
   - The state change is synchronized between all connected clients

## Troubleshooting

- **ESP32 not connecting**: Ensure WiFi credentials and server IP are correct
- **LED not responding**: Verify the LED pin number (usually GPIO 2 for built-in LED)
- **Connection showing as "Disconnected"**: Check that both the web app and ESP32 are connecting to the same Socket.IO server

## Extending the Project

This project can be extended to control additional components:
- Add more I/O pins for controlling relays, motors, etc.
- Implement sensor readings and display them on the web interface
- Create scheduled tasks for automated irrigation
