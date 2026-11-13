import multer from 'multer';
import { unlink } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const avatarDir = join(__dirname, '..', 'public', 'uploads', 'avatars');
const allowedTypes = new Map([
    ['image/jpeg', '.jpg'],
    ['image/png', '.png'],
    ['image/webp', '.webp']
]);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, avatarDir),
    filename: (req, file, cb) => {
        // Nombre aleatorio: nunca se usa el nombre original del usuario.
        cb(null, `${randomBytes(16).toString('hex')}${allowedTypes.get(file.mimetype) || extname(file.originalname)}`);
    }
});

const uploader = multer({
    storage,
    limits: { fileSize: 2 * 1024 * 1024, files: 1 },
    fileFilter: (req, file, cb) => {
        if (!allowedTypes.has(file.mimetype)) {
            const error = new Error('La imagen debe ser JPG, PNG o WEBP.');
            error.status = 400;
            return cb(error);
        }
        return cb(null, true);
    }
});

// Middleware: procesa el campo opcional "avatar" y convierte errores de Multer en 400.
export function uploadAvatar(req, res, next) {
    uploader.single('avatar')(req, res, (error) => {
        if (!error) {
            // Si la petición termina con error (validación, correo repetido, BD caída), se borra la imagen.
            res.on('finish', () => {
                if (req.file && res.statusCode >= 400) unlink(req.file.path).catch(() => {});
            });
            return next();
        }
        if (error instanceof multer.MulterError) {
            error.status = 400;
            error.message = error.code === 'LIMIT_FILE_SIZE'
                ? 'La imagen no puede pesar más de 2 MB.'
                : 'No se pudo procesar la imagen.';
        }
        return next(error);
    });
}
