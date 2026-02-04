document.body.classList.add('stop-scroll');

// Fallback de seguridad: nunca dejar la página sin scroll
setTimeout(() => {
    document.body.classList.remove('stop-scroll');
}, 3500);

// Obtener el año para el footer
(() => {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();

// Efecto de reveal basado en scroll
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

// Animación de papel quemado
const canvasEl = document.querySelector("#fire-overlay");
const devicePixelRatio = Math.min(window.devicePixelRatio, 2);
let startTime = performance.now();
let animationProgress = 0.3;
let uniforms;

function createTextTexture(gl) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const isMobile = window.innerHeight > window.innerWidth;

    canvas.width = 2048;
    canvas.height = isMobile ? 2048 : 1024;

    ctx.fillStyle = "#f6f4ef";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        canvas
    );

    const img = new Image();
    img.src = "assets/img/logo.png";

    img.onload = () => {
        const maxWidth = canvas.width * 0.3;
        const maxHeight = canvas.height * 0.2;

        const ratio = Math.min(
            maxWidth / img.width,
            maxHeight / img.height
        );

        const w = img.width * ratio;
        const h = img.height * ratio;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#f6f4ef";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.drawImage(
            img,
            (canvas.width - w) / 2,
            (canvas.height - h) / 2,
            w,
            h
        );

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            canvas
        );
    };

    return texture;
}


function initShader() {
    const vsSource = document.getElementById("vertShader").textContent;
    const fsSource = document.getElementById("fragShader").textContent;
    const gl = canvasEl.getContext("webgl", { alpha: true });

    if (!gl) return null;

    gl.clearColor(0, 0, 0, 0);

    const createS = (type, src) => {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);

        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(s));
            gl.deleteShader(s);
            return null;
        }
        return s;
    };

    const vs = createS(gl.VERTEX_SHADER, vsSource);
    const fs = createS(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return null;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error(gl.getProgramInfoLog(program));
        return null;
    }

    gl.useProgram(program);

    uniforms = {};
    const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < count; i++) {
        const name = gl.getActiveUniform(program, i).name;
        uniforms[name] = gl.getUniformLocation(program, name);
    }

    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const pos = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const textTexture = createTextTexture(gl);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textTexture);
    gl.uniform1i(uniforms.u_text, 0);

    return gl;
}

const gl = initShader();

if (!gl || !uniforms) {
    canvasEl.style.display = "none";
    document.body.classList.remove('stop-scroll');
} else {
    const resize = () => {
        canvasEl.width = window.innerWidth * devicePixelRatio;
        canvasEl.height = window.innerHeight * devicePixelRatio;
        gl.viewport(0, 0, canvasEl.width, canvasEl.height);
        gl.uniform2f(uniforms.u_resolution, canvasEl.width, canvasEl.height);
    };

    window.addEventListener("resize", resize);
    resize();

    function render() {
        const elapsed = (performance.now() - startTime) / 6000; // Duración animación

        gl.clear(gl.COLOR_BUFFER_BIT);

        if (elapsed <= 1) {
            animationProgress = 0.3 + 0.7 * (
                elapsed < 0.5
                    ? 2 * elapsed * elapsed
                    : 1 - Math.pow(-2 * elapsed + 2, 2) / 2
            );

            gl.uniform1f(uniforms.u_time, performance.now() * 0.001);
            gl.uniform1f(uniforms.u_progress, animationProgress);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            requestAnimationFrame(render);
        } else {
            canvasEl.style.display = "none";
            document.body.classList.remove('stop-scroll');
        }
    }

    render();
}
