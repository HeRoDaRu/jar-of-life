document.addEventListener('DOMContentLoaded', () => {

// ─── CONFIG ──────────────────────────────────────────────────────────────────
// Canvas internal resolution is fixed — CSS scales it visually.
// This means CELL, COLS, ROWS never change after load.
const CELL    = 7;
const FPS     = 12;
const DENSITY = 0.28;
const COLS    = 54;
const ROWS    = 78;
const W       = COLS * CELL;  // 378px internal
const H       = ROWS * CELL;  // 546px internal

// ─── CANVAS SETUP ────────────────────────────────────────────────────────────
const canvas = document.getElementById('c');
const glassC = document.getElementById('glass');
const ctx    = canvas.getContext('2d');
const gctx   = glassC.getContext('2d');

// Fixed internal resolution — CSS handles visual scaling
canvas.width  = glassC.width  = W;
canvas.height = glassC.height = H;

// ─── JAR PATH ────────────────────────────────────────────────────────────────
const JAR = new Path2D();

(function buildJar() {
const cx = W / 2;

const neckHalf  = W * 0.14;
const lipHalf   = W * 0.18;
const bellyHalf = W * 0.42;
const baseHalf  = W * 0.38;

const yTop      = H * 0.03;
const yLip      = H * 0.07;
const yNeckBot  = H * 0.17;
const yBellyTop = H * 0.26;
const yBellyBot = H * 0.88;
const yBase     = H * 0.97;

JAR.moveTo(cx - lipHalf, yTop);
JAR.lineTo(cx + lipHalf, yTop);

JAR.bezierCurveTo(cx + lipHalf,  yLip,      cx + neckHalf,  yLip,      cx + neckHalf,  yNeckBot);
JAR.bezierCurveTo(cx + neckHalf, yBellyTop, cx + bellyHalf, yBellyTop, cx + bellyHalf, yBellyTop + (yBellyBot - yBellyTop) * 0.1);
JAR.bezierCurveTo(cx + bellyHalf, yBellyBot, cx + baseHalf, yBellyBot, cx + baseHalf,  yBase);

JAR.lineTo(cx - baseHalf, yBase);

JAR.bezierCurveTo(cx - baseHalf,  yBellyBot, cx - bellyHalf, yBellyBot, cx - bellyHalf, yBellyTop + (yBellyBot - yBellyTop) * 0.1);
JAR.bezierCurveTo(cx - bellyHalf, yBellyTop, cx - neckHalf,  yBellyTop, cx - neckHalf,  yNeckBot);
JAR.bezierCurveTo(cx - neckHalf,  yLip,      cx - lipHalf,   yLip,      cx - lipHalf,   yTop);

JAR.closePath();
})();

// ─── CELL MASK ───────────────────────────────────────────────────────────────
const mask = new Uint8Array(COLS * ROWS);

for (let row = 0; row < ROWS; row++) {
for (let col = 0; col < COLS; col++) {
const px = col * CELL + CELL / 2;
const py = row * CELL + CELL / 2;
if (ctx.isPointInPath(JAR, px, py)) {
mask[row * COLS + col] = 1;
}
}
}

// ─── STATE ───────────────────────────────────────────────────────────────────
let grid     = new Uint8Array(COLS * ROWS);
let next     = new Uint8Array(COLS * ROWS);
let running  = true;
let lastTick = 0;

function idx(col, row) { return row * COLS + col; }

function randomise() {
for (let i = 0; i < grid.length; i++) {
grid[i] = mask[i] && Math.random() < DENSITY ? 1 : 0;
}
}

function clearGrid() { grid.fill(0); }

randomise();

// ─── GAME OF LIFE STEP ───────────────────────────────────────────────────────
function step() {
for (let row = 0; row < ROWS; row++) {
for (let col = 0; col < COLS; col++) {
if (!mask[idx(col, row)]) { next[idx(col, row)] = 0; continue; }

  let n = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r2 = row + dr, c2 = col + dc;
      if (r2 >= 0 && r2 < ROWS && c2 >= 0 && c2 < COLS) {
        n += grid[idx(c2, r2)];
      }
    }
  }

  const alive = grid[idx(col, row)];
  next[idx(col, row)] = alive ? (n === 2 || n === 3 ? 1 : 0) : (n === 3 ? 1 : 0);
}
}
[grid, next] = [next, grid];
}

// ─── SOIL TEXTURE ────────────────────────────────────────────────────────────
const soilCanvas = document.createElement('canvas');
soilCanvas.width  = W;
soilCanvas.height = H;
const sctx = soilCanvas.getContext('2d');

(function buildSoil() {
const id = sctx.createImageData(W, H);
const d  = id.data;
for (let i = 0; i < d.length; i += 4) {
const v  = 18 + Math.random() * 16 | 0;
d[i]     = v + 8;
d[i + 1] = v + 2;
d[i + 2] = v - 4;
d[i + 3] = 255;
}
sctx.putImageData(id, 0, 0);
})();

// ─── RENDER ──────────────────────────────────────────────────────────────────
function render() {
ctx.clearRect(0, 0, W, H);

ctx.save();
ctx.clip(JAR);
ctx.drawImage(soilCanvas, 0, 0);

for (let row = 0; row < ROWS; row++) {
for (let col = 0; col < COLS; col++) {
if (!mask[idx(col, row)] || !grid[idx(col, row)]) continue;

  const x = col * CELL;
  const y = row * CELL;

  const grd = ctx.createRadialGradient(
    x + CELL / 2, y + CELL / 2, 0,
    x + CELL / 2, y + CELL / 2, CELL * 1.4
  );
  grd.addColorStop(0,   'rgba(255,140,30,0.55)');
  grd.addColorStop(0.5, 'rgba(200,90,10,0.18)');
  grd.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.fillStyle = grd;
  ctx.fillRect(x - CELL, y - CELL, CELL * 3, CELL * 3);

  ctx.fillStyle = '#e8973a';
  ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);

  ctx.fillStyle = 'rgba(255,220,140,0.55)';
  ctx.fillRect(x + 2, y + 2, CELL - 5, 2);
}
}

ctx.restore();

ctx.save();
ctx.strokeStyle = 'rgba(140,100,50,0.55)';
ctx.lineWidth   = 1.5;
ctx.stroke(JAR);
ctx.restore();
}

// ─── GLASS OVERLAY ───────────────────────────────────────────────────────────
(function renderGlass() {
gctx.clearRect(0, 0, W, H);
gctx.save();
gctx.clip(JAR);

const shineL = gctx.createLinearGradient(0, 0, W * 0.22, 0);
shineL.addColorStop(0,    'rgba(255,255,255,0)');
shineL.addColorStop(0.4,  'rgba(200,230,255,0.07)');
shineL.addColorStop(0.75, 'rgba(255,255,255,0.11)');
shineL.addColorStop(1,    'rgba(255,255,255,0)');
gctx.fillStyle = shineL;
gctx.fillRect(0, 0, W * 0.22, H);

const shineR = gctx.createLinearGradient(W * 0.82, 0, W, 0);
shineR.addColorStop(0,   'rgba(255,255,255,0)');
shineR.addColorStop(0.5, 'rgba(200,230,255,0.05)');
shineR.addColorStop(1,   'rgba(255,255,255,0)');
gctx.fillStyle = shineR;
gctx.fillRect(W * 0.82, 0, W * 0.18, H);

gctx.restore();

gctx.save();
gctx.strokeStyle = 'rgba(160,220,255,0.13)';
gctx.lineWidth   = 3;
gctx.stroke(JAR);
gctx.restore();
})();

// ─── MAIN LOOP ───────────────────────────────────────────────────────────────
function loop(timestamp) {
if (running && timestamp - lastTick > 1000 / FPS) {
step();
lastTick = timestamp;
}
render();
requestAnimationFrame(loop);
}

requestAnimationFrame(loop);

// ─── INPUT: coordinate mapping ───────────────────────────────────────────────
// Canvas is CSS-scaled, so we must map from CSS pixels → canvas pixels
function cellAt(e) {
const rect   = canvas.getBoundingClientRect();
const scaleX = W / rect.width;
const scaleY = H / rect.height;
const x = (e.clientX - rect.left) * scaleX;
const y = (e.clientY - rect.top)  * scaleY;
return { col: Math.floor(x / CELL), row: Math.floor(y / CELL), x, y };
}

function paint(e) {
const { col, row, x, y } = cellAt(e);
if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return;
if (!mask[idx(col, row)]) return;
if (!ctx.isPointInPath(JAR, x, y)) return;
grid[idx(col, row)] = paintValue;
}

let painting   = false;
let paintValue = 1;

canvas.addEventListener('mousedown', e => {
e.preventDefault();
painting   = true;
paintValue = e.button === 2 ? 0 : 1;
paint(e);
});
canvas.addEventListener('mousemove', e => { if (painting) paint(e); });
canvas.addEventListener('mouseup',    () => { painting = false; });
canvas.addEventListener('mouseleave', () => { painting = false; });
canvas.addEventListener('contextmenu', e => e.preventDefault());

canvas.addEventListener('touchstart', e => {
e.preventDefault();
painting   = true;
paintValue = 1;
paint(e.touches[0]);
}, { passive: false });

canvas.addEventListener('touchmove', e => {
e.preventDefault();
if (painting) paint(e.touches[0]);
}, { passive: false });

canvas.addEventListener('touchend', () => { painting = false; });

// ─── CONTROLS ────────────────────────────────────────────────────────────────
const btnPlay  = document.getElementById('btnPlay');
const btnReset = document.getElementById('btnReset');
const btnClear = document.getElementById('btnClear');

btnPlay.addEventListener('click', () => {
running = !running;
btnPlay.textContent = running ? '⏸ Pause' : '▶ Play';
btnPlay.classList.toggle('active', running);
});

btnReset.addEventListener('click', () => { randomise(); });
btnClear.addEventListener('click', () => { clearGrid(); });

}); // ─── END DOMContentLoaded ────────────────────────────────────────────────