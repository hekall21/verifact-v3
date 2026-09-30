/**
 * patternCorpus.js
 *
 * Korpus POLA MODUS yang berulang di Indonesia.
 *
 * BATAS YANG TEGAS — baca ini sebelum memakai data di sini:
 *   Entri di file ini BUKAN laporan pemeriksaan atas klaim tertentu.
 *   Entri ini adalah panduan pola: "modus seperti ini sudah lama dikenal,
 *   dan inilah kanal resmi untuk memeriksanya."
 *
 *   Karena itu setiap entri memiliki `kind: 'pattern'` dan TIDAK PERNAH
 *   dipakai sebagai `priorVerdict` pada mesin verdict. Kecocokan pola
 *   hanya menghasilkan konteks + rujukan kanal resmi, sehingga status
 *   akhir tetap BELUM TERBUKTI / TIDAK DAPAT DIVERIFIKASI bila memang
 *   tidak ada bukti yang diambil.
 *
 * Alasannya: mengetahui "ada modus serupa" tidak sama dengan
 * membuktikan bahwa pesan yang sedang diperiksa memang penipuan.
 */

export const PATTERN_KIND = 'pattern';

export const PATTERN_CORPUS = [
  {
    id: 'apk-malware',
    kind: PATTERN_KIND,
    topics: ['cyber', 'malware', 'scam'],
    // Kata kunci dipakai untuk pencocokan pola.
    keywords: ['apk', 'undangan pernikahan', 'surat tilang', 'tilang elektronik', 'etle', 'resi', 'paket', 'kurir', 'foto paket', 'wedding invitation', 'install'],
    requireAny: ['apk', 'install', 'pasang file'],
    officialChannels: ['bssn', 'komdigi'],
    // Poin observasi ditampilkan sebagai konteks, dengan kunci i18n.
    contextKeys: ['apkNeverOfficial', 'apkPermissions', 'apkOtpTheft'],
    actionKeys: ['doNotInstall', 'verifyViaOfficialChannel', 'reportNumber'],
    severity: 'high',
  },
  {
    id: 'bansos-phishing',
    kind: PATTERN_KIND,
    topics: ['government', 'bansos', 'scam'],
    keywords: ['bansos', 'bantuan sosial', 'bantuan tunai', 'kemensos', 'pkh', 'bst', 'bsu', 'subsidi', 'cair', 'pendaftaran bantuan'],
    requireAny: ['bansos', 'bantuan', 'subsidi', 'kemensos'],
    officialChannels: ['cekbansos', 'kemensos', 'lapor'],
    contextKeys: ['govOnlyOfficialDomain', 'noPinOrOtpRequest', 'checkBansosChannel'],
    actionKeys: ['verifyViaOfficialChannel', 'neverShareOtp', 'doNotForward'],
    severity: 'high',
  },
  {
    id: 'game-account-trade',
    kind: PATTERN_KIND,
    topics: ['scam', 'game'],
    keywords: ['jual akun', 'beli akun', 'jb akun', 'akun ml', 'mobile legends', 'free fire', 'genshin', 'valorant', 'roblox', 'all unbind', 'monsep', 'moonton', 'rekber', 'pulber', 'midman', 'skin collector', 'spek sultan', 'akun murah'],
    requireAny: ['akun', 'rekber', 'unbind', 'monsep'],
    officialChannels: ['cekrekening', 'aduannomor'],
    contextKeys: ['tooCheapPrice', 'hackbackRisk', 'fakeEscrow', 'unbindStatus'],
    actionKeys: ['useLicensedEscrow', 'checkAccountNumber', 'neverShareOtp', 'keepEvidence'],
    severity: 'high',
  },
  {
    id: 'task-scam',
    kind: PATTERN_KIND,
    topics: ['scam', 'investment'],
    keywords: ['kerja paruh waktu', 'part time', 'like subscribe', 'komisi harian', 'tugas harian', 'deposit', 'garansi', 'telegram', 'admin', 'join grup', 'penghasilan harian'],
    requireAny: ['deposit', 'komisi', 'tugas', 'paruh waktu', 'part time'],
    officialChannels: ['ojk', 'lapor'],
    contextKeys: ['taskScamFlow', 'depositNeverReturned', 'checkOjkLicense'],
    actionKeys: ['checkOjkLicense', 'doNotTransfer', 'reportNumber'],
    severity: 'high',
  },
  {
    id: 'free-diamond-phishing',
    kind: PATTERN_KIND,
    topics: ['scam', 'game', 'cyber'],
    keywords: ['diamond gratis', 'skin gratis', 'topup gratis', 'event resmi', 'login akun', 'kuota gratis', 'saldo gratis', 'giveaway'],
    requireAny: ['gratis', 'giveaway', 'event'],
    officialChannels: ['komdigi'],
    contextKeys: ['phishingLoginPage', 'officialEventOnlyInApp', 'credentialTheft'],
    actionKeys: ['doNotLogin', 'verifyViaOfficialChannel', 'enableTwoFactor'],
    severity: 'medium',
  },
  {
    id: 'earthquake-prediction',
    kind: PATTERN_KIND,
    topics: ['disaster'],
    keywords: ['gempa', 'tsunami', 'prediksi gempa', 'akan terjadi', 'megathrust', 'bmkg', 'bencana besar'],
    requireAny: ['gempa', 'tsunami', 'megathrust'],
    officialChannels: ['bmkg', 'bnpb'],
    contextKeys: ['earthquakeNotPredictable', 'bmkgOnlyOfficial', 'potentialVsPrediction'],
    actionKeys: ['verifyViaOfficialChannel', 'doNotForward'],
    severity: 'medium',
  },
  {
    id: 'health-chain-message',
    kind: PATTERN_KIND,
    topics: ['health'],
    keywords: ['air es', 'kanker', 'obat alami', 'sembuh total', 'racun tubuh', 'detoks', 'vaksin berbahaya', 'jangan minum', 'khasiat ajaib'],
    requireAny: ['kanker', 'sembuh', 'obat', 'vaksin', 'detoks'],
    officialChannels: ['kemkes', 'who', 'bpom'],
    contextKeys: ['healthNeedsProfessional', 'noMiracleCure', 'checkBpomRegistration'],
    actionKeys: ['consultHealthProfessional', 'verifyViaOfficialChannel', 'doNotForward'],
    severity: 'high',
    // Klaim kesehatan tidak boleh diberi diagnosis (master prompt §29).
    highRisk: true,
  },
  {
    id: 'deepfake-investment',
    kind: PATTERN_KIND,
    topics: ['investment', 'cyber'],
    keywords: ['deepfake', 'investasi', 'trading', 'profit harian', 'robot trading', 'keuntungan pasti', 'artis promosi', 'pejabat promosi', 'crypto'],
    requireAny: ['investasi', 'trading', 'profit', 'deepfake'],
    officialChannels: ['ojk'],
    contextKeys: ['deepfakeEndorsement', 'guaranteedProfitRedFlag', 'checkOjkLicense'],
    actionKeys: ['checkOjkLicense', 'reverseImageSearch', 'doNotTransfer'],
    severity: 'high',
  },
  {
    id: 'prize-scam',
    kind: PATTERN_KIND,
    topics: ['scam'],
    keywords: ['menang undian', 'hadiah', 'pemenang', 'biaya admin', 'pajak hadiah', 'klaim hadiah', 'selamat anda'],
    requireAny: ['undian', 'hadiah', 'pemenang'],
    officialChannels: ['cekrekening', 'aduannomor'],
    contextKeys: ['prizeRequiresNoPayment', 'adminFeeRedFlag'],
    actionKeys: ['doNotTransfer', 'checkAccountNumber', 'reportNumber'],
    severity: 'medium',
  },
  {
    id: 'bank-impersonation',
    kind: PATTERN_KIND,
    topics: ['scam', 'finance', 'cyber'],
    keywords: ['otp', 'pin', 'cvv', 'petugas bank', 'blokir rekening', 'upgrade akun', 'kode verifikasi', 'm-banking', 'rekening diblokir'],
    requireAny: ['otp', 'pin', 'cvv', 'kode verifikasi'],
    officialChannels: ['ojk', 'aduannomor'],
    contextKeys: ['bankNeverAsksOtp', 'otpIsPrivate'],
    actionKeys: ['neverShareOtp', 'contactBankDirectly', 'reportNumber'],
    severity: 'high',
  },
  {
    id: 'old-photo-recontext',
    kind: PATTERN_KIND,
    topics: ['media', 'literacy'],
    keywords: ['foto viral', 'video viral', 'rekaman', 'kejadian tadi malam', 'baru terjadi', 'detik ini'],
    requireAny: ['foto', 'video', 'rekaman'],
    officialChannels: [],
    contextKeys: ['oldMediaReused', 'checkOriginalUploadDate'],
    actionKeys: ['reverseImageSearch', 'doNotForward'],
    severity: 'low',
  },
];

/**
 * Cocokkan teks dengan korpus pola.
 * Mengembalikan pola yang cocok beserta kata kunci yang benar-benar ditemukan,
 * agar pengguna bisa melihat DASAR pencocokannya (transparan, bukan kotak hitam).
 */
export function matchPatterns(text, limit = 3) {
  const lower = String(text || '').toLowerCase();
  if (!lower.trim()) return [];

  const results = [];
  for (const pattern of PATTERN_CORPUS) {
    const matchedKeywords = pattern.keywords.filter((k) => lower.includes(k.toLowerCase()));
    if (!matchedKeywords.length) continue;

    // Syarat minimum agar tidak terlalu mudah memicu pola.
    const gate = pattern.requireAny || [];
    const gatePassed = gate.length === 0 || gate.some((g) => lower.includes(g.toLowerCase()));
    if (!gatePassed) continue;

    const score = matchedKeywords.length + (gatePassed ? 1 : 0);
    results.push({ ...pattern, matchedKeywords, matchScore: score });
  }

  return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
}
