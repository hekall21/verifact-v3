/**
 * src/services/threatIntel/PhoneThreatAnalyzer.js
 *
 * VeriFact ID 4.2 — Phone Threat Intelligence Architecture
 * Analisis intelijen ancaman nomor telepon & kontak seluler Indonesia.
 *
 * Standar Kredibilitas & Transparansi (§16, §17, §19, §24, §40):
 * 1. HAPUS seluruh nomor telepon palsu / data korban rekayasa dari source code produksi.
 * 2. Nomor yang tidak tercatat menghasilkan status: NO_REPORT_FOUND (BUKAN "AMAN 100%").
 * 3. Status sumber transparan:
 *    - AduanNomor.id (Komdigi RI): MANUAL_REFERENCE (portal resmi untuk aduan & cek mandiri)
 *    - National Telecommunication Prefix Map: LIVE_CHECKED (verifikasi struktur operator lokal)
 *    - External Spam API: NOT_CONFIGURED (jika API key belum dipasang)
 * 4. Mode Demo / Simulasi didukung melalui demoFixtures.
 */

import { DEMO_FIXTURES } from './demoFixtures.js';

export function identifyCarrier(prefix) {
  if (['0811', '0812', '0813', '0821', '0822', '0823', '0852', '0853', '0851'].includes(prefix)) {
    return { carrier: 'Telkomsel', lineType: 'Mobile Seluler' };
  }
  if (['0814', '0815', '0816', '0855', '0856', '0857', '0858'].includes(prefix)) {
    return { carrier: 'Indosat Ooredoo Hutchison', lineType: 'Mobile Seluler' };
  }
  if (['0817', '0818', '0819', '0859', '0877', '0878'].includes(prefix)) {
    return { carrier: 'XL Axiata', lineType: 'Mobile Seluler' };
  }
  if (['0831', '0832', '0833', '0838'].includes(prefix)) {
    return { carrier: 'Axis (XL Axiata)', lineType: 'Mobile Seluler' };
  }
  if (['0895', '0896', '0897', '0898', '0899'].includes(prefix)) {
    return { carrier: 'Three (3) / IOH', lineType: 'Mobile Seluler' };
  }
  if (['0881', '0882', '0883', '0884', '0885', '0886', '0887', '0888', '0889'].includes(prefix)) {
    return { carrier: 'Smartfren', lineType: 'Mobile Seluler' };
  }
  if (prefix.startsWith('021') || prefix.startsWith('022') || prefix.startsWith('031') || prefix.startsWith('024')) {
    return { carrier: 'Telkom Indonesia', lineType: 'Fixed Line (PSTN Telepon Rumah)' };
  }
  return { carrier: 'Penyedia Telekomunikasi / VoIP', lineType: 'VoIP / Nomor Virtual' };
}

export function analyzePhoneNumber(raw, options = {}) {
  const clean = String(raw || '').replace(/[\s\-().+]+/g, '');

  let normalized = clean;
  if (clean.startsWith('62') && clean.length > 9) {
    normalized = `0${clean.slice(2)}`;
  }

  // 1. Validasi Format
  if (!normalized || !/^\d+$/.test(normalized) || normalized.length < 8 || normalized.length > 15) {
    return {
      phoneNumber: raw,
      formatted: null,
      carrier: null,
      lineType: null,
      status: 'INVALID',
      statusCode: 'INVALID',
      riskScore: 0,
      riskLevel: 'UNKNOWN',
      tags: [],
      reportCount: 0,
      category: null,
      lastReportedAt: null,
      sourcesChecked: [],
      warningMessage: 'Format nomor telepon tidak valid. Pastikan nomor diawali 08xx atau +62xx dengan panjang 9-14 digit.',
      disclaimer: 'Pemeriksaan dihentikan karena format tidak valid.',
      observations: ['Struktur nomor tidak memenuhi kaidah penomoran telekomunikasi nasional'],
      valid: false,
      reasonCode: 'invalidPhoneFormat',
    };
  }

  // 2. Cek Demo Fixtures / Test Mode
  const demoMatch = DEMO_FIXTURES.phone.find(
    (item) => item.simulationData.phoneNumber === normalized || item.value.replace(/[\s\-]+/g, '') === normalized
  );

  if (demoMatch || options.isSimulation) {
    const fixture = demoMatch ? demoMatch.simulationData : DEMO_FIXTURES.phone[1].simulationData;
    return {
      ...fixture,
      isSimulation: true,
      simulationBadge: 'SIMULASI / DATA UJI',
      checkedAt: new Date().toISOString(),
    };
  }

  // 3. Opsi Force Unavailable (Network Timeout Simulation)
  if (options.forceUnavailable) {
    const prefix = normalized.slice(0, 4);
    const { carrier, lineType } = identifyCarrier(prefix);
    return {
      phoneNumber: normalized,
      formatted: normalized.replace(/(\d{4})(\d{4})(\d+)/, '$1-$2-$3'),
      carrier,
      lineType,
      status: 'DATA TIDAK TERSEDIA',
      statusCode: 'LOOKUP_UNAVAILABLE',
      riskScore: 0,
      riskLevel: 'UNKNOWN',
      tags: [],
      reportCount: 0,
      category: null,
      lastReportedAt: null,
      sourcesChecked: [
        { name: 'AduanNomor.id (Komdigi RI)', status: 'UNAVAILABLE', url: 'https://aduannomor.id' },
        { name: 'National Telecommunication Prefix Map', status: 'LIVE_CHECKED' },
        { name: 'Third-Party Spam Feed API', status: 'UNAVAILABLE' },
      ],
      warningMessage: 'Layanan basis data aduan nomor telepon sedang tidak dapat diakses. Mohon lakukan pengecekan mandiri.',
      disclaimer: 'Kegagalan jaringan ke database BUKAN bukti bahwa nomor tersebut aman digunakan.',
      observations: ['Layanan telemetri eksternal sedang tidak merespons'],
      valid: true,
      verifyUrl: 'https://aduannomor.id',
    };
  }

  const prefix = normalized.slice(0, 4);
  const { carrier, lineType } = identifyCarrier(prefix);
  const observations = [];

  // Observasi Struktural
  observations.push(`Format valid: ${normalized.length} digit`);
  observations.push(`Operator terdeteksi: ${carrier} (${lineType})`);

  if (normalized.length > 13) {
    observations.push('Panjang nomor melebihi standar seluler Indonesia (>13 digit), berpotensi nomor virtual atau roaming internasional');
  }
  if (/(\d)\1{5,}/.test(normalized)) {
    observations.push('Pola nomor repetitif terdeteksi (angka sama berulang ≥ 6 kali)');
  }
  if (lineType.includes('VoIP')) {
    observations.push('Nomor terdeteksi sebagai gateway VoIP / nomor virtual yang mudah diganti tanpa kartu SIM fisik');
  }

  const sourcesChecked = [
    { name: 'AduanNomor.id (Komdigi RI)', status: 'MANUAL_REFERENCE', url: 'https://aduannomor.id' },
    { name: 'National Telecommunication Prefix Map', status: 'LIVE_CHECKED' },
    { name: 'Third-Party Spam Feed API', status: 'NOT_CONFIGURED' },
  ];

  const formatted = normalized.replace(/(\d{4})(\d{4})(\d+)/, '$1-$2-$3');

  // Anomali Berat Tanpa Laporan Publik
  if (observations.length >= 3 || lineType.includes('VoIP')) {
    return {
      phoneNumber: normalized,
      formatted,
      carrier,
      lineType,
      status: 'MENCURIGAKAN',
      statusCode: 'SUSPICIOUS',
      riskScore: 50,
      riskLevel: 'MEDIUM',
      tags: ['Anomali Struktural', 'Potensi Nomor Virtual'],
      reportCount: 0,
      category: 'Indikasi Nomor Virtual / Anomali Pola',
      lastReportedAt: null,
      sourcesChecked,
      warningMessage: 'Terdeteksi pola struktural tidak lazim pada nomor ini (mis. gateway VoIP atau panjang tidak standar). Harap tetap waspada.',
      disclaimer: 'PENTING: Selalu verifikasi identitas lawan bicara melalui kanal resmi.',
      observations,
      valid: true,
      checkedAt: new Date().toISOString(),
      verifyUrl: 'https://aduannomor.id',
    };
  }

  // HASIL DEFAULT NOMOR PENGGUNA BERSIH: NO_REPORT_FOUND
  // GOLDEN RULE: "NO_REPORT_FOUND" != "AMAN 100%"
  observations.push('Tidak ditemukan laporan penipuan pada sumber publik yang tersedia saat pemeriksaan.');

  return {
    phoneNumber: normalized,
    formatted,
    carrier,
    lineType,
    status: 'TIDAK DITEMUKAN LAPORAN',
    statusCode: 'NO_REPORT_FOUND',
    riskScore: 10,
    riskLevel: 'LOW',
    tags: ['Belum Ada Laporan Tercatat'],
    reportCount: 0,
    category: null,
    lastReportedAt: null,
    sourcesChecked,
    warningMessage: 'Tidak ditemukan laporan penipuan pada sumber yang tersedia saat ini.',
    disclaimer: 'PENTING: Status "Tidak Ditemukan Laporan" BUKAN jaminan bahwa nomor tersebut aman. Pelaku kejahatan kerap menggunakan kartu SIM sekali pakai (burner SIM) yang baru diaktifkan.',
    observations,
    valid: true,
    checkedAt: new Date().toISOString(),
    verifyUrl: 'https://aduannomor.id',
  };
}
