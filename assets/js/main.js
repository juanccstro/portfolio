(() => {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();

const reveals = document.querySelectorAll('.reveal, .hero');

const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
        }
    });
}, { threshold: 0.3 });

reveals.forEach(el => observer.observe(el));

/* =========================================
   TEMA MODO OSCURO / VIEW TRANSITION
   ========================================= */
const themeToggleBtn = document.getElementById('theme-toggle');

// Función que aplica el cambio real en el DOM y lo guarda en memoria
function switchTheme() {
    document.documentElement.classList.toggle('dark');
    
    // Guardamos la preferencia actual en localStorage
    if (document.documentElement.classList.contains('dark')) {
        localStorage.setItem('theme', 'dark');
    } else {
        localStorage.setItem('theme', 'light');
    }
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        // Si el navegador no soporta View Transitions, cambia de golpe
        if (!document.startViewTransition) {
            switchTheme();
        } else {
            // Si lo soporta, lanza la magia del Samurai
            document.startViewTransition(switchTheme);
        }
    });
}