import {
  generatePassage,
  GeneratedPassage,
  PassageOptions,
} from "./passage-generator";
import { RaceParticipant, RaceSession, SerializedSession } from "./race-types";

export class RaceManager {
  private sessions = new Map<string, RaceSession>();
  private activeTimers = new Map<string, NodeJS.Timeout[]>();

  public getOrCreateSession(
    sessionId: string,
    options?: {
      durationSeconds?: number;
      mode?: "time" | "words" | "quote" | "custom";
      modeValue?: number;
      language?: "indonesian" | "english";
      punctuation?: boolean;
      numbers?: boolean;
      customText?: string;
    },
  ): RaceSession {
    const existing = this.sessions.get(sessionId);
    if (existing !== undefined) {
      if (
        options?.durationSeconds !== undefined &&
        options.durationSeconds > 0
      ) {
        existing.durationSeconds = options.durationSeconds;
      }
      return existing;
    }

    const passageOptions: PassageOptions = {
      mode: options?.mode ?? "time",
      modeValue: options?.modeValue ?? 180,
      language: options?.language ?? "indonesian",
      punctuation: options?.punctuation ?? false,
      numbers: options?.numbers ?? false,
      customText: options?.customText,
    };

    const passage = generatePassage(passageOptions);
    const duration =
      options?.durationSeconds !== undefined && options.durationSeconds > 0
        ? options.durationSeconds
        : 180;

    const session: RaceSession = {
      id: sessionId,
      status: "lobby",
      createdAt: Date.now(),
      text: passage.text,
      author: passage.author,
      durationSeconds: duration,
      mode: options?.mode ?? "time",
      modeValue: options?.modeValue ?? 180,
      language: options?.language ?? "indonesian",
      punctuation: options?.punctuation ?? false,
      numbers: options?.numbers ?? false,
      customText: options?.customText,
      participants: new Map<string, RaceParticipant>(),
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  public getSession(sessionId: string): RaceSession | undefined {
    return this.sessions.get(sessionId);
  }

  public joinParticipant(
    sessionId: string,
    participantId: string,
    name: string,
    isTeacher: boolean,
    customDurationSeconds?: number,
  ): RaceParticipant {
    const session = this.getOrCreateSession(sessionId, {
      durationSeconds: customDurationSeconds,
    });
    const participant: RaceParticipant = {
      id: participantId,
      name: name.trim() || "Siswa",
      isTeacher,
      progress: 0,
      wpm: 0,
      accuracy: 100,
      finished: false,
      bestWpm: 0,
      bestAccuracy: 100,
      attemptsCount: 0,
    };

    session.participants.set(participantId, participant);
    return participant;
  }

  public removeParticipant(sessionId: string, participantId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (session === undefined) return false;

    const removed = session.participants.delete(participantId);
    if (session.participants.size === 0) {
      this.clearSessionTimers(sessionId);
      this.sessions.delete(sessionId);
    }
    return removed;
  }

  public updateProgress(
    sessionId: string,
    participantId: string,
    progress: number,
    wpm: number,
    accuracy: number,
  ): RaceParticipant | undefined {
    const session = this.sessions.get(sessionId);
    if (session?.status !== "racing") return undefined;

    const participant = session.participants.get(participantId);
    if (participant === undefined) return undefined;

    const currentWpm = Math.max(0, Math.round(wpm));
    const currentAcc = Math.min(100, Math.max(0, Math.round(accuracy)));
    participant.progress = Math.min(100, Math.max(0, Math.round(progress)));
    participant.wpm = currentWpm;
    participant.accuracy = currentAcc;

    if (currentWpm > participant.bestWpm) {
      participant.bestWpm = currentWpm;
      participant.bestAccuracy = currentAcc;
    }

    return participant;
  }

  public finishParticipant(
    sessionId: string,
    participantId: string,
    wpm: number,
    accuracy: number,
    durationSeconds: number,
  ):
    | { participant: RaceParticipant; leaderboard: RaceParticipant[] }
    | undefined {
    const session = this.sessions.get(sessionId);
    if (session === undefined) return undefined;

    const participant = session.participants.get(participantId);
    if (participant === undefined) return undefined;

    participant.attemptsCount += 1;
    const finalWpm = Math.max(0, Math.round(wpm));
    const finalAcc = Math.min(100, Math.max(0, Math.round(accuracy)));
    participant.finished = true;
    participant.progress = 100;
    participant.wpm = finalWpm;
    participant.accuracy = finalAcc;
    participant.finishTime = Date.now();
    participant.durationSeconds = durationSeconds;

    if (finalWpm > participant.bestWpm) {
      participant.bestWpm = finalWpm;
      participant.bestAccuracy = finalAcc;
    }

    const leaderboard = this.getLeaderboard(session);
    return { participant, leaderboard };
  }

  public startNextAttempt(
    sessionId: string,
    participantId: string,
  ): { participant: RaceParticipant; passage: GeneratedPassage } | undefined {
    const session = this.sessions.get(sessionId);
    if (session?.status !== "racing") return undefined;

    const participant = session.participants.get(participantId);
    if (participant === undefined) return undefined;

    participant.progress = 0;
    participant.wpm = 0;
    participant.accuracy = 100;
    participant.finished = false;

    const passage = generatePassage({
      mode: session.mode,
      modeValue: session.modeValue,
      durationSeconds: session.durationSeconds,
      language: session.language,
      punctuation: session.punctuation,
      numbers: session.numbers,
      customText: session.customText,
    });

    return { participant, passage };
  }

  public startRace(
    sessionId: string,
    onCountdown: (seconds: number) => void,
    onStart: (session: SerializedSession) => void,
    onTick: (remainingSeconds: number) => void,
    onTimeout: (leaderboard: RaceParticipant[]) => void,
    options?: {
      durationSeconds?: number;
      mode?: "time" | "words" | "quote" | "custom";
      modeValue?: number;
      language?: "indonesian" | "english";
      punctuation?: boolean;
      numbers?: boolean;
      customText?: string;
    },
  ): boolean {
    const session = this.sessions.get(sessionId);
    if (session === undefined) return false;

    if (options !== undefined) {
      if (
        options.durationSeconds !== undefined &&
        options.durationSeconds > 0
      ) {
        session.durationSeconds = options.durationSeconds;
      }
      if (options.mode !== undefined) {
        session.mode = options.mode;
      }
      if (options.modeValue !== undefined) {
        session.modeValue = options.modeValue;
      }
      if (options.language !== undefined) {
        session.language = options.language;
      }
      if (options.punctuation !== undefined) {
        session.punctuation = options.punctuation;
      }
      if (options.numbers !== undefined) {
        session.numbers = options.numbers;
      }
      if (options.customText !== undefined) {
        session.customText = options.customText;
      }

      const passage = generatePassage({
        mode: session.mode,
        modeValue: session.modeValue,
        language: session.language,
        punctuation: session.punctuation,
        numbers: session.numbers,
        customText: session.customText,
      });
      session.text = passage.text;
      session.author = passage.author;
    }

    // Reset participant progress before race starts
    for (const p of session.participants.values()) {
      p.progress = 0;
      p.wpm = 0;
      p.accuracy = 100;
      p.finished = false;
      p.bestWpm = 0;
      p.bestAccuracy = 100;
      p.attemptsCount = 0;
      p.rank = undefined;
      p.finishTime = undefined;
      p.durationSeconds = undefined;
    }

    this.clearSessionTimers(sessionId);
    session.status = "countdown";

    let count = 3;
    onCountdown(count);

    const countdownTimer = setInterval(() => {
      count -= 1;
      if (count > 0) {
        onCountdown(count);
      } else {
        clearInterval(countdownTimer);
        session.status = "racing";
        session.startTime = Date.now();
        onStart(this.serializeSession(session));

        // Start 1-second server tick for absolute timer synchronization
        const tickInterval = setInterval(() => {
          const currentSession = this.sessions.get(sessionId);
          if (currentSession?.status !== "racing") {
            clearInterval(tickInterval);
            return;
          }

          const elapsedSec = Math.floor(
            (Date.now() - (currentSession.startTime ?? Date.now())) / 1000,
          );
          const remainingSec = Math.max(
            0,
            currentSession.durationSeconds - elapsedSec,
          );

          onTick(remainingSec);

          if (remainingSec <= 0) {
            clearInterval(tickInterval);
            this.concludeRace(sessionId, onTimeout);
          }
        }, 1000);

        this.addTimer(sessionId, tickInterval);
      }
    }, 1000);

    this.addTimer(sessionId, countdownTimer);
    return true;
  }

  public concludeRace(
    sessionId: string,
    onTimeout?: (leaderboard: RaceParticipant[]) => void,
  ): RaceParticipant[] {
    const session = this.sessions.get(sessionId);
    if (session === undefined) return [];

    session.status = "finished";
    this.clearSessionTimers(sessionId);

    for (const p of session.participants.values()) {
      p.finished = true;
    }

    const leaderboard = this.getLeaderboard(session);
    if (onTimeout !== undefined) {
      onTimeout(leaderboard);
    }
    return leaderboard;
  }

  public resetRace(
    sessionId: string,
    options?: {
      customText?: string;
      durationSeconds?: number;
      mode?: "time" | "words" | "quote" | "custom";
      modeValue?: number;
      language?: "indonesian" | "english";
      punctuation?: boolean;
      numbers?: boolean;
    },
  ): SerializedSession | undefined {
    const session = this.sessions.get(sessionId);
    if (session === undefined) return undefined;

    this.clearSessionTimers(sessionId);
    session.status = "lobby";

    if (options?.durationSeconds !== undefined && options.durationSeconds > 0) {
      session.durationSeconds = options.durationSeconds;
    }
    if (options?.mode !== undefined) {
      session.mode = options.mode;
    }
    if (options?.modeValue !== undefined) {
      session.modeValue = options.modeValue;
    }
    if (options?.language !== undefined) {
      session.language = options.language;
    }
    if (options?.punctuation !== undefined) {
      session.punctuation = options.punctuation;
    }
    if (options?.numbers !== undefined) {
      session.numbers = options.numbers;
    }
    if (options?.customText !== undefined) {
      session.customText = options.customText;
    }

    const passage = generatePassage({
      mode: session.mode,
      modeValue: session.modeValue,
      language: session.language,
      punctuation: session.punctuation,
      numbers: session.numbers,
      customText: session.customText,
    });
    session.text = passage.text;
    session.author = passage.author;

    for (const p of session.participants.values()) {
      p.progress = 0;
      p.wpm = 0;
      p.accuracy = 100;
      p.finished = false;
      p.bestWpm = 0;
      p.bestAccuracy = 100;
      p.attemptsCount = 0;
      p.rank = undefined;
      p.finishTime = undefined;
      p.durationSeconds = undefined;
    }

    return this.serializeSession(session);
  }

  public getLeaderboard(session: RaceSession): RaceParticipant[] {
    const list = Array.from(session.participants.values())
      .filter((p) => !p.isTeacher)
      .sort((a, b) => {
        if (b.bestWpm !== a.bestWpm) {
          return b.bestWpm - a.bestWpm;
        }
        if (b.bestAccuracy !== a.bestAccuracy) {
          return b.bestAccuracy - a.bestAccuracy;
        }
        if (b.progress !== a.progress) {
          return b.progress - a.progress;
        }
        return b.wpm - a.wpm;
      });

    list.forEach((p, idx) => {
      p.rank = idx + 1;
    });

    return list;
  }

  public serializeSession(session: RaceSession): SerializedSession {
    return {
      id: session.id,
      status: session.status,
      text: session.text,
      author: session.author,
      durationSeconds: session.durationSeconds,
      startTime: session.startTime,
      countdownValue: session.countdownValue,
      mode: session.mode,
      modeValue: session.modeValue,
      language: session.language,
      punctuation: session.punctuation,
      numbers: session.numbers,
      customText: session.customText,
      participants: Array.from(session.participants.values()),
    };
  }

  private addTimer(sessionId: string, timer: NodeJS.Timeout): void {
    const list = this.activeTimers.get(sessionId) ?? [];
    list.push(timer);
    this.activeTimers.set(sessionId, list);
  }

  private clearSessionTimers(sessionId: string): void {
    const list = this.activeTimers.get(sessionId);
    if (list) {
      for (const t of list) {
        clearInterval(t);
        clearTimeout(t);
      }
      this.activeTimers.delete(sessionId);
    }
  }
}

export const raceManager = new RaceManager();
