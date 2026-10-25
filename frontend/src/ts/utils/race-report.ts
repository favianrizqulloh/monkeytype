import { RaceParticipantState } from "../states/race";

export type TypingGradeResult = {
  score: number;
  predicate: string;
};

export type ClassStatistics = {
  totalParticipants: number;
  avgWpm: number;
  avgAccuracy: number;
  avgScore: number;
  maxWpm: number;
  minWpm: number;
  totalAttempts: number;
  topStudentName: string;
};

export type StudentReportRow = {
  rank: number;
  name: string;
  bestWpm: number;
  bestAccuracy: number;
  netWpm: number;
  attemptsCount: number;
  score: number;
  predicate: string;
};

/**
 * Kalkulasi Nilai Akhir Siswa (Skala 0-100) berbasis standar evaluasi lab komputer:
 * 70% Kecepatan WPM (patokan 60 WPM) + 30% Akurasi Pengetikan.
 */
export function calculateTypingGrade(
  wpm: number,
  accuracy: number,
): TypingGradeResult {
  const safeWpm = Math.max(0, wpm);
  const safeAcc = Math.min(100, Math.max(0, accuracy));

  const speedComponent = (safeWpm / 60) * 70;
  const accuracyComponent = (safeAcc / 100) * 30;
  const rawScore = Math.min(
    100,
    Math.round(speedComponent + accuracyComponent),
  );

  let predicate = "D (Perlu Bimbingan)";
  if (rawScore >= 85) {
    predicate = "A (Sangat Baik)";
  } else if (rawScore >= 70) {
    predicate = "B (Baik)";
  } else if (rawScore >= 55) {
    predicate = "C (Cukup)";
  }

  return {
    score: rawScore,
    predicate,
  };
}

/**
 * Kalkulasi ringkasan statistik satu kelas/sesi lomba.
 */
export function calculateClassStatistics(
  participants: RaceParticipantState[],
): ClassStatistics {
  const students = participants.filter((p) => !p.isTeacher);
  const total = students.length;

  if (total === 0) {
    return {
      totalParticipants: 0,
      avgWpm: 0,
      avgAccuracy: 0,
      avgScore: 0,
      maxWpm: 0,
      minWpm: 0,
      totalAttempts: 0,
      topStudentName: "—",
    };
  }

  let sumWpm = 0;
  let sumAcc = 0;
  let sumScore = 0;
  let maxWpm = -1;
  let minWpm = 999999;
  let totalAttempts = 0;
  let topStudentName = "—";

  for (const s of students) {
    const wpm = s.bestWpm ?? s.wpm ?? 0;
    const acc = s.bestAccuracy ?? s.accuracy ?? 100;
    const fallbackAttempts = s.progress > 0 ? 1 : 0;
    const attempts = s.attemptsCount ?? fallbackAttempts;
    const grade = calculateTypingGrade(wpm, acc);

    sumWpm += wpm;
    sumAcc += acc;
    sumScore += grade.score;
    totalAttempts += attempts;

    if (wpm > maxWpm) {
      maxWpm = wpm;
      topStudentName = s.name;
    }
    if (wpm < minWpm) {
      minWpm = wpm;
    }
  }

  return {
    totalParticipants: total,
    avgWpm: Math.round(sumWpm / total),
    avgAccuracy: Math.round(sumAcc / total),
    avgScore: Math.round(sumScore / total),
    maxWpm: Math.max(0, maxWpm),
    minWpm: minWpm === 999999 ? 0 : minWpm,
    totalAttempts,
    topStudentName,
  };
}

/**
 * Menghasilkan baris-baris laporan siswa berurutan sesuai peringkat.
 */
export function generateStudentReportRows(
  participants: RaceParticipantState[],
): StudentReportRow[] {
  const students = participants
    .filter((p) => !p.isTeacher)
    .sort((a, b) => {
      const bWpm = b.bestWpm ?? b.wpm ?? 0;
      const aWpm = a.bestWpm ?? a.wpm ?? 0;
      if (bWpm !== aWpm) return bWpm - aWpm;
      const bAcc = b.bestAccuracy ?? b.accuracy ?? 100;
      const aAcc = a.bestAccuracy ?? a.accuracy ?? 100;
      return bAcc - aAcc;
    });

  return students.map((s, idx) => {
    const bestWpm = s.bestWpm ?? s.wpm ?? 0;
    const bestAccuracy = s.bestAccuracy ?? s.accuracy ?? 100;
    const netWpm = Math.round(bestWpm * (bestAccuracy / 100) * 10) / 10;
    const fallbackAttempts = s.progress > 0 ? 1 : 0;
    const attemptsCount = s.attemptsCount ?? fallbackAttempts;
    const fallbackRank = idx + 1;
    const grade = calculateTypingGrade(bestWpm, bestAccuracy);

    return {
      rank: s.rank ?? fallbackRank,
      name: s.name,
      bestWpm,
      bestAccuracy,
      netWpm,
      attemptsCount,
      score: grade.score,
      predicate: grade.predicate,
    };
  });
}

/**
 * Mengunduh file CSV (.csv) ber-BOM UTF-8 yang kompatibel dengan Microsoft Excel & Google Sheets.
 */
export function exportRaceResultsToCsv(
  sessionId: string,
  participants: RaceParticipantState[],
  sessionMeta: {
    durationSeconds: number;
    mode: string;
    modeValue?: number;
    language: string;
  },
): void {
  const rows = generateStudentReportRows(participants);
  const stats = calculateClassStatistics(participants);

  const dateStr = new Date().toLocaleString("id-ID", {
    dateStyle: "full",
    timeStyle: "medium",
  });

  const lines: string[] = [];

  lines.push(
    "LAPORAN HASIL PENILAIAN LOMBA MENGETIK CEPAT (TYPINGTEST LIVE COMPETITION)",
  );
  lines.push("");
  lines.push("INFORMASI SESI");
  lines.push(`Kode Sesi,#${sessionId}`);
  lines.push(`Waktu Pelaksanaan,"${dateStr}"`);
  const modeValueLabel =
    sessionMeta.modeValue !== undefined ? ` (${sessionMeta.modeValue})` : "";
  lines.push(`Mode Lomba,${sessionMeta.mode}${modeValueLabel}`);
  lines.push(`Bahasa Teks,${sessionMeta.language}`);
  lines.push(
    `Durasi Sesi,${sessionMeta.durationSeconds} Detik (${Math.round(sessionMeta.durationSeconds / 60)} Menit)`,
  );
  lines.push("");

  lines.push("RINGKASAN & STATISTIK KELAS");
  lines.push(`Total Peserta,${stats.totalParticipants} Siswa`);
  lines.push(`Rata-rata Kecepatan (WPM),${stats.avgWpm} WPM`);
  lines.push(`Rata-rata Akurasi,${stats.avgAccuracy} %`);
  lines.push(`Rata-rata Nilai Siswa,${stats.avgScore} / 100`);
  lines.push(
    `Kecepatan Tertinggi (Juara 1),${stats.maxWpm} WPM (${stats.topStudentName})`,
  );
  lines.push(`Kecepatan Terendah,${stats.minWpm} WPM`);
  lines.push(`Total Putaran Diketik,${stats.totalAttempts} Putaran`);
  lines.push("");

  lines.push("DAFTAR NILAI DAN PERINGKAT SISWA");
  lines.push(
    "Peringkat,Nama Siswa,WPM Terbaik,Akurasi (%),WPM Bersih,Jumlah Putaran,Nilai Akhir (0-100),Predikat",
  );

  for (const r of rows) {
    const escapedName = `"${r.name.replace(/"/g, '""')}"`;
    lines.push(
      `${r.rank},${escapedName},${r.bestWpm},${r.bestAccuracy}%,${r.netWpm},${r.attemptsCount},${r.score},"${r.predicate}"`,
    );
  }

  const csvContent = lines.join("\r\n");
  const blob = new Blob([`\uFEFF${csvContent}`], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const dateFile = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `Laporan_Nilai_TypingTest_Sesi_${sessionId}_${dateFile}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
