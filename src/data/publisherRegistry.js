/**
 * src/data/publisherRegistry.js
 *
 * VeriFact ID 4.3 — Centralized Publisher & Domain Registry
 *
 * Standar & Aturan Mutlak (§6 & §7):
 * 1. Detik.com & Subdomain Special Handling:
 *    news.detik.com, finance.detik.com, health.detik.com, inet.detik.com, dll.
 *    semua dikaitkan ke publisher "detikcom" (NEWS_MEDIA, ID).
 * 2. Domain Recognition Stabil menggunakan WHATWG URL parser (BUKAN split atau regex kasar).
 * 3. Normalisasi menyeluruh: protocol, hostname, pathname, search, hash.
 * 4. Pembedaan tegas: SOURCE TRUST != CLAIM TRUTH.
 *    Penerbit terdaftar hanya menjelaskan SIAPA yang menerbitkan, bukan bahwa isi beritanya otomatis benar.
 */

export const PUBLISHER_REGISTRY = [
  // 1. DETIKCOM GROUP
  {
    domain: 'detik.com',
    publisher: 'detikcom',
    type: 'NEWS_MEDIA',
    country: 'ID',
    category: 'NEWS',
    homepage: 'https://www.detik.com/',
    verified: true,
    subdomains: [
      'news.detik.com',
      'finance.detik.com',
      'health.detik.com',
      'inet.detik.com',
      'hot.detik.com',
      'sport.detik.com',
      'oto.detik.com',
      'travel.detik.com',
      'food.detik.com',
      'wolipop.detik.com',
      'sepaktolak.detik.com',
      'edukasi.detik.com',
      'hikmah.detik.com',
      'fokus.detik.com',
    ],
  },

  // 2. KOMPAS GROUP
  {
    domain: 'kompas.com',
    publisher: 'Kompas.com (Kompas Gramedia)',
    type: 'NEWS_MEDIA',
    country: 'ID',
    category: 'NEWS',
    homepage: 'https://www.kompas.com/',
    verified: true,
    subdomains: [
      'nasional.kompas.com',
      'megapolitan.kompas.com',
      'regional.kompas.com',
      'money.kompas.com',
      'tekno.kompas.com',
      'otomotif.kompas.com',
      'bola.kompas.com',
      'edukasi.kompas.com',
      'lifestyle.kompas.com',
      'tren.kompas.com',
      'lestari.kompas.com',
    ],
  },
  {
    domain: 'kompas.id',
    publisher: 'Harian Kompas (Kompas.id)',
    type: 'NEWS_MEDIA',
    country: 'ID',
    category: 'NEWS',
    homepage: 'https://www.kompas.id/',
    verified: true,
  },

  // 3. TEMPO MEDIA GROUP
  {
    domain: 'tempo.co',
    publisher: 'Tempo Media Group',
    type: 'NEWS_MEDIA',
    country: 'ID',
    category: 'NEWS',
    homepage: 'https://www.tempo.co/',
    verified: true,
    subdomains: [
      'nasional.tempo.co',
      'metro.tempo.co',
      'bisnis.tempo.co',
      'tekno.tempo.co',
      'dunia.tempo.co',
      'fokus.tempo.co',
    ],
  },

  // 4. CNN INDONESIA & CNBC INDONESIA (TRANS MEDIA)
  {
    domain: 'cnnindonesia.com',
    publisher: 'CNN Indonesia (Trans Media)',
    type: 'NEWS_MEDIA',
    country: 'ID',
    category: 'NEWS',
    homepage: 'https://www.cnnindonesia.com/',
    verified: true,
  },
  {
    domain: 'cnbcindonesia.com',
    publisher: 'CNBC Indonesia (Trans Media)',
    type: 'NEWS_MEDIA',
    country: 'ID',
    category: 'FINANCIAL_NEWS',
    homepage: 'https://www.cnbcindonesia.com/',
    verified: true,
  },

  // 5. KANTOR BERITA ANTARA (BUMN)
  {
    domain: 'antaranews.com',
    publisher: 'LKBN ANTARA (Kantor Berita Nasional RI)',
    type: 'NEWS_MEDIA',
    country: 'ID',
    category: 'NATIONAL_NEWS',
    homepage: 'https://www.antaranews.com/',
    verified: true,
  },

  // 6. LIPUTAN6 & KLY GROUP
  {
    domain: 'liputan6.com',
    publisher: 'Liputan6.com (KapanLagi Youniverse)',
    type: 'NEWS_MEDIA',
    country: 'ID',
    category: 'NEWS',
    homepage: 'https://www.liputan6.com/',
    verified: true,
  },

  // 7. TRIBUN NETWORK
  {
    domain: 'tribunnews.com',
    publisher: 'Tribun Network (Kompas Gramedia)',
    type: 'NEWS_MEDIA',
    country: 'ID',
    category: 'NEWS',
    homepage: 'https://www.tribunnews.com/',
    verified: true,
  },

  // 8. MEDIA INDEPENDEN & INVESTIGASI
  {
    domain: 'tirto.id',
    publisher: 'Tirto.id',
    type: 'NEWS_MEDIA',
    country: 'ID',
    category: 'INVESTIGATIVE',
    homepage: 'https://tirto.id/',
    verified: true,
  },
  {
    domain: 'kumparan.com',
    publisher: 'kumparan',
    type: 'NEWS_MEDIA',
    country: 'ID',
    category: 'NEWS',
    homepage: 'https://kumparan.com/',
    verified: true,
  },
  {
    domain: 'idntimes.com',
    publisher: 'IDN Times (IDN Media)',
    type: 'NEWS_MEDIA',
    country: 'ID',
    category: 'NEWS',
    homepage: 'https://www.idntimes.com/',
    verified: true,
  },
  {
    domain: 'republika.co.id',
    publisher: 'Republika',
    type: 'NEWS_MEDIA',
    country: 'ID',
    category: 'NEWS',
    homepage: 'https://www.republika.co.id/',
    verified: true,
  },
  {
    domain: 'sindonews.com',
    publisher: 'SINDOnews (MNC Media)',
    type: 'NEWS_MEDIA',
    country: 'ID',
    category: 'NEWS',
    homepage: 'https://www.sindonews.com/',
    verified: true,
  },
  {
    domain: 'jawapos.com',
    publisher: 'Jawa Pos',
    type: 'NEWS_MEDIA',
    country: 'ID',
    category: 'NEWS',
    homepage: 'https://www.jawapos.com/',
    verified: true,
  },

  // 9. ORGANISASI PERIKSA FAKTA RESMI (IFCN SIGNATORIES)
  {
    domain: 'turnbackhoax.id',
    publisher: 'TurnBackHoax.ID (Mafindo)',
    type: 'FACT_CHECKER',
    country: 'ID',
    category: 'FACT_CHECK',
    homepage: 'https://turnbackhoax.id/',
    verified: true,
  },
  {
    domain: 'cekfakta.com',
    publisher: 'CekFakta.com (Aliansi Jurnalis Independen & Mafindo)',
    type: 'FACT_CHECKER',
    country: 'ID',
    category: 'FACT_CHECK',
    homepage: 'https://cekfakta.com/',
    verified: true,
  },

  // 10. MEDIA INTERNASIONAL TERKEMUKA
  {
    domain: 'bbc.com',
    publisher: 'BBC News',
    type: 'NEWS_MEDIA',
    country: 'UK',
    category: 'GLOBAL_NEWS',
    homepage: 'https://www.bbc.com/',
    verified: true,
  },
  {
    domain: 'reuters.com',
    publisher: 'Reuters',
    type: 'NEWS_MEDIA',
    country: 'US',
    category: 'GLOBAL_NEWS',
    homepage: 'https://www.reuters.com/',
    verified: true,
  },
  {
    domain: 'apnews.com',
    publisher: 'Associated Press (AP)',
    type: 'NEWS_MEDIA',
    country: 'US',
    category: 'GLOBAL_NEWS',
    homepage: 'https://apnews.com/',
    verified: true,
  },
];

/**
 * Mencari profil penerbit berdasarkan URL atau hostname menggunakan WHATWG URL parser (§7).
 *
 * @param {string|URL} urlOrHost
 * @returns {object|null}
 */
export function getPublisherRecord(urlOrHost) {
  if (!urlOrHost) return null;

  let hostname = '';
  try {
    if (typeof urlOrHost === 'object' && urlOrHost.hostname) {
      hostname = urlOrHost.hostname.toLowerCase();
    } else {
      const s = String(urlOrHost).trim();
      const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(s) ? s : `https://${s}`;
      const parsed = new URL(withScheme);
      hostname = parsed.hostname.toLowerCase();
    }
  } catch {
    hostname = String(urlOrHost).toLowerCase().replace(/^https?:\/\//i, '').split('/')[0];
  }

  hostname = hostname.replace(/^www\./, '');

  // 1. Cek Exact Domain Match
  for (const reg of PUBLISHER_REGISTRY) {
    if (reg.domain === hostname) {
      return { ...reg, matchedVia: 'exact_domain' };
    }
    if (Array.isArray(reg.subdomains) && reg.subdomains.includes(hostname)) {
      return { ...reg, matchedVia: 'subdomain', matchedSubdomain: hostname };
    }
    if (hostname.endsWith(`.${reg.domain}`)) {
      return { ...reg, matchedVia: 'wildcard_subdomain', matchedSubdomain: hostname };
    }
  }

  // 2. Cek Ekstensi Domain Pemerintah Indonesia (.go.id)
  if (hostname.endsWith('.go.id')) {
    const parts = hostname.split('.');
    const instName = parts[parts.length - 3] || 'Lembaga Pemerintah';
    return {
      domain: hostname,
      publisher: `Kementerian/Lembaga Pemerintah RI (${instName.toUpperCase()}.GO.ID)`,
      type: 'OFFICIAL_GOV',
      country: 'ID',
      category: 'GOVERNMENT',
      homepage: `https://${hostname}/`,
      verified: true,
      matchedVia: 'gov_tld',
    };
  }

  // 3. Cek Ekstensi Domain Akademis Indonesia (.ac.id / .edu)
  if (hostname.endsWith('.ac.id') || hostname.endsWith('.edu')) {
    return {
      domain: hostname,
      publisher: 'Institusi Pendidikan / Perguruan Tinggi',
      type: 'ACADEMIC',
      country: hostname.endsWith('.ac.id') ? 'ID' : 'GLOBAL',
      category: 'ACADEMIC',
      homepage: `https://${hostname}/`,
      verified: true,
      matchedVia: 'edu_tld',
    };
  }

  return null;
}

export function isRegisteredPublisher(urlOrHost) {
  return Boolean(getPublisherRecord(urlOrHost));
}
