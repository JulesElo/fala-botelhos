/* ==========================================================================
   Fala, Botelhos — mapa ilustrativo (SVG, fora de escala)
   Desenha a sede com os bairros, os distritos e os pontos dos pedidos.
   ========================================================================== */

const MAPA_CORES = {
  fundo: '#121215',
  rural: '#17171b',
  ruralLinha: '#1c1c21',
  sede: '#1a1a1f',
  borda: '#26262d',
  rua: '#2a2a31',
  avenida: '#37373f',
  rotulo: '#5c5c66',
  rotuloForte: '#8c8c96'
};

function mapSVG(opts) {
  const { pins = [], draft = null, pick = false, sel = null } = opts;
  const C = MAPA_CORES;
  let s = `<svg class="map${pick ? ' pick' : ''}" viewBox="0 0 1000 600" role="img" aria-label="Mapa ilustrativo de Botelhos e distritos">`;

  // zona rural
  s += `<rect width="1000" height="600" fill="${C.fundo}"/>`;
  [[150, 250, 120, 120], [40, 300, 90, 90], [30, 205, 70, 60], [180, 30, 100, 70]].forEach(r => {
    s += `<rect x="${r[0]}" y="${r[1]}" width="${r[2]}" height="${r[3]}" rx="6" fill="${C.rural}"/>`;
    for (let i = r[1] + 10; i < r[1] + r[3]; i += 12) s += `<line x1="${r[0] + 8}" y1="${i}" x2="${r[0] + r[2] - 8}" y2="${i}" stroke="${C.ruralLinha}" stroke-width="2"/>`;
  });

  // estradas para os distritos (saem pelo lado esquerdo da sede)
  s += `<path d="M320 85 C250 80 200 100 160 108" stroke="${C.avenida}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  s += `<path d="M320 520 C260 525 200 505 160 495" stroke="${C.avenida}" stroke-width="6" fill="none" stroke-linecap="round"/>`;

  // sede
  s += `<rect x="300" y="50" width="640" height="500" rx="28" fill="${C.sede}" stroke="${C.borda}"/>`;
  [400, 480, 560, 640, 720, 800, 880].forEach(x => s += `<line x1="${x}" y1="70" x2="${x}" y2="530" stroke="${C.rua}" stroke-width="4"/>`);
  [130, 210, 390, 470].forEach(y => s += `<line x1="320" y1="${y}" x2="920" y2="${y}" stroke="${C.rua}" stroke-width="4"/>`);

  // Rua Guanabara: do Jardim Eldorado em direção à saída para Palmeiral
  s += `<line x1="335" y1="120" x2="335" y2="520" stroke="${C.avenida}" stroke-width="5"/>`;
  s += `<text x="347" y="350" font-size="11" fill="${C.rotulo}" transform="rotate(-90 347 350)" text-anchor="middle">R. Guanabara</text>`;

  // avenida principal
  s += `<line x1="320" y1="300" x2="920" y2="300" stroke="${C.avenida}" stroke-width="10"/>`;
  s += `<text x="355" y="290" font-size="11.5" fill="${C.rotuloForte}">Av. Major Antônio A. Fernandes</text>`;

  // Praça da Matriz
  s += `<rect x="588" y="315" width="44" height="38" rx="5" fill="#22222a" stroke="${C.borda}"/>`;
  s += `<text x="610" y="368" font-size="10.5" text-anchor="middle" fill="${C.rotulo}">Praça da Matriz</text>`;

  // distritos
  [[110, 110], [110, 490]].forEach(([cx, cy]) => {
    s += `<circle cx="${cx}" cy="${cy}" r="58" fill="${C.sede}" stroke="${C.borda}"/>`;
    s += `<line x1="${cx - 45}" y1="${cy}" x2="${cx + 45}" y2="${cy}" stroke="${C.rua}" stroke-width="4"/>`;
    s += `<line x1="${cx}" y1="${cy - 45}" x2="${cx}" y2="${cy + 45}" stroke="${C.rua}" stroke-width="4"/>`;
  });
  s += `<text x="110" y="188" font-size="12" text-anchor="middle" font-weight="600" fill="${C.rotuloForte}">São Gonçalo de Botelhos</text>`;
  s += `<text x="110" y="420" font-size="12" text-anchor="middle" font-weight="600" fill="${C.rotuloForte}">Palmeiral</text>`;

  // nomes dos bairros
  const rot = [
    ['Jardim Eldorado', 450, 100], ['Santa Cruz', 830, 100], ['João Rocha', 860, 245],
    ['Jardim José Alexandre', 810, 530], ['Jardim Ipê', 600, 530], ['São Bento', 420, 530], ['Centro', 620, 255]
  ];
  rot.forEach(([n, x, y]) => s += `<text x="${x}" y="${y}" font-size="10.5" text-anchor="middle" fill="${C.rotulo}" font-weight="600" letter-spacing=".08em">${n.toUpperCase()}</text>`);

  // pontos dos pedidos
  pins.forEach(p => {
    const c = STATUS.find(x => x.id === p.status).color, on = sel === p.id;
    s += `<g class="pin" data-id="${p.id}" transform="translate(${p.x} ${p.y})" tabindex="0" role="button" aria-label="${esc(p.titulo)}">`;
    if (on) s += `<circle r="21" fill="${c}" opacity=".25"/>`;
    s += `<circle class="c" r="${on ? 12 : 10}" fill="${c}" stroke="${C.fundo}" stroke-width="3"/>`;
    if (p.copasa) s += `<circle cx="9" cy="-9" r="4.5" fill="var(--copasa)" stroke="${C.fundo}" stroke-width="2"/>`;
    s += `</g>`;
  });

  // marcador do novo pedido (tela Reportar)
  if (draft) s += `<g transform="translate(${draft.x} ${draft.y})"><circle r="22" fill="var(--pri)" opacity=".2"/><path d="M0 2 -11 -20a12 12 0 1 1 22 0z" fill="var(--pri)" stroke="${C.fundo}" stroke-width="2.5"/><circle cy="-24" r="4.5" fill="#fff"/></g>`;

  return s + `</svg>`;
}

// Bairro mais próximo de um ponto clicado (longe de todos = zona rural)
function bairroMaisProximo(x, y) {
  let best = 'Zona rural', d = Infinity;
  BAIRROS.forEach(b => {
    if (b.x == null) return;
    const dd = Math.hypot(b.x - x, b.y - y);
    if (dd < d) { d = dd; best = b.n; }
  });
  return d > 140 ? 'Zona rural' : best;
}
