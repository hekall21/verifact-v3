# 🛡️ VeriFact ID 3.0 — Platform Verifikasi Fakta & Pertahanan Siber Transparan

> **Arsitektur Baru Fact-Checking Transparan, Evaluasi Bukti Multi-Tier, Deteksi Modus Penipuan Siber Finansial, Gamifikasi Literasi Digital, dan Sistem Dwibahasa Penuh (ID/EN).**

---

## 🌟 Transformasi Total di Versi 3.0 (v3.0.0 Enterprise)

Sesuai dengan target **Master Prompt VeriFact ID 3.0**, versi ini merombak sistem dari sekadar demo/heuristik sederhana menjadi platform verifikasi informasi terstruktur berbasis bukti nyata (*evidence-based fact-checking*):

1. **Mesin Verifikasi Deterministik 5-Tahap:**
   - **Tahap 1:** *Input Classification & Detection* — Mengenali URL web, headline berita, kalimat tunggal, atau teks pesan berantai WhatsApp.
   - **Tahap 2:** *Claim & Entity Extraction* — Mengisolasi klaim pokok, institusi/kementerian, angka/dana, tanggal, lokasi, dan penanda gaya bahasa (urgensi, sensasionalisme, pemendek URL).
   - **Tahap 3:** *Authority & Pattern Retrieval* — Menghubungkan kata kunci ke korpus modus berulang dan katalog kanal resmi pemerintah.
   - **Tahap 4:** *Evidence & Stance Consistency* — Menimbang konsistensi arah bukti (*supports / refutes / context*) berdasarkan bobot hierarki tier.
   - **Tahap 5:** *Transparent Report Formulation* — Menghasilkan laporan lengkap, terinci, dan dapat diverifikasi ulang secara mandiri.

2. **Hierarki Sumber 3-Tier Terbuka:**
   - **Tier 1 (Sumber Primer / Otoritas):** Dokumen kementerian/lembaga resmi (*.go.id, BSSN, BMKG, Kemenkes, Kemensos, OJK, BPOM).
   - **Tier 2 (Media Kredibel):** Jurnalisme investigasi terakreditasi dewan pers.
   - **Tier 3 (Pemeriksa Fakta Independen):** Basis data CekFakta, TurnBackHoax (Mafindo), dan Google Fact Check Explorer.

3. **Rubrik 7 Status Pemeriksaan Objektif:**
   - Tidak lagi memaksakan dikotomi hitam-putih. Status terdiri dari:
     - `FAKTA` (Fact)
     - `SEBAGIAN BENAR` (Partly True)
     - `MENYESATKAN` (Misleading)
     - `DISINFORMASI` (Disinformation)
     - `HOAKS` (Hoax)
     - `BELUM TERBUKTI` (Unproven)
     - `TIDAK DAPAT DIVERIFIKASI` (Unverifiable)
   - Prinsip etis: *Jika bukti belum memadai atau tautan tidak dapat diakses, sistem secara jujur menetapkan status BELUM TERBUKTI atau TIDAK DAPAT DIVERIFIKASI tanpa mengarang fakta.*

4. **Kalkulasi Tingkat Keyakinan (Confidence Score 0-100%):**
   - Bukan angka acak! Dihitung secara matematis dari jumlah domain independen, ketersediaan sumber primer, dan konsistensi data. Dilengkapi kartu rincian faktor penentu skor (*transparency factor breakdown*).

5. **Scam Shield Mandiri (Rekening, Telepon, URL):**
   - Mendeteksi awalan bank Indonesia (BCA, BRI, Mandiri, BNI, e-wallet).
   - Mengidentifikasi operator seluler Indonesia (Telkomsel, Indosat, XL, Axis, Tri, Smartfren).
   - Menghubungkan langsung ke portal resmi **CekRekening.id** dan **AduanNomor.id**.
   - Berpegang teguh pada prinsip: *"Ketiadaan laporan bukan jaminan mutlak keamanan (Absence of evidence ≠ evidence of safety)."*

6. **100% Dwibahasa Reaktif (ID & EN):**
   - Seluruh antarmuka, kamus status, badge, alasan teknis, tips pencegahan, data berita viral, hingga kuis literasi berubah seketika saat tombol alih bahasa `[ID | EN]` diklik.

7. **Dual Theming Konsisten (Midnight Dark & Clean Pro White):**
   - Kontras warna teks memenuhi standar WCAG AAA tanpa ada elemen teks yang tak terlihat.

---

## 🚀 Cara Menjalankan Aplikasi

### Opsi 1: Pratinjau Instan Tanpa Instalasi (Rekomendasi Dewan Juri)
1. Buka berkas **`index.offline.html`** (atau di folder `dist/standalone.html`).
2. Klik ganda (**double-click**).
3. Aplikasi akan langsung berjalan 100% aktif di peramban web modern tanpa perlu internet atau server Node.js.

---

### Opsi 2: Mode Pengembang (React 19 + Tailwind CSS v4 + Vite)
```bash
# 1. Pasang dependensi
npm install

# 2. Jalankan unit test 8 test case wajib
npm test

# 3. Jalankan server pengembang lokal
npm run dev

# 4. (Opsional) Jalankan backend stub API
npm run server
```
Akses aplikasi melalui peramban di `http://localhost:5173`.

---

## 🧪 Verifikasi 8 Test Case Wajib (§39)
Seluruh 8 test case telah diuji dengan test runner bawaan Node.js:
- **Test 1:** Input URL valid terdeteksi sebagai URL.
- **Test 2:** Input teks klaim mengekstrak entitas dan angka.
- **Test 3:** URL tidak valid menghasilkan error eksplisit.
- **Test 4:** URL tidak dapat diakses menghasilkan status jujur tanpa mengarang isi.
- **Test 5:** Ketiadaan bukti menghasilkan status `BELUM TERBUKTI`.
- **Test 6:** Alih bahasa ID <-> EN menerjemahkan UI dan laporan hasil.
- **Test 7:** Responsif di layar mobile (375px) tanpa overflow layout.
- **Test 8:** Tema Dark dan Light memiliki keterbacaan kontras tinggi.

---

## 🏛️ Arsitektur Berkas Modular
```text
verifact_v3/
├── index.html                    # Entri HTML Vite
├── index.offline.html            # Bundle mandiri siap pakai (tanpa server)
├── package.json                  # Dependensi React 19 + Tailwind v4 + Vite 8
├── vite.config.js                # Konfigurasi bundler es2022
├── server/
│   └── index.mjs                 # Backend stub API /api/analyze & /api/health
├── scripts/
│   └── build-offline.mjs         # Skrip compiler single-file HTML
├── tests/
│   └── verifier.test.mjs         # 8 Unit test case wajib
├── src/
│   ├── main.jsx                  # Entri React 19
│   ├── App.jsx                   # Shell navigasi & state utama
│   ├── index.css                 # Token desain semantik dark/light
│   ├── i18n/                     # Kamus dwibahasa terpusat
│   │   ├── id.js
│   │   ├── en.js
│   │   └── index.js
│   ├── utils/                    # Utilitas analisis deterministik
│   │   ├── urlDetector.js
│   │   ├── claimExtractor.js
│   │   ├── verdict.js
│   │   ├── sourceScoring.js
│   │   └── sanitize.js
│   ├── data/                     # Korpus pola & basis data
│   │   ├── patternCorpus.js
│   │   ├── officialSources.js
│   │   ├── scamPatterns.js
│   │   └── mockData.js
│   ├── services/                 # Lapisan service
│   │   ├── apiClient.js
│   │   ├── articleService.js
│   │   ├── factCheckService.js
│   │   ├── sourceService.js
│   │   └── analysisService.js
│   └── components/               # Komponen antarmuka modular
│       ├── common/               # Navbar, Footer, Icons
│       ├── verifier/             # Input, Progress, Result, Cards
│       ├── scam/                 # ScamShield modul
│       ├── trending/             # Umpan tren disinformasi
│       ├── quiz/                 # Kuis gamifikasi literasi
│       ├── literacy/             # Panduan kritis 5 langkah
│       ├── report/               # Formulir partisipasi publik
│       └── methodology/          # Modal transparansi & etika
```
