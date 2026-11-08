// Language registry and translation loader.
//
// To add a language:
//   1. Copy locales/en.json to locales/<code>.json and translate every value.
//   2. Add one line to LANGUAGES below (code, English name, native name, text direction, speech tag).
// Missing keys fall back to English, so a partial file still works while it's being translated.

export const LANGUAGES = [
  { code: 'en', name: 'English',    native: 'English',          dir: 'ltr', speech: 'en-US' },
  { code: 'zh', name: 'Chinese',    native: '中文（简体）',        dir: 'ltr', speech: 'zh-CN' },
  { code: 'hi', name: 'Hindi',      native: 'हिन्दी',             dir: 'ltr', speech: 'hi-IN' },
  { code: 'es', name: 'Spanish',    native: 'Español',          dir: 'ltr', speech: 'es-ES' },
  { code: 'fr', name: 'French',     native: 'Français',         dir: 'ltr', speech: 'fr-FR' },
  { code: 'ar', name: 'Arabic',     native: 'العربية',           dir: 'rtl', speech: 'ar-SA' },
  { code: 'bn', name: 'Bengali',    native: 'বাংলা',             dir: 'ltr', speech: 'bn-BD' },
  { code: 'pt', name: 'Portuguese', native: 'Português',        dir: 'ltr', speech: 'pt-BR' },
  { code: 'ru', name: 'Russian',    native: 'Русский',          dir: 'ltr', speech: 'ru-RU' },
  { code: 'ur', name: 'Urdu',       native: 'اردو',              dir: 'rtl', speech: 'ur-PK' },
  { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia', dir: 'ltr', speech: 'id-ID' },
  { code: 'de', name: 'German',     native: 'Deutsch',          dir: 'ltr', speech: 'de-DE' },
  { code: 'ja', name: 'Japanese',   native: '日本語',             dir: 'ltr', speech: 'ja-JP' },
  { code: 'sw', name: 'Swahili',    native: 'Kiswahili',        dir: 'ltr', speech: 'sw-KE' },
  { code: 'tr', name: 'Turkish',    native: 'Türkçe',           dir: 'ltr', speech: 'tr-TR' },
  { code: 'ko', name: 'Korean',     native: '한국어',             dir: 'ltr', speech: 'ko-KR' },
  { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt',       dir: 'ltr', speech: 'vi-VN' },
  { code: 'it', name: 'Italian',    native: 'Italiano',         dir: 'ltr', speech: 'it-IT' },
  { code: 'tl', name: 'Filipino',   native: 'Filipino',         dir: 'ltr', speech: 'fil-PH' },
  { code: 'fa', name: 'Persian',    native: 'فارسی',             dir: 'rtl', speech: 'fa-IR' },
];

const STORAGE_KEY = 'storyverse.lang';
const cache = new Map();
let current = 'en';

export const getLanguage = (code) => LANGUAGES.find((l) => l.code === code) || LANGUAGES[0];
export const currentLanguage = () => getLanguage(current);

// Pick a starting language: saved choice, then the browser's preferred languages, then English.
export function detectLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && LANGUAGES.some((l) => l.code === saved)) return saved;
  } catch { /* storage blocked */ }
  for (const tag of navigator.languages || [navigator.language || 'en']) {
    const base = tag.toLowerCase().split('-')[0];
    const code = base === 'fil' ? 'tl' : base;
    if (LANGUAGES.some((l) => l.code === code)) return code;
  }
  return 'en';
}

export async function loadLocale(code) {
  if (cache.has(code)) return cache.get(code);
  const res = await fetch(`locales/${code}.json`);
  if (!res.ok) throw new Error(`Missing locale ${code}`);
  const dict = await res.json();
  cache.set(code, dict);
  return dict;
}

export async function setLanguage(code) {
  const lang = getLanguage(code);
  await Promise.all([loadLocale('en'), loadLocale(lang.code)]);
  current = lang.code;
  document.documentElement.lang = lang.code;
  document.documentElement.dir = lang.dir;
  try { localStorage.setItem(STORAGE_KEY, lang.code); } catch { /* ignore */ }
}

function format(str, vars) {
  return str.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));
}

// Translate a key in the current UI language (or a given one), with English fallback.
export function t(key, vars = {}, code = current) {
  const dict = cache.get(code) || {};
  const en = cache.get('en') || {};
  return format(dict[key] ?? en[key] ?? key, vars);
}

// Localised number formatting, so "3 scenes" uses native digits where the locale prefers them.
export const formatNumber = (n, code = current) => new Intl.NumberFormat(code === 'tl' ? 'fil' : code).format(n);

// Name of a language as written in the current UI language, e.g. "japonés" when the UI is Spanish.
export function languageName(code, inCode = current) {
  try {
    const dn = new Intl.DisplayNames([inCode === 'tl' ? 'fil' : inCode], { type: 'language' });
    return dn.of(code === 'tl' ? 'fil' : code) || getLanguage(code).name;
  } catch {
    return getLanguage(code).name;
  }
}
