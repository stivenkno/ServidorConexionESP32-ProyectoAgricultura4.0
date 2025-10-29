import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const server = createServer(app);
const wss = new WebSocketServer({ server });

// Estructura para guardar clientes
const clients = {
  react: [],  // varios React
  esp32: null // solo uno
};

wss.on("connection", (ws) => {
  console.log("🖧 Nuevo cliente conectado");

  ws.on("message", (data) => {
    let message;
    try {
      message = JSON.parse(data.toString());
    } catch (e) {
      message = { type: "raw", data: data.toString() };
    }

    console.log("📨 Mensaje recibido:", message);

    // --- Identificación del cliente ---
    if (message.type === "identify") {
      if (message.role === "react") {
        clients.react.push(ws);
        console.log(`🖥️ Nuevo cliente React conectado. Total: ${clients.react.length}`);
      }

      if (message.role === "esp32") {
        clients.esp32 = ws;
        console.log("📟 Cliente ESP32 conectado");
        clients.react.forEach((client) => {
          if (client.readyState === client.OPEN) {
            client.send(JSON.stringify({ type: "esp32-connected" }));
          }
        })
      }

      return;
    }

    // --- Si un cliente React envía datos, reenviarlos al ESP32 ---
    if (message.type === "client-msg") {
      if (clients.esp32) {
        clients.esp32.send(JSON.stringify(message));
        console.log("➡️ Datos enviados al ESP32");
      } else {
        console.log("⚠️ No hay ESP32 conectado");
      }
    }

    // --- Si el ESP32 envía datos, reenviarlos a todos los React ---
    if (message.type === "esp32-msg") {
      if (clients.react.length > 0) {
        clients.react.forEach((client) => {
          if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(message));
          }
        });
        console.log(`⬅️ Mensaje enviado a ${clients.react.length} React(s)`);
      } else {
        console.log("⚠️ No hay Reacts conectados");
      }
    }
  });

  // --- Cuando un cliente se desconecta ---
  ws.on("close", () => {
    // Si era el ESP32, lo eliminamos
    if (clients.esp32 === ws) {
      clients.esp32 = null;
      console.log("❌ ESP32 desconectado");
      clients.react.forEach((client) => {
        if (client.readyState === client.OPEN) {
          client.send(JSON.stringify({ type: "esp32-disconnected" }));
        }
      })
    }

    // Si era un React, lo removemos del array
    clients.react = clients.react.filter((client) => client !== ws);
    console.log(`❌ Cliente React desconectado. Quedan: ${clients.react.length}`);
    clients.react.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(JSON.stringify({ type: "react-disconnected" }));
      }
    })
    
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
