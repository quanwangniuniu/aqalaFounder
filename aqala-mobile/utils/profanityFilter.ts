/**
 * Simple profanity filter for usernames
 * Uses a straightforward banned words list
 */

const BANNED_WORDS = [
  "nigger", "nigga", "niga", "nigg", "n1gger", "n1gga", "niggah", "nigguh",
  "fuck", "fucker", "fucking", "fucked", "fuk", "fuks", "fukk", "fck", "f4ck", "phuck", "phuk", "fvck",
  "shit", "shits", "shitty", "sh1t", "sht", "shyt",
  "bitch", "b1tch", "btch", "biatch",
  "cunt", "cunts",
  "dick", "d1ck", "dck",
  "cock", "c0ck",
  "pussy", "puss",
  "whore", "wh0re",
  "slut", "sl0t",
  "fag", "faggot", "fags",
  "ass", "a55", "azz", "arse",
  "bastard",
  "retard", "retarded",
  "porn", "porno", "p0rn",
  "nude", "nudes",
  "rape", "rapist",
  "kkk",
  "terrorist",
  "isis",
  "kafir", "kuffar",
];

const RESERVED_WORDS = [
  "admin", "administrator", "mod", "moderator", "support", "help",
  "official", "staff", "team", "aqala", "system", "root",
  "anonymous", "guest", "user", "test",
];

export function containsProfanity(text: string): boolean {
  const lower = text.toLowerCase();
  for (const word of BANNED_WORDS) {
    if (lower.includes(word)) return true;
  }
  return false;
}

export function isReservedUsername(username: string): boolean {
  return RESERVED_WORDS.includes(username.toLowerCase());
}

export function validateUsername(username: string): string | null {
  if (username.length < 3) return "Username must be at least 3 characters";
  if (username.length > 20) return "Username must be 20 characters or less";
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return "Only letters, numbers, and underscores allowed";
  if (/^[_0-9]/.test(username)) return "Username must start with a letter";
  if (isReservedUsername(username)) return "This username is reserved";
  if (containsProfanity(username)) return "This username contains inappropriate content";
  return null;
}

export function filterProfanity(text: string): string {
  let filtered = text;
  for (const word of BANNED_WORDS) {
    const regex = new RegExp(word, "gi");
    filtered = filtered.replace(regex, "*".repeat(word.length));
  }
  return filtered;
}
