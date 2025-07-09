export function normalizeString(s: string | null | undefined): string {
  return decodeURIComponent(s || '').trim().toLowerCase();
}
