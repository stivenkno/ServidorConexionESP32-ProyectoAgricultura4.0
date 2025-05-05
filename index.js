import express from "express";
import { createServer } from "https";
import { WebSocketServer } from "ws";

const app = express();

const server = createServer(app);

const PORT = process.env.PORT || 3000;

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
  });

  // Alternar entre "encender" y "apagar" cada 3 segundos
  let estado = false;
  const intervalo = setInterval(() => {
    const mensaje = estado ? "encender" : "apagar";
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ from: clientIP, payload: mensaje }));
    }
    estado = !estado;
  }, 3000);

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

server.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
