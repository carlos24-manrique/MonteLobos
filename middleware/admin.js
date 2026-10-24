export function requireAdmin(req, res, next) {
    if (!req.session.user) {
        return res.status(401).json({ message: 'Inicia sesión para acceder al panel.' });
    }
    if (req.session.user.role !== 'admin') {
        return res.status(403).json({ message: 'No tienes permisos de administrador.' });
    }
    return next();
}

export function requireAdminPage(req, res, next) {
    if (!req.session.user) return res.redirect('/');
    if (req.session.user.role !== 'admin') return res.status(403).send('Acceso denegado');
    return next();
}
