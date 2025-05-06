import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const server = createServer(app);

// Crear servidor WebSocket sobre el mismo HTTP server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws, req) => {
  const clientIP = req.socket.remoteAddress;
  console.log(`🖧 Cliente WebSocket conectado: ${clientIP}`);

  // Enviar saludo al conectar
  ws.send(JSON.stringify({ type: "info", msg: "¡Hola ESP32!" }));

  ws.on("message", (data) => {
    let message;
    try {
      message = JSON.parse(data);
    } catch (e) {
      message = data.toString();
    }
    console.log("📨 Mensaje recibido :", message);

    switch (message) {
      case "encender luz habitación":
        wss.clients.forEach((client) => {
          if (client.readyState === client.OPEN) {
            client.send(0);
          }
        });
        break;
      case "apagar luz habitación":
        wss.clients.forEach((client) => {
          if (client.readyState === client.OPEN) {
            client.send(1);
          }
        });
        break;
      case "encender luz balcón":
        wss.clients.forEach((client) => {
          if (client.readyState === client.OPEN) {
            client.send(2);
          }
        });
        break;
      case "apagar luz balcón":
        wss.clients.forEach((client) => {
          if (client.readyState === client.OPEN) {
            client.send(3);
          }
        });
        break;
      case "encender luz sala":
        wss.clients.forEach((client) => {
          if (client.readyState === client.OPEN) {
            client.send(4);
          }
        });
        break;
      case "apagar luz sala":
        wss.clients.forEach((client) => {
          if (client.readyState === client.OPEN) {
            client.send(5);
          }
        });
        break;
      case "encender televisor":
        wss.clients.forEach((client) => {
          if (client.readyState === client.OPEN) {
            client.send(6);
          }
        });
        break;
      case "apagar televisor":
        wss.clients.forEach((client) => {
          if (client.readyState === client.OPEN) {
            client.send(7);
          }
        });
        break;
    }
  });

  ws.on("close", () => {
    console.log(`❌ Cliente WebSocket desconectado: ${clientIP}`);
  });

  ws.on("error", (err) => {
    console.error("⚠️ Error WebSocket:", err);
  });
});

// Ruta HTTP de prueba
app.post("/", async (req, res) => {
  const { comando } = req.body;
  console.log("📩 Datos recibidos:", comando);
  res.send("Datos recibidos");
});

// Arrancar el servidor en el puerto 3000
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
