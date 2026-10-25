import fs from "fs";
import path from "path";
import { indonesianPassages } from "./indonesian-texts";

export type PassageOptions = {
  mode?: "time" | "words" | "quote" | "custom";
  modeValue?: number;
  durationSeconds?: number;
  language?: "indonesian" | "english";
  punctuation?: boolean;
  numbers?: boolean;
  customText?: string;
};

export type GeneratedPassage = {
  text: string;
  author: string;
};

const englishQuotesFallback = [
  {
    text: "The future belongs to those who believe in the beauty of their dreams.",
    source: "Eleanor Roosevelt",
  },
  {
    text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    source: "Winston Churchill",
  },
  {
    text: "It does not matter how slowly you go as long as you do not stop.",
    source: "Confucius",
  },
  {
    text: "In the middle of every difficulty lies opportunity.",
    source: "Albert Einstein",
  },
  {
    text: "Learn from yesterday, live for today, hope for tomorrow. The important thing is not to stop questioning.",
    source: "Albert Einstein",
  },
  {
    text: "Live as if you were to die tomorrow. Learn as if you were to live forever.",
    source: "Mahatma Gandhi",
  },
  {
    text: "Education is the most powerful weapon which you can use to change the world.",
    source: "Nelson Mandela",
  },
  {
    text: "Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less.",
    source: "Marie Curie",
  },
  {
    text: "Whatever you are, be a good one.",
    source: "Abraham Lincoln",
  },
  {
    text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.",
    source: "Aristotle",
  },
  {
    text: "The only limit to our realization of tomorrow will be our doubts of today.",
    source: "Franklin D. Roosevelt",
  },
  {
    text: "If I have seen further than others, it is by standing upon the shoulders of giants.",
    source: "Isaac Newton",
  },
  {
    text: "An investment in knowledge pays the best interest.",
    source: "Benjamin Franklin",
  },
  {
    text: "Life is what happens when you are busy making other plans.",
    source: "John Lennon",
  },
  {
    text: "Stay hungry, stay foolish.",
    source: "Steve Jobs",
  },
];

const fallbackIndonesianWords = [
  "aku",
  "anda",
  "anak",
  "ada",
  "akan",
  "air",
  "angin",
  "antara",
  "apa",
  "arah",
  "asal",
  "atau",
  "baca",
  "bagus",
  "baik",
  "bantu",
  "banyak",
  "baru",
  "batu",
  "bawa",
  "bebas",
  "belajar",
  "benar",
  "berapa",
  "berdiri",
  "beri",
  "besar",
  "biasa",
  "bisa",
  "buku",
  "bulan",
  "bumi",
  "bunga",
  "burung",
  "cara",
  "cepat",
  "cinta",
  "coba",
  "contoh",
  "dan",
  "dapat",
  "dari",
  "datang",
  "dekat",
  "dengan",
  "depan",
  "desa",
  "dengar",
  "dia",
  "dingin",
  "diri",
  "dua",
  "duduk",
  "dunia",
  "empat",
  "enak",
  "gagasan",
  "gambar",
  "ganti",
  "gigi",
  "guna",
  "guru",
  "habis",
  "hari",
  "harus",
  "hati",
  "hidup",
  "hijau",
  "hilang",
  "hitam",
  "hujan",
  "hutan",
  "ibu",
  "ikan",
  "ikut",
  "ilmu",
  "indah",
  "ingat",
  "ingin",
  "ini",
  "itu",
  "jadi",
  "jalan",
  "jangan",
  "jauh",
  "jelas",
  "jika",
  "jiwa",
  "jual",
  "juga",
  "kaki",
  "kalau",
  "kami",
  "kamu",
  "kanan",
  "karena",
  "kata",
  "ke",
  "keluar",
  "kembali",
];

const fallbackEnglishWords = [
  "the",
  "be",
  "to",
  "of",
  "and",
  "a",
  "in",
  "that",
  "have",
  "i",
  "it",
  "for",
  "not",
  "on",
  "with",
  "he",
  "as",
  "you",
  "do",
  "at",
  "this",
  "but",
  "his",
  "by",
  "from",
  "they",
  "we",
  "say",
  "her",
  "she",
  "or",
  "an",
  "will",
  "my",
  "one",
  "all",
  "would",
  "there",
  "their",
  "what",
  "so",
  "up",
  "out",
  "if",
  "about",
  "who",
  "get",
  "which",
  "go",
  "me",
  "when",
  "make",
  "can",
  "like",
  "time",
  "no",
  "just",
  "him",
  "know",
  "take",
  "people",
  "into",
  "year",
  "your",
  "good",
  "some",
  "could",
  "them",
  "see",
  "other",
  "than",
  "then",
  "now",
  "look",
  "only",
  "come",
  "its",
  "over",
  "think",
  "also",
  "back",
  "after",
  "use",
  "two",
  "how",
  "our",
  "work",
  "first",
  "well",
  "way",
];

function resolveStaticPath(relativeSubpath: string): string {
  const tryPaths = [
    path.resolve(process.cwd(), "frontend/static", relativeSubpath),
    path.resolve(__dirname, "../../../frontend/static", relativeSubpath),
    path.resolve(__dirname, "../../static", relativeSubpath),
  ];

  for (const p of tryPaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }
  return tryPaths[0] ?? "";
}

function loadWordlist(language: "indonesian" | "english"): string[] {
  try {
    const filename =
      language === "english"
        ? "languages/english.json"
        : "languages/indonesian.json";
    const fullPath = resolveStaticPath(filename);
    if (fs.existsSync(fullPath)) {
      const parsed = JSON.parse(fs.readFileSync(fullPath, "utf-8")) as {
        words?: string[];
      };
      if (Array.isArray(parsed.words) && parsed.words.length > 0) {
        return parsed.words;
      }
    }
  } catch {}
  return language === "english"
    ? fallbackEnglishWords
    : fallbackIndonesianWords;
}

function loadQuotes(
  language: "indonesian" | "english",
): { text: string; source: string }[] {
  try {
    const filename =
      language === "english" ? "quotes/english.json" : "quotes/indonesian.json";
    const fullPath = resolveStaticPath(filename);
    if (fs.existsSync(fullPath)) {
      const parsed = JSON.parse(fs.readFileSync(fullPath, "utf-8")) as {
        quotes?: { text: string; source: string }[];
      };
      if (Array.isArray(parsed.quotes) && parsed.quotes.length > 0) {
        if (language === "indonesian") {
          const bannedWords = [
            "mulas",
            "buang air",
            "tisue",
            "patah hati",
            "patah-hati",
            "selingkuh",
            "pacar",
            "jodoh",
          ];
          const bannedSources = [
            "Raditya Dika",
            "Boy Candra",
            "Fiersa Besari",
            "Sujiwo Tejo",
            "Sujiwo Tedjo",
          ];
          const filtered = parsed.quotes.filter((q) => {
            const textLower = q.text.toLowerCase();
            if (bannedSources.some((b) => q.source.includes(b))) return false;
            if (bannedWords.some((b) => textLower.includes(b))) return false;
            return true;
          });
          const curated = indonesianPassages.map((p) => ({
            text: p.text,
            source: p.author,
          }));
          return [...curated, ...filtered];
        }
        return parsed.quotes;
      }
    }
  } catch {}

  if (language === "english") {
    return englishQuotesFallback;
  }
  return indonesianPassages.map((p) => ({ text: p.text, source: p.author }));
}

export function generatePassage(
  options: PassageOptions = {},
): GeneratedPassage {
  const {
    mode = "time",
    modeValue,
    durationSeconds,
    language = "indonesian",
    punctuation = false,
    numbers = false,
    customText,
  } = options;

  // Mode 1: Custom Text
  if (
    mode === "custom" &&
    customText !== undefined &&
    customText.trim().length > 0
  ) {
    return {
      text: customText.trim(),
      author:
        language === "english"
          ? "Teacher (Custom Text)"
          : "Pengajar (Teks Kustom)",
    };
  }

  // Mode 2: Quote (Scales words with duration)
  if (mode === "quote") {
    const quotes = loadQuotes(language);
    const sec =
      durationSeconds !== undefined && durationSeconds > 0
        ? durationSeconds
        : modeValue !== undefined && modeValue > 0
          ? modeValue
          : 180;

    let targetWords = 220;
    if (sec <= 15) targetWords = 25;
    else if (sec <= 30) targetWords = 45;
    else if (sec <= 60) targetWords = 80;
    else if (sec <= 120) targetWords = 150;
    else if (sec <= 180) targetWords = 220;
    else if (sec <= 300) targetWords = 380;
    else targetWords = 750;

    const shuffled = [...quotes].sort(() => Math.random() - 0.5);
    const selectedQuotes: { text: string; source: string }[] = [];
    let currentWordCount = 0;

    for (const q of shuffled) {
      const qWords = q.text.trim().split(/\s+/).length;
      selectedQuotes.push(q);
      currentWordCount += qWords;
      if (currentWordCount >= targetWords) {
        break;
      }
    }

    const firstQuote = quotes[0];
    if (selectedQuotes.length === 0 && firstQuote !== undefined) {
      selectedQuotes.push(firstQuote);
    }

    const combinedText = selectedQuotes.map((q) => q.text.trim()).join(" ");
    const authors = Array.from(
      new Set(selectedQuotes.map((q) => q.source)),
    ).join(", ");

    return {
      text: combinedText,
      author: authors,
    };
  }

  // Mode 3: Words or Time
  const wordsList = loadWordlist(language);
  let wordCount = 30;

  if (mode === "words") {
    wordCount = modeValue !== undefined && modeValue > 0 ? modeValue : 25;
  } else {
    // Mode time: supply enough words so students don't immediately run out
    const sec = modeValue !== undefined && modeValue > 0 ? modeValue : 180;
    if (sec <= 15) wordCount = 20;
    else if (sec <= 30) wordCount = 35;
    else if (sec <= 60) wordCount = 65;
    else if (sec <= 120) wordCount = 110;
    else if (sec <= 180) wordCount = 160;
    else if (sec <= 300) wordCount = 260; // 5 menit
    else wordCount = 500; // 10 menit (600 detik)
  }

  const selectedWords: string[] = [];
  for (let i = 0; i < wordCount; i++) {
    const r = Math.floor(Math.random() * wordsList.length);
    selectedWords.push(wordsList[r] ?? "kata");
  }

  // Apply numbers toggle if enabled
  if (numbers) {
    for (let i = 4; i < selectedWords.length; i += 7) {
      const num = Math.floor(1 + Math.random() * 999).toString();
      selectedWords[i] = num;
    }
  }

  // Apply punctuation toggle if enabled
  if (punctuation) {
    for (let i = 0; i < selectedWords.length; i++) {
      const w = selectedWords[i] ?? "";
      // Capitalize first word or word after period
      if (i === 0 || selectedWords[i - 1]?.endsWith(".")) {
        selectedWords[i] = w.charAt(0).toUpperCase() + w.slice(1);
      }

      // Add comma periodically
      if (
        i > 0 &&
        i % 6 === 0 &&
        i !== selectedWords.length - 1 &&
        !selectedWords[i - 1]?.endsWith(".")
      ) {
        selectedWords[i] = `${selectedWords[i]},`;
      } else if (i > 0 && i % 11 === 0 && i !== selectedWords.length - 1) {
        selectedWords[i] = `${selectedWords[i]}.`;
      }
    }
    // End with period
    const lastIdx = selectedWords.length - 1;
    const lastWord = selectedWords[lastIdx];
    if (
      lastWord !== undefined &&
      lastWord.length > 0 &&
      !lastWord.endsWith(".")
    ) {
      selectedWords[lastIdx] = `${lastWord}.`;
    }
  }

  return {
    text: selectedWords.join(" "),
    author: language === "english" ? "Practice Passage" : "Latihan Mengetik",
  };
}
