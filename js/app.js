import { projects } from './projects.js';

const grid = document.querySelector('#project-grid');
const dialog = document.querySelector('#project-dialog');
const content = document.querySelector('#dialog-content');
const closeButton = dialog.querySelector('.dialog-close');
const asset = filename => `./assets/work/${filename}`;
let visibleProjects = projects;
let opener = null;
let currentProject = null;

// Content is local and authored, but escaping keeps future edits safe in templates.
const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function renderProjects() {
  grid.innerHTML = visibleProjects.map(project => `
    <article class="project-card" style="--card-bg:${project.background || '#e7e9e1'}">
      <button class="project-open" type="button" data-project="${project.id}" aria-label="View ${escape(project.title)} project" aria-haspopup="dialog">
        <div class="project-image"><img src="${asset(project.image)}" alt="${escape(project.alt)}" loading="lazy" decoding="async" ${project.fit ? `style="object-fit:${project.fit}"` : ''}><span class="project-view">View project</span></div>
        <div class="project-info"><div><h3>${escape(project.title)}</h3><p>${escape(project.category)}</p></div><span class="project-number">${String(projects.indexOf(project)+1).padStart(2,'0')}</span></div>
      </button>
    </article>`).join('');
  document.querySelector('#project-count').textContent = `${visibleProjects.length} projects`;
}

document.querySelector('.filters').addEventListener('click', event => {
  const button = event.target.closest('[data-filter]');
  if (!button) return;
  document.querySelectorAll('[data-filter]').forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
  visibleProjects = button.dataset.filter === 'all' ? projects : projects.filter(project => project.filters.includes(button.dataset.filter));
  renderProjects();
  document.querySelector('#filter-status').textContent = `${visibleProjects.length} projects shown.`;
});

function showProject(project) {
  currentProject = project;
  const index = projects.indexOf(project);
  document.querySelector('#dialog-number').textContent = `Selected work / ${String(index+1).padStart(2,'0')}`;
  const nextIndex = (visibleProjects.indexOf(project)+1) % visibleProjects.length;
  const next = visibleProjects[nextIndex];
  content.innerHTML = `
    <h2 id="dialog-title" tabindex="-1">${escape(project.title)}</h2>
    <div class="dialog-meta"><span>${escape(project.roles)}</span><span>${escape(project.country)}</span></div>
    <div class="dialog-story">${project.story.map(paragraph => `<p>${escape(paragraph)}</p>`).join('')}</div>
    ${project.note ? `<p class="dialog-note project-disclosure">${escape(project.note)}</p>` : ''}
    <div class="dialog-gallery">
      <img class="gallery-cover" src="${asset(project.image)}" alt="${escape(project.alt)}">
      ${project.gallery.map((filename,i) => `<img src="${asset(filename)}" alt="${escape(project.title)} — ${escape(filename.replace('.webp','').split('-').slice(1).join(' '))}" loading="lazy" decoding="async">`).join('')}
      <img class="gallery-spread" src="${asset(project.spread)}" alt="Complete ${escape(project.title)} presentation from the original portfolio" loading="lazy" decoding="async">
    </div>
    <div class="dialog-next"><span>Keep exploring</span><button type="button" data-next="${next.id}">${escape(next.title)}</button></div>`;
  if (!dialog.open) {
    dialog.showModal();
    document.body.classList.add('modal-open');
    document.dispatchEvent(new CustomEvent('portfolio-dialog', {detail:true}));
  }
  dialog.scrollTop = 0;
  closeButton.focus({preventScroll:true});
}

grid.addEventListener('click', event => {
  const button = event.target.closest('[data-project]');
  if (!button) return;
  opener = button;
  showProject(projects.find(project => project.id === button.dataset.project));
});
content.addEventListener('click', event => {
  const button = event.target.closest('[data-next]');
  if (button) showProject(projects.find(project => project.id === button.dataset.next));
});
closeButton.addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => {
  const box = dialog.getBoundingClientRect();
  if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
});
dialog.addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  document.dispatchEvent(new CustomEvent('portfolio-dialog', {detail:false}));
  if (opener?.isConnected) opener.focus({preventScroll:true});
  currentProject = null;
});
document.querySelector('#year').textContent = new Date().getFullYear();
renderProjects();

// The content works independently of WebGL. Load 3D after the page is usable.
const loadScene = () => import('./scene.js').then(module => module.initScene()).catch(error => console.warn('3D unavailable; displaying static artwork.', error));
if ('requestIdleCallback' in window) requestIdleCallback(loadScene, {timeout:1200});
else setTimeout(loadScene, 100);
