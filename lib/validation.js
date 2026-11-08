const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function text(value, { min = 1, max = 255 } = {}) {
    if (typeof value !== 'string') return null;
    const result = value.trim();
    return result.length >= min && result.length <= max ? result : null;
}

export function email(value) {
    const result = text(value, { max: 254 })?.toLowerCase();
    return result && emailPattern.test(result) ? result : null;
}

export function positiveInteger(value) {
    const number = typeof value === 'number' ? value : Number(value);
    return Number.isSafeInteger(number) && number > 0 ? number : null;
}
