'use strict';

const $ = id => document.getElementById(id);
const html = value => String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[character]);
const copy = value => JSON.parse(JSON.stringify(value));
const ui = Object.fromEntries(['viewport','github-app','focus-ring','focus-number','guide','step-count','chapter-label','lesson-title','instruction','context-note','feedback','back-button','progress','progress-fill','player-count','player','completion','announcer'].map(id => [id, $(id)]));
let configuration;
const state = {index:0, model:null, history:[], version:0};

const paths = {
  github:'M12 .75a11.25 11.25 0 0 0-3.56 21.92c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.72 1.16 1.72 1.16 1 1.71 2.64 1.22 3.28.93.1-.73.39-1.22.71-1.5-2.5-.28-5.13-1.25-5.13-5.57 0-1.23.44-2.23 1.16-3.02-.12-.28-.5-1.43.11-2.98 0 0 .95-.3 3.1 1.15a10.8 10.8 0 0 1 5.64 0c2.15-1.45 3.1-1.15 3.1-1.15.61 1.55.23 2.7.11 2.98.72.79 1.16 1.79 1.16 3.02 0 4.33-2.64 5.28-5.15 5.56.41.35.77 1.03.77 2.08v3.11c0 .3.2.65.78.54A11.25 11.25 0 0 0 12 .75Z',
  menu:'M1 3h14v1.5H1zm0 4.25h14v1.5H1zm0 4.25h14V13H1z',
  plus:'M7.25 1h1.5v6.25H15v1.5H8.75V15h-1.5V8.75H1v-1.5h6.25z',
  search:'M6.5 0a6.5 6.5 0 1 0 4 11.62L14.38 15.5l1.06-1.06-3.88-3.88A6.5 6.5 0 0 0 6.5 0Zm0 1.5a5 5 0 1 1 0 10 5 5 0 0 1 0-10Z',
  code:'m5.72 3.22 1.06 1.06L3.06 8l3.72 3.72-1.06 1.06L1.47 8.53a.75.75 0 0 1 0-1.06Zm4.56 0 4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25-1.06-1.06L12.94 8 9.22 4.28Z',
  chevron:'m4 5.5 4 4 4-4 1.06 1.06-4.53 4.53a.75.75 0 0 1-1.06 0L2.94 6.56Z',
  issue:'M8 .5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Zm0 1.5a6 6 0 1 1 0 12A6 6 0 0 1 8 2Zm0 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z',
  branch:'M4 1a2.5 2.5 0 0 0-.75 4.88v4.24a2.5 2.5 0 1 0 1.5 0V9.5H10A2.75 2.75 0 0 0 12.75 6.75V5.88a2.5 2.5 0 1 0-1.5 0v.87C11.25 7.44 10.69 8 10 8H4.75V5.88A2.5 2.5 0 0 0 4 1Zm0 1.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm8 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm-8 9a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z',
  pull:'M4 1a2.5 2.5 0 0 0-.75 4.88v4.24a2.5 2.5 0 1 0 1.5 0V5.88A2.5 2.5 0 0 0 4 1Zm0 1.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm0 9a1 1 0 1 1 0 2 1 1 0 0 1 0-2ZM9.53 1.22l-3 3a.75.75 0 0 0 0 1.06l3 3 1.06-1.06L8.87 5.5H11a1.75 1.75 0 0 1 1.75 1.75v2.87a2.5 2.5 0 1 0 1.5 0V7.25A3.25 3.25 0 0 0 11 4H8.87l1.72-1.72Zm4 10.28a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z',
  play:'M8 .5a7.5 7.5 0 1 0 0 15 7.5 7.5 0 0 0 0-15Zm0 1.5a6 6 0 1 1 0 12A6 6 0 0 1 8 2Zm-1.5 2.5v7L11 8Z',
  grid:'M1 1h14v14H1Zm1.5 1.5v4.75h4.75V2.5ZM8.75 2.5v4.75h4.75V2.5ZM2.5 8.75v4.75h4.75V8.75Zm6.25 0v4.75h4.75V8.75Z',
  shield:'M8 .5 1.5 3v4.5c0 3.6 3.37 6.9 6.5 8 3.13-1.1 6.5-4.4 6.5-8V3Zm0 1.6 5 1.93V7.5c0 2.7-2.53 5.43-5 6.41-2.47-.98-5-3.71-5-6.41V4.03Z',
  graph:'M1 1h1.5v12.5H15V15H1Zm3.75 9.5 3-3 2 2 4.78-4.78 1.06 1.06L9.75 11.1l-2-2-1.94 1.94Z',
  inbox:'M3 1h10l3 8v6H0V9Zm1.04 1.5L1.6 9h3.65l1 2h3.5l1-2h3.65l-2.44-6.5ZM1.5 10.5v3h13v-3h-2.82l-1 2H5.32l-1-2Z',
  device:'M1 1h14v10H8.75v2.5H12V15H4v-1.5h3.25V11H1Zm1.5 1.5v7h11v-7Z',
  home:'m8 .5 7.5 6.75-1 1.11L13 6.99V15H9v-5H7v5H3V6.99l-1.5 1.37-1-1.11ZM4.5 5.64V13.5h1v-5h5v5h1V5.64L8 2.49Z',
  feed:'M1 1h14v14H1Zm1.5 1.5v3h11v-3Zm0 4.5v6.5h3V7Zm4.5 0v1.5h6.5V7Zm0 3v1.5h6.5V10Z',
  book:'M1 1h5.5C7.1 1 7.63 1.26 8 1.67 8.37 1.26 8.9 1 9.5 1H15v13H9.5a.75.75 0 0 0-.75.75H7.25A.75.75 0 0 0 6.5 14H1Zm1.5 1.5v10H6.5c.26 0 .51.04.75.12V3.25a.75.75 0 0 0-.75-.75Zm6.25.75v9.37c.24-.08.49-.12.75-.12h4v-10h-4a.75.75 0 0 0-.75.75Z',
  repo:'M2 0h11.5A1.5 1.5 0 0 1 15 1.5V15H3a2 2 0 0 1-2-2V1a1 1 0 0 1 1-1Zm.5 1.5V11H13.5V1.5Zm0 11v.5c0 .28.22.5.5.5h10.5v-1Z',
  lock:'M8 0a4 4 0 0 0-4 4v2H2v10h12V6h-2V4a4 4 0 0 0-4-4ZM5.5 4a2.5 2.5 0 0 1 5 0v2h-5Zm-2 3.5h9v7h-9Z',
  globe:'M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm0 1.5c.7 0 1.72 1.44 2.15 4H5.85c.43-2.56 1.45-4 2.15-4ZM5.37 2.05A10.9 10.9 0 0 0 4.33 5.5H1.99a6.53 6.53 0 0 1 3.38-3.45Zm5.26 0a6.53 6.53 0 0 1 3.38 3.45h-2.34a10.9 10.9 0 0 0-1.04-3.45ZM1.58 7h2.6a16 16 0 0 0 0 2h-2.6a6.54 6.54 0 0 1 0-2ZM5.68 7h4.64a14.54 14.54 0 0 1 0 2H5.68a14.54 14.54 0 0 1 0-2Zm6.14 0h2.6a6.54 6.54 0 0 1 0 2h-2.6a16 16 0 0 0 0-2Zm-9.83 3.5h2.34c.2 1.36.55 2.55 1.04 3.45a6.53 6.53 0 0 1-3.38-3.45Zm3.86 0h4.3c-.43 2.56-1.45 4-2.15 4s-1.72-1.44-2.15-4Zm5.82 0h2.34a6.53 6.53 0 0 1-3.38 3.45c.49-.9.84-2.09 1.04-3.45Z',
  file:'M3 0h6l4 4v12H3Zm1.5 1.5v13h7V5h-4V1.5Zm4.5.62V3.5h1.38Z',
  upload:'M7.25 10V2.87L4.53 5.59 3.47 4.53 8 0l4.53 4.53-1.06 1.06-2.72-2.72V10ZM1 9h1.5v4.5h11V9H15v6H1Z',
  copy:'M6 0h8a2 2 0 0 1 2 2v8h-1.5V2a.5.5 0 0 0-.5-.5H6ZM0 4h10a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2Zm2 1.5a.5.5 0 0 0-.5.5v8c0 .28.22.5.5.5h8a.5.5 0 0 0 .5-.5V6a.5.5 0 0 0-.5-.5Z',
  check:'m6 11.3 8.47-8.47 1.06 1.06L6 13.42.47 7.89l1.06-1.06Z',
  star:'M8 0 10.47 5l5.53.8-4 3.9.94 5.51L8 12.61l-4.94 2.6L4 9.7 0 5.8 5.53 5Zm0 3.39L6.53 6.37l-3.29.48 2.38 2.32-.56 3.28L8 10.9l2.94 1.55-.56-3.28 2.38-2.32-3.29-.48Z',
  eye:'M8 2C3.5 2 0 7.5 0 8s3.5 6 8 6 8-5.5 8-6-3.5-6-8-6Zm0 1.5c2.91 0 5.57 3.17 6.29 4.5-.72 1.33-3.38 4.5-6.29 4.5S2.43 9.33 1.71 8C2.43 6.67 5.09 3.5 8 3.5ZM8 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm0 1.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z',
  clock:'M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0Zm0 1.5a6.5 6.5 0 1 1 0 13 6.5 6.5 0 0 1 0-13ZM7.25 3v5.31l3.22 3.22 1.06-1.06-2.78-2.78V3Z',
  tag:'M.5 0h6.81L16 8.69 8.69 16 0 7.31V.5Zm1 1.5v5.19l7.19 7.19 5.19-5.19L6.69 1.5ZM4.5 3A1.5 1.5 0 1 0 4.5 6a1.5 1.5 0 0 0 0-3Z',
  dots:'M2 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z',
  sparkle:'m8 0 1.7 5.3L15 7l-5.3 1.7L8 14l-1.7-5.3L1 7l5.3-1.7ZM14 11l.75 2.25L17 14l-2.25.75L14 17l-.75-2.25L11 14l2.25-.75Z',
  copilot:'M4 1h8l2 3v7l-3 3H5l-3-3V4Zm1 1.5L3.5 4.75v5.63l2.12 2.12h4.76l2.12-2.12V4.75L11 2.5Zm.5 2A1.5 1.5 0 0 0 4 6v1a1.5 1.5 0 0 0 3 0V6a1.5 1.5 0 0 0-1.5-1.5Zm5 0A1.5 1.5 0 0 0 9 6v1a1.5 1.5 0 0 0 3 0V6a1.5 1.5 0 0 0-1.5-1.5ZM6 10h4v1.5H6Z',
  pin:'m10 0 6 6-2 2-1.5-.5L9 11v2l-2-2-5 5-1-1 5-5-2-2h2l3.5-3.5L9 2Z'
};
function icon(name, extra='') { return `<svg class="octicon ${extra}" viewBox="0 0 ${name==='github'?'24 24':'16 16'}" aria-hidden="true"><path d="${paths[name] || paths.dots}"></path></svg>`; }
const caret = '<span class="gh-caret" aria-hidden="true"></span>';
const avatar = size => `<span class="avatar ${size || ''}" aria-hidden="true">biniac</span>`;
function iconButton(name,label,classes='') { return `<button type="button" class="gh-icon-button ${classes}" aria-label="${html(label)}" title="${html(label)}">${icon(name)}</button>`; }
function menuItem(name,text,action='',id='') { return `<button type="button" class="menu-item" role="menuitem" ${id?`id="${id}"`:''} ${action?`data-action="${action}"`:''}>${icon(name)}<span>${text}</span></button>`; }
function currentStep() { return configuration?.steps[state.index]; }
function initialModel() { return {name:'',description:'',visibility:'public',readme:false,gitignore:'None',license:'None',created:false,globalMenu:false,visibilityMenu:false,addFileMenu:false,codeMenu:false,protocol:'https',files:[],pendingFiles:[],commitMessage:'Carga inicial del proyecto',commitDescription:'',branchMode:'direct',latestCommit:'Initial commit',uploaded:false,copied:false,clipboard:'',query:''}; }
function repoUrl() { return `https://github.com/${configuration.owner}/${state.model.name}.git`; }

function header(view) {
  const title = view==='dashboard' ? 'Dashboard' : view==='create' ? 'New repository' : `<span class="owner">${html(configuration.owner)}</span><span class="slash">/</span><span>${html(state.model.name)}</span>${caret}`;
  return `<header class="global-header">${iconButton('menu','Open navigation menu')}<span class="github-mark" aria-label="GitHub">${icon('github')}</span><div class="header-title">${title}</div><span class="header-spacer"></span><div class="header-actions">${iconButton('search','Search GitHub','header-search')}<button type="button" class="gh-icon-button copilot-button" aria-label="Open Copilot">${icon('copilot')}${caret}</button><span class="vertical-rule"></span><div class="menu-anchor"><button type="button" id="create-menu-button" class="gh-icon-button create-menu-button" data-action="open-create-menu" aria-label="Create new (+)" aria-haspopup="menu" aria-expanded="${state.model.globalMenu}">${icon('plus')}${caret}</button>${state.model.globalMenu?`<div class="dropdown" role="menu" aria-label="Create new">${menuItem('issue','New issue')}${menuItem('repo','New repository','new-repository','new-repository')}${menuItem('repo','Import repository')}<div class="menu-divider"></div>${menuItem('device','New codespace')}${menuItem('code','New gist')}<div class="menu-divider"></div>${menuItem('grid','New organization')}${menuItem('grid','New project')}</div>`:''}</div>${iconButton('issue','Your issues','secondary-action')}${iconButton('pull','Your pull requests','secondary-action')}${iconButton('device','Your workspaces','optional-action')}${iconButton('inbox','Notifications','optional-action')}<button type="button" class="avatar" aria-label="User navigation: Biniac">biniac</button></div></header>${['repository','upload'].includes(view)?repoTabs():''}`;
}
function repoTabs() { return `<nav class="repo-tabs" aria-label="Repository">${[['code','Code'],['issue','Issues'],['pull','Pull requests'],['play','Actions'],['grid','Projects'],['shield','Security and quality'],['graph','Insights']].map(([name,label],index)=>`<button type="button" class="repo-tab ${index===0?'active':''}" ${index===0?'aria-current="page"':''}>${icon(name)}${label}</button>`).join('')}<button type="button" class="repo-tab">More ${caret}</button></nav>`; }
function footer() { return `<footer class="native-footer">${icon('github')}<span>© 2026 GitHub, Inc.</span>${['Terms','Privacy','Security','Status','Community','Docs','Contact','Manage cookies','Do not share my personal information'].map(text=>`<button type="button">${text}</button>`).join('')}</footer>`; }

function dashboard() {
  return `<div class="dashboard-layout"><aside class="dashboard-sidebar" aria-label="Dashboard navigation"><button type="button" class="sidebar-link active">${icon('home')}Home</button><button type="button" class="sidebar-link">${icon('feed')}Feed</button><div class="sidebar-separator"></div><div class="sidebar-heading"><span>Top repositories</span>${icon('search')}</div><button type="button" class="sidebar-repository">${avatar('tiny')}Biniac/test</button></aside><section class="dashboard-main"><div class="dashboard-welcome"><span class="preview-pill">Preview</span></div><h1>${icon('copilot')}Good evening, Biniac!</h1><div class="copilot-box"><textarea aria-label="Ask Copilot" placeholder="Ask anything or type @ to add context"></textarea><div class="copilot-toolbar"><button type="button" class="gh-button">${icon('copilot')}Ask ${caret}</button><button type="button" class="gh-button">${icon('repo')}All repositories ${caret}</button><button type="button" class="gh-button" aria-label="Add context">${icon('plus')}</button><span class="spacer"></span>${iconButton('sparkle','Copilot settings','copilot-extra')}${iconButton('play','Send to Copilot','copilot-extra')}</div></div><div class="suggestion-chips"><button type="button" class="gh-button">${icon('code')}Debug</button><button type="button" class="gh-button">${icon('copilot')}Agent</button><button type="button" class="gh-button">${icon('issue')}Create issue</button><button type="button" class="gh-button">${icon('code')}Write code ${caret}</button><button type="button" class="gh-button">${icon('branch')}Git ${caret}</button></div><div class="dashboard-section-heading"><h2>Pull requests</h2><button type="button" class="gh-link">View all →</button></div><div class="empty-dashboard-panel">No pull requests found using the current filters.</div></section></div>`;
}

function createRepository() {
  const model=state.model;
  const isPrivate=model.visibility==='private';
  return `<section class="create-page"><h1>Create a new repository</h1><p class="create-subtitle">Repositories contain a project's files and version history. Have a project elsewhere? <button type="button" class="gh-link">Import a repository.</button></p><p class="required-note">Required fields are marked with an asterisk (*).</p><form id="new-repository-form" novalidate><section class="form-section general-section"><h2 class="section-title"><span class="section-number">1</span>General</h2><div class="name-fields"><div><label class="field-label">Owner *</label><button type="button" class="gh-button owner-button" aria-label="Owner: Biniac">${avatar('small')}${html(configuration.owner)}${caret}</button></div><span class="name-slash" aria-hidden="true">/</span><div><label for="repository-name" class="field-label">Repository name *</label><input id="repository-name" class="gh-input" name="repository-name" required maxlength="100" autocomplete="off" autocapitalize="none" spellcheck="false" enterkeyhint="go" value="${html(model.name)}" aria-describedby="name-status"></div></div><p id="name-status" class="name-status" aria-live="polite">Great repository names are short and memorable. How about <span style="color:#3fb950">probable-disco</span>?</p><div class="description-field"><label for="repository-description" class="field-label">Description <span class="optional">(optional)</span></label><input id="repository-description" class="gh-input" maxlength="350" value="${html(model.description)}"><p class="description-limit"><span id="description-count">${model.description.length}</span> / 350 characters</p></div></section><section class="form-section"><h2 class="section-title"><span class="section-number">2</span>Configuration</h2><div class="config-card"><div class="config-row"><div><label class="field-label" for="visibility-toggle">Choose visibility *</label><p>Choose who can see and commit to this repository</p></div><div class="visibility-anchor"><button type="button" id="visibility-toggle" class="gh-button" data-action="visibility-menu" aria-haspopup="menu" aria-expanded="${model.visibilityMenu}">${icon(isPrivate?'lock':'globe')}${isPrivate?'Private':'Public'}${caret}</button>${model.visibilityMenu?`<div class="dropdown visibility-menu" role="menu" aria-label="Choose visibility"><div class="dropdown-heading">Choose visibility</div><button type="button" class="visibility-option" role="menuitem" data-action="public">${icon('globe')}<span><strong>Public</strong><small>Anyone on the internet can see this repository. You choose who can commit.</small></span></button><button type="button" id="private-option" class="visibility-option" role="menuitem" data-action="private">${icon('lock')}<span><strong>Private</strong><small>You choose who can see and commit to this repository.</small></span></button></div>`:''}</div></div><div class="config-row"><div><label class="field-label" for="readme-switch">Add README</label><p>READMEs can be used as longer descriptions.</p></div><input id="readme-switch" class="switch-input" type="checkbox" role="switch" aria-label="Add README" ${model.readme?'checked':''}></div><div class="config-row"><div><label class="field-label" for="gitignore-select">Add .gitignore</label><p>.gitignore tells git which files not to track.</p></div><select id="gitignore-select" class="config-select" aria-label="Add .gitignore"><option value="None">No .gitignore</option><option value="Node" ${model.gitignore==='Node'?'selected':''}>Node</option><option value="Python" ${model.gitignore==='Python'?'selected':''}>Python</option></select></div><div class="config-row"><div><label class="field-label" for="license-select">Add license</label><p>A license tells others how they can use your code.</p></div><select id="license-select" class="config-select" aria-label="Add license"><option value="None">No license</option><option value="MIT" ${model.license==='MIT'?'selected':''}>MIT License</option></select></div></div><div class="create-actions"><button type="button" id="create-repository" class="gh-button gh-primary large" data-action="create">Create repository</button></div><p class="create-footnote">You are creating a ${isPrivate?'private':'public'} repository in your personal account.</p></section></form></section>`;
}

function codePopover() {
  return `<div class="code-popover" aria-label="Code menu"><div class="code-local-tabs"><button type="button" class="active">Local</button><button type="button">Codespaces</button></div><div class="clone-section"><h3 class="clone-heading">${icon('device')}Clone <span class="help-icon">ⓘ</span></h3><div class="protocol-tabs" role="tablist" aria-label="Clone protocol"><button type="button" id="https-tab" class="protocol-tab active" role="tab" aria-selected="true" data-action="https">HTTPS</button><button type="button" class="protocol-tab" role="tab" aria-selected="false">SSH</button><button type="button" class="protocol-tab" role="tab" aria-selected="false">GitHub CLI</button></div><div class="clone-url-row"><input id="clone-url" class="gh-input" aria-label="Repository HTTPS URL" readonly value="${html(repoUrl())}"><button type="button" id="copy-url" class="gh-icon-button" data-action="copy" aria-label="Copiar URL del repositorio" title="${state.model.copied?'Copied!':'Copy url to clipboard'}">${icon(state.model.copied?'check':'copy')}</button></div><p class="clone-tip">Clone using the web URL.</p>${state.model.copied?`<p class="copy-confirmation">${icon('check')}Copied to the practice clipboard.</p>`:''}</div><div class="code-extra-links"><button type="button" class="code-menu-item">${icon('copilot')}Open in GitHub Copilot app</button><button type="button" class="code-menu-item">${icon('device')}Open with GitHub Desktop</button><button type="button" class="code-menu-item">${icon('upload')}Download ZIP</button></div></div>`;
}

function repository() {
  const model=state.model;
  return `<section class="repository-page"><div class="repo-summary"><div class="repo-title">${icon('lock')}<h1>${html(model.name)}</h1><span id="repo-visibility" class="visibility-badge">Private</span></div><div class="repo-social"><button type="button" class="gh-button pin-button">${icon('pin')}Pin</button><button type="button" class="gh-button watch-button">${icon('eye')}Watch<span class="button-count">0</span>${caret}</button><button type="button" class="gh-button">${icon('branch')}Fork<span class="button-count">0</span>${caret}</button><button type="button" class="gh-button">${icon('star')}Star<span class="button-count">0</span>${caret}</button></div></div><div class="repo-columns"><div class="repo-primary"><div class="repo-toolbar"><div class="repo-toolbar-left"><button type="button" class="gh-button branch-button">${icon('branch')}main ${caret}</button>${iconButton('branch','Branches')}${iconButton('tag','Tags')}</div><div class="repo-toolbar-right"><input id="file-search" class="gh-input file-search" type="search" placeholder="Go to file" aria-label="Go to file" value="${html(model.query)}"><div class="menu-anchor"><button type="button" id="add-file-button" class="gh-button add-file-button" data-action="add-file-menu" aria-label="Add file (+)" aria-haspopup="menu" aria-expanded="${model.addFileMenu}">${icon('plus','plus-icon')}<span class="add-file-label">Add file</span>${caret}</button>${model.addFileMenu?`<div class="dropdown add-file-menu" role="menu" aria-label="Add file">${menuItem('plus','Create new file')}${menuItem('upload','Upload files','upload-files','upload-files')}</div>`:''}</div><div class="menu-anchor"><button type="button" id="code-button" class="gh-button gh-primary" data-action="open-code" aria-haspopup="true" aria-expanded="${model.codeMenu}">${icon('code')}Code ${caret}</button>${model.codeMenu?codePopover():''}</div></div></div><div class="commit-bar">${avatar('small')}<span class="commit-owner">${html(configuration.owner)}</span><span class="commit-description">${html(model.latestCommit)}</span><span class="commit-meta"><span class="commit-hash">${model.uploaded?'8e2a9f1':'f72a4c0'}</span><span class="commit-time">now</span>${icon('clock')}</span></div><table class="file-table" aria-label="Repository files"><tbody>${model.files.map(file=>`<tr data-file-name="${html(file.name.toLowerCase())}"><td><button type="button" class="file-name">${icon('file')}${html(file.name)}</button></td><td>${html(model.latestCommit)}</td><td>now</td></tr>`).join('')}</tbody></table><div id="empty-file-search" class="empty-search" hidden>No files found.</div><article class="readme-panel"><div class="readme-tabs"><button type="button" class="readme-tab">${icon('book')}README</button></div><div class="readme-body"><h2>${html(model.name)}</h2><p>${model.uploaded?'Mi primer proyecto en GitHub. Los archivos del proyecto ya están guardados en este repositorio.':'Repositorio de mi primer proyecto.'}</p>${model.uploaded?'<p>El proyecto incluye <code>index.html</code>, <code>estilos.css</code> y <code>README.md</code>.</p>':''}</div></article></div><aside class="repo-sidebar"><h2>About ${iconButton('dots','Repository details')}</h2><p>${html(model.description || 'No description, website, or topics provided.')}</p><ul class="about-stats"><li>${icon('book')}Readme</li><li>${icon('graph')}Activity</li><li>${icon('star')}<strong>0</strong> stars</li><li>${icon('eye')}<strong>0</strong> watching</li><li>${icon('branch')}<strong>0</strong> forks</li></ul><div class="sidebar-block"><h3>Releases</h3><p>No releases published</p><button type="button" class="gh-link">Create a new release</button></div><div class="sidebar-block"><h3>Packages</h3><p>No packages published</p></div>${model.uploaded?'<div class="sidebar-block"><h3>Languages</h3><div class="language-bar"></div><div class="language-label"><i class="language-dot"></i><strong>HTML</strong><span class="muted">100.0%</span></div></div>':''}</aside></div></section>`;
}

function upload() {
  const model=state.model;
  const ready=model.pendingFiles.length>0;
  return `<section class="upload-page ${ready?'':'no-files'}"><div class="upload-breadcrumb"><button type="button" class="gh-link repo-breadcrumb">${html(model.name)}</button><span class="separator">/</span><span>Upload files</span></div><div id="upload-dropzone" class="upload-dropzone ${ready?'has-files':''}">${icon('upload')}<h1>Drag files here to add them to your repository</h1><p class="choose-line">Or <button type="button" id="choose-files" class="choose-files-button" data-action="choose-files">choose your files</button></p></div>${ready?`<div class="staged-files" aria-label="Selected files">${model.pendingFiles.map(file=>`<div class="staged-file">${icon('file')}<span>${html(file.name)}</span><span class="file-size">${html(file.size)}</span><span class="ready-icon">${icon('check')}</span><button type="button" class="remove-file" aria-label="Remove ${html(file.name)}">×</button></div>`).join('')}</div>`:''}<form id="upload-form" novalidate><div class="commit-form">${avatar('')}<div class="commit-form-box"><h2>Commit changes</h2><label class="sr-only" for="commit-message">Commit message</label><input id="commit-message" class="gh-input" value="${html(model.commitMessage)}" placeholder="Add files via upload"><label class="sr-only" for="commit-description">Extended description</label><textarea id="commit-description" class="gh-textarea" placeholder="Add an optional extended description…">${html(model.commitDescription)}</textarea><div class="commit-options"><label><input type="radio" name="branch-mode" value="direct" ${model.branchMode==='direct'?'checked':''}>Commit directly to the <code>main</code> branch.</label><label><input type="radio" name="branch-mode" value="new" ${model.branchMode==='new'?'checked':''}>Create a new branch for this commit and start a pull request.</label></div></div></div><div class="commit-actions"><button type="button" id="commit-changes" class="gh-button gh-primary large" data-action="commit" ${ready?'':'disabled'}>Commit changes</button><button type="button" class="gh-button large">Cancel</button></div></form></section>`;
}

function isValidName(value) { return value.length>0 && value.length<=100 && /^[A-Za-z0-9_.-]+$/.test(value) && !['.','..','.git'].includes(value); }
function refreshNameStatus() {
  const input=$('repository-name');
  const status=$('name-status');
  if(!input || !status) return;
  const value=input.value.trim();
  const valid=isValidName(value);
  input.setAttribute('aria-invalid',String(value.length>0&&!valid));
  status.className=`name-status ${value?(valid?'valid':'invalid'):''}`;
  status.innerHTML=value ? (valid?`${icon('check')}${html(value)} is available.`:'Use letters, numbers, periods, underscores, or hyphens. No spaces.') : 'Great repository names are short and memorable.';
}
function filterFiles() {
  const rows=[...ui['github-app'].querySelectorAll('[data-file-name]')];
  const search=state.model.query.toLowerCase().trim();
  rows.forEach(row=>{row.hidden=!row.dataset.fileName.includes(search);});
  const empty=$('empty-file-search');
  if(empty) empty.hidden=rows.some(row=>!row.hidden);
}
function validateConfiguration(data) {
  if(!data || !Array.isArray(data.steps) || !data.steps.length || !Array.isArray(data.chapters) || !Array.isArray(data.sampleFiles)) throw new Error('Secuencia no válida');
  const ids=new Set();
  for(const step of data.steps){
    if(ids.has(step.id) || !/^#[a-z0-9_-]+$/.test(step.selector) || !['dashboard','create','repository','upload'].includes(step.view) || !data.chapters.some(chapter=>chapter.id===step.chapter) || !step.action || !step.instruction) throw new Error('Paso no válido');
    ids.add(step.id);
  }
}
function activeControl() { return currentStep() ? ui['github-app'].querySelector(currentStep().selector) : null; }
function updateProgress() {
  const total=configuration.steps.length;
  const percent=Math.round(state.index/total*100);
  ui['step-count'].textContent=`${Math.min(state.index+1,total)} / ${total}`;
  ui['player-count'].textContent=`${Math.min(state.index+1,total)}/${total}`;
  ui['progress-fill'].style.width=`${percent}%`;
  ui.progress.setAttribute('aria-valuenow',String(percent));
  ui.progress.setAttribute('aria-valuetext',`${state.index} de ${total} acciones completadas`);
}
function render({focus=true}={}) {
  const version=++state.version;
  const step=currentStep();
  const view=step?.view || 'repository';
  ui['github-app'].dataset.view=view;
  ui['github-app'].dataset.step=step?.id || 'complete';
  ui['github-app'].innerHTML=header(view)+({dashboard,create:createRepository,repository,upload}[view])()+footer();
  refreshNameStatus();
  filterFiles();
  updateProgress();
  ui.completion.hidden=!!step;
  ui.guide.hidden=!step;
  ui.player.hidden=!step;
  ui['focus-ring'].hidden=true;
  if(!step){
    $('practice-clipboard').value=state.model.clipboard;
    $('completion-kicker').textContent=`${configuration.steps.length} DE ${configuration.steps.length} · COMPLETADO`;
    ui.announcer.textContent='Tutorial completado. Has creado un repositorio privado, subido archivos y copiado su dirección en esta simulación.';
    if(focus) $('complete-title').focus({preventScroll:true});
    return;
  }
  ui.guide.classList.remove('positioned');
  ui['chapter-label'].textContent=configuration.chapters.find(chapter=>chapter.id===step.chapter).title;
  ui['lesson-title'].textContent=step.title;
  ui.instruction.textContent=step.instruction;
  ui['context-note'].textContent=step.context;
  const showContext=['initialize-readme','choose-files'].includes(step.id);
  ui['context-note'].hidden=!showContext;
  $('context-button').setAttribute('aria-expanded',String(showContext));
  ui.feedback.textContent='';
  ui['back-button'].disabled=state.index===0;
  $('action-cue').textContent=step.kind==='text'?'Usa el campo de GitHub y pulsa Enter':'Usa el control destacado para avanzar';
  ui['focus-number'].textContent=String(state.index+1);
  const control=activeControl();
  if(!control) throw new Error(`No existe el control HTML de ${step.id}`);
  control.setAttribute('aria-describedby','instruction');
  if(focus){
    if(step.kind==='text') control.focus({preventScroll:true});
    else ui['lesson-title'].focus({preventScroll:true});
  }
  requestAnimationFrame(()=>{if(version===state.version)layoutGuide(true);});
  ui.announcer.textContent=`Paso ${state.index+1} de ${configuration.steps.length}. ${step.instruction}`;
}

const clamp=(value,min,max)=>Math.min(Math.max(value,min),Math.max(min,max));
function layoutGuide(center=false) {
  const control=activeControl();
  if(!control || ui.guide.hidden)return;
  const vw=document.documentElement.clientWidth;
  const vh=document.documentElement.clientHeight;
  const mobile=vw<=700;
  ui['github-app'].style.setProperty('--guide-clearance',`${mobile?ui.guide.offsetHeight+115:120}px`);
  if(center && !control.closest('.global-header')){
    const box=control.getBoundingClientRect();
    const bottom=mobile?vh-ui.guide.offsetHeight-100:vh-80;
    if(box.top<80 || box.bottom>bottom){
      ui.viewport.scrollTop+=box.top+box.height/2-Math.max(100,bottom*.43);
    }
  }
  const box=control.getBoundingClientRect();
  Object.assign(ui['focus-ring'].style,{left:`${box.left-3}px`,top:`${box.top-3}px`,width:`${box.width+6}px`,height:`${box.height+6}px`});
  ui['focus-ring'].hidden=false;
  ui.guide.dataset.offscreen=String(box.bottom<0||box.top>vh);
  if(mobile){
    ui.guide.dataset.placement='mobile';
    ui.guide.classList.add('positioned');
    return;
  }
  const width=ui.guide.offsetWidth,height=ui.guide.offsetHeight,cx=box.left+box.width/2,cy=box.top+box.height/2,gap=18;
  const obstacles=[...ui['github-app'].querySelectorAll('input,textarea,select,button')].filter(element=>element!==control).map(element=>element.getBoundingClientRect()).filter(rect=>rect.width>0&&rect.height>0&&rect.bottom>0&&rect.top<vh);
  const candidates=[
    {placement:'below',x:cx-width/2,y:box.bottom+gap},
    {placement:'above',x:cx-width/2,y:box.top-height-gap},
    {placement:'left',x:box.left-width-gap,y:cy-height/2},
    {placement:'right',x:box.right+gap,y:cy-height/2}
  ].map((candidate,index)=>{
    const x=clamp(candidate.x,14,vw-width-14),y=clamp(candidate.y,14,vh-height-77);
    const overlap=Math.max(0,Math.min(x+width,box.right)-Math.max(x,box.left))*Math.max(0,Math.min(y+height,box.bottom)-Math.max(y,box.top));
    const controlsOverlap=obstacles.reduce((sum,rect)=>sum+Math.max(0,Math.min(x+width,rect.right)-Math.max(x,rect.left))*Math.max(0,Math.min(y+height,rect.bottom)-Math.max(y,rect.top)),0);
    return {...candidate,x,y,score:overlap*1000+controlsOverlap*3+Math.abs(x-candidate.x)+Math.abs(y-candidate.y)+index*5};
  }).sort((a,b)=>a.score-b.score);
  const choice=candidates[0];
  ui.guide.dataset.placement=choice.placement;
  Object.assign(ui.guide.style,{left:`${choice.x}px`,top:`${choice.y}px`});
  ui.guide.style.setProperty('--arrow-x',`${clamp(cx-choice.x-6,16,width-28)}px`);
  ui.guide.style.setProperty('--arrow-y',`${clamp(cy-choice.y-6,16,height-28)}px`);
  ui.guide.classList.add('positioned');
}
function showHint(message='') {
  if(!currentStep())return;
  ui.feedback.textContent=message || currentStep().hint;
  layoutGuide(true);
}
function advance() {
  state.index+=1;
  state.history[state.index]=copy(state.model);
  state.history.length=state.index+1;
  render();
}
function perform(action,value) {
  const step=currentStep();
  if(!step)return;
  if(action!==step.action){showHint(`Casi. ${step.hint}`);return;}
  const model=state.model;
  switch(action){
    case 'open-create-menu': model.globalMenu=true; break;
    case 'new-repository': model.globalMenu=false; break;
    case 'name': {
      const name=$('repository-name').value.trim();
      if(!isValidName(name)){refreshNameStatus();showHint('Escribe un nombre con letras, números o guiones, sin espacios. Después pulsa Enter.');return;}
      model.name=name;break;
    }
    case 'visibility-menu':model.visibilityMenu=true;break;
    case 'private':model.visibility='private';model.visibilityMenu=false;break;
    case 'readme':if(!value){showHint('Activa Add README para continuar.');return;}model.readme=true;break;
    case 'create':
      if(!isValidName(model.name)||model.visibility!=='private'||!model.readme){showHint('Comprueba el nombre, elige Private y activa Add README.');return;}
      model.created=true;model.files=[{name:'README.md',size:'0.2 KB'}];
      if(model.gitignore!=='None')model.files.push({name:'.gitignore',size:'0.1 KB'});
      if(model.license!=='None')model.files.push({name:'LICENSE',size:'1.0 KB'});
      model.latestCommit='Initial commit';break;
    case 'add-file-menu':model.addFileMenu=true;break;
    case 'upload-files':model.addFileMenu=false;model.query='';break;
    case 'choose-files':model.pendingFiles=copy(configuration.sampleFiles);break;
    case 'commit':
      if(!model.pendingFiles.length){showHint('Selecciona los archivos antes de confirmar la carga.');return;}
      if(model.branchMode!=='direct'){showHint('Para esta práctica, selecciona Commit directly to the main branch y vuelve a confirmar.');return;}
      model.files=[...model.files.filter(file=>!model.pendingFiles.some(pending=>pending.name===file.name)),...copy(model.pendingFiles)];
      model.uploaded=true;model.latestCommit=model.commitMessage.trim()||'Add files via upload';break;
    case 'open-code':model.codeMenu=true;break;
    case 'https':model.protocol='https';break;
    case 'copy':model.copied=true;model.clipboard=repoUrl();break;
    default:throw new Error(`Acción no reconocida: ${action}`);
  }
  advance();
}
function restore(index) {
  state.index=index;
  state.model=copy(state.history[index]);
  render();
}
function restart() {
  state.index=0;state.model=initialModel();state.history=[copy(state.model)];
  $('restart-dialog').close();
  ui.viewport.scrollTop=0;
  render();
}

async function initialize() {
  const response=await fetch('./steps.json',{cache:'no-cache'});
  if(!response.ok)throw new Error('No se pudo cargar steps.json');
  configuration=await response.json();
  validateConfiguration(configuration);
  state.model=initialModel();state.history=[copy(state.model)];
  ui['github-app'].addEventListener('click',event=>{
    if(!currentStep())return;
    const input=event.target.closest('input,textarea,select,label');
    if(input)return;
    const button=event.target.closest('[data-action]');
    if(button){event.preventDefault();perform(button.dataset.action);}
    else showHint(`Casi. ${currentStep().hint}`);
  });
  ui['github-app'].addEventListener('submit',event=>event.preventDefault());
  ui['github-app'].addEventListener('keydown',event=>{
    if(event.target.id==='repository-name'&&event.key==='Enter'){
      event.preventDefault();perform(currentStep()?.action==='create'?'create':'name');
    }
    const menu=event.target.closest('[role=menu]');
    if(menu&&['ArrowDown','ArrowUp'].includes(event.key)){
      event.preventDefault();const items=[...menu.querySelectorAll('[role=menuitem]')];const index=items.indexOf(event.target);items[(index+(event.key==='ArrowDown'?1:items.length-1))%items.length].focus();
    }
  });
  ui['github-app'].addEventListener('input',event=>{
    switch(event.target.id){
      case 'repository-name':state.model.name=event.target.value;refreshNameStatus();break;
      case 'repository-description':state.model.description=event.target.value;$('description-count').textContent=String(event.target.value.length);break;
      case 'commit-message':state.model.commitMessage=event.target.value;break;
      case 'commit-description':state.model.commitDescription=event.target.value;break;
      case 'file-search':state.model.query=event.target.value;filterFiles();break;
    }
  });
  ui['github-app'].addEventListener('change',event=>{
    if(event.target.id==='readme-switch'){
      if(currentStep()?.action==='readme')perform('readme',event.target.checked);
      else{event.target.checked=state.model.readme;showHint();}
    }
    if(event.target.id==='gitignore-select')state.model.gitignore=event.target.value;
    if(event.target.id==='license-select')state.model.license=event.target.value;
    if(event.target.name==='branch-mode')state.model.branchMode=event.target.value;
  });
  $('back-button').addEventListener('click',()=>{if(state.index>0)restore(state.index-1);});
  $('repeat-button').addEventListener('click',()=>{restore(state.index);showHint('Paso listo para repetir. Usa de nuevo el control destacado.');});
  $('hint-button').addEventListener('click',()=>showHint());
  $('context-button').addEventListener('click',()=>{ui['context-note'].hidden=!ui['context-note'].hidden;$('context-button').setAttribute('aria-expanded',String(!ui['context-note'].hidden));layoutGuide(true);});
  $('restart-button').addEventListener('click',()=>$('restart-dialog').showModal());
  $('confirm-restart').addEventListener('click',restart);
  $('about-button').addEventListener('click',()=>$('about-dialog').showModal());
  $('again-button').addEventListener('click',restart);
  $('review-button').addEventListener('click',()=>restore(configuration.steps.length-1));
  $('reload-button').addEventListener('click',()=>location.reload());
  document.querySelectorAll('[data-close-dialog]').forEach(button=>button.addEventListener('click',()=>button.closest('dialog').close()));
  ui['lesson-title'].addEventListener('keydown',event=>{if(event.key==='Tab'&&!event.shiftKey){event.preventDefault();activeControl()?.focus({preventScroll:true});}});
  let frame;
  ui.viewport.addEventListener('scroll',()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(()=>layoutGuide(false));},{passive:true});
  const viewportObserver=new ResizeObserver(()=>layoutGuide(true));viewportObserver.observe(ui.viewport);
  const guideObserver=new ResizeObserver(()=>layoutGuide(false));guideObserver.observe(ui.guide);
  render({focus:false});
}

initialize().catch(error=>{
  console.error('No se pudo iniciar el clon HTML:',error);
  ui.guide.hidden=true;ui.player.hidden=true;ui['focus-ring'].hidden=true;
  $('load-error').hidden=false;$('reload-button').onclick=()=>location.reload();
});
