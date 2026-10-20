import { Server as HttpServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { raceManager } from "./race-manager";
import { ClientMessage, ServerMessage } from "./race-types";

type ConnectionMeta = {
  sessionId?: string;
  participantId?: string;
  isTeacher?: boolean;
};

export function initRaceWebSocket(server: HttpServer): WebSocketServer {
  const wss = new WebSocketServer({ server, path: "/ws/race" });
  const clientMeta = new WeakMap<WebSocket, ConnectionMeta>();

  function broadcastToRoom(
    sessionId: string,
    message: ServerMessage,
    exceptClient?: WebSocket,
  ): void {
    const data = JSON.stringify(message);
    for (const client of wss.clients) {
      if (
        client !== exceptClient &&
        client.readyState === WebSocket.OPEN &&
        clientMeta.get(client)?.sessionId === sessionId
      ) {
        client.send(data);
      }
    }
  }

  wss.on("connection", (ws: WebSocket) => {
    clientMeta.set(ws, {});

    ws.on("message", (raw: string | Buffer) => {
      try {
        const msg = JSON.parse(raw.toString()) as ClientMessage;

        switch (msg.action) {
          case "list_sessions": {
            const sessions = raceManager.getActiveSessionsList();
            const response: ServerMessage = {
              event: "sessions_list",
              sessions,
            };
            ws.send(JSON.stringify(response));
            break;
          }

          case "join": {
            const sessionId = msg.sessionId.trim();
            const participantId = `p_${Math.random().toString(36).substring(2, 9)}`;
            const participant = raceManager.joinParticipant(
              sessionId,
              participantId,
              msg.name,
              msg.isTeacher,
              msg.durationSeconds,
            );

            clientMeta.set(ws, {
              sessionId,
              participantId,
              isTeacher: msg.isTeacher,
            });

            const session = raceManager.getOrCreateSession(sessionId, {
              durationSeconds: msg.durationSeconds,
              mode: msg.mode,
              modeValue: msg.modeValue,
              language: msg.language,
              punctuation: msg.punctuation,
              numbers: msg.numbers,
              customText: msg.customText,
            });

            // Send full room state back to joiner
            const roomStateMsg: ServerMessage = {
              event: "room_state",
              session: raceManager.serializeSession(session),
              participantId,
            };
            ws.send(JSON.stringify(roomStateMsg));

            // Broadcast new participant to other room members
            const joinedMsg: ServerMessage = {
              event: "participant_joined",
              participant,
            };
            broadcastToRoom(sessionId, joinedMsg, ws);
            break;
          }

          case "progress": {
            const meta = clientMeta.get(ws);
            const sId = meta?.sessionId;
            const pId = meta?.participantId;
            if (sId === undefined || pId === undefined) return;

            const updated = raceManager.updateProgress(
              sId,
              pId,
              msg.progress,
              msg.wpm,
              msg.accuracy,
            );

            if (updated !== undefined) {
              const progressMsg: ServerMessage = {
                event: "progress_update",
                id: pId,
                progress: updated.progress,
                wpm: updated.wpm,
                accuracy: updated.accuracy,
              };
              broadcastToRoom(sId, progressMsg);
            }
            break;
          }

          case "finish": {
            const meta = clientMeta.get(ws);
            const sId = meta?.sessionId;
            const pId = meta?.participantId;
            if (sId === undefined || pId === undefined) return;

            const res = raceManager.finishParticipant(
              sId,
              pId,
              msg.wpm,
              msg.accuracy,
              msg.durationSeconds,
            );

            if (res !== undefined) {
              const finishMsg: ServerMessage = {
                event: "participant_finished",
                participant: res.participant,
                leaderboard: res.leaderboard,
              };
              broadcastToRoom(sId, finishMsg);

              const session = raceManager.getSession(sId);
              if (session?.status === "finished") {
                const raceFinishedMsg: ServerMessage = {
                  event: "race_finished",
                  leaderboard: res.leaderboard,
                };
                broadcastToRoom(sId, raceFinishedMsg);
              }
            }
            break;
          }

          case "next_attempt": {
            const meta = clientMeta.get(ws);
            const sId = meta?.sessionId;
            const pId = meta?.participantId;
            if (sId === undefined || pId === undefined) return;

            const updated = raceManager.startNextAttempt(sId, pId);
            if (updated !== undefined) {
              const progressMsg: ServerMessage = {
                event: "progress_update",
                id: pId,
                progress: 0,
                wpm: 0,
                accuracy: 100,
              };
              broadcastToRoom(sId, progressMsg);
            }
            break;
          }

          case "start_race": {
            const meta = clientMeta.get(ws);
            const sId = meta?.sessionId;
            if (sId === undefined) return;

            raceManager.startRace(
              sId,
              (seconds) => {
                const cdMsg: ServerMessage = {
                  event: "race_countdown",
                  seconds,
                };
                broadcastToRoom(sId, cdMsg);
              },
              (session) => {
                const startMsg: ServerMessage = {
                  event: "race_start",
                  startTime: session.startTime ?? Date.now(),
                  text: session.text,
                  author: session.author,
                  durationSeconds: session.durationSeconds,
                };
                broadcastToRoom(sId, startMsg);
              },
              (remainingSeconds) => {
                const tickMsg: ServerMessage = {
                  event: "timer_sync",
                  remainingSeconds,
                };
                broadcastToRoom(sId, tickMsg);
              },
              (leaderboard) => {
                const finishedMsg: ServerMessage = {
                  event: "race_finished",
                  leaderboard,
                };
                broadcastToRoom(sId, finishedMsg);
              },
              {
                durationSeconds: msg.durationSeconds,
                mode: msg.mode,
                modeValue: msg.modeValue,
                language: msg.language,
                punctuation: msg.punctuation,
                numbers: msg.numbers,
                customText: msg.customText,
              },
            );
            break;
          }

          case "reset_race": {
            const meta = clientMeta.get(ws);
            const sId = meta?.sessionId;
            if (sId === undefined) return;

            const newSession = raceManager.resetRace(sId, {
              customText: msg.customText,
              durationSeconds: msg.durationSeconds,
              mode: msg.mode,
              modeValue: msg.modeValue,
              language: msg.language,
              punctuation: msg.punctuation,
              numbers: msg.numbers,
            });
            if (newSession !== undefined) {
              const resetMsg: ServerMessage = {
                event: "race_reset",
                session: newSession,
              };
              broadcastToRoom(sId, resetMsg);
            }
            break;
          }
        }
      } catch (err) {
        console.error("Race WS error handling message:", err);
      }
    });

    ws.on("close", () => {
      const meta = clientMeta.get(ws);
      const sId = meta?.sessionId;
      const pId = meta?.participantId;
      if (sId !== undefined && pId !== undefined) {
        raceManager.removeParticipant(sId, pId);
        const leftMsg: ServerMessage = {
          event: "participant_left",
          id: pId,
        };
        broadcastToRoom(sId, leftMsg);
      }
    });
  });

  return wss;
}
