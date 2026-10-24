/* 3D 版冒烟测试：用假的 WebGL/DOM 跑一遍建村 + 首帧，抓运行时错误 */
const fs = require('fs');
const path = require('path');

let rafCb = null;

const gl = {
  VERTEX_SHADER: 1, FRAGMENT_SHADER: 2, COMPILE_STATUS: 3, LINK_STATUS: 4,
  ARRAY_BUFFER: 5, STATIC_DRAW: 6, FLOAT: 7, TRIANGLES: 8,
  DEPTH_TEST: 9, CULL_FACE: 10, BLEND: 11, SRC_ALPHA: 12, ONE_MINUS_SRC_ALPHA: 13,
  COLOR_BUFFER_BIT: 14, DEPTH_BUFFER_BIT: 15, LEQUAL: 16,
  createShader: () => ({}), shaderSource() {}, compileShader() {},
  getShaderParameter: () => true, getShaderInfoLog: () => '',
  createProgram: () => ({}), attachShader() {}, linkProgram() {},
  getProgramParameter: () => true, getProgramInfoLog: () => '',
  getAttribLocation: () => 0, getUniformLocation: () => ({}),
  createBuffer: () => ({}), bindBuffer() {}, bufferData() {},
  enableVertexAttribArray() {}, vertexAttribPointer() {},
  uniformMatrix4fv() {}, uniformMatrix3fv() {},
  uniform3fv() {}, uniform3f() {}, uniform1f() {},
  drawArrays() {}, clearColor() {}, clear() {},
  enable() {}, disable() {}, depthMask() {}, blendFunc() {},
  viewport() {}, getExtension: () => null, useProgram() {}
};

const ctx2d = {
  fillStyle: '', strokeStyle: '', lineWidth: 1, font: '', textAlign: '', lineCap: '',
  fillRect() {}, strokeRect() {}, clearRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, fill() {},
  ellipse() {}, arc() {}, closePath() {}, save() {}, restore() {}, translate() {}, rotate() {},
  scale() {}, drawImage() {}, setLineDash() {}, fillText() {}, strokeText() {},
  measureText() { return { width: 10 }; },
  createLinearGradient() { return { addColorStop() {} }; }
};

function makeEl(id) {
  return {
    id: id || '', width: 0, height: 0, textContent: '', innerHTML: '',
    style: {}, children: [],
    classList: { add() {}, remove() {}, contains() { return false; }, toggle() {} },
    addEventListener() {}, removeEventListener() {},
    setPointerCapture() {}, releasePointerCapture() {},
    appendChild() {},
    getContext: (t) => (t === '2d' ? ctx2d : gl),
    querySelector: () => ({ getBoundingClientRect: () => ({ left: 0, top: 0, width: 112, height: 112 }) }),
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 112, height: 112 })
  };
}

const els = new Map();
global.document = {
  getElementById(id) {
    if (!els.has(id)) els.set(id, makeEl(id));
    return els.get(id);
  },
  createElement(tag) { return makeEl(tag); },
  addEventListener() {},
  body: makeEl('body')
};
global.window = {
  addEventListener() {}, innerWidth: 1280, innerHeight: 800, devicePixelRatio: 1,
  requestAnimationFrame: (cb) => { rafCb = cb; return 1; }
};
global.requestAnimationFrame = (cb) => { rafCb = cb; return 1; };
global.performance = { now: () => 0 };
global.location = { search: '?ball=1' };

try {
  const code = fs.readFileSync(path.join(__dirname, '..', 'src', 'game.js'), 'utf8');
  new Function(code)();
  console.log('INIT OK');
  const G = global.window.__game;
  let now = 16;
  for (const p of [0.34, 0.38, 0.40, 0.42, 0.44, 0.46, 0.48, 0.50, 0.55]) {
    G.bball.phase = 'aim'; G.bball.ball = null; G.bball.made = false; G.bball.result = '';
    G.bball.power = p; G.bball.charging = true; G.bball.shots = 0; G.bball.wait = 0;
    G.shootBall();
    for (let i = 0; i < 130; i++) { now += 50; rafCb(now); }
    console.log('P', p.toFixed(2), 'RES', G.bball.result, 'SCORE', G.bball.score);
  }
  if (rafCb) {
    rafCb(16);
    console.log('FRAME OK');
  } else {
    console.log('NO RAF');
  }
} catch (e) {
  console.error('FAIL:', e && e.stack ? e.stack : e);
  process.exit(1);
}

