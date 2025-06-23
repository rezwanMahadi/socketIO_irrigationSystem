# Irrigation Control System

A real-time irrigation control system with ESP32 integration.

## Project Structure

This project consists of three main components:

1. **ESP32 Device**: Connects to the Heroku WebSocket server
2. **Heroku Server**: Socket.IO server for real-time communication
3. **Vercel Frontend**: Next.js application for user interface

## Deployment Instructions

### Heroku Server Deployment

1. Create a Heroku account if you don't have one
2. Install the Heroku CLI
3. Create a new Heroku app:
   ```
   heroku create your-app-name
   ```
4. Copy the server files to a separate directory:
   ```
   mkdir heroku-deploy
   cp heroku-server.js Procfile heroku-package.json heroku-deploy/
   cd heroku-deploy
   mv heroku-package.json package.json
   ```
5. Initialize git and deploy:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   heroku git:remote -a your-app-name
   git push heroku master
   ```
6. Verify the application is running:
   ```
   heroku open
   ```

### Vercel Frontend Deployment

1. Connect your GitHub repository to Vercel
2. Configure the build settings:
   - Build Command: `npm run build`
   - Output Directory: `.next`
3. Add environment variables if needed
4. Deploy!

### ESP32 Setup

1. Update the ESP32 code with your actual Heroku app name:
   ```cpp
   const char* socketio_server = "your-heroku-app-name.herokuapp.com";
   ```
2. Update WiFi credentials
3. Upload the code to your ESP32

## Development

- Run the Next.js frontend locally: `npm run dev`
- Run the server locally for testing: `npm run dev:server`

## Important Notes

- Make sure to update `your-heroku-app-name.herokuapp.com` in both the ESP32 code and the Socket.IO context in the frontend
- The ESP32 and frontend both connect to the Heroku server for real-time communication
