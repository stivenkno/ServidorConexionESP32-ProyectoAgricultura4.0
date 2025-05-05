import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";

const app = express();

const server = createServer(app);

// Crear servidor WebSocket sobre el mismo HTTP server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  const clientIP = req.socket.remoteAddress;
  console.log(`🖧 Cliente WebSocket conectado: ${clientIP}`);

  // Enviar saludo al conectar
  ws.send(JSON.stringify({ type: "info", msg: "¡Hola ESP32!" }));

  // Escuchar mensajes del cliente (ESP32)
  ws.on("message", (data) => {
    let message;
    try {
      message = JSON.parse(data);
    } catch (e) {
      message = data.toString();
    }
    console.log("📨 Mensaje recibido del ESP32:", message);

    // Ejemplo: reenviar a todos los conectados
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(
          JSON.stringify({
            from: clientIP,
            payload: message,
          })
        );
      }
    });
  });

  ws.on("close", () => {
    console.log(`❌ Cliente WebSocket desconectado: ${clientIP}`);
  });

  ws.on("error", (err) => {
    console.error("⚠️ Error WebSocket:", err);
  });
});

// Ruta HTTP de prueba
app.get("/", (req, res) => {
  res.send("Servidor Express + ws funcionando");
});

// Arrancar el servidor en el puerto 3000
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
