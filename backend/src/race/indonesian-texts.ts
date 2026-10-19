export type IndonesianPassage = {
  text: string;
  author: string;
};

export const indonesianPassages: IndonesianPassage[] = [
  {
    text: "Keberhasilan bukanlah milik orang yang pintar. Keberhasilan adalah kepunyaan mereka yang senantiasa berusaha dan tidak pernah menyerah.",
    author: "B.J. Habibie",
  },
  {
    text: "Pendidikan adalah senjata paling ampuh yang dapat kamu gunakan untuk mengubah dunia dan membangun masa depan bangsa yang gemilang.",
    author: "Nelson Mandela (Terjemahan)",
  },
  {
    text: "Belajar tanpa berpikir itu tidaklah berguna, namun berpikir tanpa belajar terlebih dahulu itu sangatlah berbahaya bagi kemajuan akal budi.",
    author: "Ir. Soekarno",
  },
  {
    text: "Jadikan setiap tempat sebagai sekolah dan jadikan setiap orang sebagai guru agar pengetahuanmu terus bertambah setiap harinya.",
    author: "Ki Hajar Dewantara",
  },
  {
    text: "Teknologi komputer dan internet membuka jendela ilmu pengetahuan seluas-luasnya bagi generasi muda Indonesia untuk berkarya di tingkat dunia.",
    author: "Literasi Komputer",
  },
  {
    text: "Kecakapan mengetik sepuluh jari dengan cepat dan akurat melatih koordinasi motorik serta meningkatkan produktivitas dalam era digital modern.",
    author: "Keahlian Mengetik",
  },
  {
    text: "Kurang cerdas dapat diperbaiki dengan belajar, kurang cakap dapat dihilangkan dengan pengalaman, namun kejujuran tidak akan pernah terbeli.",
    author: "Mohammad Hatta",
  },
  {
    text: "Banyak hal yang bisa menjatuhkanmu, tetapi satu-satunya hal yang benar-benar dapat menjatuhkanmu adalah sikapmu sendiri yang enggan bangkit.",
    author: "R.A. Kartini",
  },
  {
    text: "Langkah pertama menuju kesuksesan dimulai dari keberanian untuk mencoba hal baru dan konsistensi dalam berlatih setiap hari tanpa henti.",
    author: "Motivasi Belajar",
  },
  {
    text: "Komputer hanya memproses instruksi logika, namun manusialah yang memberikan jiwa, kreativitas, dan tujuan mulia pada setiap baris karya.",
    author: "Dunia Pemrograman",
  },
];

const fallbackPassage: IndonesianPassage = {
  text: "Keberhasilan bukanlah milik orang yang pintar. Keberhasilan adalah kepunyaan mereka yang senantiasa berusaha dan tidak pernah menyerah.",
  author: "B.J. Habibie",
};

export function getRandomIndonesianPassage(): IndonesianPassage {
  const index = Math.floor(Math.random() * indonesianPassages.length);
  const found = indonesianPassages[index];
  return found ?? fallbackPassage;
}
