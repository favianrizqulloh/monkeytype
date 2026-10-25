import { createMemo, For, JSXElement, Show } from "solid-js";

import { RaceParticipantState } from "../../../states/race";
import { cn } from "../../../utils/cn";
import {
  calculateClassStatistics,
  exportRaceResultsToCsv,
  generateStudentReportRows,
} from "../../../utils/race-report";
import { Button } from "../../common/Button";
import { Fa } from "../../common/Fa";

export type RaceReportModalProps = {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  participants: RaceParticipantState[];
  sessionMeta: {
    durationSeconds: number;
    mode: string;
    modeValue?: number;
    language: string;
  };
};

export function RaceReportModal(props: RaceReportModalProps): JSXElement {
  const rows = createMemo(() => generateStudentReportRows(props.participants));
  const stats = createMemo(() => calculateClassStatistics(props.participants));

  const currentDateFormatted = createMemo(() =>
    new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  );

  const handlePrint = (): void => {
    window.print();
  };

  const handleExportCsv = (): void => {
    exportRaceResultsToCsv(
      props.sessionId,
      props.participants,
      props.sessionMeta,
    );
  };

  return (
    <Show when={props.isOpen}>
      <div class="bg-black/80 print:bg-white fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm print:static print:p-0">
        <div class="print:text-black flex max-h-[92vh] w-full max-w-4xl flex-col rounded-double border border-sub/30 bg-bg p-6 text-text shadow-2xl print:max-h-none print:max-w-none print:border-none print:p-8 print:shadow-none">
          {/* Action Bar (Hidden when Printing) */}
          <div class="flex items-center justify-between border-b border-sub/20 pb-4 print:hidden">
            <div class="flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-main/15 text-main">
                <Fa icon="fa-file-invoice" size={1.25} />
              </div>
              <div>
                <h2 class="text-lg font-bold text-text">
                  Laporan Rekapitulasi Nilai Siswa
                </h2>
                <p class="text-xs text-sub">
                  Sesi #{props.sessionId} — Siap Diekspor ke Excel atau Dicetak
                  ke PDF
                </p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <Button
                variant="text"
                class="rounded-radius flex items-center gap-2 bg-main/20 px-3.5 py-2 text-xs font-bold text-main transition-all hover:bg-main hover:text-bg"
                onClick={handleExportCsv}
              >
                <Fa icon="fa-file-csv" />
                <span>Download CSV (Excel)</span>
              </Button>

              <Button
                variant="text"
                class="rounded-radius flex items-center gap-2 bg-main px-4 py-2 text-xs font-bold text-bg shadow-[0_2px_10px_var(--main-color)] transition-all hover:brightness-110"
                onClick={handlePrint}
              >
                <Fa icon="fa-print" />
                <span>Cetak / Simpan PDF</span>
              </Button>

              <button
                type="button"
                class="rounded-radius flex h-8 w-8 items-center justify-center text-sub transition-colors hover:bg-sub/20 hover:text-text"
                onClick={() => props.onClose()}
              >
                <Fa icon="fa-times" />
              </button>
            </div>
          </div>

          {/* Printable Report Document Body */}
          <div class="mt-4 flex flex-1 flex-col gap-6 overflow-y-auto pr-1 print:overflow-visible print:pr-0">
            {/* Kop Laporan Resmi */}
            <div class="print:border-black flex items-center justify-between border-b-2 border-text/40 pb-4">
              <div class="flex items-center gap-4">
                <div class="print:border-black print:text-black flex h-14 w-14 items-center justify-center rounded-2xl bg-main/20 font-black text-main print:border">
                  <Fa icon="fa-keyboard" size={2} />
                </div>
                <div>
                  <h1 class="print:text-black text-xl font-black tracking-tight text-text uppercase">
                    Lembar Penilaian Lomba Mengetik Cepat
                  </h1>
                  <p class="print:text-gray-600 text-xs font-semibold text-sub uppercase">
                    TypingTest Live Competition — Laboratorium Komputer Sekolah
                  </p>
                </div>
              </div>
              <div class="print:text-black text-right text-xs text-sub">
                <p class="print:text-black font-mono font-bold text-main">
                  SESI #{props.sessionId}
                </p>
                <p>{currentDateFormatted()}</p>
              </div>
            </div>

            {/* Sesi Metadata */}
            <div class="rounded-radius print:border-gray-300 print:bg-gray-50 print:text-black grid grid-cols-2 gap-3 border border-sub/20 bg-sub-alt/30 p-3.5 text-xs text-sub md:grid-cols-4">
              <div>
                <span class="print:text-gray-500 block text-[10px] text-sub uppercase">
                  Mode Lomba
                </span>
                <span class="print:text-black font-bold text-text uppercase">
                  {props.sessionMeta.mode}
                  {props.sessionMeta.modeValue !== undefined
                    ? ` (${props.sessionMeta.modeValue})`
                    : ""}
                </span>
              </div>
              <div>
                <span class="print:text-gray-500 block text-[10px] text-sub uppercase">
                  Bahasa Teks
                </span>
                <span class="print:text-black font-bold text-text uppercase">
                  {props.sessionMeta.language}
                </span>
              </div>
              <div>
                <span class="print:text-gray-500 block text-[10px] text-sub uppercase">
                  Durasi Sesi
                </span>
                <span class="print:text-black font-bold text-text">
                  {props.sessionMeta.durationSeconds} Detik (
                  {Math.round(props.sessionMeta.durationSeconds / 60)} Menit)
                </span>
              </div>
              <div>
                <span class="print:text-gray-500 block text-[10px] text-sub uppercase">
                  Waktu Cetak
                </span>
                <span class="print:text-black font-bold text-text">
                  {new Date().toLocaleTimeString("id-ID")}
                </span>
              </div>
            </div>

            {/* Statistik Ringkasan Kelas */}
            <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div class="rounded-radius print:border-gray-300 print:bg-white flex flex-col border border-sub/20 bg-bg p-3.5 shadow-xs">
                <span class="print:text-gray-500 text-[10px] font-semibold text-sub uppercase">
                  Total Peserta
                </span>
                <span class="print:text-black font-mono text-2xl font-black text-text">
                  {stats().totalParticipants}{" "}
                  <span class="text-xs font-normal text-sub">Siswa</span>
                </span>
              </div>

              <div class="rounded-radius print:border-gray-300 print:bg-white flex flex-col border border-sub/20 bg-bg p-3.5 shadow-xs">
                <span class="print:text-gray-500 text-[10px] font-semibold text-sub uppercase">
                  Rata-rata WPM Kelas
                </span>
                <span class="print:text-black font-mono text-2xl font-black text-main">
                  {stats().avgWpm}{" "}
                  <span class="text-xs font-normal text-sub">WPM</span>
                </span>
              </div>

              <div class="rounded-radius print:border-gray-300 print:bg-white flex flex-col border border-sub/20 bg-bg p-3.5 shadow-xs">
                <span class="print:text-gray-500 text-[10px] font-semibold text-sub uppercase">
                  Rata-rata Akurasi
                </span>
                <span class="print:text-black font-mono text-2xl font-black text-text">
                  {stats().avgAccuracy}%
                </span>
              </div>

              <div class="rounded-radius print:border-gray-300 print:bg-white flex flex-col border border-sub/20 bg-bg p-3.5 shadow-xs">
                <span class="print:text-gray-500 text-[10px] font-semibold text-sub uppercase">
                  Rata-rata Nilai Kelas
                </span>
                <span class="print:text-black font-mono text-2xl font-black text-main">
                  {stats().avgScore}{" "}
                  <span class="text-xs font-normal text-sub">/ 100</span>
                </span>
              </div>
            </div>

            {/* Tabel Nilai Lengkap Siswa */}
            <div class="rounded-radius print:border-gray-300 overflow-hidden border border-sub/20">
              <table class="w-full text-left text-xs">
                <thead class="print:border-gray-400 print:bg-gray-100 print:text-black border-b border-sub/20 bg-sub-alt/60 text-[11px] font-bold text-sub uppercase print:border-b-2">
                  <tr>
                    <th class="py-2.5 pr-2 pl-4 text-center">Rank</th>
                    <th class="px-3 py-2.5">Nama Lengkap Siswa</th>
                    <th class="px-3 py-2.5 text-center">WPM Terbaik</th>
                    <th class="px-3 py-2.5 text-center">Akurasi</th>
                    <th class="px-3 py-2.5 text-center">WPM Bersih</th>
                    <th class="px-3 py-2.5 text-center">Putaran</th>
                    <th class="px-3 py-2.5 text-center">Nilai Akhir</th>
                    <th class="py-2.5 pr-4 pl-3 text-center">Predikat</th>
                  </tr>
                </thead>
                <tbody class="print:divide-gray-300 divide-y divide-sub/10 font-mono">
                  <For
                    each={rows()}
                    fallback={
                      <tr>
                        <td
                          colSpan={8}
                          class="py-8 text-center font-sans text-sm text-sub"
                        >
                          Belum ada peserta yang menyelesaikan lomba.
                        </td>
                      </tr>
                    }
                  >
                    {(student) => (
                      <tr class="print:text-black transition-colors hover:bg-sub-alt/20">
                        <td class="py-2.5 pr-2 pl-4 text-center font-bold">
                          <span
                            class={cn(
                              "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-black",
                              {
                                "bg-yellow-500/20 text-yellow-500 print:border-black print:text-black print:border":
                                  student.rank === 1,
                                "bg-slate-300/20 text-slate-300 print:text-black":
                                  student.rank === 2,
                                "bg-amber-700/20 text-amber-500 print:text-black":
                                  student.rank === 3,
                                "print:text-black text-sub": student.rank > 3,
                              },
                            )}
                          >
                            #{student.rank}
                          </span>
                        </td>
                        <td class="print:text-black px-3 py-2.5 font-sans font-semibold text-text">
                          {student.name}
                        </td>
                        <td class="print:text-black px-3 py-2.5 text-center font-bold text-main">
                          {student.bestWpm}
                        </td>
                        <td class="print:text-black px-3 py-2.5 text-center text-text">
                          {student.bestAccuracy}%
                        </td>
                        <td class="print:text-black px-3 py-2.5 text-center text-sub">
                          {student.netWpm}
                        </td>
                        <td class="print:text-black px-3 py-2.5 text-center text-sub">
                          {student.attemptsCount}x
                        </td>
                        <td class="print:text-black px-3 py-2.5 text-center font-black text-text">
                          {student.score}
                        </td>
                        <td class="py-2.5 pr-4 pl-3 text-center font-sans">
                          <span
                            class={cn(
                              "rounded-md px-2 py-0.5 text-[10px] font-bold",
                              {
                                "print:border-black print:text-black bg-main/20 text-main print:border":
                                  student.score >= 85,
                                "print:text-black bg-sub/20 text-text":
                                  student.score >= 70 && student.score < 85,
                                "bg-yellow-500/20 text-yellow-500 print:text-black":
                                  student.score >= 55 && student.score < 70,
                                "print:text-black bg-error/20 text-error":
                                  student.score < 55,
                              },
                            )}
                          >
                            {student.predicate}
                          </span>
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>

            {/* Kolom Tanda Tangan Guru / Penguji */}
            <div class="print:text-black mt-6 flex justify-between pt-4 text-xs text-sub">
              <div class="flex flex-col gap-1 text-[11px]">
                <p>
                  * Nilai Akhir (0–100) dihitung berbasis rasio 70% Kecepatan
                  WPM dan 30% Akurasi.
                </p>
                <p>
                  * Predikat: A (&ge; 85), B (70–84), C (55–69), D (&lt; 55).
                </p>
              </div>

              <div class="flex w-64 flex-col items-center gap-16 text-center">
                <div class="flex flex-col">
                  <span>Mengetahui,</span>
                  <span class="print:text-black font-bold text-text">
                    Guru Penguji / Pengawas Lab
                  </span>
                </div>
                <div class="flex w-full flex-col items-center">
                  <div class="print:bg-black h-px w-48 bg-text/40"></div>
                  <span class="print:text-gray-600 mt-1 text-[11px] text-sub">
                    NIP. ....................................................
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
}
