// Procedural scene art. Every scene gets a deterministic "picture" built from a seed,
// and the same model can be drawn as a still frame (thumbnails) or animated over time
// (the short video clips). When a real image/video model is connected, a scene's
// `image` or `video` URL replaces this placeholder art; see js/providers.js.

function seededRandom(seed) {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// [sky top, sky horizon, orb, near ground, particle]
const PALETTES = {
  fantasy:   [['#2a1b5c', '#e07ab8', '#ffe9a8', '#1a1035', '#fff3c4'], ['#13294b', '#7f6fd8', '#f6f1ff', '#0c1430', '#c9b8ff']],
  scifi:     [['#030b1f', '#1b6d8f', '#9ff4ff', '#020812', '#7fe7ff'], ['#140527', '#6a2c91', '#ffb3f5', '#07020f', '#ff9cf0']],
  romance:   [['#5b2a4d', '#ffa69e', '#fff1e0', '#2d1426', '#ffd1dc'], ['#3c1f3b', '#f78fb3', '#ffe8f0', '#1d0e1c', '#ffc2d6']],
  mystery:   [['#0d1b1e', '#35606b', '#d9efe9', '#050c0e', '#a7c4bf'], ['#16161f', '#4b4a6b', '#e6e2c8', '#08080d', '#b8b5a0']],
  adventure: [['#1d3557', '#f4a261', '#ffe66d', '#2b1d12', '#ffd38a'], ['#264653', '#e9c46a', '#fff8d6', '#1b1b0f', '#fbe7a1']],
  comedy:    [['#3a86ff', '#ffbe0b', '#ffffff', '#1d4e26', '#ffffff'], ['#00b4d8', '#ffd6a5', '#fffbe0', '#2d5a27', '#ffffff']],
};

const PARTICLES = { fantasy: 'sparkle', scifi: 'stars', romance: 'petals', mystery: 'fog', adventure: 'dust', comedy: 'bubbles' };

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
const mix = (a, b, k) => {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  return `rgb(${Math.round(r1 + (r2 - r1) * k)},${Math.round(g1 + (g2 - g1) * k)},${Math.round(b1 + (b2 - b1) * k)})`;
};

export function buildScene(seed, genre = 'fantasy', style = 'storybook') {
  const rand = seededRandom(seed);
  const set = PALETTES[genre] || PALETTES.fantasy;
  const [top, horizon, orb, ground, particle] = set[Math.floor(rand() * set.length)];
  const layers = [];
  const count = 4;
  for (let i = 0; i < count; i++) {
    const base = 0.5 + i * 0.11 + rand() * 0.04;
    const amp = 0.09 - i * 0.015;
    const points = [];
    const n = 18;
    let phase = rand() * Math.PI * 2;
    const freq = 1.5 + rand() * 2.5;
    for (let p = 0; p <= n; p++) {
      const x = p / n;
      const y = base - Math.abs(Math.sin(x * freq + phase)) * amp - rand() * amp * 0.35;
      points.push([x, y]);
    }
    layers.push({ points, color: mix(horizon, ground, (i + 1) / count) });
  }
  const stars = Array.from({ length: 70 }, () => [rand(), rand() * 0.5, rand() * 1.4 + 0.3, rand() * Math.PI * 2]);
  const parts = Array.from({ length: 40 }, () => [rand(), rand(), rand() * 0.8 + 0.4, rand() * Math.PI * 2]);
  return {
    top, horizon, orbColor: orb, particle,
    orb: { x: 0.2 + rand() * 0.6, y: 0.16 + rand() * 0.2, r: 0.06 + rand() * 0.06 },
    layers, stars, parts,
    particleKind: PARTICLES[genre] || 'sparkle',
    style,
  };
}

// Draw a scene. `t` is time in seconds (0 for a still frame).
export function drawScene(ctx, w, h, s, t = 0) {
  ctx.save();
  ctx.clearRect(0, 0, w, h);

  // Slow push-in, the "Ken Burns" move used for the clips.
  const zoom = 1 + Math.min(t, 8) * 0.012;
  ctx.translate(w / 2, h / 2);
  ctx.scale(zoom, zoom);
  ctx.translate(-w / 2, -h / 2);

  const sky = ctx.createLinearGradient(0, 0, 0, h * 0.75);
  sky.addColorStop(0, s.top);
  sky.addColorStop(1, s.horizon);
  ctx.fillStyle = sky;
  ctx.fillRect(-w * 0.1, -h * 0.1, w * 1.2, h * 1.2);

  // Stars twinkle on dark skies.
  if (['stars', 'sparkle', 'fog'].includes(s.particleKind)) {
    for (const [x, y, r, ph] of s.stars) {
      ctx.globalAlpha = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(t * 2 + ph));
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x * w, y * h, r * (w / 600), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Sun or moon with a soft glow, drifting slightly.
  const m = Math.min(w, h);
  const ox = s.orb.x * w + Math.sin(t * 0.3) * m * 0.01;
  const oy = s.orb.y * h + t * m * 0.002;
  const or = s.orb.r * m * 1.4;
  const glow = ctx.createRadialGradient(ox, oy, 0, ox, oy, or * 3);
  glow.addColorStop(0, s.orbColor);
  glow.addColorStop(0.3, s.orbColor + '66');
  glow.addColorStop(1, s.orbColor + '00');
  ctx.fillStyle = glow;
  ctx.fillRect(ox - or * 3, oy - or * 3, or * 6, or * 6);
  ctx.fillStyle = s.orbColor;
  ctx.beginPath();
  ctx.arc(ox, oy, or, 0, Math.PI * 2);
  ctx.fill();

  // Layered hills with parallax: nearer layers move more.
  s.layers.forEach((layer, i) => {
    const shift = Math.sin(t * 0.25) * (i + 1) * w * 0.006;
    ctx.fillStyle = layer.color;
    ctx.beginPath();
    ctx.moveTo(-w * 0.1, h * 1.1);
    layer.points.forEach(([x, y], idx) => {
      const px = x * w * 1.2 - w * 0.1 + shift;
      const py = y * h;
      if (idx === 0) ctx.lineTo(px, py);
      else {
        const [x0, y0] = layer.points[idx - 1];
        const cx = ((x0 + x) / 2) * w * 1.2 - w * 0.1 + shift;
        ctx.quadraticCurveTo(x0 * w * 1.2 - w * 0.1 + shift, y0 * h, cx, ((y0 + y) / 2) * h);
      }
    });
    ctx.lineTo(w * 1.1, h * 1.1);
    ctx.closePath();
    ctx.fill();
  });

  drawParticles(ctx, w, h, s, t);
  ctx.restore();

  // Style finish, drawn without the zoom.
  if (s.style === 'cinematic') {
    const v = ctx.createRadialGradient(w / 2, h / 2, m * 0.3, w / 2, h / 2, Math.max(w, h) * 0.75);
    v.addColorStop(0, 'rgba(0,0,0,0)');
    v.addColorStop(1, 'rgba(0,0,0,0.55)');
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
  } else if (s.style === 'watercolor') {
    ctx.fillStyle = 'rgba(255,250,240,0.16)';
    ctx.fillRect(0, 0, w, h);
  } else if (s.style === 'storybook') {
    ctx.fillStyle = 'rgba(255,214,150,0.10)';
    ctx.fillRect(0, 0, w, h);
  } else if (s.style === 'anime') {
    const shine = ctx.createLinearGradient(0, 0, w, h);
    shine.addColorStop(0, 'rgba(255,255,255,0.12)');
    shine.addColorStop(0.5, 'rgba(255,255,255,0)');
    ctx.fillStyle = shine;
    ctx.fillRect(0, 0, w, h);
  }
}

function drawParticles(ctx, w, h, s, t) {
  const m = Math.min(w, h);
  ctx.fillStyle = s.particle;
  for (const [x0, y0, size, ph] of s.parts) {
    let x = x0, y = y0, r = size * m * 0.006, a = 0.8;
    switch (s.particleKind) {
      case 'sparkle': y = (y0 - t * 0.02 * size + 1) % 1; a = 0.5 + 0.5 * Math.sin(t * 3 + ph); break;
      case 'petals':  y = (y0 + t * 0.04 * size) % 1; x = x0 + Math.sin(t + ph) * 0.03; r *= 1.4; break;
      case 'bubbles': y = 1 - ((1 - y0 + t * 0.05 * size) % 1); x = x0 + Math.sin(t * 1.5 + ph) * 0.02; r *= 2; a = 0.5; break;
      case 'fog':     x = (x0 + t * 0.01 * size) % 1; y = 0.55 + y0 * 0.4; r *= 14; a = 0.06; break;
      case 'dust':    x = (x0 + t * 0.03 * size) % 1; y = 0.4 + y0 * 0.6; a = 0.5; break;
      case 'stars':   x = (x0 - t * 0.06 * size + 1) % 1; y = y0 * 0.6; r *= 0.7; break;
    }
    ctx.globalAlpha = Math.max(0, Math.min(1, a));
    ctx.beginPath();
    if (s.particleKind === 'petals') ctx.ellipse(x * w, y * h, r, r * 0.55, t + ph, 0, Math.PI * 2);
    else ctx.arc(x * w, y * h, r, 0, Math.PI * 2);
    if (s.particleKind === 'bubbles') { ctx.strokeStyle = s.particle; ctx.lineWidth = 1.5; ctx.stroke(); }
    else ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// Size a canvas for its CSS box and the screen's pixel density. Returns [ctx, width, height].
export function fitCanvas(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rect = canvas.getBoundingClientRect();
  const w = Math.max(1, Math.round(rect.width * dpr));
  const h = Math.max(1, Math.round(rect.height * dpr));
  if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  return [canvas.getContext('2d'), w, h];
}
