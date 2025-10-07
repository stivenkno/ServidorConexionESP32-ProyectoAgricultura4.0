import express from "express";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import cors from "cors";

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Guardamos clientes identificados
const clients = {};

wss.on("connection", (ws, req) => {
  console.log("🖧 Nuevo cliente conectado");

  ws.on("message", (data) => {
    let message;
    try {
      message = JSON.parse(data.toString());
    } catch (e) {
      message = { type: "raw", data: data.toString() };
    }

    console.log("📨 Mensaje recibido:", message);

    // Identificación de cliente
    if (message.type === "identify") {
      if (message.role === "react") {
        clients.react = ws;
        console.log("🖥️ Cliente identificado como React");
      }
      if (message.role === "esp32") {
        clients.esp32 = ws;
        console.log("📟 Cliente identificado como ESP32");
      }
      return;
    }

    // Si el cliente React envía datos -> reenviar al ESP32
    if (message.type === "client-msg" && clients.esp32) {
      clients.esp32.send(JSON.stringify(message));
      console.log("➡️ Datos enviados al ESP32");
    }

    // Si el ESP32 responde -> reenviar al React
    if (message.type === "esp32-msg" && clients.react) {
      clients.react.send(JSON.stringify(message));
      console.log("⬅️ Respuesta enviada al React");
    }
  });

  ws.on("close", () => {
    console.log("❌ Cliente desconectado");
  });
});

const PORT = 4000;
server.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
