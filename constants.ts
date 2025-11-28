

export const RESEARCH_TYPES = [
    'Skripsi',
    'Tesis',

    'Disertasi',
    'Makalah',
    'Buku',
    'Buku Pelajaran',
    'Khutbah',
    'Karya Ilmiah Lain',
    'Novel',
    'Cerita',
];

export const CHAPTERS = [
    'Bab 1: Pendahuluan',
    'Bab 2: Kajian Pustaka',
    'Bab 3: Metodologi Penelitian',
    'Bab 4: Hasil dan Pembahasan',
    'Bab 5: Kesimpulan dan Saran',
    'Outline',
    'Abstrak',
    'Daftar Isi',
    'Daftar Pustaka',
];

export const BOOK_CHAPTERS = [
    'Outline',
    'Daftar Isi',
    'Kata Pengantar',
    'Sarankan Judul Bab',
    'Bab 1',
    'Bab 2',
    'Bab 3',
    'Bab 4',
    'Bab 5',
    'Bab 6',
    'Bab 7',
    'Bab 8',
    'Bab 9',
    'Bab 10',
    'Daftar Pustaka',
];

export const NOVEL_CHAPTERS = [
    'Sinopsis',
    'Sarankan Judul Bab',
    'Prolog',
    'Bab 1',
    'Bab 2',
    'Bab 3',
    'Bab 4',
    'Bab 5',
    'Bab 6',
    'Bab 7',
    'Bab 8',
    'Bab 9',
    'Bab 10',
    'Bab 11',
    'Bab 12',
    'Bab 13',
    'Bab 14',
    'Bab 15',
    'Biografi Penulis',
    'Epilog',
];

export const CITATION_STYLES = [
    'APA', 'MLA', 'Chicago', 'IEEE', 'Harvard', 'Turabian', 'Vancouver', 'CSE', 'AMA', 'ASA'
];

export const REFERENCE_TYPES = [
    'In-text citation',
    'Footnote'
];

export const ACADEMIC_WRITING_STYLES = [
    'Akademisi',
    'Dosen',
    'Profesional',
    'Mahasiswa',
    'Guru',
    'Siswa',
];

export const NOVEL_WRITING_STYLES = [
    'Asma Nadia',
    'Tere Liye',
    'Andrea Hirata',
    'Eka Kurniawan',
    'Haidar Musyafa',
    'Pramoedya Ananta Toer',
    'Ahmad Fuadi',
    'Ilana Tan',
    'Dewi Lestari (Dee)',
    'Raditya Dika',
    'Nh. Dini',
    'Winna Efendi',
    'Ika Natassa',
    'Valerie Patkar',
    'Leila S. Chudori',
    'Sapardi Djoko Damono',
    'Pidi Baiq',
    'Ayu Utami',
    'Habiburrahman El Siradji',
    'Gaya Bahasa Betawi',
    'Gaya Bahasa Fiksi',
    'Gaya Bahasa Indonesia-Sunda',
    'Gaya Bahasa Indonesia-Jawa',
];

export const OUTPUT_LANGUAGES = [
    'Indonesia',
    'Inggris',
    'Arab',
    'Indonesia + Arab (Al-Qur\'an/Hadits)',
    'Indonesia + Inggris',
    'Sunda',
    'Jawa',
    'Padang (Minang)',
];

export const MAJORS = [
    'Sains dan Teknologi',
    'Ilmu Sosial dan Humaniora',
    'Ekonomi dan Bisnis',
    'Kesehatan',
    'Pendidikan',
    'Seni dan Desain',
    'Agama'
];

export const STUDY_PROGRAMS: Record<string, string[]> = {
    'Sains dan Teknologi': [
        'Teknik Informatika',
        'Sistem Informasi',
        'Teknik Sipil',
        'Teknik Mesin',
        'Teknik Elektro',
        'Arsitektur',
        'Matematika',
        'Fisika',
        'Kimia',
        'Biologi',
        'Statistika'
    ],
    'Ilmu Sosial dan Humaniora': [
        'Ilmu Komunikasi',
        'Hubungan Internasional',
        'Ilmu Politik',
        'Sosiologi',
        'Antropologi',
        'Ilmu Hukum',
        'Psikologi',
        'Sastra Indonesia',
        'Sastra Inggris',
        'Sejarah'
    ],
    'Ekonomi dan Bisnis': [
        'Manajemen',
        'Akuntansi',
        'Ilmu Ekonomi',
        'Bisnis Digital',
        'Kewirausahaan',
        'Perbankan Syariah'
    ],
    'Kesehatan': [
        'Pendidikan Dokter',
        'Ilmu Keperawatan',
        'Farmasi',
        'Kesehatan Masyarakat',
        'Gizi'
    ],
    'Pendidikan': [
        'Pendidikan Guru Sekolah Dasar (PGSD)',
        'Pendidikan Anak Usia Dini (PAUD)',
        'Pendidikan Matematika',
        'Pendidikan Bahasa Inggris',
        'Pendidikan Jasmani',
        'Manajemen Pendidikan'
    ],
    'Seni dan Desain': [
        'Desain Komunikasi Visual (DKV)',
        'Seni Murni',
        'Desain Interior',
        'Musik',
        'Teater'
    ],
    'Agama': [
        'Ilmu Al-Qur\'an dan Tafsir',
        'Hukum Keluarga Islam (Ahwal Syakhshiyyah)',
        'Komunikasi dan Penyiaran Islam',
        'Ekonomi Syariah',
        'Pendidikan Agama Islam'
    ]
};

export const RESEARCH_INSTRUMENTS = [
  { name: 'Wawancara', description: 'Pengumpulan data melalui percakapan terarah dengan responden.' },
  { name: 'Observasi', description: 'Pendataan berdasarkan pengamatan langsung terhadap objek penelitian.' },
  { name: 'Dokumentasi', description: 'Analisis dokumen, arsip, dan sumber tertulis terkait penelitian.' },
  { name: 'Kuesioner/Angket', description: 'Formulir berisi pertanyaan untuk diisi responden secara mandiri.' },
  { name: 'Tes Tertulis', description: 'Instrumen pengukuran kemampuan atau pengetahuan responden.' },
  { name: 'Skala Sikap', description: 'Penilaian sikap atau pendapat menggunakan skala (Likert, Guttman, dsb).' },
  { name: 'Checklist (Daftar Periksa)', description: 'Daftar item penilaian yang ditandai sesuai pengamatan.' },
  { name: 'Rubrik Penilaian', description: 'Formulir khusus untuk menilai karya atau performa berdasarkan indikator.' },
  { name: 'Sheet Catatan Lapangan', description: 'Buku atau lampiran untuk mencatat temuan selama penelitian.' }
];