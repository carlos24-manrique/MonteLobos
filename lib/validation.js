const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const orderStatuses = new Set(['pending', 'confirmed', 'completed', 'cancelled']);
const userRoles = new Set(['customer', 'admin']);

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

export function isOrderStatus(value) {
    return orderStatuses.has(value);
}

export function isUserRole(value) {
    return userRoles.has(value);
}

export function validationError(message) {
    const error = new Error(message);
    error.status = 400;
    return error;
}
