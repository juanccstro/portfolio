// Obtener el año para el footer
(() => {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
