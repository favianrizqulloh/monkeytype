import http from "http";
import cors from "cors";
import express from "express";
import { BASE_CONFIGURATION } from "../constants/base-configuration";
import { raceManager } from "./race-manager";
import { initRaceWebSocket } from "./race-ws";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", app: "TypingTest Race Server" });
});

app.get("/configuration", (_req, res) => {
  res.json({
    message: "Configuration retrieved",
    data: BASE_CONFIGURATION,
  });
});

app.get("/api/race/sessions", (_req, res) => {
  res.json({
    sessions: raceManager.getActiveSessionsList(),
  });
});

const server = http.createServer(app);
initRaceWebSocket(server);

const PORT = parseInt(process.env["PORT"] ?? "5005", 10);

server.listen(PORT, "0.0.0.0", () => {
  console.log(`\n==================================================`);
  console.log(`  TypingTest WebSocket Server aktif di port ${PORT}`);
  console.log(`  Path WebSocket: ws://localhost:${PORT}/ws/race`);
  console.log(`==================================================\n`);
});
