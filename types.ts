export interface RpmData {
  // Umum
  satuanPendidikan: string;
  namaGuru: string;
  nipGuru: string;
  kelas: string;
  semester: string;
  fase: string;
  mataPelajaran: string;
  elemen: string;
  materiAjar: string;
  alokasiWaktu: string;

  // Identifikasi
  identifikasiPeserta: string;
  identifikasiMateri: string;
  dimensiProfil: Record<string, boolean>;

  // Desain
  desainCapaian: string;
  desainLintasDisiplin: string;
  desainTujuan: string;
  desainTopik: string;
  desainPedagogis: string;
  desainKemitraan: string;
  desainLingkungan: string;
  desainDigital: string;

  // Pengalaman
  pengalamanAwal: string;
  pengalamanInti: string;
  pengalamanPenutup: string;

  // Asesmen
  asesmenAwal: string;
  asesmenProses: string;
  asesmenAkhir: string;

  // Lampiran
  lampiranDiagnostik: string;
  lampiranRubrikDiskusi: string;
  lampiranRubrikPresentasi: string;
  lampiranLkpd: string;
  lampiranMateri: string;

  // Signature
  guruSignatureSrc: string | null;
}

export interface TeacherData {
  [key: string]: string; // Name -> NIP
}

export interface GenerationContext {
  MATA_PELAJARAN: string;
  TOPIK: string;
  KELAS: string;
  FASE: string;
  TUJUAN_PEMBELAJARAN: string;
  CAPAIAN_PEMBELAJARAN: string;
  PRAKTIK_PEDAGOGIS: string;
}

export interface SectionConfig {
  id: keyof RpmData;
  promptKey: string;
  title: string;
}
