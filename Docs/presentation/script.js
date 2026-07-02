let slides = [];
let index = 0;

const slidesEl = document.getElementById('slides');
const tocEl = document.getElementById('toc');
const counterEl = document.getElementById('counter');
const progressEl = document.getElementById('progress');
const sidebarEl = document.getElementById('sidebar');

document.getElementById('prevBtn').addEventListener('click', prev);
document.getElementById('nextBtn').addEventListener('click', next);
document.getElementById('toggleMenu').addEventListener('click', () => {
  sidebarEl.classList.toggle('open');
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') next();
  if (e.key === 'ArrowLeft') prev();
});

fetch('data/slides.json')
  .then((r) => r.json())
  .then((data) => {
    slides = data;
    renderToc();
    renderSlide();
  });

function renderToc() {
  tocEl.innerHTML = '';
  slides.forEach((s, i) => {
    const b = document.createElement('button');
    b.className = 'toc-item' + (i === index ? ' active' : '');
    b.textContent = `${i + 1}. ${s.title}`;
    b.addEventListener('click', () => {
      index = i;
      renderSlide();
      sidebarEl.classList.remove('open');
    });
    tocEl.appendChild(b);
  });
}

function renderSlide() {
  const s = slides[index];
  slidesEl.innerHTML = buildSlide(s);
  counterEl.textContent = `${index + 1} / ${slides.length}`;
  progressEl.style.width = `${((index + 1) / slides.length) * 100}%`;
  [...tocEl.children].forEach((c, i) => c.classList.toggle('active', i === index));
}

function prev() {
  index = (index - 1 + slides.length) % slides.length;
  renderSlide();
}

function next() {
  index = (index + 1) % slides.length;
  renderSlide();
}

function buildSlide(s) {
  switch (s.type) {
    case 'cover':
      return `
        <article class="slide cover">
          <h2>${s.title}</h2>
          <p class="subtitle">${s.subtitle || ''}</p>
          <div class="card"><strong>Réalisé par:</strong><br/>${s.authors}</div>
          <div class="grid-2">
            <div class="card"><strong>Encadré par:</strong><br/>${s.supervisor}</div>
            <div class="card"><strong>Établissement:</strong><br/>${s.school}</div>
          </div>
          <div class="card meta"><strong>Année universitaire:</strong> ${s.year}</div>
        </article>
      `;

    case 'toc':
      return `
        <article class="slide">
          <h2>${s.title}</h2>
          <div class="grid-2">
            ${s.items.map((i) => `<div class="card">${i}</div>`).join('')}
          </div>
        </article>
      `;

    case 'content':
      return `
        <article class="slide">
          <h2>${s.title}</h2>
          ${s.blocks ? `<div class="grid-2">${s.blocks.map(b => `<div class="card"><h3>${b.heading}</h3><p>${b.text}</p></div>`).join('')}</div>` : ''}
          ${s.columns ? `<div class="grid-3">${s.columns.map(c => `<div class="card"><h3>${c.heading}</h3><ul>${(c.list||[]).map(li => `<li>${li}</li>`).join('')}</ul></div>`).join('')}</div>` : ''}
        </article>
      `;

    case 'timeline':
      return `
        <article class="slide">
          <h2>${s.title}</h2>
          <div class="timeline">
            ${s.items.map((i) => `<div class="timeline-item"><span class="dot"></span><span>${i}</span></div>`).join('')}
          </div>
        </article>
      `;

    case 'feature-grid':
      return `
        <article class="slide">
          <h2>${s.title}</h2>
          <div class="feature-grid">
            ${s.features.map((f) => `<div class="feature">${f}</div>`).join('')}
          </div>
        </article>
      `;

    case 'uml':
      return `
        <article class="slide">
          <h2>${s.title}</h2>
          <div class="uml-grid">
            ${s.items.map((u) => `<div class="card"><h3>${u.name}</h3><div class="placeholder">Placer l'image: ${u.placeholder}</div></div>`).join('')}
          </div>
        </article>
      `;

    case 'database':
      return `
        <article class="slide">
          <h2>${s.title}</h2>
          <div class="grid-2">
            <div class="card">
              <ul>${s.blocks.map((b) => `<li>${b}</li>`).join('')}</ul>
            </div>
            <div class="card">
              ${s.images.map((img) => `<div class="placeholder">Image: ${img}</div>`).join('')}
            </div>
          </div>
        </article>
      `;

    case 'architecture':
      return `
        <article class="slide">
          <h2>${s.title}</h2>
          <div class="card">
            <div class="chain">
              ${s.chain.map((n, i) => `${i ? '<span class="arrow">→</span>' : ''}<span class="node">${n}</span>`).join('')}
            </div>
          </div>
        </article>
      `;

    case 'tech':
      return `
        <article class="slide">
          <h2>${s.title}</h2>
          <div class="tech-grid">
            ${s.stack.map((t) => `<div class="tech">${t}</div>`).join('')}
          </div>
        </article>
      `;

    case 'demo-gallery':
      return `
        <article class="slide">
          <h2>${s.title}</h2>
          <div class="demo-grid">
            ${s.screens.map((sc) => `<div class="screen">Capture: ${sc}</div>`).join('')}
          </div>
        </article>
      `;

    case 'two-columns':
      return `
        <article class="slide">
          <h2>${s.title}</h2>
          <div class="grid-2">
            <div class="card"><h3>${s.leftTitle}</h3><ul>${s.left.map((x) => `<li>${x}</li>`).join('')}</ul></div>
            <div class="card"><h3>${s.rightTitle}</h3><ul>${s.right.map((x) => `<li>${x}</li>`).join('')}</ul></div>
          </div>
        </article>
      `;

    case 'thanks':
      return `
        <article class="slide cover">
          <h2>${s.title}</h2>
          <p class="subtitle">${s.subtitle || ''}</p>
          <div class="card">Merci pour votre attention.</div>
        </article>
      `;

    default:
      return `
        <article class="slide">
          <h2>${s.title || 'Slide'}</h2>
          <div class="card">Type de slide non supporté.</div>
        </article>
      `;
  }
}
