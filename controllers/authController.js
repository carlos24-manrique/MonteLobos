import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { requireSupabase } from '../lib/supabase.js';

const scryptAsync = promisify(scrypt);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function publicAccount(account) {
    return { id: account.id, name: account.name, email: account.email, role: account.role || 'customer' };
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
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!name || name.length > 80 || !emailPattern.test(email) || email.length > 254
        || password.length < 8 || password.length > 128) {
        return res.status(400).json({ message: 'Revisa tu nombre, correo y contraseña (mínimo 8 caracteres).' });
    }

    const db = requireSupabase();
    const { data: existing, error: lookupError } = await db
        .from('users')
        .select('id')
        .eq('email', email)
        .maybeSingle();
    if (lookupError) throw lookupError;
    if (existing) {
        return res.status(409).json({ message: 'Ya existe una cuenta con ese correo.' });
    }

    const salt = randomBytes(16).toString('hex');
    const passwordHash = (await scryptAsync(password, salt, 64)).toString('hex');
    const account = {
        id: randomBytes(16).toString('hex'),
        name,
        email,
        salt,
        passwordHash
    };

    const { error } = await db.from('users').insert({
        id: account.id,
        name: account.name,
        email: account.email,
        salt: account.salt,
        password_hash: account.passwordHash
    });
    if (error) throw error;
    await startSession(req, account);
    return res.status(201).json({ user: publicAccount(account) });
}

export async function login(req, res) {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const db = requireSupabase();
    const { data: savedAccount, error } = await db
        .from('users')
        .select('id, name, email, salt, password_hash, role')
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
    return res.json({ user: publicAccount(account) });
}

export function logout(req, res, next) {
    req.session.destroy((error) => {
        if (error) return next(error);
        res.clearCookie('montelobos.sid', { path: '/' });
        return res.json({ ok: true });
    });
}