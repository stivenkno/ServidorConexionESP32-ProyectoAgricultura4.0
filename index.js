import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import cors from "cors";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

app.use(cors({ origin: "*" }));
app.use(express.json());

let esp32socket = null;
let clientWebSocket = null;

// Cuando un cliente se conecta
wss.on("connection", (ws, req) => {
  const clientIP = req.socket.remoteAddress;
  console.log(` Cliente WebSocket conectado: ${clientIP}`);


  ws.on("message", (msg) => {
    const message = msg.toString();
    console.log("📩 Mensaje recibido:", message);

    if (message === "ESP32") {
      esp32socket = ws;
      console.log("🤖 ESP32 registrado!");
    } 
  });

  ws.send(JSON.stringify({ type: "Te has conectado exitosamente!" }));



  ws.on("error", (error) => {
    console.error("❌ Error en el WebSocket:", error);
  });

  ws.on("close", () => {
    console.log(`🔌 Cliente WebSocket desconectado: ${clientIP}`);
  });
});

// Endpoint para iniciar simulación
app.get("/iniciar-simulacion", (req, res) => {
  try {
    if (esp32socket) {
      esp32socket.send(JSON.stringify({ type: "INICIAR_SIMULACION" }));
      console.log("🚦 Mensaje enviado al ESP32");
    }
    res.status(200).send("Se ha iniciado la simulación");
  } catch (error) {
    res.status(500).send("No se ha iniciado la simulación");
  }
});

// Endpoint para detener simulación
app.get("/detener-simulacion", (req, res) => {
  try {
    if (esp32socket) {
      esp32socket.send(JSON.stringify({ type: "DETENER_SIMULACION" }));
      console.log("🛑 Mensaje enviado al ESP32");
    }
    res.status(200).send("Se ha detenido la simulación");
  } catch (error) {
    res.status(500).send("No se ha detenido la simulación");
  }
});

// Arrancar servidor
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
