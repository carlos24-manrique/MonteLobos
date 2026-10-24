export function renderAdmin(req, res) {
    res.render('admin', { title: 'Administración | MonteLobos', account: req.session.user });
}
