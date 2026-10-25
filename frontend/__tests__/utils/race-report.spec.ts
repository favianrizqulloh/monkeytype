import { describe, expect, it } from "vitest";

import { RaceParticipantState } from "../../src/ts/states/race";
import {
  calculateClassStatistics,
  calculateTypingGrade,
  generateStudentReportRows,
} from "../../src/ts/utils/race-report";

describe("race-report utilities", () => {
  it("calculates balanced typing grades and predicates correctly", () => {
    // 60 WPM with 100% accuracy = 70 + 30 = 100 (A)
    const g100 = calculateTypingGrade(60, 100);
    expect(g100.score).toBe(100);
    expect(g100.predicate).toBe("A (Sangat Baik)");

    // Speeds above 60 WPM with 100% accuracy cap at 100
    const gOver = calculateTypingGrade(90, 100);
    expect(gOver.score).toBe(100);
    expect(gOver.predicate).toBe("A (Sangat Baik)");

    // 40 WPM with 95% accuracy = round(46.67 + 28.5) = 75 (B)
    const g75 = calculateTypingGrade(40, 95);
    expect(g75.score).toBe(75);
    expect(g75.predicate).toBe("B (Baik)");

    // 30 WPM with 90% accuracy = round(35 + 27) = 62 (C)
    const g62 = calculateTypingGrade(30, 90);
    expect(g62.score).toBe(62);
    expect(g62.predicate).toBe("C (Cukup)");

    // 15 WPM with 80% accuracy = round(17.5 + 24) = 42 (D)
    const g42 = calculateTypingGrade(15, 80);
    expect(g42.score).toBe(42);
    expect(g42.predicate).toBe("D (Perlu Bimbingan)");
  });

  it("calculates class statistics accurately", () => {
    const mockParticipants: RaceParticipantState[] = [
      {
        id: "p1",
        name: "Budi Santoso",
        isTeacher: false,
        progress: 100,
        wpm: 60,
        accuracy: 98,
        finished: true,
        bestWpm: 65,
        bestAccuracy: 98,
        attemptsCount: 2,
      },
      {
        id: "p2",
        name: "Siti Rahma",
        isTeacher: false,
        progress: 100,
        wpm: 45,
        accuracy: 96,
        finished: true,
        bestWpm: 45,
        bestAccuracy: 96,
        attemptsCount: 1,
      },
      {
        id: "p3",
        name: "Ahmad Dani",
        isTeacher: false,
        progress: 80,
        wpm: 30,
        accuracy: 90,
        finished: false,
        bestWpm: 30,
        bestAccuracy: 90,
        attemptsCount: 1,
      },
      {
        id: "teacher",
        name: "Guru Pengawas",
        isTeacher: true,
        progress: 0,
        wpm: 0,
        accuracy: 100,
        finished: false,
      },
    ];

    const stats = calculateClassStatistics(mockParticipants);
    // Teacher should be excluded
    expect(stats.totalParticipants).toBe(3);
    // Average WPM = (65 + 45 + 30) / 3 = 46.67 -> 47
    expect(stats.avgWpm).toBe(47);
    // Average Accuracy = (98 + 96 + 90) / 3 = 94.67 -> 95
    expect(stats.avgAccuracy).toBe(95);
    expect(stats.maxWpm).toBe(65);
    expect(stats.minWpm).toBe(30);
    expect(stats.topStudentName).toBe("Budi Santoso");
    expect(stats.totalAttempts).toBe(4);
  });

  it("handles empty participants list gracefully in statistics", () => {
    const emptyStats = calculateClassStatistics([]);
    expect(emptyStats.totalParticipants).toBe(0);
    expect(emptyStats.avgWpm).toBe(0);
    expect(emptyStats.avgScore).toBe(0);
    expect(emptyStats.topStudentName).toBe("—");
  });

  it("generates correctly sorted student report rows", () => {
    const mockParticipants: RaceParticipantState[] = [
      {
        id: "p2",
        name: "Siti Rahma",
        isTeacher: false,
        progress: 100,
        wpm: 45,
        accuracy: 96,
        finished: true,
        bestWpm: 45,
        bestAccuracy: 96,
        attemptsCount: 1,
      },
      {
        id: "p1",
        name: "Budi Santoso",
        isTeacher: false,
        progress: 100,
        wpm: 60,
        accuracy: 98,
        finished: true,
        bestWpm: 65,
        bestAccuracy: 98,
        attemptsCount: 2,
      },
    ];

    const rows = generateStudentReportRows(mockParticipants);
    expect(rows.length).toBe(2);
    expect(rows[0]?.name).toBe("Budi Santoso");
    expect(rows[0]?.bestWpm).toBe(65);
    expect(rows[0]?.netWpm).toBe(63.7);
    expect(rows[0]?.rank).toBe(1);

    expect(rows[1]?.name).toBe("Siti Rahma");
    expect(rows[1]?.bestWpm).toBe(45);
    expect(rows[1]?.rank).toBe(2);
  });
});
