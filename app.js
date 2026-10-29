'use strict';

// steps.json es la única fuente de la secuencia, las instrucciones y las zonas.
const byId = id => document.getElementById(id);
const escapeHtml = text => String(text).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const ui = Object.fromEntries(['surface', 'viewport', 'chapters', 'progress', 'progress-fill', 'step-count', 'percent', 'step-eyebrow', 'lesson-title', 'instruction', 'context-note', 'feedback', 'source-label', 'viewer-caption', 'example-note', 'back-button', 'repeat-button', 'hint-button', 'zoom-button', 'learning-layout', 'completion', 'announcer'].map(id => [id, byId(id)]));
const state = { index: 0, name: '', clipboard: '', zoomed: window.matchMedia('(max-width: 820px)').matches, renderVersion: 0, failedImage: false };
let configuration;
let resizeObserver;

const githubMark = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .75a11.25 11.25 0 0 0-3.56 21.92c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.71 2.64 1.22 3.28.93.1-.73.39-1.22.71-1.5-2.5-.28-5.13-1.25-5.13-5.57 0-1.23.44-2.23 1.16-3.02-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.1 1.15a10.8 10.8 0 0 1 5.64 0c2.15-1.45 3.1-1.15 3.1-1.15.61 1.55.23 2.7.11 2.98.72.79 1.16 1.79 1.16 3.02 0 4.33-2.64 5.28-5.15 5.56.41.35.77 1.03.77 2.08v3.11c0 .3.2.65.78.54A11.25 11.25 0 0 0 12 .75Z"/></svg>';
const lockMark = '<svg width="13" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><rect x="3" y="7" width="10" height="8" rx="1.5"/><path d="M5 7V4a3 3 0 0 1 6 0v3"/></svg>';

function sceneHeader(title, repository = false) {
  return `<div class="gh-header"><span class="hamburger">≡</span><span class="gh-logo">${githubMark}</span><span class="gh-head-title">${title}</span><span class="gh-head-spacer"></span><span class="gh-topicon">⌕</span><span class="gh-topicon">＋</span><span class="gh-topicon">◉</span><span class="gh-topicon">▣</span><span class="gh-avatar">biniac</span></div>${repository ? '<div class="gh-tabs"><span class="selected">〈〉 Code</span><span>◯ Issues</span><span>⑂ Pull requests</span><span>⊙ Actions</span><span>▦ Projects</span><span>♧ Security</span><span>⋯</span></div>' : ''}`;
}

function createScene(scene) {
  const isPrivate = scene === 'create-private';
  const menuOpen = scene === 'create-menu';
  return `<div class="recreation" aria-hidden="true">${sceneHeader('New repository')}
    <div class="gh-create-body"><h3>Create a new repository</h3><p class="gh-muted">Repositories contain a project's files and version history.</p>
      <div class="gh-section"><span class="gh-number">1</span> General</div>
      <div class="gh-form-content"><div class="gh-name-row"><div><span class="gh-label">Owner *</span><div class="gh-field gh-owner"><span class="gh-mini-avatar"></span> Biniac ▾</div></div><span class="gh-slash">/</span><div><span class="gh-label">Repository name *</span><div class="gh-field">${escapeHtml(state.name || configuration.practiceName)}</div></div></div><p class="gh-name-check">✓ ${escapeHtml(configuration.practiceName)} is available.</p><span class="gh-label">Description</span><div class="gh-field gh-description"></div></div>
      <div class="gh-section config-section"><span class="gh-number">2</span> Configuration</div><div class="gh-config">
        <div class="gh-config-row"><div><span class="gh-label">Choose visibility *</span><p class="gh-muted">Choose who can see and commit to this repository</p></div><span class="gh-fake-button" data-control="visibility">${isPrivate ? `${lockMark} Private` : '▣ Public'} ▾</span></div>
        ${menuOpen ? `<div class="gh-visibility-menu"><div class="gh-menu-heading">Choose visibility</div><div class="gh-option"><span>▣</span><div><strong>Public</strong><small>Anyone on the internet can see this repository.</small></div></div><div class="gh-option" data-control="private"><span>${lockMark}</span><div><strong>Private</strong><small>You choose who can see and commit to this repository.</small></div></div></div>` : ''}
        <div class="gh-config-row"><div><span class="gh-label">Add README</span><p class="gh-muted">READMEs can be used as longer descriptions.</p></div><span class="gh-toggle"></span></div><div class="gh-config-row"><div><span class="gh-label">Add .gitignore</span><p class="gh-muted">.gitignore tells git which files not to track.</p></div><span class="gh-fake-button">No .gitignore ▾</span></div>
      </div><div class="gh-create-actions"><span class="gh-green" data-control="create">Create repository</span></div><p class="gh-disclaimer">You are creating a ${isPrivate ? 'private' : 'public'} repository in your personal account.</p>
    </div></div>`;
}

function uploadScene(scene) {
  const ready = scene === 'upload-ready';
  return `<div class="recreation" aria-hidden="true">${sceneHeader('Biniac &nbsp; / &nbsp; test', true)}<div class="gh-upload-body ${ready ? 'ready' : ''}"><div class="gh-breadcrumb"><span class="gh-link">test</span><span class="gh-muted">/</span><span>Upload files</span></div><div class="gh-upload-zone"><span class="gh-upload-icon">⇧</span><div>Drag files here to add them to your repository</div><div class="gh-choose-line">Or <span class="gh-choose" data-control="choose-files">choose your files</span></div></div>
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

function showHint(prefix = '') {
  const step = currentStep();
  if (!step) return;
  ui.feedback.textContent = `${prefix}${step.hint}`;
  ui.surface.classList.remove('wrong-flash');
  void ui.surface.offsetWidth;
  ui.surface.classList.add('wrong-flash');
  centerAction();
}

function updateProgress() {
  const percent = Math.round(state.index / configuration.steps.length * 100);
  ui['step-count'].textContent = `Paso ${Math.min(state.index + 1, configuration.steps.length)} de ${configuration.steps.length}`;
  ui.percent.textContent = `${percent}%`;
  ui['progress-fill'].style.width = `${percent}%`;
  ui.progress.setAttribute('aria-valuenow', String(percent));
  ui.progress.setAttribute('aria-valuetext', `${state.index} de ${configuration.steps.length} acciones completadas`);
  ui.chapters.innerHTML = configuration.chapters.map((chapter, index) => {
    const indexes = configuration.steps.flatMap((step, position) => step.chapter === chapter.id ? [position] : []);
    const completed = state.index > Math.max(...indexes);
    const active = currentStep()?.chapter === chapter.id;
    return `<li class="chapter ${completed ? 'done' : active ? 'active' : ''}" ${active ? 'aria-current="step"' : ''}><span class="chapter-number" aria-label="${completed ? 'Completado' : `Objetivo ${index + 1}`}">${completed ? '✓' : `0${index + 1}`}</span><div class="chapter-text"><h3>${escapeHtml(chapter.title)}</h3><p>${escapeHtml(chapter.description)}</p></div></li>`;
  }).join('');
}

function render({ focus = true } = {}) {
  state.renderVersion += 1;
  const version = state.renderVersion;
  state.failedImage = false;
  updateProgress();
  const step = currentStep();
  const finished = !step;
  ui['learning-layout'].hidden = finished;
  ui.completion.hidden = !finished;
  if (finished) {
    byId('practice-clipboard').value = state.clipboard;
    ui.announcer.textContent = `Práctica completada. Has realizado las ${configuration.steps.length} acciones.`;
    if (focus) byId('complete-title').focus({ preventScroll: true });
    return;
  }

  const chapterIndex = configuration.chapters.findIndex(chapter => chapter.id === step.chapter);
  const chapterSteps = configuration.steps.filter(item => item.chapter === step.chapter);
  const chapterPosition = chapterSteps.findIndex(item => item.id === step.id) + 1;
  ui['step-eyebrow'].textContent = `OBJETIVO 0${chapterIndex + 1} · ACCIÓN ${chapterPosition} DE ${chapterSteps.length}`;
  ui['lesson-title'].textContent = step.title;
  ui.instruction.textContent = step.instruction;
  byId('mobile-step').textContent = `PASO ${state.index + 1} DE ${configuration.steps.length}`;
  byId('mobile-instruction').textContent = step.instruction;
  ui['context-note'].hidden = !step.context;
  ui['context-note'].textContent = step.context || '';
  ui.feedback.textContent = '';
  ui['back-button'].disabled = state.index === 0;
  ui['source-label'].textContent = step.source === 'original' ? 'GitHub · captura original' : 'GitHub · vista recreada';
  ui['viewer-caption'].textContent = step.kind === 'text' ? 'Escribe en la zona destacada y pulsa Enter.' : 'Selecciona la zona destacada para avanzar.';
  ui['example-note'].textContent = step.chapter === 'create' ? 'Práctica local: crearás un repositorio privado ficticio. Ninguna acción se envía a GitHub.' : 'Referencia visual: Biniac/test es público. La carga se simula y las capturas originales no cambian.';
  ui.surface.dataset.step = step.id;
  ui.surface.className = `screen-surface ${step.source === 'recreated' ? 'is-recreated' : ''}`;
  ui.surface.style.aspectRatio = `${step.width} / ${step.height}`;
  if (step.source === 'original') {
    ui.surface.innerHTML = `<img src="./${step.image}" alt="Captura original de GitHub: ${escapeHtml(step.title)}" width="${step.width}" height="${step.height}" draggable="false">`;
    const image = ui.surface.querySelector('img');
    image.addEventListener('load', () => { if (version === state.renderVersion) updateSize(); }, { once: true });
    image.addEventListener('error', () => {
      if (version !== state.renderVersion) return;
      state.failedImage = true;
      ui.surface.innerHTML = '<p class="image-error">No se pudo cargar esta captura.<br>Recarga la página para volver a intentarlo.</p>';
      ui.feedback.textContent = 'La práctica está en pausa porque falta la imagen. No avanzarás sin verla.';
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
    input.value = '';
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
    const surfaceBox = ui.surface.getBoundingClientRect();
    const controlBox = control.getBoundingClientRect();
    const scale = surfaceBox.width / step.width;
    bounds = { x: (controlBox.left - surfaceBox.left) / scale, y: (controlBox.top - surfaceBox.top) / scale, width: controlBox.width / scale, height: controlBox.height / scale };
  }
  target.style.left = `${bounds.x / step.width * 100}%`;
  target.style.top = `${bounds.y / step.height * 100}%`;
  target.style.width = `${bounds.width / step.width * 100}%`;
  target.style.height = `${bounds.height / step.height * 100}%`;
}

function updateSize() {
  if (!currentStep() || ui['learning-layout'].hidden) return;
  const step = currentStep();
  const available = ui.viewport.clientWidth;
  if (available <= 0) return;
  const surfaceWidth = state.zoomed ? Math.max(1435, available * 1.5) : available;
  ui.surface.style.width = `${surfaceWidth}px`;
  ui.surface.style.setProperty('--screen-scale', String(surfaceWidth / step.width));
  ui['zoom-button'].setAttribute('aria-pressed', String(state.zoomed));
  ui['zoom-button'].textContent = state.zoomed ? '⊖ Ver pantalla completa' : '⊕ Enfocar acción';
  positionTarget();
  centerAction();
}

function centerAction() {
  const target = byId('action-target');
  if (!target) return;
  const surfaceBox = ui.surface.getBoundingClientRect();
  const targetBox = target.getBoundingClientRect();
  ui.viewport.scrollLeft = state.zoomed ? targetBox.left - surfaceBox.left + targetBox.width / 2 - ui.viewport.clientWidth / 2 : 0;
  ui.viewport.scrollTop = Math.max(0, targetBox.top - surfaceBox.top + targetBox.height / 2 - ui.viewport.clientHeight / 2);
}

function advance() {
  if (state.failedImage || !currentStep()) return;
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
  if (!response.ok) throw new Error('No se pudo cargar steps.json');
  configuration = await response.json();
  validateConfiguration(configuration);
  for (const image of new Set(configuration.steps.filter(step => step.source === 'original').map(step => step.image))) {
    const preload = new Image();
    preload.src = `./${image}`;
  }
  ui.surface.addEventListener('click', event => {
    if (event.target.closest('#action-target')) return;
    showHint('Casi. ');
  });
  ui['back-button'].addEventListener('click', () => { if (state.index > 0) { state.index -= 1; render(); } });
  ui['repeat-button'].addEventListener('click', () => { render(); ui.feedback.textContent = 'Paso listo para repetir. Completa de nuevo la acción destacada.'; });
  ui['hint-button'].addEventListener('click', () => showHint());
  ui['zoom-button'].addEventListener('click', () => { state.zoomed = !state.zoomed; updateSize(); });
  byId('restart-button').addEventListener('click', () => byId('restart-dialog').showModal());
  byId('about-button').addEventListener('click', () => byId('about-dialog').showModal());
  byId('confirm-restart').addEventListener('click', restart);
  byId('again-button').addEventListener('click', restart);
  byId('review-button').addEventListener('click', () => { state.index = configuration.steps.length - 1; render(); });
  document.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => button.closest('dialog').close()));
  byId('reload-button').addEventListener('click', () => window.location.reload());
  resizeObserver = new ResizeObserver(updateSize);
  resizeObserver.observe(ui.viewport);
  render({ focus: false });
}

initialize().catch(error => {
  console.error('No se pudo iniciar la práctica:', error);
  ui['learning-layout'].hidden = true;
  byId('load-error').hidden = false;
  byId('reload-button').onclick = () => window.location.reload();
});
