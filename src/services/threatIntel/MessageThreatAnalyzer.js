/**
 * src/services/threatIntel/MessageThreatAnalyzer.js
 *
 * VeriFact ID 4.2 — Message Threat Intelligence Analyzer
 *
 * Mendeteksi rekayasa sosial dan indikasi penipuan siber pada teks pesan:
 * - Urgency / Batas Waktu Mendesak
 * - Fear Language / Ancaman Pemblokiran / Sanksi
 * - Authority Impersonation (Bank, Pajak, Bea Cukai, PLN, Polri, BUMN)
 * - Permintaan OTP / Kode Rahasia
 * - Permintaan Kredensial / Password / PIN
 * - Permintaan Transfer Uang / Biaya Administrasi
 * - Tautan URL Mencurigakan / Penyingkat Tautan / APK
 * - Umpan Hadiah / Undian / Saldo Gratis
 */

export function analyzeMessageThreat(rawText = '', options = {}) {
  const text = String(rawText || '').trim();
  if (!text) {
    return {
      valid: false,
      text: '',
      status: 'INVALID',
      statusCode: 'INVALID',
      riskScore: 0,
      riskLevel: 'UNKNOWN',
      indicators: ['Teks pesan kosong'],
      warningMessage: 'Silakan masukkan teks pesan yang ingin diperiksa.',
      disclaimer: 'Pemeriksaan dibatalkan.',
    };
  }

  const textLower = text.toLowerCase();
  const indicators = [];
  let score = 0;

  // 1. Urgency / Batas waktu mendesak
  const urgencyKeywords = [
    'segera', 'dalam 24 jam', '1x24 jam', 'hari ini juga', 'sebelum terlambat',
    'batas waktu', 'secepatnya', 'menit lagi', 'segera konfirmasi', 'buruan',
  ];
  const matchedUrgency = urgencyKeywords.filter((kw) => textLower.includes(kw));
  if (matchedUrgency.length > 0) {
    score += 25;
    indicators.push({
      category: 'urgency',
      title: 'Menciptakan Rasa Mendesak (Urgency)',
      detail: `Pesan menekan penerima untuk bertindak terburu-buru (${matchedUrgency.join(', ')}). Pelaku memanfaatkan kepanikan agar korban tidak sempat berpikir kritis.`,
    });
  }

  // 2. Fear Language & Account Blocking Threats
  const threatKeywords = [
    'diblokir', 'pemblokiran', 'dinonaktifkan', 'penutupan rekening', 'disita',
    'panggilan kepolisian', 'hukum pidana', 'denda', 'kasus hukum', 'penahanan',
    'tarif transaksi', 'biaya bulanan rp150', 'dikenakan denda',
  ];
  const matchedThreats = threatKeywords.filter((kw) => textLower.includes(kw));
  if (matchedThreats.length > 0) {
    score += 35;
    indicators.push({
      category: 'fear_threat',
      title: 'Ancaman Pemblokiran Akun atau Sanksi Hukum',
      detail: `Pesan menakut-nakuti dengan sanksi sepihak (${matchedThreats.join(', ')}). Lembaga resmi tidak pernah mengancam pemblokiran mendadak via pesan instan.`,
    });
  }

  // 3. Authority Impersonation
  const authorityKeywords = [
    { name: 'Perbankan (BCA, BRI, Mandiri, BNI)', words: ['bca', 'bri', 'brimo', 'mandiri', 'livin', 'bni', 'cimb', 'bank'] },
    { name: 'Pajak / DJP RI', words: ['djp', 'pajak', 'dirjen pajak', 'e-filing'] },
    { name: 'Bea Cukai', words: ['bea cukai', 'customs', 'penahanan paket'] },
    { name: 'PLN / Subsidi Listrik', words: ['pln', 'token listrik gratis', 'pemutusan listrik'] },
    { name: 'Kementerian / Pemerintah RI', words: ['kominfo', 'komdigi', 'kemensos', 'bansos', 'bpjs', 'blt'] },
    { name: 'Jasa Ekspedisi / Kurir', words: ['j&t', 'jne', 'sicepat', 'foto paket', 'resi paket'] },
  ];
  const matchedAuthorities = [];
  for (const auth of authorityKeywords) {
    if (auth.words.some((w) => textLower.includes(w))) {
      matchedAuthorities.push(auth.name);
    }
  }
  if (matchedAuthorities.length > 0) {
    score += 20;
    indicators.push({
      category: 'impersonation',
      title: 'Mencatut Nama Institusi / Otoritas',
      detail: `Pesan mengatasnamakan ${matchedAuthorities.join(', ')} untuk membangun kredibilitas palsu.`,
    });
  }

  // 4. Permintaan OTP / Kode Rahasia
  const otpKeywords = [
    'otp', 'kode otp', 'kode 6 digit', 'kode verifikasi', 'sms masuk', 'teruskan kode',
    'jangan berikan ke siapapun kecuali', 'kirim balik kode',
  ];
  const matchedOtp = otpKeywords.filter((kw) => textLower.includes(kw));
  if (matchedOtp.length > 0) {
    score += 45;
    indicators.push({
      category: 'otp_request',
      title: 'Permintaan Kode Verifikasi / OTP (Bahaya Sangat Tinggi)',
      detail: 'Pesan meminta atau menanyakan kode OTP. Kode OTP adalah kunci rahasia sekali pakai yang TIDAK PERNAH boleh dibagikan kepada siapapun, termasuk pihak bank/customer service.',
    });
  }

  // 5. Permintaan Kredensial (Password, PIN, Nomor Kartu)
  const credentialKeywords = [
    'kata sandi', 'password', 'pin atm', 'pin mobile', 'cvv', 'cvc',
    'nomor kartu debit', 'masa berlaku kartu', 'user id',
  ];
  const matchedCreds = credentialKeywords.filter((kw) => textLower.includes(kw));
  if (matchedCreds.length > 0) {
    score += 40;
    indicators.push({
      category: 'credential_harvesting',
      title: 'Permintaan Kredensial Pribadi atau PIN Rekening',
      detail: `Pesan mengarahkan pengisian data sensitif (${matchedCreds.join(', ')}). Ini indikator kuat pencurian akses akun.`,
    });
  }

  // 6. Umpan Hadiah / Undian / Saldo Gratis (Reward Bait)
  const rewardKeywords = [
    'selamat anda memenangkan', 'pemenang undian', 'gebyar', 'hadiah tunai',
    'saldo gratis', 'klaim hadiah', 'dana kaget', 'bonus tahun baru',
  ];
  const matchedRewards = rewardKeywords.filter((kw) => textLower.includes(kw));
  if (matchedRewards.length > 0) {
    score += 30;
    indicators.push({
      category: 'reward_bait',
      title: 'Umpan Hadiah / Menang Undian Palsu',
      detail: 'Pemberitahuan hadiah tanpa keikutsertaan lomba resmi adalah skema klasik penipuan berantai.',
    });
  }

  // 7. Permintaan Transfer Uang / Biaya Tebusan
  const moneyKeywords = [
    'transfer ke rekening', 'biaya administrasi', 'biaya pencairan', 'ongkir terlebih dahulu',
    'tebus barang', 'uang jaminan', 'dp minimal',
  ];
  const matchedMoney = moneyKeywords.filter((kw) => textLower.includes(kw));
  if (matchedMoney.length > 0) {
    score += 30;
    indicators.push({
      category: 'money_request',
      title: 'Permintaan Pembayaran atau Transfer Uang Muka',
      detail: 'Pesan meminta transfer uang muka atau biaya administrasi untuk pencairan hadiah/pekerjaan.',
    });
  }

  // 8. Tautan URL Mencurigakan / File APK
  const hasUrl = /https?:\/\/[^\s]+/i.test(text);
  const hasApk = /\.apk\b/i.test(text) || textLower.includes('unduh aplikasi') || textLower.includes('surat undangan.apk');
  const hasShortener = /(bit\.ly|tinyurl\.com|s\.id|t\.me|wa\.me|linktr\.ee)/i.test(text);
  const hasInvalidDomain = /\.invalid\b/i.test(text);

  if (hasApk) {
    score += 50;
    indicators.push({
      category: 'malware_apk',
      title: 'Distribusi File Aplikasi APK via Chat',
      detail: 'Modus sniffing APK Android menyamar sebagai surat undangan, resi kurir, atau surat tilang untuk menyadap SMS OTP korban.',
    });
  }

  if (hasUrl) {
    score += 20;
    indicators.push({
      category: 'suspicious_link',
      title: 'Menyertakan Tautan Luar (Link URL)',
      detail: hasShortener
        ? 'Tautan menggunakan penyingkat URL untuk menyembunyikan alamat situs tujuan sebenarnya.'
        : hasInvalidDomain
        ? 'Tautan menggunakan domain uji coba (.invalid).'
        : 'Tautan mengarahkan penerima ke halaman eksternal di luar aplikasi resmi.',
    });
  }

  // 9. Jual Beli Akun Game / Media Sosial (Account Sale §17)
  const isAccountSale = ['jual akun', 'beli akun', 'akun ml', 'mobile legends', 'akun ff', 'free fire', 'transfer dulu', 'jual murah akun', 'take all akun', 'jual char'].some((kw) => textLower.includes(kw));
  if (isAccountSale) {
    score += 35;
    indicators.push({
      category: 'account_sale',
      title: 'Tawaran Jual Beli Akun Game / Media Sosial Tidak Resmi',
      detail: 'Transaksi dilakukan di luar jalur resmi penerbit game/platform tanpa mekanisme perlindungan pembeli (escrow resmi). Berisiko tinggi akun hasil curian (phishing/hack) atau penipuan transfer sepihak.',
    });
  }

  // 10. Tawaran Investasi Bodong / Titip Dana
  const isInvestmentScam = ['titip dana', 'investasi slot', 'profit harian', 'trading kilat', 'keuntungan pasti', 'garansi modal'].some((kw) => textLower.includes(kw));
  if (isInvestmentScam) {
    score += 45;
    indicators.push({
      category: 'investment_scam',
      title: 'Tawaran Investasi Tidak Wajar / Skema Ponzi',
      detail: 'Pesan menjanjikan keuntungan pasti tanpa risiko atau titip dana kelolaan tanpa izin Otoritas Jasa Keuangan (OJK).',
    });
  }

  // 11. Lowongan Kerja Komisi / Tugas Like & Follow
  const isJobScam = ['lowongan kerja', 'loker', 'tugas like', 'follow instagram dapat', 'komisi harian', 'paruh waktu online'].some((kw) => textLower.includes(kw));
  if (isJobScam) {
    score += 45;
    indicators.push({
      category: 'fake_job',
      title: 'Modus Lowongan Kerja Berbayar / Tugas Komisi Palsu',
      detail: 'Pekerjaan sampingan online yang meminta deposit saldo atau menyelesaikan misi like/follow media sosial dengan iming-iming komisi fiktif.',
    });
  }

  // 12. Permintaan Deposit / Top Up Dana Awal
  if (textLower.includes('deposit') || textLower.includes('depo minimal') || textLower.includes('saldo aktivasi')) {
    score += 30;
    indicators.push({
      category: 'deposit_request',
      title: 'Instruksi Setoran Saldo / Deposit Modal Awal',
      detail: 'Pelaku mewajibkan calon korban mentransfer dana talangan atau deposit modal terlebih dahulu.',
    });
  }

  // Klasifikasi Status Akhir & Risk Level (§18)
  let status = 'AMAN TERINDIKASI RENDAH';
  let statusCode = 'LOW';
  let riskLevel = 'LOW';
  let riskLevel5 = 'LOW RISK';

  if (score >= 65 || matchedOtp.length > 0 || hasApk) {
    status = 'BERISIKO TINGGI';
    statusCode = 'HIGH';
    riskLevel = 'CRITICAL';
    riskLevel5 = 'CRITICAL RISK';
  } else if (score >= 40 || isAccountSale || isInvestmentScam || isJobScam || indicators.length >= 2) {
    status = 'BERISIKO TINGGI';
    statusCode = 'HIGH';
    riskLevel = 'HIGH';
    riskLevel5 = 'HIGH RISK';
  } else if (score >= 25 || indicators.length === 1) {
    status = 'PERLU WASPADA';
    statusCode = 'MEDIUM';
    riskLevel = 'MEDIUM';
    riskLevel5 = 'MEDIUM RISK';
  }

  // Ringkasan Apa yang Ditawarkan (§17 & §29)
  let whatIsOffered = 'Pesan memuat teks percakapan biasa.';
  if (isAccountSale) {
    whatIsOffered = 'Pesan menawarkan penjualan akun game atau media sosial dengan harga miring dan meminta transfer uang langsung.';
  } else if (isInvestmentScam) {
    whatIsOffered = 'Pesan menawarkan skema titip dana atau investasi instan dengan janji keuntungan finansial cepat.';
  } else if (isJobScam) {
    whatIsOffered = 'Pesan menawarkan lowongan pekerjaan paruh waktu online dengan imbalan komisi harian.';
  } else if (matchedRewards.length > 0) {
    whatIsOffered = 'Pesan mengklaim penerima memenangkan hadiah uang tunai, undian, atau saldo gratis.';
  } else if (matchedThreats.length > 0) {
    whatIsOffered = 'Pesan menyampaikan peringatan pemblokiran akun/layanan dan mendesak verifikasi segera.';
  }

  // Mengapa Berisiko (§17 & §29)
  let whyRisky = indicators.length > 0
    ? `Ditemukan ${indicators.length} indikator rekayasa sosial: ${indicators.map((i) => i.title).join('; ')}. Pelaku memanipulasi psikologi korban melalui ${indicators.map((i) => i.category).join(', ')} untuk mendapatkan uang atau akses akun pribadi.`
    : 'Pesan belum menunjukkan pola manipulasi siber yang mencurigakan.';

  if (isJobScam) {
    whyRisky += ' Modus lowongan kerja dengan deposit dana modal awal merupakan skema penipuan terstruktur di mana dana yang disetor tidak akan pernah dikembalikan.';
  } else if (isInvestmentScam) {
    whyRisky += ' Modus titip dana trading forex dengan janji pasti untung tanpa risiko bertentangan dengan prinsip investasi legal OJK dan berkarakteristik skema Ponzi ilegal.';
  }

  // Yang Perlu Diperiksa (§17)
  const thingsToVerify = [
    'Identitas asli pihak pengirim / penjual melalui kanal resmi',
    'Bukti kepemilikan sah barang atau akun yang ditawarkan',
    'Riwayat transaksi dan reputasi penjual di platform resmi',
    'Metode pembayaran (hindari transfer langsung ke rekening pribadi tanpa jaminan rekber)',
    'Kemungkinan akun hasil curian (phishing/sniffing) atau akun ilegal',
    'Ketentuan dan aturan resmi penyedia layanan / platform terkait',
  ];

  // Rekomendasi Tindakan (§17 & §29)
  const recommendedActions = [
    'JANGAN mentransfer uang secara sepihak ke rekening pribadi yang belum diverifikasi.',
    'JANGAN pernah membagikan kode OTP, PIN perbankan, atau kata sandi akun kepada siapapun.',
    'JANGAN membuka tautan mencurigakan atau mengunduh berkas biner/APK dari obrolan pribadi.',
    'Gunakan mekanisme transaksi resmi yang menyediakan perlindungan pembeli (Escrow/Rekber Terpercaya).',
    'Hubungi pusat bantuan resmi instansi atau platform yang bersangkutan untuk konfirmasi.',
  ];

  const sourcesChecked = [
    { name: 'Social Engineering Pattern Detector', status: 'ACTIVE_HEURISTIC_ENGINE' },
    { name: 'Malware & APK Sniffing Signatures', status: 'ACTIVE_HEURISTIC_ENGINE' },
    { name: 'Banking Impersonation Heuristics', status: 'ACTIVE_HEURISTIC_ENGINE' },
    { name: 'National Anti-Scam Reference Framework', status: 'MANUAL_REFERENCE', url: 'https://iasc.ojk.go.id' },
  ];

  return {
    valid: true,
    text,
    status,
    statusCode,
    riskScore: Math.min(100, Math.max(5, score)),
    riskLevel,
    riskLevel5,
    indicators,
    whatIsOffered,
    whyRisky,
    thingsToVerify,
    recommendedActions,
    sourcesChecked,
    warningMessage:
      riskLevel === 'CRITICAL' || riskLevel === 'HIGH'
        ? 'PERINGATAN TINGGI: Pesan ini mengandung banyak karakteristik manipulasi psikologis penipuan siber. JANGAN klik tautan, JANGAN kirim OTP, dan JANGAN mentransfer dana apapun.'
        : riskLevel === 'MEDIUM'
        ? 'WASPADA: Terdeteksi pola yang lazim digunakan pada pesan spam atau pengelabuan awal. Lakukan konfirmasi langsung ke nomor resmi institusi terkait.'
        : 'Tidak terdeteksi indikator rekayasa sosial berat pada teks pesan ini. Tetap berhati-hati terhadap permintaan data rahasia.',
    disclaimer: 'Pemeriksaan ini menganalisis pola redaksional, manipulasi psikologis, dan indikator keamanan teks. Selalu lakukan verifikasi sekunder.',
  };
}
