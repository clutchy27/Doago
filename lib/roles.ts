// Vloge uporabnikov:
//   navaden  — privzeta vloga. Lahko objavlja IN sprejema naloge. Ne more sprejeti profesionalnih nalog.
//   student  — izvajalec prek študentskega servisa. Lahko objavlja IN sprejema naloge. Ne more sprejeti profesionalnih nalog.
//   izvajalec — izvajalec s.p. Sprejema naloge, vključno s profesionalnimi. Načeloma ne objavlja nalog.

export function canAcceptProfessional(vloga: string): boolean {
  return vloga === "izvajalec";
}

export function requiresSetup(vloga: string): boolean {
  return vloga === "izvajalec" || vloga === "student";
}

export function hasSpPodatki(vloga: string): boolean {
  return vloga === "izvajalec";
}
