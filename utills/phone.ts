// utils/phone.ts
export function isE164(s: string) {
  const v = String(s || '').replace(/[^\d+]/g, ''); // strip spaces, hyphens, etc.
  return /^\+\d{8,15}$/.test(v); // typical E.164 length bounds
}
