/**
 * Email typo detection.
 *
 * Not a whitelist — a whitelist would reject legitimate addresses at company
 * and school domains, which is worse than the problem it solves. Real domain
 * existence is checked server-side with a DNS lookup; this file only catches
 * the handful of misspellings people actually make, and suggests a fix.
 */

const PROVIDER_TYPOS = {
    'gmial.com': 'gmail.com',
    'gmai.com': 'gmail.com',
    'gmal.com': 'gmail.com',
    'gmaill.com': 'gmail.com',
    'gnail.com': 'gmail.com',
    'gmail.co': 'gmail.com',
    'gmail.cm': 'gmail.com',
    'gmail.om': 'gmail.com',
    'yaho.com': 'yahoo.com',
    'yahooo.com': 'yahoo.com',
    'yahoo.co': 'yahoo.com',
    'hotmial.com': 'hotmail.com',
    'hotmai.com': 'hotmail.com',
    'hotmil.com': 'hotmail.com',
    'outlok.com': 'outlook.com',
    'outloook.com': 'outlook.com',
    'iclod.com': 'icloud.com',
    'icloud.co': 'icloud.com',
    'protonmai.com': 'protonmail.com',
};

// Mistyped top-level domains, keyed by the wrong ending.
const TLD_TYPOS = {
    '.cmo': '.com',
    '.con': '.com',
    '.cim': '.com',
    '.ocm': '.com',
    '.comm': '.com',
    '.cpm': '.com',
    '.xom': '.com',
    '.vom': '.com',
    '.nte': '.net',
    '.ner': '.net',
    '.orgg': '.org',
    '.ogr': '.org',
    '.edu.pj': '.edu.ph',
    '.edu.pn': '.edu.ph',
};

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Does this look like a finished address? Used to decide when it's fair to
 * show an error — complaining while someone is mid-word is just noise.
 */
export function looksComplete(email) {
    return EMAIL_REGEX.test(email.trim());
}

/**
 * Returns a corrected address if the domain looks like a known typo,
 * otherwise null.
 */
export function suggestCorrection(email) {
    const trimmed = email.trim().toLowerCase();
    const at = trimmed.lastIndexOf('@');
    if (at < 1) return null;

    const local = trimmed.slice(0, at);
    const domain = trimmed.slice(at + 1);
    if (!domain) return null;

    if (PROVIDER_TYPOS[domain]) {
        return `${local}@${PROVIDER_TYPOS[domain]}`;
    }

    for (const [wrong, right] of Object.entries(TLD_TYPOS)) {
        if (domain.endsWith(wrong)) {
            return `${local}@${domain.slice(0, -wrong.length)}${right}`;
        }
    }

    return null;
}

/**
 * Validate for display. Returns { error, suggestion } — both may be null.
 *
 * `touched` should be true only once the field has been blurred, so nothing
 * is flagged while the visitor is still typing.
 */
export function validateEmail(email, touched) {
    const trimmed = email.trim();

    if (!trimmed) {
        return { error: null, suggestion: null };
    }

    const suggestion = suggestCorrection(trimmed);
    if (suggestion) {
        return { error: null, suggestion };
    }

    if (touched && !looksComplete(trimmed)) {
        return { error: 'Please enter a valid email address.', suggestion: null };
    }

    return { error: null, suggestion: null };
}