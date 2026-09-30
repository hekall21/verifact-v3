/**
 * src/services/queryGenerator.js
 *
 * VeriFact ID 4.1 — Multi-Query Generation Engine
 *
 * Mengikuti spesifikasi mutlak §Part 5 & §Part 6:
 * - Menghasilkan variasi query: exact phrase, entity query, date query, official site query.
 * - SUPPORT QUERY & REFUTE QUERY untuk setiap klaim guna mencegah konfirmasi bias.
 */

export function generateVerificationQueries(mainClaim = '', atomicClaims = [], entities = [], dates = []) {
  const queries = [];
  const cleanMain = String(mainClaim || '').replace(/[^\w\s\d]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = cleanMain.split(' ').filter((w) => w.length > 2);
  const corePhrase = words.slice(0, 5).join(' ');

  // 1. Exact Phrase Query
  if (corePhrase) {
    queries.push({
      id: 'q-exact',
      type: 'exact_phrase',
      query: `"${corePhrase}"`,
      purpose: 'Pencarian klaim persis pada pangkalan data publikasi dan arsip berita',
      mode: 'neutral',
    });
  }

  // 2. Official Source Query (site:go.id)
  const officialEntity = entities.find((e) =>
    /kementerian|kemenkes|kemensos|kominfo|komdigi|ojk|bmkg|bnpb|presiden|pemerintah|polri|bank indonesia|bi|bpom/i.test(e)
  );

  if (officialEntity) {
    queries.push({
      id: 'q-official',
      type: 'official_site',
      query: `site:go.id "${officialEntity}" ${words.slice(0, 4).join(' ')}`,
      purpose: 'Verifikasi pernyataan atau dokumen rilis pers resmi dari domain pemerintah (.go.id)',
      mode: 'official',
    });
  } else {
    queries.push({
      id: 'q-official-general',
      type: 'official_site',
      query: `site:go.id "${corePhrase}"`,
      purpose: 'Pencarian regulasi dan klarifikasi resmi kementerian terkait',
      mode: 'official',
    });
  }

  // 3. SUPPORT QUERY (Mencari bukti konfirmasi/fakta yang mendukung)
  queries.push({
    id: 'q-support',
    type: 'support_search',
    query: `"${corePhrase}" (fakta OR resmi OR pemerintah OR "terbukti benar")`,
    purpose: 'Mencari bukti dan dokumentasi yang mendukung kebenaran klaim',
    mode: 'support',
  });

  // 4. REFUTE QUERY (Mencari bukti bantahan/klarifikasi hoaks)
  queries.push({
    id: 'q-refute',
    type: 'refute_search',
    query: `"${corePhrase}" (hoaks OR palsu OR penipuan OR disinformasi OR bantahan)`,
    purpose: 'Mencari bukti sanggahan, laporan debunking, atau klarifikasi penipuan',
    mode: 'refute',
  });

  // 5. Fact Check Archive Query (Mafindo, CekFakta, JalaHoaks)
  queries.push({
    id: 'q-factcheck',
    type: 'fact_check_archive',
    query: `"${corePhrase}" ("cek fakta" OR turnbackhoax OR mafindo OR jalahoaks)`,
    purpose: 'Pencarian laporan klarifikasi dari koalisi pemeriksa fakta independen',
    mode: 'fact_check',
  });

  // 6. Temporal / Date Query
  if (dates.length > 0) {
    queries.push({
      id: 'q-temporal',
      type: 'temporal_check',
      query: `"${corePhrase}" "${dates[0]}"`,
      purpose: 'Memverifikasi relevansi linimasa dan konteks waktu peristiwa',
      mode: 'temporal',
    });
  } else {
    const currentYear = new Date().getFullYear();
    queries.push({
      id: 'q-temporal-current',
      type: 'temporal_check',
      query: `"${corePhrase}" ${currentYear}`,
      purpose: 'Memeriksa kebaruan informasi pada tahun berjalan',
      mode: 'temporal',
    });
  }

  // 7. Atomic Sub-Claim Query
  if (atomicClaims && atomicClaims.length > 1) {
    const sub = atomicClaims[1].text?.replace(/[^\w\s]/g, ' ').trim().slice(0, 45);
    if (sub) {
      queries.push({
        id: 'q-atomic-sub',
        type: 'atomic_clause',
        query: `"${sub}"`,
        purpose: 'Pemeriksaan klaim atomik turunan secara independen',
        mode: 'atomic',
      });
    }
  }

  return queries;
}
