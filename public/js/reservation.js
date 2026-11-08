const reservationForm = document.querySelector('.reservation-form');

reservationForm?.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (reservationForm.dataset.submitted === 'true') {
        return;
    }

    const formData = new FormData(reservationForm);
    const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: formData.get('nombre'),
            lastName: formData.get('apellido'),
            phone: formData.get('telefono'),
            email: formData.get('correo')
        })
    });
    if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        const feedback = document.createElement('p');
        feedback.className = 'reservation-feedback';
        feedback.setAttribute('role', 'alert');
        feedback.textContent = result.message || 'No fue posible guardar la reserva.';
        reservationForm.prepend(feedback);
        return;
    }

    reservationForm.dataset.submitted = 'true';

    const feedback = document.createElement('p');
    feedback.className = 'reservation-feedback';
    feedback.setAttribute('role', 'status');
    feedback.setAttribute('aria-live', 'polite');
    feedback.tabIndex = -1;
    feedback.textContent = '¡Gracias por tu reserva! El formulario quedará bloqueado hasta que recargues la página.';
    reservationForm.prepend(feedback);

    reservationForm.querySelectorAll('input, button, select, textarea').forEach((control) => {
        control.disabled = true;
    });

    feedback.focus();
});