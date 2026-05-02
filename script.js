// ─── CONFIG ──────────────────────────────────────────────────────────────────
const CELL    = 7;     // px per cell
const FPS     = 12;    // simulation steps per second
const DENSITY = 0.28;  // initial live cell probability

// ─── CANVAS SETUP ────────────────────────────────────────────────────────────
const canvas = document.getElementById(‘c’);
const glassC = document.getElementById(‘glass’);
const ctx    = canvas.getContext(‘2d’);
const gctx   = glassC.getContext(‘2d’);

// Jar dimensions in cells
const COLS = 54;
const ROWS = 78;

const W = COLS * CELL;
const H = ROWS * CELL;

canvas.width  = glassC.width  = W;
canvas.height = glassC.height = H;

// ─── JAR PATH ────────────────────────────────────────────────────────────────
// Defined as a Path2D so we can use isPointInPath() for the cell mask
// and for hit-testing mouse/touch input.
const JAR = new Path2D();

(function buildJar() {
const cx = W / 2;

// Half-widths at key horizontal sections
const neckHalf  = W * 0.14;  // narrowest part of the neck
const lipHalf   = W * 0.18;  // opening at the very top
const bellyHalf = W * 0.42;  // widest point of the jar
const baseHalf  = W * 0.38;  // bottom base (slightly narrower than belly)

// Vertical key positions
const yTop      = H * 0.03;
const yLip      = H * 0.07;
const yNeckBot  = H * 0.17;
const yBellyTop = H * 0.26;
const yBellyBot = H * 0.88;
const yBase     = H * 0.97;

JAR.moveTo(cx - lipHalf, yTop);
JAR.lineTo(cx + lipHalf, yTop);

// Right side: lip → neck → shoulder → belly → base
JAR.bezierCurveTo(cx + lipHalf,  yLip,      cx + neckHalf, yLip,      cx + neckHalf, yNeckBot);
JAR.bezierCurveTo(cx + neckHalf, yBellyTop, cx + bellyHalf, yBellyTop, cx + bellyHalf, yBellyTop + (yBellyBot - yBellyTop) * 0.1);
JAR.bezierCurveTo(cx + bellyHalf, yBellyBot, cx + baseHalf, yBellyBot, cx + baseHalf, yBase);

// Base
JAR.lineTo(cx - baseHalf, yBase);

// Left side (mirror of right)
JAR.bezierCurveTo(cx - baseHalf,  yBellyBot, cx - bellyHalf, yBellyBot, cx - bellyHalf, yBellyTop + (yBellyBot - yBellyTop) * 0.1);
JAR.bezierCurveTo(cx - bellyHalf, yBellyTop, cx - neckHalf,  yBellyTop, cx - neckHalf,  yNeckBot);
JAR.bezierCurveTo(cx - neckHalf,  yLip,      cx - lipHalf,   yLip,      cx - lipHalf,   yTop);

JAR.closePath();
})();

// ─── CELL MASK ───────────────────────────────────────────────────────────────
// Precomputed once at startup. 1 = cell is inside the jar, 0 = outside.
// Avoids calling isPointInPath() on every cell every tick.
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

function idx(col, row) {
return row * COLS + col;
}

function randomise() {
for (let i = 0; i < grid.length; i++) {
grid[i] = mask[i] && Math.random() < DENSITY ? 1 : 0;
}
}

function clearGrid() {
grid.fill(0);
}

randomise();

// ─── GAME OF LIFE STEP ───────────────────────────────────────────────────────
function step() {
for (let row = 0; row < ROWS; row++) {
for (let col = 0; col < COLS; col++) {
if (!mask[idx(col, row)]) {
next[idx(col, row)] = 0;
continue;
}

```
  let neighbours = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const r2 = row + dr;
      const c2 = col + dc;
      if (r2 >= 0 && r2 < ROWS && c2 >= 0 && c2 < COLS) {
        neighbours += grid[idx(c2, r2)];
      }
    }
  }

  const alive = grid[idx(col, row)];
  next[idx(col, row)] = alive
    ? (neighbours === 2 || neighbours === 3 ? 1 : 0)
    : (neighbours === 3 ? 1 : 0);
}
```

}

// Swap buffers — avoids allocating a new array each tick
[grid, next] = [next, grid];
}

// ─── SOIL TEXTURE ────────────────────────────────────────────────────────────
// Generated once into an offscreen canvas and reused every render frame.
const soilCanvas    = document.createElement(‘canvas’);
soilCanvas.width    = W;
soilCanvas.height   = H;
const sctx          = soilCanvas.getContext(‘2d’);

(function buildSoil() {
const imageData = sctx.createImageData(W, H);
const d         = imageData.data;
for (let i = 0; i < d.length; i += 4) {
const v = 18 + Math.random() * 16 | 0;
d[i]     = v + 8;   // R
d[i + 1] = v + 2;   // G
d[i + 2] = v - 4;   // B
d[i + 3] = 255;     // A
}
sctx.putImageData(imageData, 0, 0);
})();

// ─── RENDER ──────────────────────────────────────────────────────────────────
function render() {
ctx.clearRect(0, 0, W, H);

// Clip all drawing to the jar silhouette
ctx.save();
ctx.clip(JAR);

// Soil background
ctx.drawImage(soilCanvas, 0, 0);

// Live cells
for (let row = 0; row < ROWS; row++) {
for (let col = 0; col < COLS; col++) {
if (!mask[idx(col, row)]) continue;
if (!grid[idx(col, row)]) continue;

```
  const x = col * CELL;
  const y = row * CELL;

  // Radial glow around cell
  const grd = ctx.createRadialGradient(
    x + CELL / 2, y + CELL / 2, 0,
    x + CELL / 2, y + CELL / 2, CELL * 1.4
  );
  grd.addColorStop(0,   'rgba(255,140,30,0.55)');
  grd.addColorStop(0.5, 'rgba(200,90,10,0.18)');
  grd.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.fillStyle = grd;
  ctx.fillRect(x - CELL, y - CELL, CELL * 3, CELL * 3);

  // Core cell body
  ctx.fillStyle = '#e8973a';
  ctx.fillRect(x + 1, y + 1, CELL - 2, CELL - 2);

  // Inner highlight (top-left corner)
  ctx.fillStyle = 'rgba(255,220,140,0.55)';
  ctx.fillRect(x + 2, y + 2, CELL - 5, 2);
}
```

}

ctx.restore();

// Jar outline
ctx.save();
ctx.strokeStyle = ‘rgba(140,100,50,0.55)’;
ctx.lineWidth   = 1.5;
ctx.stroke(JAR);
ctx.restore();
}

// ─── GLASS OVERLAY ───────────────────────────────────────────────────────────
// Static layer — rendered once, composited on top of the simulation canvas.
function renderGlass() {
gctx.clearRect(0, 0, W, H);

gctx.save();
gctx.clip(JAR);

// Left shine band
const shineL = gctx.createLinearGradient(0, 0, W * 0.22, 0);
shineL.addColorStop(0,    ‘rgba(255,255,255,0)’);
shineL.addColorStop(0.4,  ‘rgba(200,230,255,0.07)’);
shineL.addColorStop(0.75, ‘rgba(255,255,255,0.11)’);
shineL.addColorStop(1,    ‘rgba(255,255,255,0)’);
gctx.fillStyle = shineL;
gctx.fillRect(0, 0, W * 0.22, H);

// Right shine band (narrower)
const shineR = gctx.createLinearGradient(W * 0.82, 0, W, 0);
shineR.addColorStop(0,   ‘rgba(255,255,255,0)’);
shineR.addColorStop(0.5, ‘rgba(200,230,255,0.05)’);
shineR.addColorStop(1,   ‘rgba(255,255,255,0)’);
gctx.fillStyle = shineR;
gctx.fillRect(W * 0.82, 0, W * 0.18, H);

gctx.restore();

// Subtle blue glow along the jar edge
gctx.save();
gctx.strokeStyle = ‘rgba(160,220,255,0.13)’;
gctx.lineWidth   = 3;
gctx.stroke(JAR);
gctx.restore();
}

renderGlass();

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

// ─── MOUSE INTERACTION ───────────────────────────────────────────────────────
let painting   = false;
let paintValue = 1; // 1 = draw live, 0 = draw dead

function cellAt(e) {
const rect = canvas.getBoundingClientRect();
const x    = e.clientX - rect.left;
const y    = e.clientY - rect.top;
const col  = Math.floor(x / CELL);
const row  = Math.floor(y / CELL);
return { col, row, x, y };
}

function paint(e) {
const { col, row, x, y } = cellAt(e);
if (col < 0 || col >= COLS || row < 0 || row >= ROWS) return;
if (!mask[idx(col, row)]) return;
if (!ctx.isPointInPath(JAR, x, y)) return;
grid[idx(col, row)] = paintValue;
}

canvas.addEventListener(‘mousedown’, e => {
e.preventDefault();
painting   = true;
paintValue = e.button === 2 ? 0 : 1;
paint(e);
});

canvas.addEventListener(‘mousemove’, e => {
if (!painting) return;
paint(e);
});

canvas.addEventListener(‘mouseup’,    () => { painting = false; });
canvas.addEventListener(‘mouseleave’, () => { painting = false; });
canvas.addEventListener(‘contextmenu’, e => e.preventDefault());

// ─── TOUCH INTERACTION ───────────────────────────────────────────────────────
canvas.addEventListener(‘touchstart’, e => {
e.preventDefault();
painting   = true;
paintValue = 1;
paint(e.touches[0]);
}, { passive: false });

canvas.addEventListener(‘touchmove’, e => {
e.preventDefault();
if (!painting) return;
paint(e.touches[0]);
}, { passive: false });

canvas.addEventListener(‘touchend’, () => { painting = false; });

// ─── CONTROLS ────────────────────────────────────────────────────────────────
const btnPlay  = document.getElementById(‘btnPlay’);
const btnReset = document.getElementById(‘btnReset’);
const btnClear = document.getElementById(‘btnClear’);

btnPlay.addEventListener(‘click’, () => {
running = !running;
btnPlay.textContent = running ? ‘⏸ Pause’ : ‘▶ Play’;
btnPlay.classList.toggle(‘active’, running);
});

btnReset.addEventListener(‘click’, () => { randomise(); });
btnClear.addEventListener(‘click’, () => { clearGrid(); });
