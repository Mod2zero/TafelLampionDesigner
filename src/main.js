// Lampion J1701 — bootstrap, render-loop, mode-switch.

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

import { makeParams, defaults } from './params.js';
import { buildPreviewGeometry, buildExportGeometry } from './geometry/shade.js';
import { buildCollarGeometry, buildGaugeGeometry, collarMetrics } from './geometry/collar.js';
import { Studio, makeAtelierMaterial, makeNightMaterial, glowIntensity } from './sim/lighting.js';
import { exportSTL, printSettings } from './export/stl.js';
import { analyzeGeometry, formatReport } from './print/validate.js';
import { buildPanel } from './ui/panel.js';

const p = makeParams();

// ---------- Three.js basis ----------
const viewport = document.getElementById('viewport');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(35, viewport.clientWidth / viewport.clientHeight, 1, 4000);
camera.position.set(0, 120, 460);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
renderer.setSize(viewport.clientWidth, viewport.clientHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
viewport.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 120;
controls.maxDistance = 1600;
controls.maxPolarAngle = Math.PI * 0.9;

const studio = new Studio(renderer, scene, camera);
studio.setMode('atelier');

// ---------- Materialen + meshes ----------
const atelierMat = makeAtelierMaterial(p);
const nightMat = makeNightMaterial(p);
const collarMat = new THREE.MeshStandardMaterial({ color: 0x3a3a40, roughness: 0.5, metalness: 0.1, side: THREE.DoubleSide });
const moduleMat = new THREE.MeshStandardMaterial({ color: 0x1b1b1e, roughness: 0.4, metalness: 0.2 });

let mode = 'atelier';

const kapMesh = new THREE.Mesh(new THREE.BufferGeometry(), atelierMat);
kapMesh.castShadow = true; kapMesh.receiveShadow = true;
scene.add(kapMesh);

const collarMesh = new THREE.Mesh(new THREE.BufferGeometry(), collarMat);
collarMesh.castShadow = true;
scene.add(collarMesh);

const moduleMesh = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 48), moduleMat);
moduleMesh.castShadow = true;
scene.add(moduleMesh);

let showCollar = true;

// ---------- Rebuild ----------
function rebuild() {
  kapMesh.geometry.dispose();
  kapMesh.geometry = buildPreviewGeometry(p);

  collarMesh.geometry.dispose();
  collarMesh.geometry = buildCollarGeometry(p);

  // Faceted → vlakke shading in atelier
  atelierMat.flatShading = p.style === 'faceted';
  atelierMat.color.set(p.shadeColor);
  atelierMat.needsUpdate = true;

  // Assemblage: de houder zakt verzonken in de kapmond, de lip rust op de rand;
  // de module rust op de bodemrichel, LED naar beneden.
  const m = collarMetrics(p);
  collarMesh.position.y = p.height - (m.totalHeight - m.lipT);
  const floorTop = collarMesh.position.y + m.ledgeT;
  moduleMesh.geometry.dispose();
  moduleMesh.geometry = new THREE.CylinderGeometry(p.moduleFlangeDiameter / 2, p.moduleFlangeDiameter / 2, p.moduleHeight, 72);
  moduleMesh.position.y = floorTop + p.moduleHeight / 2;

  collarMesh.visible = showCollar;
  moduleMesh.visible = showCollar && mode !== 'night';

  controls.target.set(0, p.height * 0.5, 0);
  updateStats();
}

function updateStats() {
  const tris = kapMesh.geometry.index
    ? kapMesh.geometry.index.count / 3
    : kapMesh.geometry.attributes.position.count / 3;
  const maxR = Math.max(p.baseRadius, p.bellyRadius, p.shoulderRadius, p.topRadius) + Math.max(p.fluteAmp, p.rippleAmp);
  document.getElementById('stats').innerHTML =
    `<span>Ø ${Math.round(maxR * 2)} × ${Math.round(p.height)} mm</span><br>` +
    `<span>${Math.round(tris).toLocaleString('nl-BE')}</span> driehoeken<br>` +
    `<span>${STYLE_NL[p.style]}</span>`;
}
const STYLE_NL = { organic: 'organisch', ribbed: 'geribd', faceted: 'gefacetteerd' };

// ---------- Sim-update ----------
function updateSim() {
  nightMat.uniforms.uColor.value.set(p.ledColor);
  nightMat.uniforms.uIntensity.value = glowIntensity(p);
  atelierMat.color.set(p.shadeColor);
  studio.update(p, p.height);
  moduleMesh.visible = showCollar && mode !== 'night';
}

// ---------- Mode-switch ----------
function setMode(next) {
  mode = next;
  document.body.classList.toggle('night', mode === 'night');
  document.getElementById('modeAtelier').classList.toggle('active', mode === 'atelier');
  document.getElementById('modeNight').classList.toggle('active', mode === 'night');
  kapMesh.material = mode === 'night' ? nightMat : atelierMat;
  studio.setMode(mode);
  updateSim();
}
document.getElementById('modeAtelier').onclick = () => setMode('atelier');
document.getElementById('modeNight').onclick = () => setMode('night');

// ---------- Export ----------
function exportPart(part) {
  let geo, name;
  if (part === 'kap') { geo = buildExportGeometry(p); name = 'lampion-kap.stl'; }
  else if (part === 'houder') { geo = buildCollarGeometry(p); name = 'lampion-led-houder.stl'; }
  else { geo = buildGaugeGeometry(p); name = 'lampion-meetijkje.stl'; }
  exportSTL(geo, name);
  geo.dispose();
}

function validate() {
  const report = document.getElementById('report');
  const kapGeo = buildExportGeometry(p);
  const collarGeo = buildCollarGeometry(p);
  const kapR = analyzeGeometry(kapGeo);
  const collarR = analyzeGeometry(collarGeo);
  kapGeo.dispose(); collarGeo.dispose();

  const cls = kapR.watertight ? 'ok' : 'bad';
  report.innerHTML =
    `<span class="${cls}">${formatReport('KAP-export', kapR).replace(/\n/g, '<br>')}</span><br><br>` +
    `${formatReport('LED-HOUDER', collarR).replace(/\n/g, '<br>')}`;
  report.classList.add('show');
}

// ---------- Panel ----------
const panel = buildPanel(document.getElementById('controls'), p, {
  rebuild,
  updateSim,
  exportPart,
  validate,
  reset: () => { Object.assign(p, defaults); setMode('atelier'); rebuild(); updateSim(); },
  setCollarVisible: (on) => { showCollar = on; collarMesh.visible = on; moduleMesh.visible = on && mode !== 'night'; },
});

// Print-instellingen in de console (handig naast de UI).
console.log('Aanbevolen printinstellingen:', printSettings(p));

// ---------- Resize + loop ----------
function resize() {
  const w = viewport.clientWidth, h = viewport.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
  studio.resize(w, h);
}
window.addEventListener('resize', resize);

rebuild();
updateSim();
resize();

(function animate() {
  requestAnimationFrame(animate);
  controls.update();
  studio.render();
})();
