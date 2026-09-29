import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scryptAsync = promisify(scrypt);
const accountsFile = join(dirname(fileURLToPath(import.meta.url)), '../data/accounts.json');
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function readAccounts() {
    try {
        return JSON.parse(await readFile(accountsFile, 'utf8'));
    } catch (error) {
        if (error.code === 'ENOENT') return [];
        throw error;
    }
}

async function writeAccounts(accounts) {
    await mkdir(dirname(accountsFile), { recursive: true });
    await writeFile(accountsFile, `${JSON.stringify(accounts, null, 2)}\n`, 'utf8');
}

function publicAccount(account) {
    return { id: account.id, name: account.name, email: account.email };
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

    const accounts = await readAccounts();
    if (accounts.some((account) => account.email === email)) {
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

    accounts.push(account);
    await writeAccounts(accounts);
    await startSession(req, account);
    return res.status(201).json({ user: publicAccount(account) });
}

export async function login(req, res) {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    const account = (await readAccounts()).find((candidate) => candidate.email === email);

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