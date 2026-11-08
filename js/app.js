import { LANGUAGES, getLanguage, currentLanguage, detectLanguage, setLanguage, t, formatNumber, languageName } from './i18n.js';
import { buildScene, drawScene, fitCanvas } from './scene.js';
import { SAMPLE_STORIES } from './stories.js';
import { generateStory, continueStory, isDemo } from './providers.js';

const GENRES = ['fantasy', 'scifi', 'romance', 'mystery', 'adventure', 'comedy'];
const STYLES = ['watercolor', 'anime', 'cinematic', 'storybook'];
const MINE_KEY = 'storyverse.mine';

const view = document.getElementById('view');
const langSelect = document.getElementById('lang-select');

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// ---------- user stories (kept in this browser until accounts exist) ----------
function loadMine() {
  try { return JSON.parse(localStorage.getItem(MINE_KEY)) || []; } catch { return []; }
}
function saveMine(list) {
  try { localStorage.setItem(MINE_KEY, JSON.stringify(list)); } catch { /* storage full or blocked */ }
}
const allStories = () => [...loadMine(), ...SAMPLE_STORIES];
const findStory = (id) => allStories().find((s) => s.id === id);

// ---------- animation: one loop drives whatever is currently playing ----------
const animations = new Set();
let rafId = 0;
function tick() {
  // Use performance.now(), not the rAF timestamp: the timestamp can be earlier than the
  // moment an animation started, which would give a negative elapsed time.
  const now = performance.now() / 1000;
  for (const a of animations) a(now);
  rafId = animations.size ? requestAnimationFrame(tick) : 0;
}
function animate(fn) {
  animations.add(fn);
  if (!rafId) rafId = requestAnimationFrame(tick);
  return () => animations.delete(fn);
}
let cleanups = [];
// Still frames (thumbnails, style previews) that need redrawing when the window resizes.
let redrawers = [];
function resetView() {
  cleanups.forEach((fn) => fn());
  cleanups = [];
  redrawers = [];
  animations.clear();
  if (window.speechSynthesis) speechSynthesis.cancel();
}

const sceneFor = (story, i) => buildScene(`${story.id}:${i}`, story.genre, story.style);

// ---------- shell ----------
function renderShell() {
  langSelect.innerHTML = LANGUAGES.map((l) =>
    `<option value="${l.code}" ${l.code === currentLanguage().code ? 'selected' : ''} lang="${l.code}">${esc(l.native)}</option>`).join('');
  langSelect.setAttribute('aria-label', t('lang.label'));
  document.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
  const route = location.hash.split('/')[1] || '';
  document.querySelectorAll('.nav a').forEach((a) => a.classList.toggle('active', a.dataset.route === route));
  document.title = `Storyverse · ${t('app.tagline')}`;
}

// ---------- story card ----------
function cardHTML(story) {
  const lang = getLanguage(story.lang);
  const showEn = story.titleEn && story.titleEn !== story.title && currentLanguage().code !== story.lang;
  return `
    <a class="card" href="#/story/${esc(story.id)}" data-id="${esc(story.id)}">
      <div class="card-media">
        <canvas aria-hidden="true"></canvas>
        <span class="badge" lang="${lang.code}">${esc(lang.native)}</span>
        <span class="play-hint" aria-hidden="true">▶</span>
      </div>
      <div class="card-body">
        <h3 lang="${lang.code}" dir="${lang.dir}">${esc(story.title)}</h3>
        ${showEn ? `<p class="card-sub" lang="en" dir="ltr">${esc(story.titleEn)}</p>` : ''}
        <p class="card-meta">
          <span>${esc(t(`genre.${story.genre}`))}</span>
          <span>${esc(t('card.scenes', { n: formatNumber(story.scenes.length) }))}</span>
          ${story.likes ? `<span>♥ ${formatNumber(story.likes)}</span>` : ''}
        </p>
        ${story.author ? `<p class="card-author">${esc(t('card.by', { name: story.author }))}</p>` : ''}
      </div>
    </a>`;
}

// Cards show a still frame, and play a short looping clip on hover or focus.
function wireCards(root) {
  root.querySelectorAll('.card').forEach((card) => {
    const story = findStory(card.dataset.id);
    const canvas = card.querySelector('canvas');
    const scenes = story.scenes.map((_, i) => sceneFor(story, i));
    const still = () => { const [ctx, w, h] = fitCanvas(canvas); drawScene(ctx, w, h, scenes[0], 0); };
    requestAnimationFrame(still);
    redrawers.push(() => { if (!stop) still(); });
    let stop = null;
    const start = () => {
      if (stop) return;
      const t0 = performance.now() / 1000;
      stop = animate((now) => {
        const el = now - t0;
        const idx = Math.floor(el / 3) % scenes.length;
        const [ctx, w, h] = fitCanvas(canvas);
        drawScene(ctx, w, h, scenes[idx], el % 3);
      });
    };
    const end = () => { if (stop) { stop(); stop = null; still(); } };
    card.addEventListener('pointerenter', start);
    card.addEventListener('pointerleave', end);
    card.addEventListener('focus', start);
    card.addEventListener('blur', end);
  });
}

// ---------- views ----------
let feedFilter = 'all';

function homeView() {
  const ui = currentLanguage().code;
  const stories = allStories().filter((s) => feedFilter === 'all' || s.lang === ui);
  view.innerHTML = `
    <section class="hero">
      <div class="hero-copy">
        <h1>${esc(t('hero.title'))}</h1>
        <p>${esc(t('hero.subtitle'))}</p>
        <a class="btn primary" href="#/create">${esc(t('hero.cta'))}</a>
      </div>
      <div class="hero-art"><canvas aria-hidden="true"></canvas></div>
    </section>
    <section>
      <div class="section-head">
        <h2>${esc(t('feed.title'))}</h2>
        <div class="chips" role="group">
          <button class="chip ${feedFilter === 'all' ? 'on' : ''}" data-filter="all">${esc(t('feed.all'))}</button>
          <button class="chip ${feedFilter === 'mine' ? 'on' : ''}" data-filter="mine">${esc(t('feed.mine'))}</button>
        </div>
      </div>
      <div class="grid">${stories.map(cardHTML).join('') || `<p class="empty">${esc(t('mine.empty'))}</p>`}</div>
    </section>`;
  view.querySelectorAll('[data-filter]').forEach((b) => b.addEventListener('click', () => { feedFilter = b.dataset.filter; homeView(); }));
  wireCards(view);

  const heroCanvas = view.querySelector('.hero-art canvas');
  const heroScenes = SAMPLE_STORIES.slice(0, 4).map((s) => sceneFor(s, 0));
  const t0 = performance.now() / 1000;
  cleanups.push(animate((now) => {
    const el = now - t0;
    const [ctx, w, h] = fitCanvas(heroCanvas);
    drawScene(ctx, w, h, heroScenes[Math.floor(el / 5) % heroScenes.length], el % 5);
  }));
}

function createView() {
  const ui = currentLanguage().code;
  view.innerHTML = `
    <section class="create">
      <h1>${esc(t('create.title'))}</h1>
      <form id="create-form" class="panel">
        <label class="field">
          <span>${esc(t('create.prompt'))}</span>
          <textarea name="prompt" rows="3" required maxlength="400" placeholder="${esc(t('create.placeholder'))}"></textarea>
        </label>
        <div class="row">
          <label class="field">
            <span>${esc(t('create.storyLang'))}</span>
            <select name="lang">${LANGUAGES.map((l) => `<option value="${l.code}" ${l.code === ui ? 'selected' : ''}>${esc(l.native)}</option>`).join('')}</select>
          </label>
          <label class="field">
            <span>${esc(t('create.length'))}</span>
            <select name="scenes">
              <option value="3">${esc(t('create.short'))}</option>
              <option value="5">${esc(t('create.medium'))}</option>
            </select>
          </label>
        </div>
        <fieldset class="field">
          <legend>${esc(t('create.genre'))}</legend>
          <div class="chips">${GENRES.map((g, i) => `<label class="chip"><input type="radio" name="genre" value="${g}" ${i === 0 ? 'checked' : ''}><span>${esc(t(`genre.${g}`))}</span></label>`).join('')}</div>
        </fieldset>
        <fieldset class="field">
          <legend>${esc(t('create.style'))}</legend>
          <div class="styles">${STYLES.map((s, i) => `
            <label class="style-opt">
              <input type="radio" name="style" value="${s}" ${i === 3 ? 'checked' : ''}>
              <canvas data-style="${s}" aria-hidden="true"></canvas>
              <span>${esc(t(`style.${s}`))}</span>
            </label>`).join('')}</div>
        </fieldset>
        <button class="btn primary" type="submit">${esc(t('create.submit'))}</button>
        ${isDemo() ? `<p class="note">${esc(t('create.demo'))}</p>` : ''}
      </form>
    </section>`;

  const form = view.querySelector('#create-form');
  const drawStyles = () => {
    const genre = form.elements.genre.value;
    form.querySelectorAll('canvas[data-style]').forEach((c) => {
      const [ctx, w, h] = fitCanvas(c);
      drawScene(ctx, w, h, buildScene('preview', genre, c.dataset.style), 0);
    });
  };
  requestAnimationFrame(drawStyles);
  redrawers.push(drawStyles);
  form.addEventListener('change', (e) => { if (e.target.name === 'genre') drawStyles(); });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true;
    btn.textContent = t('create.working');
    try {
      // Read through form.elements: form.lang and form.style are built-in element properties.
      const f = form.elements;
      const story = await generateStory({
        prompt: f.prompt.value, lang: f.lang.value, genre: f.genre.value,
        style: f['style'].value, scenes: Number(f.scenes.value),
      });
      saveMine([story, ...loadMine()]);
      location.hash = `#/story/${story.id}`;
    } catch (err) {
      console.error(err);
      btn.disabled = false;
      btn.textContent = t('create.submit');
    }
  });
}

function mineView() {
  const mine = loadMine();
  view.innerHTML = `
    <section>
      <div class="section-head"><h1>${esc(t('nav.mine'))}</h1><a class="btn primary" href="#/create">${esc(t('hero.cta'))}</a></div>
      ${mine.length ? `<div class="grid">${mine.map(cardHTML).join('')}</div>` : `<p class="empty">${esc(t('mine.empty'))}</p>`}
    </section>`;
  wireCards(view);
}

// ---------- story player: vertical clip with captions, narration and translation ----------
function storyView(id) {
  const story = findStory(id);
  if (!story) { location.hash = '#/'; return; }
  const lang = getLanguage(story.lang);
  const hasTranslation = story.scenes.some((s) => s.en);
  let index = 0;
  let playing = true;
  let narrate = false;
  let showEn = false;
  let sceneStart = performance.now() / 1000;
  let scenes = story.scenes.map((_, i) => sceneFor(story, i));

  view.innerHTML = `
    <section class="player-wrap">
      <div class="player" tabindex="0">
        <canvas aria-hidden="true"></canvas>
        <div class="segments"></div>
        <button class="tap prev" aria-label="‹"></button>
        <button class="tap next" aria-label="›"></button>
        <div class="caption">
          <p class="caption-text" lang="${lang.code}" dir="${lang.dir}"></p>
          <p class="caption-en" lang="en" dir="ltr" hidden></p>
        </div>
      </div>
      <aside class="story-info">
        <p class="eyebrow">${esc(t(`genre.${story.genre}`))} · ${esc(t(`style.${story.style}`))}</p>
        <h1 lang="${lang.code}" dir="${lang.dir}">${esc(story.title)}</h1>
        ${story.titleEn && story.titleEn !== story.title ? `<p class="card-sub" lang="en" dir="ltr">${esc(story.titleEn)}</p>` : ''}
        <p class="meta">${esc(t('story.original', { lang: languageName(story.lang) }))}${story.author ? ` · ${esc(t('card.by', { name: story.author }))}` : ''}</p>
        <div class="controls">
          <button class="btn" data-act="play"></button>
          <button class="btn" data-act="narrate" aria-pressed="false">🔊 ${esc(t('story.narrate'))}</button>
          ${hasTranslation ? `<button class="btn" data-act="translate" aria-pressed="false">${esc(t('story.translation'))}</button>` : ''}
        </div>
        <ol class="scene-list"></ol>
        ${story.mine ? `<button class="btn primary" data-act="continue">${esc(t('story.continue'))}</button>` : ''}
      </aside>
    </section>`;

  const canvas = view.querySelector('.player canvas');
  const segs = view.querySelector('.segments');
  const capText = view.querySelector('.caption-text');
  const capEn = view.querySelector('.caption-en');
  const list = view.querySelector('.scene-list');
  const playBtn = view.querySelector('[data-act=play]');

  const duration = (i) => Math.min(14, Math.max(6, 3 + story.scenes[i].text.length * 0.05));

  function renderStatic() {
    segs.innerHTML = story.scenes.map(() => '<span><i></i></span>').join('');
    list.innerHTML = story.scenes.map((s, i) => `
      <li data-i="${i}">
        <button>
          <span class="scene-n">${esc(t('story.scene', { n: formatNumber(i + 1) }))}</span>
          <span lang="${lang.code}" dir="${lang.dir}">${esc(s.text)}</span>
          ${showEn && s.en ? `<span class="en" lang="en" dir="ltr">${esc(s.en)}</span>` : ''}
        </button>
      </li>`).join('');
    list.querySelectorAll('li').forEach((li) => li.addEventListener('click', () => go(Number(li.dataset.i))));
    sync();
  }

  function sync() {
    const s = story.scenes[index];
    capText.textContent = s.text;
    capEn.textContent = s.en || '';
    capEn.hidden = !(showEn && s.en);
    list.querySelectorAll('li').forEach((li, i) => li.classList.toggle('on', i === index));
    playBtn.textContent = playing ? `❚❚ ${t('story.pause')}` : `▶ ${t('story.play')}`;
    segs.querySelectorAll('span').forEach((seg, i) => seg.classList.toggle('done', i < index));
  }

  function speak() {
    if (!narrate || !window.speechSynthesis) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(story.scenes[index].text);
    u.lang = lang.speech;
    const voice = speechSynthesis.getVoices().find((v) => v.lang.toLowerCase().startsWith(lang.speech.split('-')[0]));
    if (voice) u.voice = voice;
    speechSynthesis.speak(u);
  }

  function go(i) {
    index = (i + story.scenes.length) % story.scenes.length;
    sceneStart = performance.now() / 1000;
    sync();
    speak();
  }

  let pausedAt = 0;
  cleanups.push(animate((now) => {
    const el = playing ? now - sceneStart : pausedAt;
    if (playing) pausedAt = el;
    const d = duration(index);
    if (playing && el >= d) {
      if (index === story.scenes.length - 1) { playing = false; pausedAt = d; sync(); }
      else go(index + 1);
      return;
    }
    const [ctx, w, h] = fitCanvas(canvas);
    drawScene(ctx, w, h, scenes[index], el);
    const bar = segs.children[index]?.firstElementChild;
    if (bar) bar.style.transform = `scaleX(${Math.min(1, el / d)})`;
    [...segs.children].forEach((seg, i) => { if (i !== index) seg.firstElementChild.style.transform = `scaleX(${i < index ? 1 : 0})`; });
  }));

  playBtn.addEventListener('click', () => {
    if (!playing && index === story.scenes.length - 1 && pausedAt >= duration(index)) { go(0); playing = true; sync(); return; }
    playing = !playing;
    sceneStart = performance.now() / 1000 - pausedAt;
    sync();
  });
  view.querySelector('.prev').addEventListener('click', () => go(index - 1));
  view.querySelector('.next').addEventListener('click', () => go(index + 1));
  view.querySelector('[data-act=narrate]').addEventListener('click', (e) => {
    narrate = !narrate;
    e.currentTarget.setAttribute('aria-pressed', narrate);
    if (narrate) speak(); else if (window.speechSynthesis) speechSynthesis.cancel();
  });
  view.querySelector('[data-act=translate]')?.addEventListener('click', (e) => {
    showEn = !showEn;
    e.currentTarget.setAttribute('aria-pressed', showEn);
    renderStatic();
  });
  view.querySelector('[data-act=continue]')?.addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    const scene = await continueStory(story);
    story.scenes.push(scene);
    saveMine(loadMine().map((s) => (s.id === story.id ? story : s)));
    scenes = story.scenes.map((_, i) => sceneFor(story, i));
    btn.disabled = false;
    renderStatic();
    playing = true;
    go(story.scenes.length - 1);
  });
  const onKey = (e) => {
    if (e.key === 'ArrowRight') go(index + (lang.dir === 'rtl' ? -1 : 1));
    if (e.key === 'ArrowLeft') go(index + (lang.dir === 'rtl' ? 1 : -1));
  };
  document.addEventListener('keydown', onKey);
  cleanups.push(() => document.removeEventListener('keydown', onKey));

  renderStatic();
}

// ---------- router ----------
function route() {
  resetView();
  renderShell();
  const [, name, id] = location.hash.split('/');
  if (name === 'create') createView();
  else if (name === 'mine') mineView();
  else if (name === 'story' && id) storyView(decodeURIComponent(id));
  else homeView();
  window.scrollTo(0, 0);
}

langSelect.addEventListener('change', async () => {
  await setLanguage(langSelect.value);
  route();
});
window.addEventListener('hashchange', route);
let resizeTimer;
// Only redraw canvases on resize. Re-rendering the view would wipe a half-typed form,
// and on phones the on-screen keyboard fires resize events.
window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(() => redrawers.forEach((fn) => fn()), 150); });

await setLanguage(detectLanguage());
route();
