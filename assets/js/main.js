// Obtener el año para el footer
(() => {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();

// Efecto de reveal
(() => {
    const reveals = document.querySelectorAll('.reveal');

    if (!reveals.length) return;

    const observer = new IntersectionObserver(
        (entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    obs.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.25
        }
    );

    reveals.forEach(el => observer.observe(el));
})();
