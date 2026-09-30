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

  // Klasifikasi Status Akhir
  let status = 'AMAN TERINDIKASI RENDAH';
  let statusCode = 'LOW';
  let riskLevel = 'LOW';

  if (score >= 65 || matchedOtp.length > 0 || hasApk) {
    status = 'BERISIKO TINGGI';
    statusCode = 'HIGH';
    riskLevel = 'CRITICAL';
  } else if (score >= 35 || indicators.length >= 2) {
    status = 'PERLU WASPADA';
    statusCode = 'MEDIUM';
    riskLevel = 'MEDIUM';
  } else if (score >= 20 || indicators.length === 1) {
    status = 'MENCURIGAKAN';
    statusCode = 'MEDIUM_HIGH';
    riskLevel = 'MODERATE';
  }

  const sourcesChecked = [
    { name: 'Social Engineering Pattern Detector', status: 'LIVE_CHECKED' },
    { name: 'Malware & APK Sniffing Signatures', status: 'LIVE_CHECKED' },
    { name: 'Banking Impersonation Heuristics', status: 'LIVE_CHECKED' },
    { name: 'National Anti-Scam Heuristic Feed', status: 'MANUAL_REFERENCE', url: 'https://iasc.ojk.go.id' },
  ];

  return {
    valid: true,
    text,
    status,
    statusCode,
    riskScore: Math.min(100, Math.max(5, score)),
    riskLevel,
    indicators,
    sourcesChecked,
    warningMessage:
      statusCode === 'HIGH'
        ? 'PERINGATAN TINGGI: Pesan ini mengandung banyak karakteristik manipulasi psikologis penipuan siber. JANGAN klik tautan, JANGAN kirim OTP, dan JANGAN mentransfer dana apapun.'
        : statusCode === 'MEDIUM' || statusCode === 'MEDIUM_HIGH'
        ? 'WASPADA: Terdeteksi pola yang lazim digunakan pada pesan spam atau pengelabuan awal. Lakukan konfirmasi langsung ke nomor resmi institusi terkait.'
        : 'Tidak terdeteksi indikator rekayasa sosial berat pada teks pesan ini. Tetap berhati-hati terhadap permintaan data rahasia.',
    disclaimer: 'Pemeriksaan ini menganalisis pola redaksional, manipulasi psikologis, dan indikator keamanan teks. Selalu lakukan verifikasi sekunder.',
  };
}
