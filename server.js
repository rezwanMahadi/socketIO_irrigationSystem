const http = require('http');
const { Server } = require('socket.io');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

// Store the current LED state
let ledState = false;

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    return handle(req, res);
  });
  
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });
  
  // Socket.IO connection handler
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);
    
    // Send current LED state to newly connected client
    socket.emit('ledState', ledState);
    
    // Handle LED toggle from web client
    socket.on('toggleLED', (state) => {
      console.log('LED state toggled to:', state);
      ledState = state;
      // Broadcast the new state to all connected clients (including ESP32)
      io.emit('ledState', ledState);
    });
    
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
  
  server.listen(PORT, () => {
    console.log(`> Server listening on http://localhost:${PORT}`);
  });
}); 