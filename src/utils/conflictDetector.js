/**
 * conflictDetector.js
 *
 * VeriFact ID 4.0 - Conflict Detection Engine
 * Mendeteksi pertentangan atau diskrepansi antar sumber bukti.
 * Jika sumber primer resmi membantah klaim namun sumber sekunder menyebarkannya,
 * sistem akan menandai adanya konflik secara transparan tanpa memaksakan verdict palsu.
 * Sesuai spesifikasi master prompt v4.txt §22.
 */

export function detectEvidenceConflicts(evidenceList = []) {
  if (!evidenceList || !evidenceList.length) {
    return {
      hasConflict: false,
      conflictType: 'NONE',
      description: '',
      supportingSources: [],
      refutingSources: [],
    };
  }

  const supporting = evidenceList.filter((e) => e.stance === 'supports');
  const refuting = evidenceList.filter((e) => e.stance === 'refutes');

  // Ada konflik langsung bila terdapat bukti yang mendukung sekaligus yang membantah
  if (supporting.length > 0 && refuting.length > 0) {
    const hasPrimaryRefuting = refuting.some((e) => e.tier === 1);
    const hasFactCheckRefuting = refuting.some((e) => e.tier === 3);

    let conflictType = 'DIRECT_CONTRADICTION';
    let description = `${supporting.length} sumber mendukung klaim, sementara ${refuting.length} sumber membantahnya.`;

    if (hasPrimaryRefuting) {
      conflictType = 'OFFICIAL_DENIAL';
      description = `Klaim didukung oleh beberapa laporan sekunder, namun dibantah langsung oleh sumber primer/instansi resmi.`;
    } else if (hasFactCheckRefuting) {
      conflictType = 'FACT_CHECK_DEBUNKED';
      description = `Klaim beredar luas di media/publik, namun telah diverifikasi sebagai keliru oleh koalisi pemeriksa fakta.`;
    }

    return {
      hasConflict: true,
      conflictType,
      description,
      supportingCount: supporting.length,
      refutingCount: refuting.length,
      supportingSources: supporting.map((s) => ({ id: s.id, publisher: s.publisher, title: s.title })),
      refutingSources: refuting.map((s) => ({ id: s.id, publisher: s.publisher, title: s.title })),
    };
  }

  return {
    hasConflict: false,
    conflictType: 'NONE',
    description: 'Seluruh bukti yang ditemukan memiliki arah kesimpulan yang konsisten.',
    supportingCount: supporting.length,
    refutingCount: refuting.length,
    supportingSources: supporting,
    refutingSources: refuting,
  };
}
