// Pronoms dans l'ordre des colonnes CSV
const VERB_PRONOUNS = [
  { id: 'ana',    fr: 'Je',   ar: 'أنا' },
  { id: 'nti',    fr: 'Tu',   ar: 'إنتَ/إنتِ' },
  { id: 'houwa',  fr: 'Il',   ar: 'هو' },
  { id: 'hiya',   fr: 'Elle', ar: 'هي' },
  { id: 'ahna',   fr: 'Nous', ar: 'إحنا' },
  { id: 'ntouma', fr: 'Vous', ar: 'إنتوما' },
  { id: 'houma',  fr: 'Ils',  ar: 'هوما' },
];

// Verbes prioritaires dans l'ordre souhaité
const PRIORITY_VERBS = [
  'manger','faire','dire','aller','voir','savoir','pouvoir','falloir',
  'aimer/vouloir','venir','prendre','trouver','donner','parler','montrer',
  'entrer','rester','commencer','écouter','appeler','ouvrir','sortir',
  'revenir','utiliser','dormir','casser','aider','allumer','éteindre',
  'écrire','comprendre','demander','changer','arrêter','poser','boire',
  'lire','monter','descendre','arriver','finir','chercher','oublier',
  'enlever','accepter','fermer','acheter','vendre','jouer','apprendre',
  "s'assoire",'marcher','regarder','apporter','remplir','attendre',
];

async function loadVerbs() {
  const response = await fetch('Verbs.csv');
  const text = await response.text();
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  // Ignore la ligne d'en-tête
  const verbMap = new Map();

  for (const line of lines.slice(1)) {
    const parts = line.split(',');
    if (parts.length < 16) continue;

    let raw = parts[0].trim();
    const tenseMatch = raw.match(/\s+\((\w+)\)$/);
    if (!tenseMatch) continue;

    const tenseKey = tenseMatch[1]; // past | present | imperative | masdar
    let verbFr = raw.replace(/\s+\(\w+\)$/, '').trim();
    const verbEn = parts[1].replace(/\s+\(\w+\)$/, '').trim();

    // Normalisation : "vouloir" est la même entrée qu'aimer/vouloir
    if (verbFr === 'vouloir') verbFr = 'aimer/vouloir';

    const forms = VERB_PRONOUNS.map((_, i) => {
      const latin  = parts[2 + i * 2]?.trim();
      const arabic = parts[3 + i * 2]?.trim();
      return {
        latin:  (!latin  || latin  === '-') ? null : latin,
        arabic: (!arabic || arabic === '-') ? null : arabic,
      };
    });

    if (!verbMap.has(verbFr)) {
      verbMap.set(verbFr, {
        fr: verbFr,
        en: verbEn,
        tenses: { past: null, present: null, imperative: null, masdar: null },
      });
    }
    verbMap.get(verbFr).tenses[tenseKey] = forms;
  }

  // Tri : prioritaires d'abord (dans l'ordre), puis alphabétique
  const priorityIdx = new Map(PRIORITY_VERBS.map((v, i) => [v, i]));
  return [...verbMap.values()].sort((a, b) => {
    const ai = priorityIdx.has(a.fr) ? priorityIdx.get(a.fr) : Infinity;
    const bi = priorityIdx.has(b.fr) ? priorityIdx.get(b.fr) : Infinity;
    if (ai !== bi) return ai - bi;
    return a.fr.localeCompare(b.fr, 'fr');
  });
}

window.VERB_PRONOUNS = VERB_PRONOUNS;
window.loadVerbs = loadVerbs;
