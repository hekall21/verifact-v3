/**
 * Quiz Question Pool: phishing
 */

export const phishingQuestions = [
  {
    id: "phishing-1",
    category: "Phishing",
    q: "Anda menerima email dari 'layanan-bca@bca-verifikasi-id.com' yang meminta verifikasi akun dalam 24 jam atau rekening akan dibekukan. Apa tindakan paling tepat?",
    options: [
      {
        text: "Segera klik tautan agar rekening tidak terblokir",
        isCorrect: false,
        explanation: "Mengklik tautan dari pengirim tidak dikenal sangat berbahaya."
      },
      {
        text: "Periksa alamat domain pengirim; bank resmi menggunakan domain bca.co.id bukan domain pihak ketiga",
        isCorrect: true,
        explanation: "Bank resmi menggunakan domain resmi terverifikasi dan tidak pernah mengancam pembekuan sepihak via email mencurigakan."
      },
      {
        text: "Balas email menanyakan nomor CS resmi",
        isCorrect: false,
        explanation: "Membalas email phishing hanya mengonfirmasi bahwa email Anda aktif."
      },
      {
        text: "Kirimkan foto buku tabungan untuk bukti",
        isCorrect: false,
        explanation: "Jangan pernah membagikan dokumen perbankan ke pihak mencurigakan."
      },
    ]
  },
  {
    id: "phishing-2",
    category: "Phishing",
    q: "Sebuah pesan WhatsApp mengaku dari kurir paket mengirimkan file 'Lihat_Foto_Paket.apk'. Apa bahaya utama file tersebut?",
    options: [
      {
        text: "File tersebut menghapus seluruh foto di galeri",
        isCorrect: false,
        explanation: "Fungsi utamanya adalah pencurian data dan SMS OTP."
      },
      {
        text: "File tersebut merupakan aplikasi malware Android yang dapat membaca SMS OTP perbankan",
        isCorrect: true,
        explanation: "Malware APK kurir menyusupkan izin SMS listener untuk mencuri kode OTP transaksi perbankan."
      },
      {
        text: "File tersebut membuat kuota internet cepat habis",
        isCorrect: false,
        explanation: "Meskipun memakai data, ancaman paling fatal adalah pembobolan saldo."
      },
      {
        text: "File tersebut otomatis menelepon kontak Anda",
        isCorrect: false,
        explanation: "Malware fokus mengeksfiltrasi kredensial finansial."
      },
    ]
  },
  {
    id: "phishing-3",
    category: "Phishing",
    q: "Apa yang dimaksud dengan 'typosquatting' dalam konteks phishing?",
    options: [
      {
        text: "Mengetik cepat di keyboard tanpa melihat layar",
        isCorrect: false,
        explanation: "Bukan istilah kecepatan mengetik."
      },
      {
        text: "Pendaftaran domain web yang sengaja menyerupai nama situs populer dengan sedikit salah ketik",
        isCorrect: true,
        explanation: "Typosquatting mendaftarkan domain mirip seperti bcaa.com atau tw1tter.com untuk menjebak korban."
      },
      {
        text: "Mengirim email massal dengan tata bahasa acak",
        isCorrect: false,
        explanation: "Itu spamming."
      },
      {
        text: "Mengganti password akun secara berkala",
        isCorrect: false,
        explanation: "Itu praktik keamanan yang baik."
      },
    ]
  },
  {
    id: "phishing-4",
    category: "Phishing",
    q: "Mengapa keberadaan gembok HTTPS pada sebuah website TIDAK menjamin website tersebut bukan phishing?",
    options: [
      {
        text: "HTTPS hanya mengenkripsi transmisi data di transit, sertifikat SSL gratis mudah didapat oleh penipu",
        isCorrect: true,
        explanation: "Sertifikat SSL hanya membuktikan komunikasi terenkripsi, bukan membuktikan kejujuran atau legalitas pemilik situs."
      },
      {
        text: "HTTPS sudah usang dan digantikan HTTP 3.0",
        isCorrect: false,
        explanation: "HTTPS tetap standar enkripsi web modern."
      },
      {
        text: "Gembok hijau sekarang hanya untuk situs pemerintah",
        isCorrect: false,
        explanation: "Gembok SSL dapat dipasang di situs manapun."
      },
      {
        text: "Semua situs berbayar otomatis terverifikasi OJK",
        isCorrect: false,
        explanation: "Domain berbayar tidak ada kaitannya dengan pengawasan OJK."
      },
    ]
  },
  {
    id: "phishing-5",
    category: "Phishing",
    q: "Anda menerima telepon mengaku dari bank yang menyebutkan nomor kartu debit Anda dan meminta kode OTP SMS. Apa yang harus Anda lakukan?",
    options: [
      {
        text: "Berikan OTP karena penelepon sudah tahu nomor kartu",
        isCorrect: false,
        explanation: "Nomor kartu bisa bocor dari kebocoran data, OTP tetap rahasia mutlak."
      },
      {
        text: "Tolak memberikan OTP, matikan telepon, dan hubungi call center resmi bank",
        isCorrect: true,
        explanation: "Pihak bank tidak pernah meminta kode OTP atau PIN dengan alasan apapun."
      },
      {
        text: "Tanyakan nama lengkap petugas lalu berikan 3 digit pertama",
        isCorrect: false,
        explanation: "Sebagian OTP pun tidak boleh dibagikan."
      },
      {
        text: "Minta penelepon mengirimkan surat resmi terlebih dahulu",
        isCorrect: false,
        explanation: "Segera putuskan panggilan dan laporkan."
      },
    ]
  },
  {
    id: "phishing-6",
    category: "Phishing",
    q: "Tautan pesan singkat bertuliskan: 'bit.ly/bansos-kemensos-2026'. Risiko terbesar tautan pemendek URL ini adalah:",
    options: [
      {
        text: "Tautan tersebut hanya bisa dibuka di komputer",
        isCorrect: false,
        explanation: "Bisa dibuka di perangkat apapun."
      },
      {
        text: "Menyembunyikan alamat domain tujuan asli yang mungkin berupa situs phishing",
        isCorrect: true,
        explanation: "Pemendek tautan kerap dipakai menyembunyikan domain jebakan pencuri data."
      },
      {
        text: "Membuat baterai ponsel cepat panas",
        isCorrect: false,
        explanation: "Bukan dampak teknis tautan pendek."
      },
      {
        text: "Menghapus riwayat pencarian browser",
        isCorrect: false,
        explanation: "Tidak ada hubungan dengan history browser."
      },
    ]
  },
  {
    id: "phishing-7",
    category: "Phishing",
    q: "Ciri khas serangan 'Spear Phishing' yang membedakannya dari phishing biasa adalah:",
    options: [
      {
        text: "Serangan ditargetkan secara spesifik kepada individu tertentu dengan riset mendalam",
        isCorrect: true,
        explanation: "Spear phishing menggunakan informasi personal korban agar tampak sangat meyakinkan."
      },
      {
        text: "Menggunakan senjata fisik di dunia nyata",
        isCorrect: false,
        explanation: "Ini istilah serangan siber."
      },
      {
        text: "Hanya menyerang sistem operasi Linux",
        isCorrect: false,
        explanation: "Menyerang pengguna di sistem apapun."
      },
      {
        text: "Selalu disebarkan lewat panggilan radio",
        isCorrect: false,
        explanation: "Disampaikan via email, pesan instan, atau sosial media."
      },
    ]
  },
  {
    id: "phishing-8",
    category: "Phishing",
    q: "Website mengklaim memberikan saldo e-wallet gratis Rp500 ribu dengan syarat login menggunakan akun Google Anda di jendela popup. Apa indikasinya?",
    options: [
      {
        text: "Promo resmi dari Google Indonesia",
        isCorrect: false,
        explanation: "Google tidak membagikan saldo lewat situs pihak ketiga."
      },
      {
        text: "Upaya pencurian kredensial akun OAuth (Credential Harvesting)",
        isCorrect: true,
        explanation: "Popup tiruan dibuat untuk menyalin kata sandi atau token otentikasi korban."
      },
      {
        text: "Fitur resmi integrasi satu pintu",
        isCorrect: false,
        explanation: "Situs tidak terafiliasi."
      },
      {
        text: "Pemberitahuan hadiah pemenang undian tahunan",
        isCorrect: false,
        explanation: "Ini modus penipuan berulang."
      },
    ]
  },
  {
    id: "phishing-9",
    category: "Phishing",
    q: "Apa yang harus diperiksa pada alamat email pengirim untuk mendeteksi 'Email Spoofing'?",
    options: [
      {
        text: "Hanya nama display yang muncul di layar",
        isCorrect: false,
        explanation: "Display name sangat mudah dipalsukan."
      },
      {
        text: "Header lengkap email dan domain pengirim yang sebenarnya (Return-Path / SPF / DKIM)",
        isCorrect: true,
        explanation: "Domain asli pengirim di header email membongkar identitas server yang sebenarnya."
      },
      {
        text: "Jumlah paragraf dalam isi email",
        isCorrect: false,
        explanation: "Panjang isi email tidak membuktikan keaslian."
      },
      {
        text: "Warna logo yang terlampir di footer",
        isCorrect: false,
        explanation: "Logo asli bisa dicuri dan ditempel dengan mudah."
      },
    ]
  },
  {
    id: "phishing-10",
    category: "Phishing",
    q: "Pesan Instagram dari teman lama: 'Tolong vote saya di kompetisi ini, nanti kirim kode 6 digit SMS yang masuk ya'. Apa yang sebenarnya terjadi?",
    options: [
      {
        text: "Teman Anda sedang mengikuti kompetisi fotografi",
        isCorrect: false,
        explanation: "Ini modus pengambilalihan akun."
      },
      {
        text: "Akun teman Anda telah diretas dan pelaku mencoba mereset password akun Anda via SMS OTP",
        isCorrect: true,
        explanation: "Kode 6 digit adalah SMS verifikasi WhatsApp atau Instagram korban untuk diambil alih."
      },
      {
        text: "Instagram mengadakan kuis berhadiah resmi",
        isCorrect: false,
        explanation: "Bukan program resmi."
      },
      {
        text: "Sistem membutuhkan verifikasi dua perangkat",
        isCorrect: false,
        explanation: "Bukan mekanisme resmi."
      },
    ]
  },
  {
    id: "phishing-11",
    category: "Phishing",
    q: "Apa bahaya memindai sembarang kode QR di tempat umum (Quishing - QR Phishing)?",
    options: [
      {
        text: "Kamera ponsel bisa langsung pecah",
        isCorrect: false,
        explanation: "Tidak merusak perangkat keras."
      },
      {
        text: "Kode QR palsu dapat mengarahkan ke website phishing atau mengunduh malware otomatis",
        isCorrect: true,
        explanation: "Quishing mengganti stiker QR resmi (misal QRIS) dengan QR link jebakan."
      },
      {
        text: "Mengubah bahasa keyboard ponsel secara otomatis",
        isCorrect: false,
        explanation: "Bukan perilaku umum."
      },
      {
        text: "Menghapus kontak darurat di ponsel",
        isCorrect: false,
        explanation: "Bukan dampak langsung pemindaian."
      },
    ]
  },
  {
    id: "phishing-12",
    category: "Phishing",
    q: "Situs web bank menggunakan alamat 'https://www.klikbca.co.id.login-auth.com'. Domain sebenarnya dari situs tersebut adalah:",
    options: [
      {
        text: "klikbca.co.id",
        isCorrect: false,
        explanation: "Itu hanya subdomain yang sengaja dibuat untuk mengelabui."
      },
      {
        text: "login-auth.com",
        isCorrect: true,
        explanation: "Domain utama adalah bagian sebelum TLD terakhir, yaitu login-auth.com."
      },
      {
        text: "co.id",
        isCorrect: false,
        explanation: "Itu adalah ccTLD."
      },
      {
        text: "www.klikbca.com",
        isCorrect: false,
        explanation: "Bukan domain yang aktif pada URL tersebut."
      },
    ]
  },
  {
    id: "phishing-13",
    category: "Phishing",
    q: "Apa tindakan pertama jika Anda tidak sengaja memasukkan password di halaman phishing?",
    options: [
      {
        text: "Menutup laptop dan mendiamkannya selama 3 hari",
        isCorrect: false,
        explanation: "Tidak menyelesaikan pencurian data."
      },
      {
        text: "Segera ganti kata sandi akun di situs resmi dan aktifkan verifikasi 2 langkah (2FA)",
        isCorrect: true,
        explanation: "Mengganti password secepatnya membatalkan nilai kredensial yang baru saja dicuri."
      },
      {
        text: "Menghapus riwayat cache di peramban web",
        isCorrect: false,
        explanation: "Pelaku sudah mendapatkan data di server mereka."
      },
      {
        text: "Mengirim pesan ke admin phishing untuk meminta maaf",
        isCorrect: false,
        explanation: "Tidak ada gunanya berkomunikasi dengan penyerang."
      },
    ]
  },
  {
    id: "phishing-14",
    category: "Phishing",
    q: "Mengapa lampiran file berformat '.svg' atau '.html' dari orang asing perlu diwaspadai di email?",
    options: [
      {
        text: "File tersebut terlalu besar ukurannya",
        isCorrect: false,
        explanation: "Ukurannya justru seringkali sangat kecil."
      },
      {
        text: "File format tersebut dapat menyematkan script JavaScript berbahaya yang dieksekusi saat dibuka",
        isCorrect: true,
        explanation: "SVG dan HTML dapat mengeksekusi script otomatis untuk mengunduh payload atau mencuri token cookie."
      },
      {
        text: "File SVG hanya bisa dibuka di printer 3D",
        isCorrect: false,
        explanation: "SVG adalah format grafis vektor standar web."
      },
      {
        text: "Format HTML dilarang oleh asosiasi internet dunia",
        isCorrect: false,
        explanation: "HTML adalah standar bahasa web."
      },
    ]
  },
  {
    id: "phishing-15",
    category: "Phishing",
    q: "Sebuah pesan SMS berbunyi: 'Poin Telkomsel Anda akan hangus hari ini. Tukarkan di http://poin-telkomsel.xyz'. Apa red flag utamanya?",
    options: [
      {
        text: "Menggunakan kata 'Poin'",
        isCorrect: false,
        explanation: "Poin adalah istilah umum."
      },
      {
        text: "Rasa urgensi palsu ('akan hangus hari ini') dan domain mencurigakan bukan situs resmi telkomsel.com",
        isCorrect: true,
        explanation: "Menciptakan kepanikan agar korban bertindak terburu-buru tanpa memeriksa domain."
      },
      {
        text: "Nomor pengirim berisi 4 digit",
        isCorrect: false,
        explanation: "SMS broadcast resmi justru sering memakai shortcode."
      },
      {
        text: "Dikirim pada jam kerja",
        isCorrect: false,
        explanation: "Waktu kirim bukan indikator utama."
      },
    ]
  },
];

export default phishingQuestions;
