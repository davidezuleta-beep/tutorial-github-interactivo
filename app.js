'use strict';

// steps.json es la única fuente de la secuencia, las instrucciones y las zonas.
const byId = id => document.getElementById(id);
const escapeHtml = text => String(text).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const ui = Object.fromEntries(['surface', 'viewport', 'guide', 'progress', 'progress-fill', 'step-count', 'chapter-label', 'lesson-title', 'instruction', 'context-note', 'feedback', 'source-label', 'back-button', 'repeat-button', 'hint-button', 'zoom-button', 'completion', 'announcer'].map(id => [id, byId(id)]));
const state = { index: 0, name: '', clipboard: '', overview: false, renderVersion: 0, failedImage: false };
let configuration;
let resizeObserver;

const lockMark = '<svg width="13" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="3" y="7" width="10" height="8" rx="1.5"/><path d="M5 7V4a3 3 0 0 1 6 0v3"/></svg>';

function createScene(scene) {
  const isPrivate = scene === 'create-private';
  const menuOpen = scene === 'create-menu';
  return `<div class="recreation create-recreation" aria-hidden="true"><img class="gh-create-original" src="./assets/screenshots/07_nuevo_repositorio.png" alt="" width="879" height="513"><span class="gh-entered-name">${escapeHtml(state.name || configuration.practiceName)}</span><div class="gh-config gh-config-continuation"><div class="gh-config-row"><div><span class="gh-label">Choose visibility *</span><p class="gh-muted">Choose who can see and commit to this repository</p></div><span class="gh-fake-button" data-control="visibility">${isPrivate ? `${lockMark} Private` : '▣ Public'} ▾</span></div>${menuOpen ? `<div class="gh-visibility-menu"><div class="gh-menu-heading">Choose visibility</div><div class="gh-option"><span>▣</span><div><strong>Public</strong><small>Anyone on the internet can see this repository.</small></div></div><div class="gh-option" data-control="private"><span>${lockMark}</span><div><strong>Private</strong><small>You choose who can see and commit to this repository.</small></div></div></div>` : ''}<div class="gh-config-row"><div><span class="gh-label">Add README</span><p class="gh-muted">READMEs can be used as longer descriptions.</p></div><span class="gh-toggle"></span></div><div class="gh-config-row"><div><span class="gh-label">Add .gitignore</span><p class="gh-muted">.gitignore tells git which files not to track.</p></div><span class="gh-fake-button">No .gitignore ▾</span></div></div><div class="gh-create-actions gh-create-confirm"><span class="gh-green" data-control="create">Create repository</span></div></div>`;
}

function uploadScene(scene) {
  const ready = scene === 'upload-ready';
  return `<div class="recreation" aria-hidden="true"><div class="gh-upload-header"><img src="./assets/screenshots/02_repositorio.png" alt="" width="879" height="513"></div><div class="gh-upload-body ${ready ? 'ready' : ''}"><div class="gh-breadcrumb"><span class="gh-link">test</span><span class="gh-muted">/</span><span>Upload files</span></div><div class="gh-upload-zone"><span class="gh-upload-icon">⇧</span><div>Drag files here to add them to your repository</div><div class="gh-choose-line">Or <span class="gh-choose" data-control="choose-files">choose your files</span></div></div>
    ${ready ? '<div class="gh-file-list"><div class="gh-file-row">▤ <span>index.html</span><span class="gh-file-ok">✓ Ready</span></div><div class="gh-file-row">▤ <span>estilos.css</span><span class="gh-file-ok">✓ Ready</span></div><div class="gh-file-row">▤ <span>README.md</span><span class="gh-file-ok">✓ Ready</span></div></div>' : ''}
    <div class="gh-commit-panel"><h3>Commit changes</h3><div class="gh-field gh-commit-message">${ready ? 'Carga inicial del proyecto' : 'Add files via upload'}</div><div class="gh-field gh-commit-description">Add an optional extended description…</div><div class="gh-radio-row"><span class="gh-radio"></span> Commit directly to the <strong>main</strong> branch.</div></div><div class="gh-upload-actions"><span class="gh-green" data-control="commit">Commit changes</span><span class="gh-fake-button gh-cancel">Cancel</span></div></div></div>`;
}

function validateConfiguration(data) {
  if (!data || !Array.isArray(data.steps) || !data.steps.length || !Array.isArray(data.chapters)) throw new Error('Estructura de pasos no válida');
  const ids = new Set();
  for (const step of data.steps) {
    if (ids.has(step.id) || !data.chapters.some(chapter => chapter.id === step.chapter)) throw new Error('Identificador de paso o capítulo no válido');
    ids.add(step.id);
    if (!step.title || !step.instruction || !step.label || !step.width || !step.height) throw new Error('Paso incompleto');
    if (step.source === 'original') {
      if (!/^assets\/screenshots\/[a-zA-Z0-9_-]+\.png$/.test(step.image)) throw new Error('Ruta de imagen no válida');
      const target = step.target;
      if (!target || target.x < 0 || target.y < 0 || target.width <= 0 || target.height <= 0 || target.x + target.width > step.width || target.y + target.height > step.height) throw new Error('Zona clicable fuera de la imagen');
    } else if (step.source !== 'recreated' || !['create-public', 'create-menu', 'create-private', 'upload-empty', 'upload-ready'].includes(step.scene)) throw new Error('Vista recreada no reconocida');
  }
}

function currentStep() { return configuration.steps[state.index]; }

function updateProgress() {
  const total = configuration.steps.length;
  const percent = Math.round(state.index / total * 100);
  ui['step-count'].textContent = `${Math.min(state.index + 1, total)} / ${total}`;
  byId('player-count').textContent = `${Math.min(state.index + 1, total)}/${total}`;
  ui['progress-fill'].style.width = `${percent}%`;
  ui.progress.setAttribute('aria-valuenow', String(percent));
  ui.progress.setAttribute('aria-valuetext', `${state.index} de ${total} acciones completadas`);
}

function showHint(prefix = '') {
  if (!currentStep()) return;
  ui.feedback.textContent = `${prefix}${currentStep().hint}`;
  centerAction();
  positionGuide();
}

function render({ focus = true } = {}) {
  const version = ++state.renderVersion;
  state.failedImage = false;
  updateProgress();
  const step = currentStep();
  ui.guide.hidden = !step;
  ui.completion.hidden = !!step;
  byId('player').hidden = !step;
  ui['source-label'].hidden = !step;
  if (!step) {
    const target = byId('action-target');
    if (target) target.hidden = true;
    byId('practice-clipboard').value = state.clipboard;
    document.querySelector('.completion-kicker').textContent = `${configuration.steps.length} DE ${configuration.steps.length} · COMPLETADO`;
    ui.announcer.textContent = `Tutorial completado: ${configuration.steps.length} acciones.`;
    if (focus) byId('complete-title').focus({ preventScroll: true });
    return;
  }

  ui.guide.classList.remove('is-positioned');
  ui['chapter-label'].textContent = configuration.chapters.find(chapter => chapter.id === step.chapter).title;
  ui['lesson-title'].textContent = step.title;
  ui.instruction.textContent = step.instruction;
  ui['context-note'].textContent = step.context || '';
  const showContext = ['add-files-menu', 'choose-files'].includes(step.id);
  ui['context-note'].hidden = !showContext;
  byId('context-button').setAttribute('aria-expanded', String(showContext));
  ui.feedback.textContent = '';
  ui['back-button'].disabled = state.index === 0;
  ui['source-label'].textContent = step.source === 'original' ? 'Práctica · Captura original' : 'Práctica · Vista recreada';
  byId('action-cue').textContent = step.kind === 'text' ? 'Escribe el nombre en GitHub y pulsa Enter' : 'Haz clic en la zona destacada para avanzar';
  ui.surface.dataset.step = step.id;
  ui.surface.className = `screen-surface ${step.source === 'recreated' ? 'is-recreated' : ''}`;
  ui.surface.style.aspectRatio = `${step.width} / ${step.height}`;
  if (step.source === 'original') {
    ui.surface.innerHTML = `<img src="./${step.image}" alt="GitHub: ${escapeHtml(step.title)}" width="${step.width}" height="${step.height}" draggable="false">`;
    const image = ui.surface.querySelector('img');
    image.addEventListener('load', () => { if (version === state.renderVersion) updateSize(); }, { once: true });
    image.addEventListener('error', () => {
      if (version !== state.renderVersion) return;
      state.failedImage = true;
      ui.surface.innerHTML = '<p class="image-error">No se pudo cargar la captura. Recarga la página para intentarlo de nuevo.</p>';
      ui.feedback.textContent = 'La práctica está en pausa hasta que cargue la imagen.';
      ui.guide.style.left = '20px';
      ui.guide.style.top = '60px';
      ui.guide.classList.add('is-positioned');
    }, { once: true });
  } else {
    ui.surface.innerHTML = step.scene.startsWith('create-') ? createScene(step.scene) : uploadScene(step.scene);
    ui.surface.querySelector('.recreation').style.height = `${step.height}px`;
  }

  const target = document.createElement(step.kind === 'text' ? 'form' : 'button');
  target.id = 'action-target';
  target.className = `hotspot ${step.kind === 'text' ? 'text-hotspot' : ''}`;
  target.setAttribute('aria-describedby', 'instruction context-note');
  if (step.kind === 'text') {
    target.setAttribute('aria-label', 'Nombre del repositorio de práctica');
    const input = document.createElement('input');
    input.id = 'repository-name-input';
    input.type = 'text';
    input.setAttribute('aria-label', step.label);
    input.setAttribute('aria-describedby', 'instruction feedback');
    input.autocomplete = 'off';
    input.autocapitalize = 'none';
    input.spellcheck = false;
    input.maxLength = 100;
    input.enterKeyHint = 'go';
    target.appendChild(input);
    target.addEventListener('submit', event => {
      event.preventDefault();
      if (input.value.trim() !== configuration.practiceName) {
        showHint(`Usa «${configuration.practiceName}». `);
        input.focus({ preventScroll: true });
        return;
      }
      state.name = input.value.trim();
      advance();
    });
  } else {
    target.type = 'button';
    target.setAttribute('aria-label', step.label);
    target.addEventListener('click', event => { event.stopPropagation(); advance(); });
  }
  const marker = document.createElement('span');
  marker.className = 'target-marker';
  marker.setAttribute('aria-hidden', 'true');
  marker.textContent = String(state.index + 1);
  target.appendChild(marker);
  ui.surface.appendChild(target);
  requestAnimationFrame(() => { if (version === state.renderVersion) updateSize(); });
  if (focus) ui['lesson-title'].focus({ preventScroll: true });
  ui.announcer.textContent = `Paso ${state.index + 1} de ${configuration.steps.length}. ${step.instruction}`;
}

function positionTarget() {
  const step = currentStep();
  const target = byId('action-target');
  if (!step || !target || state.failedImage) return;
  let bounds = step.target;
  if (step.source === 'recreated') {
    const control = ui.surface.querySelector(step.selector);
    if (!control) throw new Error(`Falta el control de ${step.id}`);
    const surface = ui.surface.getBoundingClientRect();
    const box = control.getBoundingClientRect();
    const scale = surface.width / step.width;
    bounds = { x: (box.left - surface.left) / scale, y: (box.top - surface.top) / scale, width: box.width / scale, height: box.height / scale };
  }
  Object.assign(target.style, { left: `${bounds.x / step.width * 100}%`, top: `${bounds.y / step.height * 100}%`, width: `${bounds.width / step.width * 100}%`, height: `${bounds.height / step.height * 100}%` });
}

function updateSize() {
  const step = currentStep();
  if (!step || state.failedImage) return;
  const available = ui.viewport.clientWidth;
  let width = state.overview ? available : Math.max(available, available <= 700 ? 1055 : step.width);
  if (!state.overview && available <= 700 && step.kind === 'text') {
    width = Math.max(available, (available - 36) * step.width / step.target.width);
  }
  ui.surface.style.width = `${width}px`;
  ui.surface.style.setProperty('--screen-scale', String(width / step.width));
  ui['zoom-button'].setAttribute('aria-pressed', String(state.overview));
  ui['zoom-button'].setAttribute('aria-label', state.overview ? 'Enfocar acción' : 'Ver imagen completa');
  ui['zoom-button'].title = state.overview ? 'Enfocar acción' : 'Ver imagen completa';
  positionTarget();
  centerAction();
  positionGuide();
}

function centerAction() {
  const target = byId('action-target');
  if (!target || target.hidden) return;
  const surface = ui.surface.getBoundingClientRect();
  const box = target.getBoundingClientRect();
  const mobile = ui.viewport.clientWidth <= 700;
  const reserved = mobile ? ui.guide.offsetHeight + 100 : 90;
  const usableHeight = Math.max(160, ui.viewport.clientHeight - reserved);
  const targetY = box.top - surface.top + box.height / 2;
  const desiredY = Math.max(60, usableHeight * (mobile ? .43 : .38));
  ui.viewport.scrollLeft = state.overview ? 0 : Math.max(0, box.left - surface.left + box.width / 2 - ui.viewport.clientWidth / 2);
  ui.viewport.scrollTop = Math.max(0, targetY - desiredY);
}

const clamp = (value, low, high) => Math.min(Math.max(value, low), Math.max(low, high));

function positionGuide() {
  const target = byId('action-target');
  if (!currentStep() || !target || state.failedImage) return;
  const viewport = ui.viewport.getBoundingClientRect();
  const box = target.getBoundingClientRect();
  const width = ui.guide.offsetWidth;
  const height = ui.guide.offsetHeight;
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  const cx = box.left + box.width / 2;
  const cy = box.top + box.height / 2;
  ui.guide.dataset.offscreen = String(box.bottom < 0 || box.top > viewport.height || box.right < 0 || box.left > viewport.width);
  if (vw <= 700) {
    ui.guide.dataset.placement = 'mobile';
    ui.guide.classList.add('is-positioned');
    return;
  }
  const margin = 18;
  const candidates = [
    { placement: 'below', x: cx - width / 2, y: box.bottom + margin },
    { placement: 'above', x: cx - width / 2, y: box.top - height - margin },
    { placement: 'left', x: box.left - width - margin, y: cy - height / 2 },
    { placement: 'right', x: box.right + margin, y: cy - height / 2 }
  ].map((candidate, index) => {
    const x = clamp(candidate.x, 14, vw - width - 14);
    const y = clamp(candidate.y, 14, vh - height - 77);
    const overlap = Math.max(0, Math.min(x + width, box.right) - Math.max(x, box.left)) * Math.max(0, Math.min(y + height, box.bottom) - Math.max(y, box.top));
    return { ...candidate, x, y, score: overlap * 100 + Math.abs(x - candidate.x) + Math.abs(y - candidate.y) + index * 6 };
  }).sort((a, b) => a.score - b.score);
  const choice = candidates[0];
  ui.guide.dataset.placement = choice.placement;
  ui.guide.style.left = `${choice.x}px`;
  ui.guide.style.top = `${choice.y}px`;
  ui.guide.style.setProperty('--arrow-x', `${clamp(cx - choice.x - 6, 16, width - 28)}px`);
  ui.guide.style.setProperty('--arrow-y', `${clamp(cy - choice.y - 6, 16, height - 28)}px`);
  ui.guide.classList.add('is-positioned');
}

function advance() {
  if (!currentStep() || state.failedImage) return;
  if (currentStep().id === 'copy-url') state.clipboard = configuration.referenceUrl;
  state.index += 1;
  render();
}

function restart() {
  state.index = 0;
  state.name = '';
  state.clipboard = '';
  byId('restart-dialog').close();
  render();
}

async function initialize() {
  const response = await fetch('./steps.json', { cache: 'no-cache' });
  if (!response.ok) throw new Error('No se pudo cargar la secuencia');
  configuration = await response.json();
  validateConfiguration(configuration);
  for (const image of new Set(configuration.steps.filter(step => step.source === 'original').map(step => step.image))) {
    const preload = new Image();
    preload.src = `./${image}`;
  }
  ui.surface.addEventListener('click', event => { if (!event.target.closest('#action-target')) showHint('Casi. '); });
  ui['back-button'].addEventListener('click', () => { if (state.index > 0) { state.index -= 1; render(); } });
  ui['repeat-button'].addEventListener('click', () => { render(); ui.feedback.textContent = 'Vuelve a completar la acción destacada.'; requestAnimationFrame(updateSize); });
  ui['hint-button'].addEventListener('click', () => showHint());
  ui['zoom-button'].addEventListener('click', () => { state.overview = !state.overview; updateSize(); });
  byId('context-button').addEventListener('click', () => {
    ui['context-note'].hidden = !ui['context-note'].hidden;
    byId('context-button').setAttribute('aria-expanded', String(!ui['context-note'].hidden));
    centerAction(); positionGuide();
  });
  byId('restart-button').addEventListener('click', () => byId('restart-dialog').showModal());
  byId('about-button').addEventListener('click', () => byId('about-dialog').showModal());
  byId('confirm-restart').addEventListener('click', restart);
  byId('again-button').addEventListener('click', restart);
  byId('review-button').addEventListener('click', () => { state.index = configuration.steps.length - 1; render(); });
  document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  byId('reload-button').addEventListener('click', () => window.location.reload());
  let scrollFrame;
  ui.viewport.addEventListener('scroll', () => { cancelAnimationFrame(scrollFrame); scrollFrame = requestAnimationFrame(positionGuide); }, { passive: true });
  resizeObserver = new ResizeObserver(updateSize);
  resizeObserver.observe(ui.viewport);
  const guideObserver = new ResizeObserver(positionGuide);
  guideObserver.observe(ui.guide);
  render({ focus: false });
}

initialize().catch(error => {
  console.error('No se pudo iniciar la demo:', error);
  ui.guide.hidden = true;
  byId('player').hidden = true;
  byId('load-error').hidden = false;
  byId('reload-button').onclick = () => window.location.reload();
});
