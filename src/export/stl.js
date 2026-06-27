// STL-export per onderdeel (binair) + aanbevolen printinstellingen per onderdeel.

import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';

export function exportSTL(geometry, filename) {
  const mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
  const data = new STLExporter().parse(mesh, { binary: true });
  const blob = new Blob([data], { type: 'model/stl' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Aanbevolen printinstellingen, afgeleid van de parameters.
export function printSettings(p) {
  const nozzleHint = p.wallThickness <= 0.7 ? '0,4 mm' : p.wallThickness <= 1.1 ? '0,4–0,6 mm' : '0,6 mm';
  return {
    kap: {
      title: 'KAP — vase / spiral-mode',
      lines: [
        ['Modus', 'Spiral vase / Spiralize outer contour AAN'],
        ['Wanddikte', `${p.wallThickness.toFixed(2)} mm = 1 perimeter (nozzle ${nozzleHint})`],
        ['Laaghoogte', '0,20–0,28 mm'],
        ['Bodemlagen', '4–5 (massieve bodem)'],
        ['Toplagen', '0 (open top in vase-mode)'],
        ['Infill', '0 %'],
        ['Supports', 'geen'],
        ['Materiaal', 'wit/naturel PLA of PETG (warmste gloed)'],
      ],
    },
    kraag: {
      title: 'KRAAG — normaal geprint',
      lines: [
        ['Modus', 'Normaal (perimeters + bodemlagen)'],
        ['Oriëntatie', 'platte ring op het bed, clips omhoog'],
        ['Perimeters', '3'],
        ['Laaghoogte', '0,16–0,20 mm (nette clips)'],
        ['Infill', '20–30 %'],
        ['Supports', 'geen — griplip-overhang is bridgebaar'],
        ['Materiaal', 'PETG aanbevolen (clips minder bros dan PLA)'],
      ],
    },
    meetijkje: {
      title: 'MEETIJKJE — clip-ring testprint',
      lines: [
        ['Doel', 'kalibreer module-speling vóór de volledige print'],
        ['Modus', 'Normaal, zelfde instellingen als de kraag'],
        ['Materiaal', 'zelfde als kraag (PETG)'],
        ['Test', 'klikt de J1701 vast met lichte klik? Zo niet → pas "Speling module" aan'],
      ],
    },
  };
}
