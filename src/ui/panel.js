// Bouwt het bedieningspaneel (atelier-esthetiek geport uit het prototype).

import { schema } from '../params.js';
import { presets, ledSwatches, shadeSwatches } from '../presets.js';

const STYLE_LABELS = { organic: 'Organisch', ribbed: 'Geribd', faceted: 'Gefacetteerd' };
const SIM_ONLY = new Set(['glow', 'bloomStrength']);

const fmtItem = (item, v) => {
  if (item.fmt) return item.fmt(v);
  const num = item.step < 1 ? v.toFixed(2) : Math.round(v);
  return item.unit ? `${num}${item.unit}` : `${num}`;
};

export function buildPanel(root, p, handlers) {
  root.innerHTML = '';
  const inputs = {};
  const valueEls = {};

  const section = (title, num) => {
    const el = document.createElement('div');
    el.className = 'section';
    el.innerHTML = `<div class="section-header"><div class="section-title">${title}</div><div class="section-num">— ${num}</div></div>`;
    root.appendChild(el);
    return el;
  };

  // ---- Presets ----
  const presetSec = section('Presets', '00');
  const presetWrap = document.createElement('div');
  presetWrap.className = 'presets';
  Object.entries(presets).forEach(([name, preset]) => {
    const b = document.createElement('button');
    b.className = 'preset';
    b.textContent = preset.label;
    b.onclick = () => {
      Object.assign(p, preset.values);
      refreshAll();
      handlers.rebuild();
      handlers.updateSim();
    };
    presetWrap.appendChild(b);
  });
  presetSec.appendChild(presetWrap);

  // ---- Secties uit het schema ----
  schema.forEach((sec) => {
    const el = section(sec.title, sec.num);

    if (sec.kind === 'style') {
      const seg = document.createElement('div');
      seg.className = 'seg';
      Object.entries(STYLE_LABELS).forEach(([key, label]) => {
        const b = document.createElement('button');
        b.textContent = label;
        b.dataset.style = key;
        if (p.style === key) b.classList.add('active');
        b.onclick = () => {
          p.style = key;
          seg.querySelectorAll('button').forEach((x) => x.classList.toggle('active', x.dataset.style === key));
          handlers.rebuild();
          handlers.updateSim();
        };
        seg.appendChild(b);
      });
      el.appendChild(seg);
      el._styleSeg = seg;
      return;
    }

    sec.items.forEach((item) => {
      const ctrl = document.createElement('div');
      ctrl.className = 'control';
      ctrl.innerHTML = `
        <div class="control-label">
          <span class="name">${item.label}</span>
          <span class="value">${fmtItem(item, p[item.key])}</span>
        </div>
        <input type="range" min="${item.min}" max="${item.max}" step="${item.step}" value="${p[item.key]}">`;
      el.appendChild(ctrl);
      const input = ctrl.querySelector('input');
      const valEl = ctrl.querySelector('.value');
      inputs[item.key] = input;
      valueEls[item.key] = { el: valEl, item };
      input.addEventListener('input', (e) => {
        const v = parseFloat(e.target.value);
        p[item.key] = v;
        valEl.textContent = fmtItem(item, v);
        if (SIM_ONLY.has(item.key)) handlers.updateSim();
        else { handlers.rebuild(); handlers.updateSim(); }
      });
    });
  });

  // ---- Weergave-toggles ----
  const viewSec = section('Weergave', '07');
  const collarRow = toggleRow('Toon houder + module', true, (on) => handlers.setCollarVisible(on));
  const bloomRow = toggleRow('Bloom (nacht)', p.bloom, (on) => { p.bloom = on; handlers.updateSim(); });
  viewSec.appendChild(collarRow);
  viewSec.appendChild(bloomRow);

  // ---- Kleuren ----
  const colorSec = section('Kleur', '08');
  colorSec.appendChild(swatchRow('LED', ledSwatches, p.ledColor, (hex) => { p.ledColor = hex; handlers.updateSim(); }));
  colorSec.appendChild(swatchRow('Kap', shadeSwatches, p.shadeColor, (hex) => { p.shadeColor = hex; handlers.updateSim(); }));

  // ---- Export ----
  const exportSec = section('Export', '09');
  exportSec.classList.add('actions');
  const mkBtn = (label, cls, fn) => {
    const b = document.createElement('button');
    b.className = `action${cls ? ' ' + cls : ''}`;
    b.textContent = label;
    b.onclick = fn;
    return b;
  };
  exportSec.appendChild(mkBtn('Exporteer LAMPION (vase) ↓', '', () => handlers.exportPart('kap')));
  exportSec.appendChild(mkBtn('Exporteer LED-HOUDER ↓', '', () => handlers.exportPart('houder')));
  exportSec.appendChild(mkBtn('Exporteer MEETIJKJE ↓', 'secondary', () => handlers.exportPart('meetijkje')));
  exportSec.appendChild(mkBtn('Valideer kap (manifold)', 'secondary', () => handlers.validate()));
  exportSec.appendChild(mkBtn('Terugzetten', 'secondary', () => { handlers.reset(); refreshAll(); }));

  const report = document.createElement('div');
  report.className = 'report';
  report.id = 'report';
  exportSec.appendChild(report);

  const note = document.createElement('div');
  note.className = 'note';
  note.innerHTML = '<b>Tip:</b> print eerst het <b>meetijkje</b> om de module-speling te kalibreren. ' +
    'De kap-export is een watertight solid — zet in de slicer <b>spiral/vase-mode</b> aan.';
  exportSec.appendChild(note);

  function refreshAll() {
    Object.keys(inputs).forEach((key) => {
      if (p[key] === undefined) return;
      inputs[key].value = p[key];
      const { el, item } = valueEls[key];
      el.textContent = fmtItem(item, p[key]);
    });
    // stijl-segment
    root.querySelectorAll('.seg button').forEach((b) => b.classList.toggle('active', b.dataset.style === p.style));
  }

  return { refreshAll, reportEl: report };
}

function toggleRow(label, initial, onChange) {
  const row = document.createElement('div');
  row.className = 'toggle-row';
  const span = document.createElement('span');
  span.textContent = label;
  const btn = document.createElement('button');
  let on = initial;
  const sync = () => { btn.textContent = on ? 'aan' : 'uit'; btn.classList.toggle('on', on); };
  sync();
  btn.onclick = () => { on = !on; sync(); onChange(on); };
  row.appendChild(span); row.appendChild(btn);
  return row;
}

function swatchRow(label, swatches, current, onPick) {
  const wrap = document.createElement('div');
  wrap.className = 'control';
  const lab = document.createElement('div');
  lab.className = 'control-label';
  lab.innerHTML = `<span class="name">${label}</span>`;
  const colors = document.createElement('div');
  colors.className = 'colors';
  swatches.forEach((c) => {
    const sw = document.createElement('div');
    sw.className = 'color' + (c.hex === current ? ' active' : '');
    sw.style.background = c.hex;
    sw.title = c.name;
    sw.onclick = () => {
      colors.querySelectorAll('.color').forEach((x) => x.classList.remove('active'));
      sw.classList.add('active');
      onPick(c.hex);
    };
    colors.appendChild(sw);
  });
  wrap.appendChild(lab); wrap.appendChild(colors);
  return wrap;
}
