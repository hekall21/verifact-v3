/**
 * Quiz Question Pool: deepfake
 */

export const deepfakeQuestions = [
  {
    id: "deepfake-1",
    category: "Deepfake",
    q: "Apa yang dimaksud dengan teknologi 'Deepfake'?",
    options: [
      {
        text: "Metode penyelaman laut dalam menggunakan robot",
        isCorrect: false,
        explanation: "Bukan istilah kelautan."
      },
      {
        text: "Manipulasi media sintetis (video, audio, foto) menggunakan model kecerdasan buatan (deep learning) untuk meniru rupa dan suara seseorang",
        isCorrect: true,
        explanation: "Teknologi deep learning dapat menukar wajah atau menyintesis ucapan tokoh secara sangat meyakinkan."
      },
      {
        text: "Aplikasi edit foto biasa untuk menambahkan filter warna",
        isCorrect: false,
        explanation: "Bukan sekadar filter warna."
      },
      {
        text: "Penyimpanan file tersembunyi di sistem operasi",
        isCorrect: false,
        explanation: "Itu hidden directory."
      },
    ]
  },
  {
    id: "deepfake-2",
    category: "Deepfake",
    q: "Ciri visual yang sering terlihat pada video Deepfake wajah kualitas rendah adalah:",
    options: [
      {
        text: "Warna baju tokoh selalu berubah-ubah",
        isCorrect: false,
        explanation: "Bukan anomali pakaian."
      },
      {
        text: "Kedipan mata tidak wajar, distorsi di sekitar tepi wajah, dan gerakan bibir yang tidak sinkron sempurna dengan ucapan",
        isCorrect: true,
        explanation: "Keterbatasan rendering wajah sering menghasilkan artefak visual di sekitar dagu, mata, atau tepi bibir."
      },
      {
        text: "Video hanya bisa diputar dalam orientasi vertikal",
        isCorrect: false,
        explanation: "Bisa diputar di mana saja."
      },
      {
        text: "Karakter video berbicara dalam bahasa Latin kuno",
        isCorrect: false,
        explanation: "Bukan batasan bahasa."
      },
    ]
  },
  {
    id: "deepfake-3",
    category: "Deepfake",
    q: "Modus kejahatan 'Voice Cloning Deepfake' yang menargetkan keluarga biasanya dijalankan dengan cara:",
    options: [
      {
        text: "Mengirimkan pesan teks SMS berisi kode acak",
        isCorrect: false,
        explanation: "Bukan kloning suara."
      },
      {
        text: "Menirukan suara anak atau kerabat yang menangis meminta transfer uang darurat akibat kecelakaan atau ditangkap polisi",
        isCorrect: true,
        explanation: "Pelaku menyintesis sampel suara korban dari media sosial untuk memeras keluarga korban dalam kepanikan."
      },
      {
        text: "Menyanyikan lagu karaoke melalui panggilan video",
        isCorrect: false,
        explanation: "Bukan modus kejahatan."
      },
      {
        text: "Mengirimkan rekaman radio berita masa lalu",
        isCorrect: false,
        explanation: "Bukan kloning personal."
      },
    ]
  },
  {
    id: "deepfake-4",
    category: "Deepfake",
    q: "Berapa lama sampel rekaman audio yang dibutuhkan oleh model AI Voice Generator modern untuk mengkloning suara seseorang?",
    options: [
      {
        text: "Minimal 10 tahun rekaman terus-menerus",
        isCorrect: false,
        explanation: "Teknologi masa kini sangat efisien."
      },
      {
        text: "Hanya membutuhkan 3 hingga 10 detik sampel suara jernih dari video media sosial",
        isCorrect: true,
        explanation: "Model generative voice terkini (zero-shot TTS) mampu mereplikasi intonasi suara hanya dari hitungan detik audio."
      },
      {
        text: "Harus direkam di studio musik profesional",
        isCorrect: false,
        explanation: "Audio ponsel sudah mencukupi."
      },
      {
        text: "Tidak bisa dikloning tanpa izin tertulis dari satelit",
        isCorrect: false,
        explanation: "Bukan batasan teknis."
      },
    ]
  },
  {
    id: "deepfake-5",
    category: "Deepfake",
    q: "Apa bahaya penggunaan Deepfake dalam konteks pemilihan umum (Pemilu)?",
    options: [
      {
        text: "Kertas suara menjadi cepat rusak",
        isCorrect: false,
        explanation: "Tidak ada hubungan dengan kertas fisik."
      },
      {
        text: "Penyebaran video manipulasi kandidat yang menyampaikan pernyataan provokatif palsu untuk memicu konflik horizontal",
        isCorrect: true,
        explanation: "Disinformasi visual berdaya ledak tinggi dapat merusak kepercayaan pemilih dan mendestabilisasi demokrasi."
      },
      {
        text: "Durasi masa kampanye otomatis diperpanjang",
        isCorrect: false,
        explanation: "Jadwal kampanye diatur undang-undang."
      },
      {
        text: "Peralatan komputasi KPU akan langsung terbakar",
        isCorrect: false,
        explanation: "Bukan malware penghancur."
      },
    ]
  },
  {
    id: "deepfake-6",
    category: "Deepfake",
    q: "Langkah pencegahan terbaik bagi keluarga untuk menghadapi ancaman telepon pemerasan kloning suara adalah:",
    options: [
      {
        text: "Tidak pernah lagi menggunakan telepon seluler",
        isCorrect: false,
        explanation: "Tindakan tidak realistis."
      },
      {
        text: "Membuat 'Kata Kunci Rahasia Keluarga' (Safe Word) yang hanya diketahui anggota keluarga inti untuk verifikasi darurat",
        isCorrect: true,
        explanation: "Safe word yang tidak pernah dipublikasikan di internet membuktikan keaslian penelepon saat situasi panik."
      },
      {
        text: "Memasang aplikasi pemutar musik otomatis saat menerima panggilan",
        isCorrect: false,
        explanation: "Tidak memverifikasi penelepon."
      },
      {
        text: "Menghapus semua nomor kontak di ponsel",
        isCorrect: false,
        explanation: "Menghilangkan akses keluarga."
      },
    ]
  },
  {
    id: "deepfake-7",
    category: "Deepfake",
    q: "Dalam mendeteksi gambar hasil AI Image Generator (seperti Midjourney/DALL-E), bagian anatomi yang sering mengalami ketidaksempurnaan adalah:",
    options: [
      {
        text: "Jumlah jari tangan, susunan gigi, pola tekstur kulit berlebih, atau pencahayaan pupil mata yang tidak konsisten",
        isCorrect: true,
        explanation: "Model difusi AI sering kesulitan merender proporsi tangan, jumlah jari, kacamata yang menyatu dengan kulit, atau pantulan iris mata."
      },
      {
        text: "Warna langit yang selalu merah pekat",
        isCorrect: false,
        explanation: "Langit bisa dirender dengan sempurna."
      },
      {
        text: "Ukuran sepatu yang selalu bernomor 40",
        isCorrect: false,
        explanation: "Bukan anomali ukuran sepatu."
      },
      {
        text: "Semua karakter gambar memakai topi koboi",
        isCorrect: false,
        explanation: "Bukan batasan generasi."
      },
    ]
  },
  {
    id: "deepfake-8",
    category: "Deepfake",
    q: "Apa yang dimaksud dengan 'Cheapfake' (atau Shallowfake)?",
    options: [
      {
        text: "Aplikasi pembuat video yang dijual sangat murah",
        isCorrect: false,
        explanation: "Bukan masalah harga software."
      },
      {
        text: "Manipulasi video sederhana tanpa teknologi AI canggih, seperti memperlambat/mempercepat kecepatan video atau pemotongan konteks",
        isCorrect: true,
        explanation: "Contoh terkenal adalah memperlambat video pidato tokoh publik agar tampak mabuk atau linglung."
      },
      {
        text: "Kamera ponsel berkualitas paling rendah",
        isCorrect: false,
        explanation: "Bukan perangkat keras."
      },
      {
        text: "Video animasi kartun anak-anak",
        isCorrect: false,
        explanation: "Bukan genre kartun."
      },
    ]
  },
  {
    id: "deepfake-9",
    category: "Deepfake",
    q: "Teknologi 'Watermarking Kriptografis' (seperti standar C2PA / Content Credentials) pada konten digital berfungsi untuk:",
    options: [
      {
        text: "Memberikan efek bercak air artistik pada foto",
        isCorrect: false,
        explanation: "Bukan efek seni."
      },
      {
        text: "Menyematkan metadata asal-usul (provenance) yang terenkripsi untuk membuktikan apakah konten dibuat kamera asli atau disintesis AI",
        isCorrect: true,
        explanation: "Inisiatif C2PA menyediakan jejak rantai pengeditan digital yang tidak dapat dipalsukan untuk transparansi media."
      },
      {
        text: "Menghapus hak cipta pembuat karya",
        isCorrect: false,
        explanation: "Justru melindungi hak kepemilikan."
      },
      {
        text: "Mengurangi ukuran file video menjadi setengahnya",
        isCorrect: false,
        explanation: "Bukan fungsi kompresi."
      },
    ]
  },
  {
    id: "deepfake-10",
    category: "Deepfake",
    q: "Mengapa video Deepfake tokoh terkenal mempromosikan aplikasi investasi bodong sangat mudah menyebar di media sosial?",
    options: [
      {
        text: "Masyarakat sudah terlatih mengenali AI",
        isCorrect: false,
        explanation: "Sebagian besar pengguna masih awam."
      },
      {
        text: "Otoritas figur publik dipadukan dengan manipulasi visual canggih menurunkan kewaspadaan kritis korban",
        isCorrect: true,
        explanation: "Korban merasa percaya karena sosok tokoh ternama seolah-olah mendukung program tersebut secara langsung."
      },
      {
        text: "Aplikasi investasi tersebut resmi diawasi Bank Indonesia",
        isCorrect: false,
        explanation: "Investasi bodong tidak berizin."
      },
      {
        text: "Penyedia media sosial memberikan insentif uang kepada penonton",
        isCorrect: false,
        explanation: "Bukan skema monetisasi platform."
      },
    ]
  },
  {
    id: "deepfake-11",
    category: "Deepfake",
    q: "Apa yang harus Anda lakukan jika melihat video tokoh publik membuat pengakuan kontroversial yang hanya ada di satu akun TikTok anonim?",
    options: [
      {
        text: "Langsung percaya dan membagikannya ke media sosial lain",
        isCorrect: false,
        explanation: "Tindakan ceroboh menyebarkan materi belum terverifikasi."
      },
      {
        text: "Cek apakah peristiwa atau pengakuan tersebut diberitakan oleh kantor berita arus utama (mainstream news agency) yang kredibel",
        isCorrect: true,
        explanation: "Pernyataan penting tokoh publik selalu diliput secara luas oleh media pers resmi."
      },
      {
        text: "Mengunduh video dan menjualnya sebagai NFT",
        isCorrect: false,
        explanation: "Bukan tindakan yang relevan."
      },
      {
        text: "Menghapus aplikasi TikTok dari ponsel teman Anda",
        isCorrect: false,
        explanation: "Tidak menyelesaikan masalah."
      },
    ]
  },
  {
    id: "deepfake-12",
    category: "Deepfake",
    q: "Istilah 'Liar's Dividend' (Keuntungan Pembohong) dalam era Deepfake merujuk pada:",
    options: [
      {
        text: "Bonus gaji bagi pembuat video rekayasa",
        isCorrect: false,
        explanation: "Bukan kompensasi kerja."
      },
      {
        text: "Situasi di mana pelaku kejahatan nyata dapat menyangkal bukti video asli dengan berdalih bahwa video tersebut adalah rekayasa AI (Deepfake)",
        isCorrect: true,
        explanation: "Eksistensi deepfake membuat publik ragu bahkan terhadap rekaman bukti otentik yang sebenarnya nyata."
      },
      {
        text: "Denda hukum bagi penyebar berita palsu",
        isCorrect: false,
        explanation: "Itu sanksi pidana."
      },
      {
        text: "Pajak penghasilan khusus bagi artis digital",
        isCorrect: false,
        explanation: "Bukan istilah fiskal."
      },
    ]
  },
  {
    id: "deepfake-13",
    category: "Deepfake",
    q: "Alat analisis forensik digital memeriksa ketidaksesuaian 'Biological Signals' pada video Deepfake melalui:",
    options: [
      {
        text: "Pengukuran suhu baterai ponsel saat memutar video",
        isCorrect: false,
        explanation: "Bukan sensor biologis video."
      },
      {
        text: "Deteksi perubahan mikro warna kulit akibat denyut nadi darah (Photoplethysmography / PPG sintetis)",
        isCorrect: true,
        explanation: "Wajah manusia nyata memiliki fluktuasi mikroskopis rona kulit dari aliran darah yang sulit disintesis sempurna oleh AI."
      },
      {
        text: "Menghitung jumlah kata per menit dalam naskah",
        isCorrect: false,
        explanation: "Bukan sinyal biologis."
      },
      {
        text: "Memeriksa merek kamera yang tertulis di judul",
        isCorrect: false,
        explanation: "Metadata judul mudah disunting."
      },
    ]
  },
  {
    id: "deepfake-14",
    category: "Deepfake",
    q: "Apa implikasi hukum di Indonesia bagi seseorang yang sengaja membuat dan menyebarkan Deepfake pornografi non-konsensual (NCII)?",
    options: [
      {
        text: "Hanya diberikan surat peringatan tertulis tanpa konsekuensi",
        isCorrect: false,
        explanation: "Merupakan tindak pidana serius."
      },
      {
        text: "Diancam hukuman pidana penjara dan denda berat berdasarkan UU ITE dan UU Pornografi",
        isCorrect: true,
        explanation: "Pembuatan materi asusila manipulatif tanpa persetujuan melanggar pasal pidana UU ITE dan perlindungan kekerasan seksual."
      },
      {
        text: "Diberikan beasiswa kursus animasi",
        isCorrect: false,
        explanation: "Bukan bentuk sanksi hukum."
      },
      {
        text: "Diwajibkan membuat 10 video klarifikasi di YouTube",
        isCorrect: false,
        explanation: "Bukan vonis pengadilan."
      },
    ]
  },
  {
    id: "deepfake-15",
    category: "Deepfake",
    q: "Jika Anda dihubungi via panggilan video WhatsApp oleh 'atasan kantor' yang meminta transfer dana darurat tetapi wajahnya tampak kaku dan ada gangguan visual, Anda harus:",
    options: [
      {
        text: "Segera transfer karena takut dimarahi",
        isCorrect: false,
        explanation: "Kasus CEO fraud menggunakan deepfake video call telah merugikan jutaan dolar."
      },
      {
        text: "Minta atasan melakukan gerakan spontan (seperti melambaikan tangan di depan wajah) atau telepon nomor kantor resmi untuk verifikasi ganda",
        isCorrect: true,
        explanation: "Gerakan fisik melintasi wajah merusak rendering model real-time deepfake dan membongkar penyamaran."
      },
      {
        text: "Mengirimkan file data rahasia perusahaan",
        isCorrect: false,
        explanation: "Bukan tindakan yang tepat."
      },
      {
        text: "Mematikan laptop dan pulang ke rumah",
        isCorrect: false,
        explanation: "Tindakan tidak bertanggung jawab."
      },
    ]
  },
];

export default deepfakeQuestions;
