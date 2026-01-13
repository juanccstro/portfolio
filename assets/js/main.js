// Obtener el año para el footer
(() => {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();

// Efecto de reveal
const reveals = document.querySelectorAll('.reveal, .hero');

const observer = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
            }
        });
    },
    { threshold: 0.3 }
);

reveals.forEach(el => observer.observe(el));


