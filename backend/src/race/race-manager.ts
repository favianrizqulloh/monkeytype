import { getRandomIndonesianPassage } from "./indonesian-texts";
import { RaceParticipant, RaceSession, SerializedSession } from "./race-types";

export class RaceManager {
  private sessions = new Map<string, RaceSession>();
  private activeTimers = new Map<string, NodeJS.Timeout[]>();

  public getOrCreateSession(
    sessionId: string,
    customDurationSeconds?: number,
  ): RaceSession {
    const existing = this.sessions.get(sessionId);
    if (existing !== undefined) {
      if (customDurationSeconds !== undefined && customDurationSeconds > 0) {
        existing.durationSeconds = customDurationSeconds;
      }
      return existing;
    }

    const passage = getRandomIndonesianPassage();
    const session: RaceSession = {
      id: sessionId,
      status: "lobby",
      createdAt: Date.now(),
      text: passage.text,
      author: passage.author,
      durationSeconds:
        customDurationSeconds !== undefined && customDurationSeconds > 0
          ? customDurationSeconds
          : 180,
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
    const session = this.getOrCreateSession(sessionId, customDurationSeconds);
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
  ): RaceParticipant | undefined {
    const session = this.sessions.get(sessionId);
    if (session?.status !== "racing") return undefined;

    const participant = session.participants.get(participantId);
    if (participant === undefined) return undefined;

    participant.progress = 0;
    participant.wpm = 0;
    participant.accuracy = 100;
    participant.finished = false;

    return participant;
  }

  public startRace(
    sessionId: string,
    onCountdown: (seconds: number) => void,
    onStart: (session: SerializedSession) => void,
    onTimeout: (leaderboard: RaceParticipant[]) => void,
    customDurationSeconds?: number,
  ): boolean {
    const session = this.sessions.get(sessionId);
    if (session === undefined) return false;

    if (customDurationSeconds !== undefined && customDurationSeconds > 0) {
      session.durationSeconds = customDurationSeconds;
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

        // Start race duration timer (default 180 seconds)
        const raceTimeout = setTimeout(() => {
          this.concludeRace(sessionId, onTimeout);
        }, session.durationSeconds * 1000);

        this.addTimer(sessionId, raceTimeout);
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
    customText?: string,
    customDurationSeconds?: number,
  ): SerializedSession | undefined {
    const session = this.sessions.get(sessionId);
    if (session === undefined) return undefined;

    this.clearSessionTimers(sessionId);
    session.status = "lobby";

    if (customDurationSeconds !== undefined && customDurationSeconds > 0) {
      session.durationSeconds = customDurationSeconds;
    }

    if (customText !== undefined && customText.trim().length > 0) {
      session.text = customText.trim();
      session.author = "Pengajar";
    } else {
      const passage = getRandomIndonesianPassage();
      session.text = passage.text;
      session.author = passage.author;
    }

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
