import * as THREE from 'three';

// 1. Scene setup
const container = document.getElementById('katana-canvas-container');
const scene = new THREE.Scene();
// Nota: Se ha eliminado la niebla (fog) para no manchar el fondo transparente de tu web

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 6);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.setClearColor(0x000000, 0); // Fondo totalmente transparente

container.appendChild(renderer.domElement);

// 2. Mouse tracking
const mouse = new THREE.Vector2(0, 0);
const target3D = new THREE.Vector3(0, 0, 0);
const currentPos = new THREE.Vector3(0, 0, 0);
const currentRot = new THREE.Vector2(0, 0);
let velocity = new THREE.Vector2(0, 0);
let prevMouse = new THREE.Vector2(0, 0);

function onPointerMove(e) {
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  mouse.x = (clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(clientY / window.innerHeight) * 2 + 1;
}
window.addEventListener('mousemove', onPointerMove);
window.addEventListener('touchmove', onPointerMove, { passive: true });

// 3. BUILD KATANA
const katanaGroup = new THREE.Group();

// Blade
const bladeMat = new THREE.MeshPhysicalMaterial({
  color: 0xd8dce6, metalness: 0.95, roughness: 0.08,
  reflectivity: 1.0, clearcoat: 0.6, clearcoatRoughness: 0.05, envMapIntensity: 2.0,
});
const bladeShape = new THREE.Shape();
bladeShape.moveTo(0, 0);
bladeShape.lineTo(0.045, 0);
bladeShape.lineTo(0.038, 1.8);
bladeShape.bezierCurveTo(0.035, 2.0, 0.02, 2.2, 0.005, 2.4);
bladeShape.lineTo(0, 2.42);
bladeShape.lineTo(0, 2.4);
bladeShape.bezierCurveTo(0.0, 2.2, 0.0, 2.0, 0, 1.8);
bladeShape.lineTo(0, 0);

const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, { steps: 1, depth: 0.008, bevelEnabled: true, bevelThickness: 0.003, bevelSize: 0.003, bevelSegments: 3 });
bladeGeo.center();
const blade = new THREE.Mesh(bladeGeo, bladeMat);
blade.position.y = 0.8;
blade.castShadow = true;
katanaGroup.add(blade);

// Hamon line
const hamonCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0.012, -0.38, 0.006), new THREE.Vector3(0.015, 0.0, 0.006),
  new THREE.Vector3(0.018, 0.4, 0.006), new THREE.Vector3(0.016, 0.8, 0.006),
  new THREE.Vector3(0.012, 1.2, 0.006), new THREE.Vector3(0.008, 1.5, 0.006),
]);
const hamonGeo = new THREE.TubeGeometry(hamonCurve, 40, 0.0015, 4, false);
const hamonMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 });
const hamon = new THREE.Mesh(hamonGeo, hamonMat);
hamon.position.y = 0.8;
katanaGroup.add(hamon);

// Habaki
const habaki = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.06, 0.025), new THREE.MeshPhysicalMaterial({ color: 0xc4a035, metalness: 0.9, roughness: 0.2 }));
habaki.position.set(0.022, -0.37, 0.004);
katanaGroup.add(habaki);

// Tsuba
const tsuba = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.012, 32), new THREE.MeshPhysicalMaterial({ color: 0x1a1a1a, metalness: 0.85, roughness: 0.3 }));
tsuba.position.set(0.022, -0.41, 0.004);
tsuba.rotation.x = Math.PI / 2;
tsuba.castShadow = true;
katanaGroup.add(tsuba);

for (let i = 0; i < 8; i++) {
  const angle = (i / 8) * Math.PI * 2;
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.006, 8, 8), new THREE.MeshPhysicalMaterial({ color: 0xd4a020, metalness: 0.95, roughness: 0.15, emissive: 0xd4a020, emissiveIntensity: 0.15 }));
  dot.position.set(0.022 + Math.cos(angle) * 0.075, -0.41, 0.004 + Math.sin(angle) * 0.075);
  katanaGroup.add(dot);
}

// Tsuka
const tsuka = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.03, 0.55, 8), new THREE.MeshPhysicalMaterial({ color: 0x1a0a05, roughness: 0.85, metalness: 0.0 }));
tsuka.position.set(0.022, -0.69, 0.004);
tsuka.castShadow = true;
katanaGroup.add(tsuka);

for (let i = 0; i < 14; i++) {
  const wrap = new THREE.Mesh(new THREE.TorusGeometry(0.032, 0.004, 4, 8), new THREE.MeshPhysicalMaterial({ color: 0x2a1510, roughness: 0.9 }));
  wrap.position.set(0.022, -0.46 - i * 0.035, 0.004);
  wrap.rotation.y = (i % 2) * 0.4;
  katanaGroup.add(wrap);
}

// Kashira & Menuki
const kashira = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: 0x1a1a1a, metalness: 0.8, roughness: 0.3 }));
kashira.position.set(0.022, -0.94, 0.004);
kashira.rotation.x = Math.PI;
katanaGroup.add(kashira);

const menuki = new THREE.Mesh(new THREE.TorusKnotGeometry(0.012, 0.004, 32, 8, 2, 3), new THREE.MeshPhysicalMaterial({ color: 0xd4a020, metalness: 0.95, roughness: 0.1, emissive: 0xd4a020, emissiveIntensity: 0.1 }));
menuki.position.set(0.022, -0.65, 0.034);
katanaGroup.add(menuki);

katanaGroup.rotation.z = -Math.PI / 6;
katanaGroup.rotation.x = 0.1;
scene.add(katanaGroup);

// 4. LIGHTING & ENVIRONMENT
const ambient = new THREE.AmbientLight(0xffffff, 0.5); // Suavizado para encajar en temas claros y oscuros
scene.add(ambient);

const keyLight = new THREE.DirectionalLight(0xffe4b5, 1.2);
keyLight.position.set(3, 5, 4);
keyLight.castShadow = true;
scene.add(keyLight);

const rimLight = new THREE.DirectionalLight(0x4477ff, 0.6);
rimLight.position.set(-3, 2, -3);
scene.add(rimLight);

const accentLight = new THREE.PointLight(0xff6633, 0.5, 10);
accentLight.position.set(2, -1, 3);
scene.add(accentLight);

const bladeGlow = new THREE.PointLight(0xaabbff, 0.3, 5);
bladeGlow.position.set(0, 1.5, 1);
katanaGroup.add(bladeGlow);

// Mapa de entorno (solo para reflejos del metal, no se renderiza de fondo)
const envCanvas = document.createElement('canvas');
envCanvas.width = 256; envCanvas.height = 256;
const envCtx = envCanvas.getContext('2d');
const gradient = envCtx.createLinearGradient(0, 0, 0, 256);
gradient.addColorStop(0, '#1a2244');
gradient.addColorStop(0.5, '#0a0a1a');
gradient.addColorStop(1, '#2a1520');
envCtx.fillStyle = gradient;
envCtx.fillRect(0, 0, 256, 256);
const envTexture = new THREE.CanvasTexture(envCanvas);
envTexture.mapping = THREE.EquirectangularReflectionMapping;
scene.environment = envTexture;

// 5. BLADE EDGE GLOW EFFECT
const glowCurve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, -0.38, 0.006), new THREE.Vector3(0, 0.0, 0.006),
  new THREE.Vector3(0, 0.5, 0.006), new THREE.Vector3(0, 1.0, 0.006),
  new THREE.Vector3(0, 1.4, 0.006), new THREE.Vector3(0.005, 1.62, 0.006),
]);
const glowGeo = new THREE.TubeGeometry(glowCurve, 50, 0.004, 6, false);
const glowMat = new THREE.ShaderMaterial({
  uniforms: { uTime: { value: 0 }, uColor: { value: new THREE.Color(0x88aaff) } },
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vNormal = normalMatrix * normal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColor;
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      float glow = sin(vUv.x * 30.0 - uTime * 3.0) * 0.5 + 0.5;
      glow *= smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x);
      float edge = 1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0)));
      float alpha = glow * 0.4 * edge + 0.08;
      gl_FragColor = vec4(uColor, alpha);
    }
  `,
  transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
});
const glowMesh = new THREE.Mesh(glowGeo, glowMat);
glowMesh.position.y = 0.8;
katanaGroup.add(glowMesh);

// 6. ANIMATION
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  velocity.x = mouse.x - prevMouse.x;
  velocity.y = mouse.y - prevMouse.y;
  prevMouse.copy(mouse);

  target3D.set(mouse.x * 3, mouse.y * 2, 0);
  currentPos.lerp(target3D, 0.04);
  katanaGroup.position.x = currentPos.x;
  katanaGroup.position.y = currentPos.y;

  katanaGroup.position.y += Math.sin(t * 1.5) * 0.06;
  katanaGroup.position.x += Math.cos(t * 1.2) * 0.03;

  const targetRotY = -mouse.x * 0.4 + Math.sin(t * 0.8) * 0.05;
  const targetRotX = mouse.y * 0.2 + Math.cos(t * 0.6) * 0.05;
  currentRot.x += (targetRotX - currentRot.x) * 0.03;
  currentRot.y += (targetRotY - currentRot.y) * 0.03;
  katanaGroup.rotation.x = currentRot.x + 0.1;
  katanaGroup.rotation.y = currentRot.y;
  katanaGroup.rotation.z = -Math.PI / 6 + Math.sin(t * 0.7) * 0.03;

  const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y);
  bladeGlow.intensity = 0.3 + speed * 8;
  glowMat.uniforms.uTime.value = t;
  glowMat.uniforms.uColor.value.setHSL(0.6 + Math.sin(t * 0.5) * 0.05, 0.5, 0.6 + speed * 2);

  accentLight.position.x = Math.sin(t * 0.4) * 3;
  accentLight.position.y = Math.cos(t * 0.3) * 2;

  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});