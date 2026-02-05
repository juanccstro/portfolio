document.body.classList.add('stop-scroll');

setTimeout(() => {
    document.body.classList.remove('stop-scroll');
}, 3000);

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

const canvasEl = document.querySelector("#fire-overlay");
const devicePixelRatio = Math.min(window.devicePixelRatio, 2);
let startTime = performance.now();
let animationProgress = 0.3;
let uniforms;

function createTextTexture(gl) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = 2048;
    canvas.height = 1024;

    ctx.fillStyle = "rgba(246, 244, 239, 0.92)";
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

    return texture;
}

function initShader() {
    const vsSource = document.getElementById("vertShader").textContent;
    const fsSource = document.getElementById("fragShader").textContent;
    const gl = canvasEl.getContext("webgl", { alpha: true });

    if (!gl) return null;

    const createS = (type, src) => {
        const s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
        return s;
    };

    const vs = createS(gl.VERTEX_SHADER, vsSource);
    const fs = createS(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return null;

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
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

if (gl) {
    const resize = () => {
        canvasEl.width = window.innerWidth * devicePixelRatio;
        canvasEl.height = window.innerHeight * devicePixelRatio;
        gl.viewport(0, 0, canvasEl.width, canvasEl.height);
        gl.uniform2f(uniforms.u_resolution, canvasEl.width, canvasEl.height);
    };

    resize();
    window.addEventListener("resize", resize);

    function render() {
        const elapsed = (performance.now() - startTime) / 5500;

        gl.clear(gl.COLOR_BUFFER_BIT);

        if (elapsed <= 1) {
            animationProgress = 0.3 + 0.7 * elapsed;
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