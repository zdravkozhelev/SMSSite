const CYRILLIC_PATTERN = /[Ѐ-ӿ]/;

/**
 * SMS providers encode Cyrillic text as UCS-2 (70 chars/segment) and
 * Latin/GSM-7 text at double that (140 chars/segment) — a single
 * Cyrillic character anywhere in the message forces the whole SMS onto
 * the narrower UCS-2 encoding.
 */
export function calculateSmsSegments(text: string) {
  const isCyrillic = CYRILLIC_PATTERN.test(text);
  const unit = isCyrillic ? 70 : 140;
  const segments = text.length === 0 ? 1 : Math.ceil(text.length / unit);
  return { segments, unit, isCyrillic };
}
