/* ==========================================================================
   Fala, Botelhos — telas e interações
   Usa os dados de dados.js e o desenho de mapa.js.
   Nada é salvo: ao recarregar a página, tudo volta ao estado inicial.
   ========================================================================== */

// ---------- utilidades ----------
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const NIVEL = ['', 'baixo', 'médio', 'alto'];

const ICONS = {
  asfalto: '<path d="M5 21 9 3M19 21 15 3M12 5v2M12 11v2M12 17v2"/>',
  iluminacao: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  calcada: '<circle cx="11" cy="4" r="1.8"/><path d="M11 7v6h5l2 6M11 10h4M8.5 11.5a5 5 0 1 0 7 6"/>',
  bueiro: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  lixo: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  outro: '<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16v.5"/>'
};
const ic = (t, s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[t] || ICONS.outro}</svg>`;
const st = id => STATUS.find(s => s.id === id);
const hoje = () => { const d = new Date(); return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0'); };

function toast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('on');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('on'), 2600);
}

// Prioridade = impacto x3 + urgência x3 + apoios (no máximo +3)
function prioridade(p) {
  if (p.imp == null) return { nivel: 'aval', label: 'Em avaliação técnica', pts: null };
  const a = Math.min(3, Math.floor(p.apoios / 10));
  const pts = p.imp * 3 + p.urg * 3 + a;
  const nivel = pts >= 14 ? 'Alta' : pts >= 10 ? 'Média' : 'Baixa';
  return { nivel, label: 'Prioridade ' + nivel.toLowerCase(), pts, a };
}
const badgeSt = s => `<span class="badge st-${s}"><span class="dot"></span>${st(s).label}</span>`;
const badgePr = p => { const pr = prioridade(p); return `<span class="badge pr-${pr.nivel}">${pr.label}</span>`; };

// ==========================================================================
// MAPA DE PEDIDOS
// ==========================================================================
let fStatus = 'todos', fBairro = 'todos', selId = null;

function renderLegenda() {
  $('#legend').innerHTML = STATUS.map(s => `<span><i style="background:${s.color}"></i>${s.label}</span>`).join('') +
    `<span><i style="background:var(--copasa)"></i>COPASA</span>`;
}
function renderFiltros() {
  const opts = [{ id: 'todos', label: 'Todos' }].concat(STATUS);
  $('#f-status').innerHTML = opts.map(o => `<button class="chip${fStatus === o.id ? ' on' : ''}" data-s="${o.id}">${o.label}</button>`).join('');
  $('#f-bairro').innerHTML = `<option value="todos">Todos os bairros e distritos</option>` +
    BAIRROS.map(b => `<option${fBairro === b.n ? ' selected' : ''}>${b.n}</option>`).join('');
}
function filtrados() {
  return pedidos
    .filter(p => (fStatus === 'todos' || p.status === fStatus) && (fBairro === 'todos' || p.bairro === fBairro))
    .sort((a, b) => (a.status === 'resolvido') - (b.status === 'resolvido') ||
      (prioridade(b).pts ?? -1) - (prioridade(a).pts ?? -1) || b.id - a.id);
}
function renderMapa() {
  const list = filtrados();
  $('#map-main').innerHTML = mapSVG({ pins: list, sel: selId });
  $('#count').textContent = list.length + (list.length === 1 ? ' pedido' : ' pedidos') + ' · por prioridade';
  $('#list').innerHTML = list.length ? list.map(p => `
    <button class="item" data-id="${p.id}">
      <span class="ic">${ic(p.tipo)}</span>
      <span style="flex:1;min-width:0">
        <div class="t">${esc(p.titulo)}</div>
        <div class="m">${esc(p.end)} · ${esc(p.bairro)}</div>
        <div class="b">${badgeSt(p.status)}${p.status !== 'resolvido' ? badgePr(p) : ''}${p.copasa ? '<span class="badge tag-copasa">COPASA</span>' : ''}<span class="ap">▲ ${p.apoios}</span></div>
      </span>
    </button>`).join('') : `<div class="empty">Nenhum pedido com esses filtros.</div>`;
}

// ---------- detalhe do pedido ----------
const apoiados = new Set();

function abrir(id) {
  selId = id; renderMapa();
  const p = pedidos.find(x => x.id === id); if (!p) return;
  const pr = prioridade(p), idx = STATUS.findIndex(s => s.id === p.status);
  const tl = STATUS.map((s, i) => `<li class="${i <= idx ? 'done' : ''}">${s.label}<span>${p.hist[s.id] || '—'}</span></li>`).join('');

  let prBox;
  if (pr.pts == null) {
    prBox = `<div class="box"><b>Prioridade:</b> aguardando avaliação técnica. A equipe da prefeitura classifica o impacto e a urgência do problema.</div>`;
  } else {
    prBox = `<div class="box">
      <div class="prio-row"><b>Como a prioridade é calculada</b><span class="badge pr-${pr.nivel}">${pr.nivel}</span></div>
      <div class="prio-row"><span>Impacto: ${NIVEL[p.imp]}</span><span>+${p.imp * 3}</span></div>
      <div class="prio-row"><span>Urgência: ${NIVEL[p.urg]}</span><span>+${p.urg * 3}</span></div>
      <div class="prio-row"><span>Apoios dos moradores: ${p.apoios}</span><span>+${pr.a}</span></div>
      <div class="muted" style="font-size:12px;margin-top:6px">Os apoios contam, mas com peso limitado, para que bairros mais conectados não passem na frente dos mais afastados.</div>
    </div>`;
  }

  let extra = '';
  if (p.status === 'agendado' && p.agenda) extra += `<div class="box"><b>Serviço agendado para ${p.agenda}.</b> Você será avisado quando for concluído.</div>`;
  if (p.status === 'resolvido') {
    if (p.meu && !p.confirmado) extra += `<div class="confirm"><p>Você relatou este problema. Ele foi resolvido de verdade?</p><div class="actions"><button class="btn sm pri" data-act="ok">Sim, foi resolvido</button><button class="btn sm" data-act="nok">Não, o problema continua</button></div></div>`;
    else if (p.confirmado) extra += `<div class="box">✓ <b>Resolução confirmada pelo morador.</b> Resolvido em ${p.dias} dias.</div>`;
  }
  const origem = p.origem === 'presencial' ? 'Registrado em encontro presencial' : 'Enviado pelo aplicativo';

  $('#modal').innerHTML = `
    <div class="m-head"><span class="ic">${ic(p.tipo, 20)}</span>
      <div><small>Pedido nº ${p.id} · ${TIPOS[p.tipo].label}</small><h3>${esc(p.titulo)}</h3><div class="muted" style="font-size:13.5px">${esc(p.end)} · ${esc(p.bairro)}</div></div>
      <button class="x" data-act="fechar" aria-label="Fechar">×</button></div>
    <div class="m-body">
      <div class="photo">${p.foto ? `<img src="${p.foto}" alt="Foto do problema">` : 'Foto enviada pelo morador'}</div>
      <div class="tags">${badgeSt(p.status)}${p.copasa ? '<span class="badge tag-copasa">Responsabilidade da COPASA</span>' : ''}<span class="badge">${origem}</span></div>
      ${p.desc ? `<p class="desc">${esc(p.desc)}</p>` : ''}
      <ol class="timeline">${tl}</ol>
      ${extra}
      ${p.status !== 'resolvido' ? prBox : ''}
      <div class="actions"><button class="btn ${apoiados.has(p.id) ? 'on' : ''}" data-act="apoiar">▲ ${apoiados.has(p.id) ? 'Apoiado' : 'Apoiar'} · ${p.apoios}</button></div>
      ${p.status !== 'resolvido' ? `<div class="server"><span>Demonstração · visão do servidor da prefeitura:</span><button class="btn sm" data-act="avancar">Avançar para “${STATUS[idx + 1].label}”</button></div>` : ''}
    </div>`;
  $('#modal').dataset.id = id;
  $('#overlay').classList.add('on');
}
function fechar() { $('#overlay').classList.remove('on'); selId = null; renderMapa(); }

$('#overlay').addEventListener('click', e => {
  if (e.target.id === 'overlay') return fechar();
  const b = e.target.closest('[data-act]'); if (!b) return;
  const p = pedidos.find(x => x.id === +$('#modal').dataset.id);
  const a = b.dataset.act;
  if (a === 'fechar') return fechar();
  if (a === 'apoiar') {
    if (apoiados.has(p.id)) { apoiados.delete(p.id); p.apoios--; }
    else { apoiados.add(p.id); p.apoios++; toast('Apoio registrado. Você será avisado sobre o andamento.'); }
  }
  if (a === 'avancar') {
    const novo = STATUS[STATUS.findIndex(s => s.id === p.status) + 1].id;
    if (p.imp == null) { p.imp = TIPOS[p.tipo].imp; p.urg = TIPOS[p.tipo].urg; }
    p.status = novo; p.hist[novo] = hoje();
    if (novo === 'agendado') { const d = new Date(); d.setDate(d.getDate() + 5); p.agenda = d.toLocaleDateString('pt-BR'); }
    if (novo === 'resolvido') { p.dias = 4; p.confirmado = false; p.meu = true; }
    toast(novo === 'resolvido' ? 'Morador avisado: o problema foi marcado como resolvido.' : 'Status atualizado para “' + st(novo).label + '”. O morador recebe uma notificação.');
  }
  if (a === 'ok') { p.confirmado = true; toast('Obrigado! Resolução confirmada.'); }
  if (a === 'nok') {
    p.status = 'analise'; delete p.hist.agendado; delete p.hist.resolvido; p.hist.analise = hoje();
    toast('Pedido reaberto e devolvido para análise.');
  }
  abrir(p.id); renderTransp();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#overlay').classList.contains('on')) fechar(); });

$('#f-status').addEventListener('click', e => { const c = e.target.closest('.chip'); if (!c) return; fStatus = c.dataset.s; renderFiltros(); renderMapa(); });
$('#f-bairro').addEventListener('change', e => { fBairro = e.target.value; renderMapa(); });
$('#list').addEventListener('click', e => { const it = e.target.closest('.item'); if (it) abrir(+it.dataset.id); });
$('#map-main').addEventListener('click', e => { const g = e.target.closest('.pin'); if (g) abrir(+g.dataset.id); });
$('#map-main').addEventListener('keydown', e => { const g = e.target.closest('.pin'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); abrir(+g.dataset.id); } });

// ==========================================================================
// REPORTAR
// ==========================================================================
let rTipo = null, rPos = null, rFoto = null, nextId = Math.max(...pedidos.map(p => p.id)) + 1;

function renderTipos() {
  $('#types').innerHTML = Object.entries(TIPOS).map(([k, t]) => `<button type="button" class="type${rTipo === k ? ' on' : ''}" data-t="${k}">${ic(k, 20)}${t.label}</button>`).join('');
}
function renderPick() { $('#map-pick').innerHTML = mapSVG({ pick: true, draft: rPos }); }

$('#types').addEventListener('click', e => { const b = e.target.closest('.type'); if (!b) return; rTipo = b.dataset.t; renderTipos(); });
$('#map-pick').addEventListener('click', e => {
  const svg = e.target.closest('svg'); if (!svg) return;
  const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
  const p = pt.matrixTransform(svg.getScreenCTM().inverse());
  rPos = { x: Math.round(p.x), y: Math.round(p.y) };
  $('#r-bairro').value = bairroMaisProximo(rPos.x, rPos.y);
  renderPick();
});
$('#r-foto').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  const rd = new FileReader();
  rd.onload = () => { rFoto = rd.result; $('#upload-txt').innerHTML = `<img src="${rFoto}" alt="">Foto adicionada · toque para trocar`; };
  rd.readAsDataURL(f);
});
$('#rep-form').addEventListener('submit', e => {
  e.preventDefault();
  const err = $('#r-err');
  if (!rTipo) { err.textContent = 'Escolha o tipo de problema.'; err.style.display = 'block'; return; }
  if (!rPos) { err.textContent = 'Marque o local no mapa.'; err.style.display = 'block'; return; }
  err.style.display = 'none';
  const p = {
    id: nextId++, tipo: rTipo, titulo: TIPOS[rTipo].label, desc: $('#r-desc').value.trim(),
    end: $('#r-end').value.trim() || 'Local marcado no mapa', bairro: $('#r-bairro').value,
    x: rPos.x, y: rPos.y, status: 'recebido', copasa: $('#r-copasa').checked, imp: null, urg: null,
    apoios: 0, origem: 'app', hist: { recebido: hoje() }, foto: rFoto, meu: true
  };
  pedidos.unshift(p);
  $('#rep-form-wrap').hidden = true;
  const ok = $('#rep-ok'); ok.hidden = false;
  ok.innerHTML = `<div class="ok"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></div>
    <h2 style="font-size:20px">Pedido enviado</h2>
    <p class="muted" style="margin:6px 0 6px">Protocolo <span class="proto">FB-2026-${p.id}</span></p>
    <p class="muted" style="max-width:440px;margin:0 auto 22px">Seu pedido já aparece no mapa público. Você receberá um aviso a cada mudança de etapa${p.copasa ? ', e ele está marcado como responsabilidade da COPASA' : ''}.</p>
    <div class="actions" style="justify-content:center"><button class="btn pri" id="ver">Acompanhar pedido</button><button class="btn" id="novo">Reportar outro</button></div>`;
  $('#ver').onclick = () => { location.hash = 'mapa'; fStatus = 'todos'; fBairro = 'todos'; renderFiltros(); setTimeout(() => abrir(p.id), 30); };
  $('#novo').onclick = resetForm;
  renderMapa(); renderTransp();
});
function resetForm() {
  rTipo = rPos = rFoto = null;
  $('#rep-form').reset(); $('#upload-txt').textContent = 'Toque para tirar ou escolher uma foto';
  $('#rep-form-wrap').hidden = false; $('#rep-ok').hidden = true;
  renderTipos(); renderPick();
}

// ==========================================================================
// DECIDIR
// ==========================================================================
let meuVoto = null, escolha = null;
const sugApoio = new Set();

function renderConsulta() {
  const tot = OPCOES.reduce((s, o) => s + o.app + o.pres, 0);
  let h = `<span class="badge st-resolvido"><span class="dot"></span>Consulta aberta</span>
    <h2 style="margin:10px 0 2px;font-size:19px;letter-spacing:-.01em">Prioridades de investimento · 1º semestre de 2027</h2>
    <div class="muted" style="font-size:13.5px;margin-bottom:18px">Encerra em 30/11/2026 · ${tot} votos até agora</div>`;
  if (meuVoto == null) {
    h += `<p style="margin:0 0 12px">Qual destas obras deve ser feita primeiro?</p>`;
    h += OPCOES.map(o => `<label class="opt${escolha === o.id ? ' on' : ''}"><input type="radio" name="v" value="${o.id}"${escolha === o.id ? ' checked' : ''}><span><div class="t">${o.t}</div><div class="d">${o.d}</div><div class="o">${o.o}</div></span></label>`).join('');
    h += `<button class="btn pri" id="votar" style="margin-top:8px"${escolha ? '' : ' disabled'}>Confirmar voto</button>
      <p class="muted" style="font-size:12.5px;margin:12px 0 0">Um voto por morador. Votos dos encontros presenciais entram na mesma contagem.</p>`;
  } else {
    h += `<p style="margin:0 0 16px"><b>Obrigado por votar.</b> <span class="muted">Resultado parcial:</span></p>`;
    h += OPCOES.slice().sort((a, b) => (b.app + b.pres) - (a.app + a.pres)).map((o, i) => {
      const n = o.app + o.pres, pc = Math.round(n / tot * 100);
      return `<div class="res${meuVoto === o.id ? ' mine' : ''}"><div class="top"><b>${o.t}</b><span>${pc}%</span></div><div class="bar"><i class="${i ? 'dim' : ''}" style="width:0" data-w="${pc}"></i></div><div class="muted" style="font-size:12px;margin-top:4px">${n} votos · ${o.app} pelo aplicativo e ${o.pres} presenciais</div></div>`;
    }).join('');
    h += `<div class="resp">Ao final, a prefeitura publica o resultado e o que fará com ele. Se decidir de outra forma, precisa justificar publicamente.</div>`;
  }
  $('#consulta').innerHTML = h;
  requestAnimationFrame(() => document.querySelectorAll('#consulta .bar i[data-w]').forEach(i => i.style.width = i.dataset.w + '%'));
}
$('#consulta').addEventListener('change', e => { if (e.target.name === 'v') { escolha = e.target.value; renderConsulta(); } });
$('#consulta').addEventListener('click', e => {
  if (e.target.id !== 'votar' || !escolha) return;
  meuVoto = escolha; OPCOES.find(o => o.id === escolha).app++;
  renderConsulta(); renderTransp(); toast('Voto registrado.');
});

function renderSugs() {
  $('#sugs').innerHTML = sugestoes.map((s, i) => ({ s, i })).sort((a, b) => b.s.ap - a.s.ap)
    .map(({ s, i }) => `<li><span>${esc(s.t)}</span><button class="btn sm ${sugApoio.has(i) ? 'on' : ''}" data-i="${i}">▲ ${s.ap}</button></li>`).join('');
}
$('#sug-form').addEventListener('submit', e => {
  e.preventDefault(); const t = $('#sug-txt').value.trim(); if (!t) return;
  sugestoes.push({ t, ap: 1 }); sugApoio.add(sugestoes.length - 1); $('#sug-txt').value = '';
  renderSugs(); toast('Sugestão enviada.');
});
$('#sugs').addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return; const i = +b.dataset.i;
  if (sugApoio.has(i)) { sugApoio.delete(i); sugestoes[i].ap--; } else { sugApoio.add(i); sugestoes[i].ap++; }
  renderSugs();
});

function renderAnterior() {
  const c = CONSULTA_ANTERIOR;
  $('#anterior').innerHTML = `<h2>${c.titulo}</h2>` +
    c.opcoes.map((o, i) => `<div class="res"><div class="top">${i ? `<span>${o.t}</span>` : `<b>${o.t}</b>`}<span>${o.pc}%</span></div><div class="bar"><i class="${i ? 'dim' : ''}" style="width:${o.pc}%"></i></div></div>`).join('') +
    `<p class="muted" style="font-size:12.5px;margin:0">${c.participantes}</p>` +
    c.respostas.map(r => `<div class="resp${r.tipo === 'warn' ? ' warn' : ''}">${r.texto}</div>`).join('');
}

// ==========================================================================
// TRANSPARÊNCIA
// ==========================================================================
function renderTransp() {
  const tot = pedidos.length;
  const res = pedidos.filter(p => p.status === 'resolvido');
  const conf = res.filter(p => p.confirmado).length;
  const media = res.length ? res.reduce((s, p) => s + (p.dias || 0), 0) / res.length : 0;
  const cop = pedidos.filter(p => p.copasa);
  const copOk = cop.filter(p => p.status === 'resolvido' && (p.dias || 0) <= 15).length;
  const tile = (k, v, n) => `<div class="card tile"><div class="k">${k}</div><div class="v">${v}</div><div class="n">${n}</div></div>`;
  $('#tiles').innerHTML =
    tile('Pedidos registrados', tot, 'desde o início do piloto') +
    tile('Resolvidos', Math.round(res.length / tot * 100) + '%', `${res.length} pedidos · ${conf} confirmados pelo morador`) +
    tile('Tempo médio', media.toFixed(1).replace('.', ',') + ' dias', 'do registro à resolução') +
    tile('Pedidos da COPASA', `${copOk} de ${cop.length}`, 'resolvidos no prazo de 15 dias');

  const by = {}; BAIRROS.forEach(b => by[b.n] = 0); pedidos.forEach(p => by[p.bairro]++);
  const max = Math.max(...Object.values(by), 1);
  $('#by-bairro').innerHTML = Object.entries(by).sort((a, b) => b[1] - a[1]).map(([n, v]) =>
    `<div class="hbar"><span>${n}</span><div class="bar"><i style="width:${v / max * 100}%"></i></div><b>${v}</b></div>`).join('') +
    `<p class="muted" style="font-size:12.5px;margin:12px 0 0">Bairros com poucos pedidos recebem reforço na divulgação e nos encontros presenciais.</p>`;

  const app = pedidos.filter(p => p.origem === 'app').length, pres = tot - app;
  const vApp = OPCOES.reduce((s, o) => s + o.app, 0), vPres = OPCOES.reduce((s, o) => s + o.pres, 0);
  const linha = (t, a, b) => {
    const pa = Math.round(a / (a + b) * 100);
    return `<div style="font-size:13.5px;font-weight:600">${t}</div>
      <div class="split"><i style="width:${pa}%;background:var(--pri)"></i><i style="width:${100 - pa}%;background:#4a4a53"></i></div>
      <div class="legend" style="margin-bottom:16px"><span><i style="background:var(--pri)"></i>Aplicativo: ${a} (${pa}%)</span><span><i style="background:#4a4a53"></i>Presencial: ${b} (${100 - pa}%)</span></div>`;
  };
  $('#canal').innerHTML = linha('Pedidos', app, pres) + linha('Votos na consulta atual', vApp, vPres);
}
function renderEncontros() {
  $('#encontros').innerHTML = ENCONTROS.map(e => `<div class="meet"><div class="dt">${e.dia}<small>${e.mes}</small></div><div><b>${e.lugar}</b><br><span class="muted">${e.local}</span></div></div>`).join('');
}

// ==========================================================================
// NAVEGAÇÃO ENTRE AS TELAS (#mapa, #reportar, #decidir, #transparencia)
// ==========================================================================
const VIEWS = ['mapa', 'reportar', 'decidir', 'transparencia'];
function rota() {
  const v = VIEWS.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'mapa';
  VIEWS.forEach(x => $('#v-' + x).classList.toggle('on', x === v));
  document.querySelectorAll('nav a').forEach(a => a.classList.toggle('on', a.dataset.v === v));
  if ($('#overlay').classList.contains('on')) fechar();
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', rota);

// ---------- início ----------
$('#r-bairro').innerHTML = BAIRROS.map(b => `<option>${b.n}</option>`).join('');
renderLegenda(); renderFiltros(); renderMapa(); renderTipos(); renderPick();
renderConsulta(); renderSugs(); renderAnterior(); renderTransp(); renderEncontros(); rota();
