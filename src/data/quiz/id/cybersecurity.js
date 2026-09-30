/**
 * Quiz Question Pool: cybersecurity
 */

export const cybersecurityQuestions = [
  {
    id: "cybersecurity-1",
    category: "Cybersecurity",
    q: "Apa fungsi utama dari Autentikasi Dua Faktor (2FA / MFA)?",
    options: [
      {
        text: "Mempercepat koneksi internet",
        isCorrect: false,
        explanation: "2FA tidak mempengaruhi kecepatan bandwidth."
      },
      {
        text: "Memberikan lapisan keamanan kedua sehingga akun tetap terlindungi meski kata sandi bocor",
        isCorrect: true,
        explanation: "2FA mewajibkan faktor kedua (kode OTP/kunci keamanan) selain kata sandi."
      },
      {
        text: "Menyimpan cadangan data di cloud",
        isCorrect: false,
        explanation: "Itu fungsi backup."
      },
      {
        text: "Menghapus cache otomatis setiap hari",
        isCorrect: false,
        explanation: "Bukan fungsi pembersihan."
      },
    ]
  },
  {
    id: "cybersecurity-2",
    category: "Cybersecurity",
    q: "Karakteristik kata sandi yang kuat dan tahan terhadap serangan brute-force adalah:",
    options: [
      {
        text: "Nama depan diikuti tanggal lahir (misal: Budi1990)",
        isCorrect: false,
        explanation: "Sangat mudah ditebak lewat social engineering."
      },
      {
        text: "Kombinasi frasa sandi (passphrase) panjang (\u226512 karakter) dengan huruf besar, huruf kecil, angka, dan simbol unik",
        isCorrect: true,
        explanation: "Panjang dan entropi tinggi eksponensial meningkatkan waktu peretasan brute-force."
      },
      {
        text: "Kata sandi yang sama untuk semua akun agar tidak lupa",
        isCorrect: false,
        explanation: "Risiko berantai jika salah satu layanan bocor."
      },
      {
        text: "Urutan angka pada keyboard (12345678)",
        isCorrect: false,
        explanation: "Paling sering dicoba dalam daftar wordlist peretas."
      },
    ]
  },
  {
    id: "cybersecurity-3",
    category: "Cybersecurity",
    q: "Mengapa menggunakan jaringan Wi-Fi publik tanpa proteksi VPN berisiko bagi transaksi perbankan?",
    options: [
      {
        text: "Bisa terkena serangan Man-in-the-Middle (MitM) dan penyadapan lalu lintas data",
        isCorrect: true,
        explanation: "Penyerang pada jaringan Wi-Fi yang sama dapat mengendus atau memanipulasi paket data yang tidak terenkripsi sempurna."
      },
      {
        text: "Baterai laptop akan habis dalam 5 menit",
        isCorrect: false,
        explanation: "Bukan dampak konsumsi daya."
      },
      {
        text: "Layar laptop bisa tiba-tiba terbalik",
        isCorrect: false,
        explanation: "Bukan dampak jaringan."
      },
      {
        text: "Sinyal GPS ponsel akan mati",
        isCorrect: false,
        explanation: "GPS mandiri dari sinyal Wi-Fi."
      },
    ]
  },
  {
    id: "cybersecurity-4",
    category: "Cybersecurity",
    q: "Aplikasi password manager seperti Bitwarden atau 1Password berguna untuk:",
    options: [
      {
        text: "Mempercepat proses mengetik dokumen",
        isCorrect: false,
        explanation: "Bukan alat pengetikan."
      },
      {
        text: "Membuat dan menyimpan kata sandi unik yang kuat untuk setiap akun dalam brankas terenkripsi",
        isCorrect: true,
        explanation: "Password manager menghilangkan kebiasaan buruk menggunakan kata sandi yang sama di banyak akun."
      },
      {
        text: "Menghapus virus secara otomatis",
        isCorrect: false,
        explanation: "Itu fungsi antivirus."
      },
      {
        text: "Menjual data akun ke pihak ketiga",
        isCorrect: false,
        explanation: "Aplikasi terpercaya menggunakan enkripsi zero-knowledge."
      },
    ]
  },
  {
    id: "cybersecurity-5",
    category: "Cybersecurity",
    q: "Apa bahaya utama membiarkan sistem operasi dan peramban web tidak pernah diperbarui (update)?",
    options: [
      {
        text: "Tampilan layar menjadi hitam putih",
        isCorrect: false,
        explanation: "Bukan masalah grafis."
      },
      {
        text: "Celah keamanan (vulnerability) yang belum ditambal dapat dieksploitasi oleh malware dan peretas",
        isCorrect: true,
        explanation: "Pembaruan rutin menyertakan security patch untuk menutup celah zero-day dan bug kritis."
      },
      {
        text: "Kapasitas hard disk bertambah dua kali lipat",
        isCorrect: false,
        explanation: "Pembaruan justru membutuhkan ruang penyimpanan."
      },
      {
        text: "Mouse dan keyboard tidak dapat digunakan",
        isCorrect: false,
        explanation: "Perangkat keras dasar tetap berjalan."
      },
    ]
  },
  {
    id: "cybersecurity-6",
    category: "Cybersecurity",
    q: "Apa yang dimaksud dengan 'Ransomware'?",
    options: [
      {
        text: "Perangkat lunak gratis untuk membuat dokumen",
        isCorrect: false,
        explanation: "Bukan freeware."
      },
      {
        text: "Malware jahat yang mengenkripsi file korban dan menuntut tebusan uang untuk kunci dekripsinya",
        isCorrect: true,
        explanation: "Ransomware melumpuhkan akses data perusahaan atau personal demi pemerasan finansial."
      },
      {
        text: "Kabel pengisi daya ponsel berdaya tinggi",
        isCorrect: false,
        explanation: "Bukan perangkat keras."
      },
      {
        text: "Layanan penyimpanan awan publik",
        isCorrect: false,
        explanation: "Bukan cloud storage."
      },
    ]
  },
  {
    id: "cybersecurity-7",
    category: "Cybersecurity",
    q: "Praktik 'Shoulder Surfing' dalam rekayasa sosial merujuk pada:",
    options: [
      {
        text: "Berselancar di internet menggunakan perahu",
        isCorrect: false,
        explanation: "Bukan olahraga air."
      },
      {
        text: "Mengintip langsung dari belakang korban saat mereka memasukkan PIN ATM atau kata sandi",
        isCorrect: true,
        explanation: "Metode konvensional mencuri kredensial melalui pengamatan visual langsung."
      },
      {
        text: "Mengirimkan spam ke kontak email teman",
        isCorrect: false,
        explanation: "Itu email spamming."
      },
      {
        text: "Mengganti wallpaper desktop rekan kerja",
        isCorrect: false,
        explanation: "Itu tindakan iseng biasa."
      },
    ]
  },
  {
    id: "cybersecurity-8",
    category: "Cybersecurity",
    q: "Mengapa metode 2FA berbasis aplikasi authenticator (Google/Microsoft Authenticator) lebih aman daripada SMS OTP?",
    options: [
      {
        text: "Aplikasi authenticator tidak memerlukan pulsa dan kebal terhadap serangan pembajakan SIM Swap",
        isCorrect: true,
        explanation: "SMS OTP rentan disadap atau dibajak lewat manipulasi duplikasi kartu SIM (SIM Swap Fraud)."
      },
      {
        text: "SMS OTP selalu berbayar Rp100.000 per pesan",
        isCorrect: false,
        explanation: "Bukan biaya standar."
      },
      {
        text: "Aplikasi authenticator bisa memprediksi masa depan",
        isCorrect: false,
        explanation: "Algoritma TOTP berbasis waktu sinkron, bukan ramalan."
      },
      {
        text: "SMS hanya bisa diterima di ponsel jadul",
        isCorrect: false,
        explanation: "Semua ponsel menerima SMS."
      },
    ]
  },
  {
    id: "cybersecurity-9",
    category: "Cybersecurity",
    q: "Apa yang dilakukan serangan 'Brute Force' terhadap sistem login?",
    options: [
      {
        text: "Merusak fisik server dengan palu",
        isCorrect: false,
        explanation: "Bukan serangan fisik."
      },
      {
        text: "Mencoba ribuan hingga jutaan kombinasi kata sandi secara otomatis hingga menemukan yang cocok",
        isCorrect: true,
        explanation: "Metode tebak otomatis menggunakan daftar kata sandi populer atau komputasi cepat."
      },
      {
        text: "Mematikan aliran listrik gedung",
        isCorrect: false,
        explanation: "Itu pemadaman listrik."
      },
      {
        text: "Mengirimkan surat somasi kepada admin",
        isCorrect: false,
        explanation: "Bukan langkah legal."
      },
    ]
  },
  {
    id: "cybersecurity-10",
    category: "Cybersecurity",
    q: "Istilah 'Zero-Day Vulnerability' berarti:",
    options: [
      {
        text: "Celah keamanan yang belum diketahui pengembang perangkat lunak atau belum ada tambalan (patch) resminya",
        isCorrect: true,
        explanation: "Pengembang memiliki 'nol hari' untuk bersiap karena eksploitasi sudah ditemukan peretas lebih dulu."
      },
      {
        text: "Aplikasi yang dibuat dalam waktu nol hari",
        isCorrect: false,
        explanation: "Bukan durasi pengembangan."
      },
      {
        text: "Komputer yang bebas dari segala jenis virus",
        isCorrect: false,
        explanation: "Tidak ada sistem 100% bebas celah."
      },
      {
        text: "Koneksi internet tanpa batasan kuota",
        isCorrect: false,
        explanation: "Itu paket unlimited."
      },
    ]
  },
  {
    id: "cybersecurity-11",
    category: "Cybersecurity",
    q: "Prinsip 'Least Privilege' (Hak Akses Minimum) dalam keamanan sistem informasi menyatakan:",
    options: [
      {
        text: "Semua pengguna harus diberikan hak akses administrator penuh",
        isCorrect: false,
        explanation: "Itu pelanggaran keamanan berat."
      },
      {
        text: "Setiap pengguna hanya diberikan hak akses minimum yang benar-benar dibutuhkan untuk menjalankan tugasnya",
        isCorrect: true,
        explanation: "Membatasi potensi kerusakan jika salah satu akun pengguna berhasil diretas."
      },
      {
        text: "Tidak ada karyawan yang boleh mengakses komputer kantor",
        isCorrect: false,
        explanation: "Menghambat operasional bisnis."
      },
      {
        text: "Kata sandi hanya boleh terdiri dari 3 huruf",
        isCorrect: false,
        explanation: "Kata sandi pendek sangat tidak aman."
      },
    ]
  },
  {
    id: "cybersecurity-12",
    category: "Cybersecurity",
    q: "Apa risiko mencolokkan flashdisk yang ditemukan di tempat parkir kantor ke komputer kerja (USB Dropping)?",
    options: [
      {
        text: "Kapasitas komputer otomatis bertambah",
        isCorrect: false,
        explanation: "Flashdisk adalah media penyimpanan eksternal."
      },
      {
        text: "Flashdisk tersebut mungkin dirancang menyuntikkan malware otomatis (BadUSB / Trojan)",
        isCorrect: true,
        explanation: "Taktik rekayasa sosial menargetkan rasa penasaran karyawan untuk menginfeksi jaringan internal kantor."
      },
      {
        text: "Monitor komputer akan berkedip warna-warni",
        isCorrect: false,
        explanation: "Bukan efek langsung."
      },
      {
        text: "Keyboard akan berubah menjadi bahasa asing",
        isCorrect: false,
        explanation: "Bukan fungsi utama BadUSB."
      },
    ]
  },
  {
    id: "cybersecurity-13",
    category: "Cybersecurity",
    q: "Jika akun email Anda muncul di situs 'Have I Been Pwned', artinya:",
    options: [
      {
        text: "Akun email Anda telah dihapus oleh Google",
        isCorrect: false,
        explanation: "Email tidak otomatis terhapus."
      },
      {
        text: "Alamat email dan kemungkinan kata sandi Anda pernah bocor dalam insiden kebocoran data (data breach) layanan pihak ketiga",
        isCorrect: true,
        explanation: "Database kebocoran publik mencatat akun Anda pernah terekspos, segera ganti kata sandi terkait."
      },
      {
        text: "Anda memenangkan hadiah undian siber",
        isCorrect: false,
        explanation: "Bukan program reward."
      },
      {
        text: "Komputer Anda pasti sedang dirusak hacker saat ini",
        isCorrect: false,
        explanation: "Kebocoran terjadi di database server layanan pihak ketiga."
      },
    ]
  },
  {
    id: "cybersecurity-14",
    category: "Cybersecurity",
    q: "Apa tindakan paling aman saat hendak menjual ponsel bekas Anda?",
    options: [
      {
        text: "Cukup menghapus foto di galeri dan membuang riwayat chat",
        isCorrect: false,
        explanation: "Data yang dihapus biasa masih bisa dipulihkan dengan software recovery."
      },
      {
        text: "Lakukan Factory Reset (Kembalikan ke Setelan Pabrik) dengan opsi enkripsi data penuh terlebih dahulu",
        isCorrect: true,
        explanation: "Menghapus seluruh kunci dekripsi dan mengembalikan perangkat ke kondisi steril pabrikan."
      },
      {
        text: "Mengganti kartu SIM dengan kartu baru",
        isCorrect: false,
        explanation: "Data internal memori tetap tertinggal di ponsel."
      },
      {
        text: "Mematikan daya ponsel selama 24 jam",
        isCorrect: false,
        explanation: "Data tidak hilang saat ponsel mati."
      },
    ]
  },
  {
    id: "cybersecurity-15",
    category: "Cybersecurity",
    q: "Apa bahaya dari 'Session Hijacking' (Pembajakan Sesi)?",
    options: [
      {
        text: "Mengganggu sesi latihan kebugaran",
        isCorrect: false,
        explanation: "Bukan istilah olahraga."
      },
      {
        text: "Peretas mencuri token cookie sesi aktif korban sehingga dapat mengakses akun tanpa memasukkan kata sandi",
        isCorrect: true,
        explanation: "Dengan cookie sesi yang dicuri, peretas langsung masuk sebagai pengguna terautentikasi."
      },
      {
        text: "Memperpanjang masa aktif akun secara gratis",
        isCorrect: false,
        explanation: "Bukan keuntungan peretas."
      },
      {
        text: "Menghapus aplikasi browser dari perangkat",
        isCorrect: false,
        explanation: "Bukan dampaknya."
      },
    ]
  },
];

export default cybersecurityQuestions;
