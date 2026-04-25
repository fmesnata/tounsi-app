// Données de vocabulaire — structure extensible.
// Pour ajouter une catégorie, ajoute un objet à `categories`.
// Pour ajouter un mot, ajoute un objet à `items` de la catégorie concernée.
// Champs attendus pour chaque item :
//   - fr, en : étiquettes optionnelles
//   - image  : chemin relatif vers l'image (optionnel)
//   - masculin / feminin / pluriel : { latin, arabe } — laisse à null si la forme n'existe pas

const categories = [
  {
    id: "couleurs",
    nom: "Couleurs",
    icone: "Anki/Couleurs/couleur.webp",
    items: [
      {
        fr: "couleur", en: "color", image: "Anki/Couleurs/couleur.webp",
        masculin: { latin: "loun",  arabe: "لون" },
        feminin:  null,
        pluriel:  { latin: "alwen", arabe: "أَلْوان" },
      },
      {
        fr: "blanc", en: "white", image: "Anki/Couleurs/blanc.png",
        masculin: { latin: "abyath", arabe: "أَبْيَض" },
        feminin:  { latin: "bitha",  arabe: "بيضا" },
        pluriel:  { latin: "byoth",  arabe: "بْيُض" },
      },
      {
        fr: "noir", en: "black", image: "Anki/Couleurs/noir.png",
        masculin: { latin: "ak7al", arabe: "أَكْحَل" },
        feminin:  { latin: "ka7la", arabe: "كَحْلا" },
        pluriel:  { latin: "k7ol",  arabe: "كْحُل" },
      },
      {
        fr: "rouge", en: "red", image: "Anki/Couleurs/rouge.png",
        masculin: { latin: "ah7mar", arabe: "أَحْمَر" },
        feminin:  { latin: "7amra",  arabe: "حَمْرا" },
        pluriel:  { latin: "7mor",   arabe: "حْمُر" },
      },
      {
        fr: "vert", en: "green", image: "Anki/Couleurs/vert.png",
        masculin: { latin: "akhthar", arabe: "أَخْضَر" },
        feminin:  { latin: "khathra", arabe: "خَضْرا" },
        pluriel:  { latin: "khthor",  arabe: "خْضُر" },
      },
      {
        fr: "jaune", en: "yellow", image: "Anki/Couleurs/jaune.png",
        masculin: { latin: "asfar", arabe: "أَصْفَر" },
        feminin:  { latin: "safra", arabe: "صَفْرا" },
        pluriel:  { latin: "sfor",  arabe: "صْفُر" },
      },
      {
        fr: "bleu", en: "blue", image: "Anki/Couleurs/bleu.png",
        masculin: { latin: "azraq", arabe: "أَزْرَق" },
        feminin:  { latin: "zarqa", arabe: "زَرْقا" },
        pluriel:  { latin: "zroq",  arabe: "زْرُق" },
      },
      {
        fr: "marron", en: "brown", image: "Anki/Couleurs/marron.png",
        masculin: { latin: "bonni",     arabe: "بُنّي" },
        feminin:  { latin: "bonniya",   arabe: "بُنّيَّة" },
        pluriel:  { latin: "bonniyin",  arabe: "بُنّيين" },
      },
      {
        fr: "gris", en: "gray", image: "Anki/Couleurs/gris.png",
        masculin: { latin: "gris", arabe: null },
        feminin:  { latin: "gris", arabe: null },
        pluriel:  { latin: "gris", arabe: null },
      },
      {
        fr: "rose", en: "pink", image: "Anki/Couleurs/rose.png",
        masculin: { latin: "rose", arabe: "روز" },
        feminin:  { latin: "rose", arabe: "روز" },
        pluriel:  { latin: "rose", arabe: "روز" },
      },
      {
        fr: "violet", en: "purple", image: "Anki/Couleurs/violet.png",
        masculin: { latin: "mauve", arabe: "موف" },
        feminin:  { latin: "mauve", arabe: "موف" },
        pluriel:  { latin: "mauve", arabe: "موف" },
      },
      {
        fr: "claire", en: "light", image: null,
        masculin: { latin: "feta7",  arabe: "فاتَح" },
        feminin:  { latin: "fet7a",  arabe: "فاتْحَة" },
        pluriel:  { latin: "fet7in", arabe: "فاتْحِين" },
      },
      {
        fr: "foncé", en: "dark", image: null,
        masculin: { latin: "ghamaq", arabe: "غامَق" },
        feminin:  { latin: "ghamqa", arabe: "غامْقة" },
        pluriel:  { latin: "ghamqin", arabe: "غامْقين" },
      },
    ],
  },
  { id: "maison",  nom: "Maison",  icone: null, items: [] },
  { id: "objets",  nom: "Objets",  icone: null, items: [] },
  { id: "fruits",  nom: "Fruits",  icone: null, items: [] },
  { id: "legumes", nom: "Légumes", icone: null, items: [] },
];

window.VOCAB_DATA = { categories };
