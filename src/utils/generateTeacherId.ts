export const CITY_CODE: Record<string, string> = {
  Bhopal: 'BPL',
};

function randChars(length = 6) {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let s = '';
  const arr = new Uint32Array(length);
  if (typeof crypto !== 'undefined' && (crypto as any).getRandomValues) {
    (crypto as any).getRandomValues(arr);
    for (let i = 0; i < length; i++) s += chars[arr[i] % chars.length];
  } else {
    for (let i = 0; i < length; i++) s += chars[Math.floor(Math.random() * chars.length)];
  }
  return s;
}

/**
 * Generate a teacher ID like: TMBPL456AX
 * - T prefix for Teacher
 * - gender initial (M/F/O)
 * - city code (e.g. BPL for Bhopal)
 * - 6 random alphanumeric uppercase chars
 */
export function generateTeacherId(gender?: string, city?: string) {
  const prefix = 'T';
  const g = (gender || '').toString().trim();
  const genderInitial = g ? g[0].toUpperCase() : 'X';
  const cityCode = (city && CITY_CODE[city]) ? CITY_CODE[city] : (city ? city.replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 3) : 'XXX');
  const random = randChars(6);
  return `${prefix}${genderInitial}${cityCode}${random}`;
}

export default generateTeacherId;
