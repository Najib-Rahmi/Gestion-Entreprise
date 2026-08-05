/**
 * Conversion d'un nombre en lettres (français).
 * Utilisé pour le montant TTC sur les factures PDF.
 */
export function nombreEnLettres(nombre: number): string {
  const unites = [
    "",
    "un",
    "deux",
    "trois",
    "quatre",
    "cinq",
    "six",
    "sept",
    "huit",
    "neuf",
    "dix",
    "onze",
    "douze",
    "treize",
    "quatorze",
    "quinze",
    "seize",
    "dix-sept",
    "dix-huit",
    "dix-neuf",
  ];
  const dizaines = [
    "",
    "",
    "vingt",
    "trente",
    "quarante",
    "cinquante",
    "soixante",
    "soixante-dix",
    "quatre-vingt",
    "quatre-vingt-dix",
  ];

  function convertirCentaines(n: number): string {
    if (n === 0) return "";
    if (n < 20) return unites[n];
    if (n < 100) {
      const d = Math.floor(n / 10);
      const u = n % 10;
      if (d === 7 || d === 9) {
        return dizaines[d - 1] + "-" + unites[u + 10];
      }
      if (u === 0) return dizaines[d];
      if (u === 1 && d !== 8) return dizaines[d] + "-et-un";
      return dizaines[d] + "-" + unites[u];
    }
    const c = Math.floor(n / 100);
    const r = n % 100;
    let res = (c > 1 ? unites[c] + " " : "") + "cent";
    if (r === 0) {
      if (c > 1) res += "s";
      return res;
    }
    return res + " " + convertirCentaines(r);
  }

  function convertirMille(n: number): string {
    if (n === 0) return "";
    if (n < 1000) return convertirCentaines(n);
    const m = Math.floor(n / 1000);
    const r = n % 1000;
    let res = (m > 1 ? unites[m] + " " : "") + "mille";
    if (r === 0) return res;
    return res + " " + convertirCentaines(r);
  }

  function convertirMillion(n: number): string {
    if (n === 0) return "";
    if (n < 1000000) return convertirMille(n);
    const m = Math.floor(n / 1000000);
    const r = n % 1000000;
    let res = convertirCentaines(m) + " million" + (m > 1 ? "s" : "");
    if (r === 0) return res;
    return res + " " + convertirMille(r);
  }

  function convertirMilliard(n: number): string {
    if (n === 0) return "";
    if (n < 1000000000) return convertirMillion(n);
    const m = Math.floor(n / 1000000000);
    const r = n % 1000000000;
    let res = convertirCentaines(m) + " milliard" + (m > 1 ? "s" : "");
    if (r === 0) return res;
    return res + " " + convertirMillion(r);
  }

  const entier = Math.floor(nombre);
  // Partie décimale en millimes (3 chiffres après la virgule)
  const millimes = Math.round((nombre - entier) * 1000);

  let res = "";

  if (entier > 0) {
    // Partie entière : "... dinars"
    res = convertirMilliard(entier) + " dinar" + (entier > 1 ? "s" : "");

    // Partie décimale : "et ... millimes"
    if (millimes > 0) {
      res +=
        " et " +
        convertirCentaines(millimes) +
        " millime" +
        (millimes > 1 ? "s" : "");
    }
  } else if (millimes > 0) {
    // Pas de partie entière : on n'écrit que les millimes
    res = convertirCentaines(millimes) + " millime" + (millimes > 1 ? "s" : "");
  } else {
    res = "zéro dinar";
  }

  return res.charAt(0).toUpperCase() + res.slice(1);
}