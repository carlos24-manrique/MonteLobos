const reservationForm = document.querySelector('.reservation-form');

reservationForm?.addEventListener('submit', (event) => {
    event.preventDefault();

    if (reservationForm.dataset.submitted === 'true') {
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