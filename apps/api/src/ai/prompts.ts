// Pure functions that build prompts from data.
// No API calls here — only string construction.

import type { ProfileInput, ApplicationInput } from './ai.service';

function formatAddress(p: ProfileInput): string {
  const parts = [
    p.street,
    [p.postalCode, p.city].filter(Boolean).join(' '),
    p.country,
  ].filter(Boolean);
  return parts.join(', ') || 'Nicht angegeben';
}

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return 'Nicht angegeben';
  return new Date(d).toLocaleDateString('de-DE');
}

export function buildCvPrompt(profile: ProfileInput, application: ApplicationInput): string {
  return `Du bist ein professioneller Lebenslauf-Schreiber für den deutschen Arbeitsmarkt.

Erstelle einen professionellen deutschen tabellarischen Lebenslauf auf Basis der folgenden Daten.

═══ PERSÖNLICHE DATEN ═══
Name:           ${profile.fullName ?? 'Nicht angegeben'}
Adresse:        ${formatAddress(profile)}
Telefon:        ${profile.phone ?? 'Nicht angegeben'}
E-Mail:         ${profile.email ?? 'Nicht angegeben'}
Geburtsdatum:   ${formatDate(profile.dateOfBirth)}
Nationalität:   ${profile.nationality ?? 'Nicht angegeben'}

═══ KURZPROFIL / ZUSAMMENFASSUNG ═══
${profile.summary?.trim() || 'Nicht angegeben'}

═══ BERUFSERFAHRUNG ═══
${profile.workExperience?.trim() || 'Nicht angegeben'}

═══ AUSBILDUNG / BILDUNGSWEG ═══
${profile.education?.trim() || 'Nicht angegeben'}

═══ KENNTNISSE & FÄHIGKEITEN ═══
${profile.skills?.trim() || 'Nicht angegeben'}

═══ SPRACHKENNTNISSE ═══
${profile.languages?.trim() || 'Nicht angegeben'}

${profile.certificates?.trim() ? `═══ ZERTIFIKATE & WEITERBILDUNGEN ═══\n${profile.certificates.trim()}\n\n` : ''}═══ BEWERBUNGSZIEL ═══
Typ:            ${application.targetType}
Position:       ${application.titleOrRole}
Unternehmen:    ${application.companyOrInstitution}
${application.targetDescription ? `Stellenbeschreibung:\n${application.targetDescription}` : ''}

═══ ANWEISUNGEN ═══
- Schreibe ausschließlich auf Deutsch
- Nutze das klassische deutsche tabellarische Lebenslauf-Format
- Strukturiere mit klaren Abschnitten: Persönliche Daten → Berufserfahrung → Ausbildung → Kenntnisse → Sprachen
- Wenn Informationen fehlen oder "Nicht angegeben" sind, lasse den Abschnitt weg oder setze einen professionellen Platzhalter
- Richte den Fokus auf die angestrebte Position
- Gib NUR den fertigen Lebenslauf-Text aus — keine Erklärungen, keine Kommentare

Lebenslauf:`;
}

export function buildLetterPrompt(profile: ProfileInput, application: ApplicationInput): string {
  return `Du bist ein professioneller Bewerbungsschreiben-Verfasser für den deutschen Arbeitsmarkt.

Schreibe ein vollständig personalisiertes deutsches Anschreiben auf Basis der folgenden Daten.

═══ ABSENDER ═══
Name:    ${profile.fullName ?? 'Bewerber/in'}
Adresse: ${formatAddress(profile)}
Telefon: ${profile.phone ?? 'Nicht angegeben'}
E-Mail:  ${profile.email ?? 'Nicht angegeben'}

═══ PERSÖNLICHES PROFIL ═══
Nationalität:    ${profile.nationality ?? 'Nicht angegeben'}
Zusammenfassung: ${profile.summary?.trim() || 'Nicht angegeben'}
Berufserfahrung: ${profile.workExperience?.trim() || 'Nicht angegeben'}
Ausbildung:      ${profile.education?.trim() || 'Nicht angegeben'}
Sprachen:        ${profile.languages?.trim() || 'Nicht angegeben'}

═══ BEWERBUNGSZIEL ═══
Typ:         ${application.targetType}
Position:    ${application.titleOrRole}
Unternehmen: ${application.companyOrInstitution}
${application.targetDescription ? `\nDetails zur Stelle / zum Unternehmen:\n${application.targetDescription}` : ''}

═══ STRENGE REGELN ═══
- Schreibe ausschließlich auf Deutsch
- Nenne das Unternehmen / die Institution namentlich
- Beziehe dich direkt auf die angestrebte Position
- Keine generischen Floskeln ohne konkreten Bezug zur Person
- Verbinde den Hintergrund des Bewerbers mit den Anforderungen der Stelle
- Professioneller, klarer und natürlicher Ton
- Maximal eine Seite
- Struktur: Einleitung (Bezug zur Stelle) → Erfahrung & Hintergrund → Motivation & Eignung → Abschluss (Einladung zum Gespräch)
- Gib NUR das fertige Anschreiben aus — keine Erklärungen, keine Kommentare

Anschreiben:`;
}
