// AI providers. The app only talks to these functions, so swapping the demo
// generator for real models is a change in this file, not in the UI.
//
// Production shape (see docs/AI_PIPELINE.md):
//   POST /api/stories        { prompt, lang, genre, style, scenes } -> Story
//   POST /api/stories/:id/continue                              -> Scene
// The server calls a text model (writes the story directly in `lang`), then an
// image model per scene, then an image-to-video model for a 4–6 s clip, then TTS.
// Each scene may then carry `image`, `video` and `audio` URLs; the player uses them
// when present and falls back to the procedural art in js/scene.js otherwise.

import { loadLocale } from './i18n.js';

const API_BASE = window.STORYVERSE_API || ''; // set to e.g. 'https://api.example.com' to use a backend

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const uid = () => Math.random().toString(36).slice(2, 10);

function fill(str, idea) {
  return str.replace('{idea}', idea);
}

// Demo generator: builds a story from the story language's templates, on the device.
async function demoGenerate({ prompt, lang, genre, style, scenes }) {
  const dict = await loadLocale(lang);
  const idea = prompt.trim().replace(/[.。!！?？…]+$/u, '');
  const keys = scenes >= 5 ? ['tpl.1', 'tpl.2', 'tpl.5', 'tpl.3', 'tpl.4'] : ['tpl.1', 'tpl.2', 'tpl.4'];
  await wait(1200);
  const title = idea.length > 48 ? idea.slice(0, 46) + '…' : idea;
  return {
    id: 'u-' + uid(), lang, genre, style, author: null, likes: 0, mine: true, createdAt: Date.now(),
    title: title.charAt(0).toLocaleUpperCase(lang) + title.slice(1),
    scenes: keys.map((k) => ({ text: fill(dict[k], idea) })),
  };
}

async function demoContinue(story) {
  const dict = await loadLocale(story.lang);
  await wait(700);
  return { text: dict['tpl.more'] };
}

async function api(path, body) {
  const res = await fetch(API_BASE + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export const isDemo = () => !API_BASE;

export function generateStory(input) {
  return API_BASE ? api('/api/stories', input) : demoGenerate(input);
}

export function continueStory(story) {
  return API_BASE ? api(`/api/stories/${story.id}/continue`, {}) : demoContinue(story);
}
