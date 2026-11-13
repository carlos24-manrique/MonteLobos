import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { unlink } from 'node:fs/promises';
import { promisify } from 'node:util';
import { requireSupabase } from '../lib/supabase.js';

const scryptAsync = promisify(scrypt);

function publicAccount(account) {
    return {
        id: account.id,
        name: account.name,
        email: account.email,
        role: account.role || 'customer',
        avatarUrl: account.avatar_url || null
    };
}

async function startSession(req, account) {
    await new Promise((resolve, reject) => {
        req.session.regenerate((error) => error ? reject(error) : resolve());
    });
    req.session.user = publicAccount(account);
}

export function getSession(req, res) {
    res.json({ user: req.session.user || null });
}

export async function register(req, res) {
    // Los datos ya fueron validados por express-validator (lib/validators.js).
    const { name, email, password } = req.body;
    const avatarUrl = req.file ? `/uploads/avatars/${req.file.filename}` : null;

    const db = requireSupabase();
    const { data: existing, error: lookupError } = await db
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();
    if (lookupError) throw lookupError;
    if (existing) {
        if (req.file) await unlink(req.file.path).catch(() => {});
        return res.status(409).json({ message: 'Ya existe una cuenta con ese correo.' });
    }

    const salt = randomBytes(16).toString('hex');
    const passwordHash = (await scryptAsync(password, salt, 64)).toString('hex');
    const account = {
        id: randomBytes(16).toString('hex'),
        name,
        email,
        salt,
        passwordHash,
        avatar_url: avatarUrl
    };

    const { error } = await db.from('users').insert({
        id: account.id,
        name: account.name,
        email: account.email,
        salt: account.salt,
        password_hash: account.passwordHash,
        avatar_url: account.avatar_url
    });
    if (error) {
        if (req.file) await unlink(req.file.path).catch(() => {});
        throw error;
    }
    await startSession(req, account);
    return res.status(201).json({ user: publicAccount(account) });
}

export async function login(req, res) {
    const { email, password, remember } = req.body;
    const db = requireSupabase();
    const { data: savedAccount, error } = await db
        .from('users')
        .select('id, name, email, salt, password_hash, role, avatar_url')
        .eq('email', email)
        .maybeSingle();
    if (error) throw error;
    const account = savedAccount && {
        ...savedAccount,
        passwordHash: savedAccount.password_hash
    };

    if (!account || !password || password.length > 128) {
        return res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
    }

    const suppliedHash = await scryptAsync(password, account.salt, 64);
    const savedHash = Buffer.from(account.passwordHash, 'hex');
    if (savedHash.length !== suppliedHash.length || !timingSafeEqual(savedHash, suppliedHash)) {
        return res.status(401).json({ message: 'Correo o contraseña incorrectos.' });
    }

    await startSession(req, account);
    // "Recordarme": la cookie de sesión pasa de 24 horas a 30 días.
    if (remember) req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;
    return res.json({ user: publicAccount(account) });
}

export function logout(req, res, next) {
    req.session.destroy((error) => {
        if (error) return next(error);
        res.clearCookie('montelobos.sid', { path: '/' });
        return res.json({ ok: true });
    });
}