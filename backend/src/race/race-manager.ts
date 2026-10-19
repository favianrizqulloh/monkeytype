import { getRandomIndonesianPassage } from "./indonesian-texts";
import { RaceParticipant, RaceSession, SerializedSession } from "./race-types";

export class RaceManager {
  private sessions = new Map<string, RaceSession>();
  private activeTimers = new Map<string, NodeJS.Timeout[]>();

  public getOrCreateSession(sessionId: string): RaceSession {
    const existing = this.sessions.get(sessionId);
    if (existing !== undefined) {
      return existing;
    }

    const passage = getRandomIndonesianPassage();
    const session: RaceSession = {
      id: sessionId,
      status: "lobby",
      createdAt: Date.now(),
      text: passage.text,
      author: passage.author,
      durationSeconds: 60,
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
  ): RaceParticipant {
    const session = this.getOrCreateSession(sessionId);
    const participant: RaceParticipant = {
      id: participantId,
      name: name.trim() || "Siswa",
      isTeacher,
      progress: 0,
      wpm: 0,
      accuracy: 100,
      finished: false,
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
    if (participant === undefined || participant.finished) return undefined;

    participant.progress = Math.min(100, Math.max(0, Math.round(progress)));
    participant.wpm = Math.max(0, Math.round(wpm));
    participant.accuracy = Math.min(100, Math.max(0, Math.round(accuracy)));

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

    if (!participant.finished) {
      participant.finished = true;
      participant.progress = 100;
      participant.wpm = Math.max(0, Math.round(wpm));
      participant.accuracy = Math.min(100, Math.max(0, Math.round(accuracy)));
      participant.finishTime = Date.now();
      participant.durationSeconds = durationSeconds;

      // Assign rank among finished non-teacher participants
      const finishedCount = Array.from(session.participants.values()).filter(
        (p) => !p.isTeacher && p.finished && p.id !== participantId,
      ).length;
      participant.rank = finishedCount + 1;
    }

    const leaderboard = this.getLeaderboard(session);

    // If all student participants finished, set session status = "finished"
    const students = Array.from(session.participants.values()).filter(
      (p) => !p.isTeacher,
    );
    const allFinished =
      students.length > 0 && students.every((p) => p.finished);
    if (allFinished) {
      session.status = "finished";
      this.clearSessionTimers(sessionId);
    }

    return { participant, leaderboard };
  }

  public startRace(
    sessionId: string,
    onCountdown: (seconds: number) => void,
    onStart: (session: SerializedSession) => void,
    onTimeout: (leaderboard: RaceParticipant[]) => void,
  ): boolean {
    const session = this.sessions.get(sessionId);
    if (session === undefined) return false;

    // Reset participant progress before race starts
    for (const p of session.participants.values()) {
      p.progress = 0;
      p.wpm = 0;
      p.accuracy = 100;
      p.finished = false;
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

        // Start 60-second race timer
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

    // Rank any remaining unfinished participants
    const unfinishedStudents = Array.from(session.participants.values())
      .filter((p) => !p.isTeacher && !p.finished)
      .sort((a, b) => b.progress - a.progress || b.wpm - a.wpm);

    const alreadyFinishedCount = Array.from(
      session.participants.values(),
    ).filter((p) => !p.isTeacher && p.finished).length;

    unfinishedStudents.forEach((student, index) => {
      student.finished = true;
      student.rank = alreadyFinishedCount + index + 1;
      student.durationSeconds = session.durationSeconds;
    });

    const leaderboard = this.getLeaderboard(session);
    if (onTimeout !== undefined) {
      onTimeout(leaderboard);
    }
    return leaderboard;
  }

  public resetRace(
    sessionId: string,
    customText?: string,
  ): SerializedSession | undefined {
    const session = this.sessions.get(sessionId);
    if (session === undefined) return undefined;

    this.clearSessionTimers(sessionId);
    session.status = "lobby";

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
      p.rank = undefined;
      p.finishTime = undefined;
      p.durationSeconds = undefined;
    }

    return this.serializeSession(session);
  }

  public getLeaderboard(session: RaceSession): RaceParticipant[] {
    return Array.from(session.participants.values())
      .filter((p) => !p.isTeacher)
      .sort((a, b) => {
        if (a.rank !== undefined && b.rank !== undefined) {
          return a.rank - b.rank;
        }
        if (a.rank !== undefined) return -1;
        if (b.rank !== undefined) return 1;
        if (b.progress !== a.progress) {
          return b.progress - a.progress;
        }
        return b.wpm - a.wpm;
      });
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
