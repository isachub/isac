// Pure functions that build prompts from data.
// No API calls here — only string construction.

interface ProfileData {
  fullName?: string | null;
  city?: string | null;
  country?: string | null;
  dateOfBirth?: Date | null;
  nationality?: string | null;
  targetType?: string | null;
}

interface ApplicationData {
  targetType: string;
  titleOrRole: string;
  companyOrInstitution: string;
  targetDescription?: string | null;
}

export function buildCvPrompt(profile: ProfileData, application: ApplicationData): string {
  return `Du bist ein professioneller Lebenslauf-Schreiber für den deutschen Arbeitsmarkt.

Erstelle einen professionellen deutschen Lebenslauf (Lebenslauf) basierend auf den folgenden Informationen.

PROFILDATEN:
- Name: ${profile.fullName ?? 'Nicht angegeben'}
- Wohnort: ${[profile.city, profile.country].filter(Boolean).join(', ') || 'Nicht angegeben'}
- Geburtsdatum: ${profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('de-DE') : 'Nicht angegeben'}
- Nationalität: ${profile.nationality ?? 'Nicht angegeben'}

ZIEL:
- Bewerbertyp: ${application.targetType}
- Position / Ausbildung / Studiengang: ${application.titleOrRole}
- Unternehmen / Institution: ${application.companyOrInstitution}
${application.targetDescription ? `- Beschreibung: ${application.targetDescription}` : ''}

ANWEISUNGEN:
- Schreibe auf Deutsch
- Halte dich an das deutsche Lebenslauf-Format (tabellarischer Lebenslauf)
- Strukturiere den Lebenslauf klar mit Abschnitten: Persönliche Daten, Berufserfahrung, Ausbildung, Kenntnisse
- Wenn bestimmte Informationen fehlen, lasse den entsprechenden Abschnitt professionell leer oder mit einem Platzhalter
- Gib NUR den fertigen Lebenslauf-Text aus — keine Erklärungen, keine Kommentare

Lebenslauf:`;
}

export function buildLetterPrompt(profile: ProfileData, application: ApplicationData): string {
  return `Du bist ein professioneller Bewerbungsschreiben-Verfasser für den deutschen Arbeitsmarkt.

Schreibe ein vollständig personalisiertes deutsches Anschreiben (Motivationsschreiben) basierend auf den folgenden Informationen.

PROFILDATEN:
- Name: ${profile.fullName ?? 'Bewerber/in'}
- Wohnort: ${[profile.city, profile.country].filter(Boolean).join(', ') || 'Nicht angegeben'}
- Nationalität: ${profile.nationality ?? 'Nicht angegeben'}

BEWERBUNGSZIEL:
- Typ: ${application.targetType}
- Position / Ausbildung / Studiengang: ${application.titleOrRole}
- Unternehmen / Institution: ${application.companyOrInstitution}
${application.targetDescription ? `- Details zur Stelle / zum Unternehmen:\n${application.targetDescription}` : ''}

STRENGE REGELN:
- Schreibe auf Deutsch
- Nenne das Unternehmen / die Institution namentlich im Anschreiben
- Beziehe dich direkt auf die angestrebte Position
- Keine generischen Sätze wie "Ich bin motiviert" ohne konkreten Beweis
- Verbinde die Stärken des Bewerbers mit den Anforderungen der Stelle
- Professioneller, klarer und natürlicher Ton
- Maximal eine Seite
- Struktur: Einleitung → Erfahrung & Hintergrund → Motivation & Eignung → Abschluss
- Gib NUR das fertige Anschreiben aus — keine Erklärungen, keine Kommentare

Anschreiben:`;
}
