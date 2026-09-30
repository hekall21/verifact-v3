/**
 * sourceClustering.js
 *
 * VeriFact ID 4.0 - Source Independence & Clustering Engine
 * Mengelompokkan sumber berita yang hanya mengutip sumber yang sama (same-origin reporting)
 * ke dalam kluster bukti independen. Menghitung similaritas teks agar tidak terjadi ilusi
 * "banyak bukti" yang sebenarnya berasal dari satu siaran pers saja.
 * Sesuai spesifikasi master prompt v4.txt §09 dan §10.
 */

function tokenize(text = '') {
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2);
}

/**
 * Menghitung tingkat kesamaan teks (Jaccard similarity coefficient).
 */
export function computeTextSimilarity(textA = '', textB = '') {
  const setA = new Set(tokenize(textA));
  const setB = new Set(tokenize(textB));

  if (!setA.size || !setB.size) return 0;

  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }

  const union = setA.size + setB.size - intersection;
  return union > 0 ? Number((intersection / union).toFixed(2)) : 0;
}

/**
 * Mengelompokkan daftar sumber ke dalam kluster independen.
 */
export function clusterSources(sources = []) {
  if (!sources || !sources.length) return [];

  const clusters = [];
  const visited = new Set();

  for (let i = 0; i < sources.length; i++) {
    if (visited.has(sources[i].id)) continue;

    const current = sources[i];
    visited.add(current.id);

    const clusterSources = [current];
    const currentText = `${current.title} ${current.snippet || ''}`;

    for (let j = i + 1; j < sources.length; j++) {
      if (visited.has(sources[j].id)) continue;

      const other = sources[j];
      const otherText = `${other.title} ${other.snippet || ''}`;

      const similarity = computeTextSimilarity(currentText, otherText);

      // Jika similaritas >= 0.45 atau mengutip domain yang sama, masukkan ke kluster yang sama
      if (similarity >= 0.45 || current.domain === other.domain) {
        visited.add(other.id);
        clusterSources.push({
          ...other,
          similarityWithClusterLeader: Math.round(similarity * 100),
        });
      }
    }

    const isSameOrigin = clusterSources.length > 1;
    clusters.push({
      clusterId: `cluster-${clusters.length + 1}`,
      primaryOrigin: current.publisher || current.domain,
      primaryTier: current.tier || 2,
      articleCount: clusterSources.length,
      isSameOrigin,
      explanation: isSameOrigin
        ? `${clusterSources.length} artikel merujuk pada materi rilis atau subjek pemberitaan yang sama.`
        : 'Laporan independen bersumber tunggal.',
      sources: clusterSources,
    });
  }

  return clusters;
}
