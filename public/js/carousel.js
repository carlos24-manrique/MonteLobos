const carousel = document.querySelector('.carru');

if (carousel) {
    const images = [...carousel.querySelectorAll('img')];
    const previousButton = carousel.querySelector('.anterior');
    const nextButton = carousel.querySelector('.siguiente');
    let currentIndex = images.findIndex((image) => image.classList.contains('active'));
    let intervalId;

    if (currentIndex < 0) {
        currentIndex = 0;
    }

    function showImage(index) {
        currentIndex = (index + images.length) % images.length;
        images.forEach((image, imageIndex) => {
            const isActive = imageIndex === currentIndex;
            const isNext = imageIndex === (currentIndex + 1) % images.length;
            const isPrevious = imageIndex === (currentIndex - 1 + images.length) % images.length;

            image.classList.toggle('active', isActive);
            image.classList.toggle('next', isNext);
            image.classList.toggle('previous', isPrevious);
            image.classList.toggle('is-hidden', !isActive && !isNext && !isPrevious);
        });
    }

    function startAutomaticRotation() {
        window.clearInterval(intervalId);
        intervalId = window.setInterval(() => {
            showImage(currentIndex + 1);
        }, 5000);
    }

    previousButton?.addEventListener('click', () => {
        showImage(currentIndex - 1);
        startAutomaticRotation();
    });

    nextButton?.addEventListener('click', () => {
        showImage(currentIndex + 1);
        startAutomaticRotation();
    });

    carousel.addEventListener('mouseenter', () => window.clearInterval(intervalId));
    carousel.addEventListener('mouseleave', startAutomaticRotation);

    showImage(currentIndex);
    startAutomaticRotation();
}
