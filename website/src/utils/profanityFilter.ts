/**
 * Simple profanity filter for usernames
 * Uses a straightforward banned words list
 */

// Banned words list (lowercase)
const BANNED_WORDS = [
    // N-word variations
    "nigger", "nigga", "niga", "nigg", "n1gger", "n1gga", "niggah", "nigguh",

    // F-word variations
    "fuck", "fucker", "fucking", "fucked", "fuk", "fuks", "fukk", "fck", "f4ck", "phuck", "phuk", "fvck",

    // S-word variations
    "shit", "shits", "shitty", "sh1t", "sht", "shyt",

    // Other profanity
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

    // Sexual content
    "porn", "porno", "p0rn",
    "nude", "nudes",
    "rape", "rapist",

    // Hate speech
    "kkk",
    "terrorist",
    "isis",

    // Religious slurs
    "kafir", "kuffar",
];

// Reserved usernames (can't be used)
const RESERVED_WORDS = [
    "admin", "administrator", "mod", "moderator", "support", "help",
    "official", "staff", "team", "aqala", "system", "root",
    "anonymous", "guest", "user", "test",
];

/**
 * Check if text contains any banned words
 */
export function containsProfanity(text: string): boolean {
    const lower = text.toLowerCase();

    for (const word of BANNED_WORDS) {
        if (lower.includes(word)) {
            return true;
        }
    }

    return false;
}

/**
 * Check if username is reserved
 */
export function isReservedUsername(username: string): boolean {
    const lower = username.toLowerCase();
    return RESERVED_WORDS.includes(lower);
}

/**
 * Validate a username
 * Returns error message if invalid, null if valid
 */
export function validateUsername(username: string): string | null {
    // Check length
    if (username.length < 3) {
        return "Username must be at least 3 characters";
    }

    if (username.length > 20) {
        return "Username must be 20 characters or less";
    }

    // Check format (letters, numbers, underscores only)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return "Only letters, numbers, and underscores allowed";
    }

    // Must start with a letter
    if (/^[_0-9]/.test(username)) {
        return "Username must start with a letter";
    }

    // Check reserved words
    if (isReservedUsername(username)) {
        return "This username is reserved";
    }

    // Check profanity
    if (containsProfanity(username)) {
        return "This username contains inappropriate content";
    }

    return null;
}

/**
 * Filter profanity from text (replaces with asterisks)
 */
export function filterProfanity(text: string): string {
    let filtered = text;

    for (const word of BANNED_WORDS) {
        const regex = new RegExp(word, "gi");
        filtered = filtered.replace(regex, "*".repeat(word.length));
    }

    return filtered;
}
