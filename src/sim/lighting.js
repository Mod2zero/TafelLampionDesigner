// Atelier- en nacht-simulatie + bloom-pipeline + kap-materialen.
//
//  Atelier  → warme studiobelichting (zoals het prototype): zien wat je ontwerpt.
//  Nacht    → donkere scène, warme LED-puntbron van bovenaf, gloeiende wand
//             (dunner = feller, groeven feller), bloom-halo, warme lichtplas.

import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

// ---------- Materialen voor de kap ----------
export function makeAtelierMaterial(p) {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(p.shadeColor),
    roughness: 0.62,
    metalness: 0.0,
    side: THREE.DoubleSide,
    flatShading: p.style === 'faceted',
  });
}

// Gloei-shader: emissie ∝ helderheid (groeven/dunne wand) + fresnel-rand.
// De bloom-pass pikt de heldere fragmenten op en maakt de halo.
export function makeNightMaterial(p) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(p.ledColor) },
      uIntensity: { value: 1.0 },
    },
    transparent: true,
    side: THREE.DoubleSide,
    depthWrite: true,
    flatShading: p.style === 'faceted',
    vertexShader: /* glsl */`
      attribute float aBright;
      varying float vBright;
      varying vec3 vN;
      varying vec3 vView;
      void main() {
        vBright = aBright;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vN = normalize(mat3(modelMatrix) * normal);
        vView = normalize(cameraPosition - wp.xyz);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 uColor;
      uniform float uIntensity;
      varying float vBright;
      varying vec3 vN;
      varying vec3 vView;
      void main() {
        float fres = pow(1.0 - abs(dot(normalize(vN), normalize(vView))), 2.0);
        float glow = uIntensity * (0.55 * vBright + 0.8 * fres * vBright + 0.22);
        vec3 col = uColor * glow;
        float alpha = clamp(0.55 + 0.45 * vBright, 0.6, 1.0);
        gl_FragColor = vec4(col, alpha);
      }
    `,
  });
}

// Emissie-intensiteit uit wanddikte: dunner = feller (genormaliseerd op 0,4–1,6 mm).
export function glowIntensity(p) {
  const t = (p.wallThickness - 0.4) / (1.6 - 0.4); // 0 (dun) .. 1 (dik)
  const thinBoost = 1.5 - 0.9 * Math.min(1, Math.max(0, t));
  return thinBoost * p.glow;
}

export class Studio {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.mode = 'atelier';

    // --- Atelier-lampen ---
    this.ambient = new THREE.AmbientLight(0xffffff, 0.5);
    this.key = new THREE.DirectionalLight(0xfff0dc, 1.5);
    this.key.position.set(160, 320, 220);
    this.key.castShadow = true;
    this.key.shadow.mapSize.set(2048, 2048);
    Object.assign(this.key.shadow.camera, { left: -250, right: 250, top: 350, bottom: -60, near: 1, far: 1200 });
    this.key.shadow.bias = -0.0005;
    this.fill = new THREE.DirectionalLight(0xb8c8e0, 0.5);
    this.fill.position.set(-180, 140, -120);
    this.rim = new THREE.DirectionalLight(0xffffff, 0.4);
    this.rim.position.set(0, 80, -260);
    scene.add(this.ambient, this.key, this.fill, this.rim);

    // --- Nacht: warme LED-puntbron (in de top van de lampion) ---
    this.led = new THREE.PointLight(0xff9d4d, 0, 1400, 2.0);
    this.led.castShadow = true;
    this.led.shadow.mapSize.set(1024, 1024);
    scene.add(this.led);
    this.nightAmbient = new THREE.AmbientLight(0x223044, 0);
    scene.add(this.nightAmbient);

    // --- Vloer (schaduw in atelier, warme lichtplas 's nachts) ---
    this.shadowGround = new THREE.Mesh(
      new THREE.CircleGeometry(600, 64),
      new THREE.ShadowMaterial({ opacity: 0.2 })
    );
    this.shadowGround.rotation.x = -Math.PI / 2;
    this.shadowGround.position.y = -0.05;
    this.shadowGround.receiveShadow = true;
    scene.add(this.shadowGround);

    this.tableMat = new THREE.MeshStandardMaterial({ color: 0x0a0806, roughness: 0.95, metalness: 0 });
    this.table = new THREE.Mesh(new THREE.CircleGeometry(600, 64), this.tableMat);
    this.table.rotation.x = -Math.PI / 2;
    this.table.position.y = -0.06;
    this.table.receiveShadow = true;
    this.table.visible = false;
    scene.add(this.table);

    // Warme lichtplas (additieve radiale gradient) — betrouwbaar ongeacht schaduwen.
    this.pool = new THREE.Mesh(
      new THREE.CircleGeometry(210, 64),
      new THREE.MeshBasicMaterial({
        map: makeRadialTexture(),
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        color: new THREE.Color(0xff9d4d),
      })
    );
    this.pool.rotation.x = -Math.PI / 2;
    this.pool.position.y = 0.02;
    this.pool.visible = false;
    scene.add(this.pool);

    // --- Composer + bloom ---
    this.composer = new EffectComposer(renderer);
    this.renderPass = new RenderPass(scene, camera);
    this.bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.9, 0.55, 0.18);
    this.outputPass = new OutputPass();
    this.composer.addPass(this.renderPass);
    this.composer.addPass(this.bloom);
    this.composer.addPass(this.outputPass);
    this.bloom.enabled = false;
  }

  setMode(mode) {
    this.mode = mode;
    const night = mode === 'night';
    this.ambient.intensity = night ? 0.0 : 0.5;
    this.key.intensity = night ? 0.0 : 1.5;
    this.fill.intensity = night ? 0.0 : 0.5;
    this.rim.intensity = night ? 0.0 : 0.4;
    this.shadowGround.visible = !night;
    this.led.intensity = night ? 14 : 0;
    this.nightAmbient.intensity = night ? 1.0 : 0;
    this.table.visible = night;
    this.pool.visible = night;
    this.bloom.enabled = night;
    // Atelier: geen scene-achtergrond → de warme CSS-gradient schijnt door (alpha).
    this.scene.background = night ? new THREE.Color(0x0a0806) : null;
    this.renderer.setClearAlpha(night ? 1 : 0);
    this.renderer.toneMappingExposure = night ? 1.0 : 1.0;
  }

  // Positioneer de LED in de top van de lampion en stem warmte/sterkte af.
  update(p, lampionHeight) {
    const col = new THREE.Color(p.ledColor);
    this.led.color.copy(col);
    this.led.position.set(0, lampionHeight * 0.96, 0);
    this.led.intensity = this.mode === 'night' ? 8 + 12 * p.glow : 0;
    this.pool.material.color.copy(col);
    this.pool.material.opacity = 0.4 * Math.min(1.3, p.glow);
    this.bloom.strength = p.bloomStrength;
    this.bloom.enabled = this.mode === 'night' && p.bloom;
  }

  resize(w, h) {
    this.composer.setSize(w, h);
    this.bloom.setSize(w, h);
  }

  render() {
    if (this.mode === 'night' && this.bloom.enabled) this.composer.render();
    else this.renderer.render(this.scene, this.camera);
  }
}

function makeRadialTexture() {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,1)');
  g.addColorStop(0.35, 'rgba(255,255,255,0.55)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
