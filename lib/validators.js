import { body, validationResult } from 'express-validator';

// Corta la petición con 400 y el primer mensaje de error si alguna regla falla.
export function handleValidation(req, res, next) {
    const result = validationResult(req);
    if (result.isEmpty()) return next();
    const errors = result.array({ onlyFirstError: true });
    return res.status(400).json({
        message: errors[0].msg,
        errors: errors.map(({ path, msg }) => ({ field: path, message: msg }))
    });
}

export const registerRules = [
    body('name').isString().trim().isLength({ min: 2, max: 80 })
        .withMessage('El nombre debe tener entre 2 y 80 caracteres.'),
    body('email').isString().trim().isEmail().withMessage('Ingresa un correo válido.')
        .isLength({ max: 254 }).withMessage('El correo es demasiado largo.').normalizeEmail(),
    body('password').isString().isLength({ min: 8, max: 128 })
        .withMessage('La contraseña debe tener entre 8 y 128 caracteres.')
        .matches(/[A-Za-z]/).withMessage('La contraseña debe incluir al menos una letra.')
        .matches(/\d/).withMessage('La contraseña debe incluir al menos un número.'),
    handleValidation
];

export const loginRules = [
    body('email').isString().trim().isEmail().withMessage('Ingresa un correo válido.').normalizeEmail(),
    body('password').exists({ values: 'falsy' }).withMessage('Ingresa tu contraseña.').bail().isString().withMessage('Ingresa tu contraseña.')
        .isLength({ max: 128 }).withMessage('La contraseña es demasiado larga.'),
    body('remember').optional().isBoolean().withMessage('Valor de "recordarme" no válido.').toBoolean(),
    handleValidation
];

export const reservationRules = [
    body('name').isString().trim().isLength({ min: 1, max: 80 }).withMessage('El nombre es obligatorio (máx. 80 caracteres).'),
    body('lastName').isString().trim().isLength({ min: 1, max: 80 }).withMessage('El apellido es obligatorio (máx. 80 caracteres).'),
    body('phone').isString().trim().isLength({ min: 7, max: 30 }).withMessage('El teléfono debe tener entre 7 y 30 caracteres.')
        .matches(/^[0-9+()\-\s]+$/).withMessage('El teléfono solo puede contener números, espacios, +, - y paréntesis.'),
    body('email').isString().trim().isEmail().withMessage('Ingresa un correo válido.'),
    handleValidation
];

// Reglas para productos (admin). En PATCH/PUT todos los campos son opcionales.
export function productRules({ partial = false } = {}) {
    const field = (name) => (partial ? body(name).optional() : body(name));
    return [
        field('id').isString().trim().isLength({ min: 1, max: 120 }).withMessage('El identificador es obligatorio (máx. 120 caracteres).'),
        field('name').isString().trim().isLength({ min: 1, max: 80 }).withMessage('El nombre es obligatorio (máx. 80 caracteres).'),
        field('category').isString().trim().isLength({ min: 1, max: 80 }).withMessage('La categoría es obligatoria (máx. 80 caracteres).'),
        field('price').isInt({ min: 1 }).withMessage('El precio debe ser un entero positivo.').toInt(),
        body('description').optional().isString().withMessage('La descripción no es válida.'),
        body('available').optional().isBoolean({ strict: true }).withMessage('La disponibilidad no es válida.'),
        handleValidation
    ];
}
