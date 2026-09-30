/**
 * queryGenerator.js
 *
 * VeriFact ID 4.0 - Multi-Query Generation Engine
 * Menghasilkan variasi query pencarian cerdas untuk memvalidasi klaim dari berbagai sudut pandang.
 * Sesuai spesifikasi master prompt v4.txt §06.
 */

export function generateVerificationQueries(mainClaim = '', atomicClaims = [], entities = [], dates = []) {
  const queries = [];
  const cleanMain = String(mainClaim || '').replace(/[^\w\s\d]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = cleanMain.split(' ').filter((w) => w.length > 2);

  // 1. Query Utama Faktual
  const primaryKeywords = words.slice(0, 6).join(' ');
  if (primaryKeywords) {
    queries.push({
      id: 'q-main',
      type: 'factual',
      query: `"${primaryKeywords}"`,
      purpose: 'Pencarian klaim inti pada portal berita dan basis data pemeriksa fakta',
    });
  }

  // 2. Query Lembaga / Sumber Resmi (.go.id)
  const officialEntity = entities.find((e) =>
    /kementerian|kemenkes|kemensos|kominfo|komdigi|ojk|bmkg|bnpb|presiden|pemerintah|polri/i.test(e)
  );

  if (officialEntity) {
    queries.push({
      id: 'q-official',
      type: 'official_site',
      query: `site:go.id "${officialEntity}" ${words.slice(0, 4).join(' ')}`,
      purpose: 'Verifikasi pernyataan atau dokumen resmi pada domain instansi pemerintah',
    });
  } else {
    queries.push({
      id: 'q-official-general',
      type: 'official_site',
      query: `site:go.id ${words.slice(0, 5).join(' ')}`,
      purpose: 'Pencarian regulasi dan siaran pers pada situs resmi pemerintah',
    });
  }

  // 3. Query Arsip Periksa Fakta (Cek Fakta / Hoaks)
  queries.push({
    id: 'q-factcheck',
    type: 'debunk_archive',
    query: `"${words.slice(0, 4).join(' ')}" (hoaks OR "cek fakta" OR disinformasi)`,
    purpose: 'Pencarian laporan klarifikasi dan bantahan dari koalisi pemeriksa fakta',
  });

  // 4. Query Temporal & Konteks Waktu
  if (dates.length > 0) {
    queries.push({
      id: 'q-temporal',
      type: 'temporal_check',
      query: `"${words.slice(0, 4).join(' ')}" "${dates[0]}"`,
      purpose: 'Pengecekan keselarasan linimasa peristiwa dan tanggal publikasi',
    });
  } else {
    const currentYear = new Date().getFullYear();
    queries.push({
      id: 'q-temporal-current',
      type: 'temporal_check',
      query: `"${words.slice(0, 4).join(' ')}" ${currentYear}`,
      purpose: 'Memeriksa kebaruan informasi pada tahun berjalan',
    });
  }

  // 5. Query Klaim Atomik Spesifik (jika ada lebih dari 1)
  if (atomicClaims && atomicClaims.length > 1) {
    const specificClaim = atomicClaims[1].text.replace(/[^\w\s]/g, ' ').trim().slice(0, 40);
    queries.push({
      id: 'q-atomic-sub',
      type: 'atomic_clause',
      query: `"${specificClaim}"`,
      purpose: 'Pemeriksaan klaim turunan spesifik',
    });
  }

  return queries;
}
