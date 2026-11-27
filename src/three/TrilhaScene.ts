/**
 * Tabuleiro 3D da Trilha do RH (Three.js).
 * Só desenha: recebe o estado do jogo em update() e anima os trabalhadores até as casas.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { houseType, type HouseType } from '../game/board';

export interface ScenePlayer {
  id: string;
  name: string;
  /** cor escolhida pelo jogador (vira a cor do capacete) */
  color: string;
}
export interface SceneState {
  players: ScenePlayer[];
  positions: number[];
  turn: number;
  /** peão da vez está andando (a câmera acompanha) */
  moving: boolean;
  round: number;
}

const TYPE: Record<HouseType, { neon: string; label: string }> = {
  normal: { neon: '#4fd1ff', label: '' },
  inicio: { neon: '#2fe37a', label: 'INÍCIO' },
  pergunta: { neon: '#3b8cff', label: 'PERGUNTA' },
  alerta: { neon: '#ffd21f', label: 'ALERTA' },
  prevencao: { neon: '#2fe37a', label: 'PREVENÇÃO' },
  desafio: { neon: '#c04dff', label: 'DESAFIO' },
  saude: { neon: '#ff8a2a', label: 'SAÚDE' },
  chegada: { neon: '#ffd166', label: 'CHEGADA' },
};

const TOP = 0.2;
const FLOOR = -0.75;
const HOP_MS = 330;
const WORKER_KINDS = ['inspetor', 'sipat', 'campo'] as const;
type WorkerKind = (typeof WORKER_KINDS)[number];
const OFFS = [new THREE.Vector3(-0.64, 0, 0.08), new THREE.Vector3(0, 0, -0.18), new THREE.Vector3(0.64, 0, 0.08)];

export function tileCenter(n: number) {
  const i = n - 1;
  const row = Math.floor(i / 5);
  let col = i % 5;
  if (row % 2 === 1) col = 4 - col;
  return new THREE.Vector3((col - 2) * 3.4, Math.sin(i * 0.55) * 0.45, (1.5 - row) * 3.8);
}

type Ctx = CanvasRenderingContext2D;
type Draw = (x: Ctx, w: number, h: number) => void;

function canvasTexture(draw: Draw, w = 256, h = 256) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const x = c.getContext('2d')!;
  x.lineJoin = 'round';
  x.lineCap = 'round';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  draw(x, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return { t, x, c };
}
function sprite(draw: Draw, w = 256, h = 256) {
  const { t, x } = canvasTexture(draw, w, h);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthWrite: false, toneMapped: false }));
  s.userData.redraw = (d: Draw) => {
    x.clearRect(0, 0, w, h);
    d(x, w, h);
    t.needsUpdate = true;
  };
  return s;
}
function radialTex(color: string) {
  return canvasTexture((x) => {
    const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
    g.addColorStop(0, color);
    g.addColorStop(1, 'transparent');
    x.fillStyle = g;
    x.fillRect(0, 0, 256, 256);
  }).t;
}
function glow(x: Ctx, color: string, blur = 22) {
  x.shadowColor = color;
  x.shadowBlur = blur;
}

// ---------- desenhos ----------
const drawWarning: Draw = (x) => {
  glow(x, '#ffd21f', 26);
  x.beginPath(); x.moveTo(128, 22); x.lineTo(238, 218); x.lineTo(18, 218); x.closePath();
  x.fillStyle = '#ffd21f'; x.fill(); x.shadowBlur = 0;
  x.lineWidth = 12; x.strokeStyle = '#111'; x.beginPath(); x.moveTo(128, 50); x.lineTo(214, 204); x.lineTo(42, 204); x.closePath(); x.stroke();
  x.fillStyle = '#111'; x.font = '900 120px Nunito, sans-serif'; x.fillText('!', 128, 150);
};
const drawShield: Draw = (x) => {
  glow(x, '#2fe37a', 26);
  x.beginPath(); x.moveTo(128, 18); x.lineTo(222, 52); x.quadraticCurveTo(222, 180, 128, 238); x.quadraticCurveTo(34, 180, 34, 52); x.closePath();
  const g = x.createLinearGradient(0, 18, 0, 238); g.addColorStop(0, '#5cf59a'); g.addColorStop(1, '#14a352'); x.fillStyle = g; x.fill();
  x.shadowBlur = 0; x.lineWidth = 8; x.strokeStyle = '#e9fff2'; x.stroke();
  x.lineWidth = 26; x.strokeStyle = '#ffffff'; x.beginPath(); x.moveTo(78, 128); x.lineTo(116, 166); x.lineTo(182, 92); x.stroke();
};
const drawHeart: Draw = (x) => {
  glow(x, '#ff5a4a', 28);
  x.beginPath(); x.moveTo(128, 226);
  x.bezierCurveTo(30, 160, 14, 100, 46, 62); x.bezierCurveTo(78, 26, 118, 44, 128, 76);
  x.bezierCurveTo(138, 44, 178, 26, 210, 62); x.bezierCurveTo(242, 100, 226, 160, 128, 226); x.closePath();
  const g = x.createLinearGradient(0, 40, 0, 226); g.addColorStop(0, '#ff8a6a'); g.addColorStop(1, '#e8322b'); x.fillStyle = g; x.fill();
  x.lineWidth = 10; x.strokeStyle = '#ffffff'; x.shadowColor = '#fff'; x.shadowBlur = 10;
  x.beginPath(); x.moveTo(30, 128); x.lineTo(84, 128); x.lineTo(102, 92); x.lineTo(124, 170); x.lineTo(146, 104); x.lineTo(160, 128); x.lineTo(226, 128); x.stroke();
};
const drawClipboard: Draw = (x) => {
  glow(x, '#3b8cff', 24);
  x.fillStyle = '#1f6fe0'; x.beginPath(); x.roundRect(46, 30, 164, 208, 18); x.fill(); x.shadowBlur = 0;
  x.fillStyle = '#f4f8ff'; x.beginPath(); x.roundRect(62, 54, 132, 170, 8); x.fill();
  x.fillStyle = '#9fb3c8'; x.beginPath(); x.roundRect(94, 18, 68, 34, 10); x.fill();
  for (let i = 0; i < 3; i++) {
    const y = 92 + i * 44;
    x.lineWidth = 9; x.strokeStyle = '#2fbf62'; x.beginPath(); x.moveTo(76, y); x.lineTo(88, y + 12); x.lineTo(106, y - 10); x.stroke();
    x.lineWidth = 10; x.strokeStyle = '#7d93ab'; x.beginPath(); x.moveTo(120, y); x.lineTo(178, y); x.stroke();
  }
};
const drawHardhat: Draw = (x) => {
  glow(x, '#ffd21f', 24);
  x.fillStyle = '#ffc61a'; x.beginPath(); x.moveTo(44, 170); x.bezierCurveTo(44, 70, 212, 70, 212, 170); x.closePath(); x.fill();
  x.shadowBlur = 0; x.fillStyle = '#ffdc55'; x.beginPath(); x.roundRect(108, 66, 40, 104, 12); x.fill();
  x.fillStyle = '#e0a800'; x.beginPath(); x.roundRect(20, 166, 216, 30, 15); x.fill();
};
const drawTrophy: Draw = (x, w) => {
  glow(x, '#ffd166', 30);
  const g = x.createLinearGradient(0, 30, 0, 200); g.addColorStop(0, '#fff1b8'); g.addColorStop(1, '#e6a400'); x.fillStyle = g;
  x.beginPath(); x.moveTo(78, 34); x.lineTo(178, 34); x.quadraticCurveTo(178, 130, 128, 140); x.quadraticCurveTo(78, 130, 78, 34); x.fill();
  x.lineWidth = 12; x.strokeStyle = '#ffcf4a';
  x.beginPath(); x.arc(70, 70, 26, Math.PI * 0.5, Math.PI * 1.5); x.stroke();
  x.beginPath(); x.arc(186, 70, 26, -Math.PI * 0.5, Math.PI * 0.5); x.stroke();
  x.fillRect(116, 138, 24, 34); x.beginPath(); x.roundRect(86, 170, 84, 22, 6); x.fill();
  x.shadowBlur = 12; x.fillStyle = '#ffffff'; x.font = '900 34px Nunito, sans-serif'; x.fillText('AMBIENTE', w / 2, 226); x.fillText('SEGURO', w / 2, 262);
};
function signFrame(x: Ctx, w: number, h: number, color: string, title: string) {
  glow(x, color, 20); x.lineWidth = 6; x.strokeStyle = color; x.fillStyle = 'rgba(6,18,36,.82)';
  x.beginPath(); x.roundRect(8, 8, w - 16, h - 16, 18); x.fill(); x.stroke();
  x.shadowBlur = 8; x.fillStyle = '#ffffff'; x.font = '900 30px Nunito, sans-serif';
  const lines = title.split('\n');
  lines.forEach((line, i) => x.fillText(line, w / 2, h - 30 - (lines.length - 1 - i) * 32));
  x.shadowBlur = 0; x.fillStyle = 'rgba(160,220,255,.06)';
  for (let y = 12; y < h - 12; y += 6) x.fillRect(12, y, w - 24, 2);
}
const SIGNS: { draw: Draw; at: [number, number, number] }[] = [
  { at: [-14.5, 3.2, -4], draw: (x, w, h) => {
    signFrame(x, w, h, '#3b8cff', 'USE EPI');
    x.fillStyle = '#1565C0'; glow(x, '#3b8cff', 16); x.beginPath(); x.arc(128, 112, 82, 0, Math.PI * 2); x.fill(); x.shadowBlur = 0;
    x.fillStyle = '#ffffff'; x.beginPath(); x.moveTo(72, 128); x.bezierCurveTo(72, 64, 184, 64, 184, 128); x.closePath(); x.fill();
    x.beginPath(); x.roundRect(58, 124, 140, 20, 10); x.fill();
  } },
  { at: [14.5, 3.4, -5], draw: (x, w, h) => {
    signFrame(x, w, h, '#ffd21f', 'ATENÇÃO');
    x.fillStyle = '#ffd21f'; x.beginPath(); x.moveTo(128, 30); x.lineTo(210, 184); x.lineTo(46, 184); x.closePath(); x.fill();
    x.fillStyle = '#111'; x.font = '900 100px Nunito, sans-serif'; x.fillText('!', 128, 128);
  } },
  { at: [14.5, 2.6, 5.5], draw: (x, w, h) => {
    signFrame(x, w, h, '#2fe37a', 'SAÍDA DE\nEMERGÊNCIA');
    x.fillStyle = '#1e9e55'; x.beginPath(); x.roundRect(40, 34, 176, 120, 12); x.fill();
    x.strokeStyle = '#fff'; x.lineWidth = 14; x.beginPath(); x.moveTo(70, 94); x.lineTo(180, 94); x.moveTo(146, 62); x.lineTo(184, 94); x.lineTo(146, 126); x.stroke();
  } },
  { at: [-14.5, 2.8, 5], draw: (x, w, h) => {
    signFrame(x, w, h, '#ff4d4d', 'PROIBIDO\nFUMAR');
    x.fillStyle = '#ffffff'; x.beginPath(); x.arc(128, 98, 70, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#333'; x.fillRect(70, 92, 96, 16); x.fillStyle = '#ff7a2a'; x.fillRect(166, 92, 18, 16);
    x.strokeStyle = '#e53935'; x.lineWidth = 16; x.beginPath(); x.arc(128, 98, 70, 0, Math.PI * 2); x.moveTo(78, 48); x.lineTo(178, 148); x.stroke();
  } },
  { at: [-6, 4.2, -12.5], draw: (x, w, h) => {
    signFrame(x, w, h, '#ffd21f', 'CUIDADO\nPISO MOLHADO');
    x.fillStyle = '#ffd21f'; x.beginPath(); x.moveTo(128, 26); x.lineTo(196, 150); x.lineTo(60, 150); x.closePath(); x.fill();
    x.fillStyle = '#3b8cff'; x.beginPath(); x.moveTo(128, 70); x.bezierCurveTo(108, 104, 108, 128, 128, 132); x.bezierCurveTo(148, 128, 148, 104, 128, 70); x.fill();
  } },
  { at: [7, 4.0, -12.5], draw: (x, w, h) => {
    signFrame(x, w, h, '#ff4d4d', 'EXTINTOR');
    x.fillStyle = '#e53935'; x.beginPath(); x.roundRect(98, 70, 60, 120, 22); x.fill();
    x.fillStyle = '#222'; x.fillRect(116, 46, 24, 26); x.strokeStyle = '#222'; x.lineWidth = 10;
    x.beginPath(); x.moveTo(140, 56); x.lineTo(176, 70); x.lineTo(176, 120); x.stroke();
    x.fillStyle = '#fff'; x.fillRect(104, 110, 48, 12);
  } },
];

// ---------- trabalhadores ----------
const WORKERS: Record<WorkerKind, { skin: string; shirt: string; vest: string; pants: string; boots: string; gloves?: string; hair?: string; beard?: string }> = {
  inspetor: { skin: '#f1c3a1', shirt: '#2f5d9c', vest: '#3ccf4e', pants: '#3e5f8f', boots: '#5a3b22', gloves: '#8a7a55' },
  sipat: { skin: '#7a4a2c', shirt: '#7f8c5a', vest: '#ff7a1a', pants: '#5e6b45', boots: '#6b4426', hair: '#1d120c' },
  campo: { skin: '#8a5a3c', shirt: '#7f8c5a', vest: '#ff7a1a', pants: '#5e6b45', boots: '#1a1a1a', beard: '#24170f' },
};
const mat = (color: string, k = 0.16, extra: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: k, roughness: 0.55, ...extra });
type V3 = [number, number, number];
function add(parent: THREE.Object3D, geo: THREE.BufferGeometry, m: THREE.Material, p: V3 = [0, 0, 0], r: V3 = [0, 0, 0], s: V3 = [1, 1, 1]) {
  const mesh = new THREE.Mesh(geo, m);
  mesh.position.set(...p);
  mesh.rotation.set(...r);
  mesh.scale.set(...s);
  parent.add(mesh);
  return mesh;
}
function textPlane(draw: Draw, w: number, h: number, cw: number, ch: number) {
  const { t } = canvasTexture(draw, cw, ch);
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, transparent: true, polygonOffset: true, polygonOffsetFactor: -2 }));
}
const drawHelmetText: Draw = (x, w, h) => {
  x.font = '900 82px Arial, sans-serif';
  x.lineWidth = 14; x.strokeStyle = '#ffffff'; x.strokeText('ETEC ZL', w / 2, h / 2 + 4);
  x.fillStyle = '#0F2942'; x.fillText('ETEC ZL', w / 2, h / 2 + 4);
};
const drawVestPatch: Draw = (x, w, h) => {
  x.fillStyle = '#1e8f3e'; x.beginPath(); x.roundRect(4, 4, w - 8, h - 8, 14); x.fill();
  x.fillStyle = '#ffffff'; x.font = '900 64px Arial, sans-serif'; x.fillText('SIPAT', w / 2, h * 0.36);
  x.font = '900 52px Arial, sans-serif'; x.fillText('NR-1', w / 2, h * 0.74);
};
const drawSipatSign: Draw = (x, w) => {
  const c = w / 2;
  x.fillStyle = '#1e8f3e'; x.beginPath(); x.arc(c, c, c - 4, 0, Math.PI * 2); x.fill();
  x.fillStyle = '#ffffff'; x.beginPath(); x.arc(c, c, c - 50, 0, Math.PI * 2); x.fill();
  const ring = (text: string, start: number, end: number, r: number, bottom: boolean) => {
    x.save(); x.translate(c, c); x.font = '900 34px Arial, sans-serif'; x.fillStyle = '#ffffff';
    const chars = [...text], step = (end - start) / (chars.length - 1);
    chars.forEach((ch, i) => { x.save(); x.rotate(start + step * i); x.translate(0, bottom ? r : -r); x.fillText(ch, 0, 0); x.restore(); });
    x.restore();
  };
  ring('SEGURANÇA EM', -1.25, 1.25, c - 27, false);
  ring('PRIMEIRO LUGAR', 1.35, -1.35, c - 27, true);
  x.fillStyle = '#1e8f3e'; x.fillRect(c - 26, c - 80, 52, 160); x.fillRect(c - 80, c - 26, 160, 52);
  x.fillStyle = '#ffffff'; x.font = '900 44px Arial, sans-serif'; x.fillText('SIPAT', c, c + 2);
};

function buildWorker(kind: WorkerKind, helmetColor: string) {
  const W = WORKERS[kind];
  const g = new THREE.Group();
  const skin = mat(W.skin, 0.12), shirt = mat(W.shirt), vest = mat(W.vest, 0.3), pants = mat(W.pants);
  const boots = mat(W.boots, 0.08, { roughness: 0.35 });
  const helmetM = mat(helmetColor, 0.22, { roughness: 0.3 });
  const reflect = mat('#e9eef4', 0.7, { metalness: 0.6, roughness: 0.2 });
  const dark = mat('#151515', 0.05);
  for (const sx of [-1, 1]) {
    add(g, new THREE.BoxGeometry(0.17, kind === 'campo' ? 0.28 : 0.15, 0.27), boots, [sx * 0.1, kind === 'campo' ? 0.14 : 0.075, 0.03]);
    add(g, new THREE.CapsuleGeometry(0.078, 0.3, 4, 12), pants, [sx * 0.1, 0.38, 0]);
  }
  add(g, new THREE.BoxGeometry(0.34, 0.14, 0.22), pants, [0, 0.57, 0]);
  add(g, new THREE.CapsuleGeometry(0.17, 0.22, 6, 16), shirt, [0, 0.79, 0], [0, 0, 0], [1, 1, 0.72]);
  add(g, new THREE.CapsuleGeometry(0.182, 0.2, 6, 16), vest, [0, 0.78, 0], [0, 0, 0], [1, 1, 0.76]);
  add(g, new THREE.BoxGeometry(0.07, 0.34, 0.02), shirt, [0, 0.82, 0.135]);
  for (const y of [0.71, 0.83]) add(g, new THREE.CylinderGeometry(0.187, 0.187, 0.03, 28, 1, true), reflect, [0, y, 0], [0, 0, 0], [1, 1, 0.78]);
  const patch = textPlane(drawVestPatch, 0.11, 0.08, 256, 186);
  patch.position.set(0.09, 0.9, 0.142);
  g.add(patch);
  // cabeça
  add(g, new THREE.CylinderGeometry(0.06, 0.07, 0.08, 12), skin, [0, 0.99, 0]);
  add(g, new THREE.SphereGeometry(0.19, 28, 20), skin, [0, 1.15, 0], [0, 0, 0], [1, 1.05, 1]);
  for (const sx of [-1, 1]) add(g, new THREE.SphereGeometry(0.022, 10, 8), dark, [sx * 0.065, 1.17, 0.172]);
  add(g, new THREE.SphereGeometry(0.026, 10, 8), mat(W.skin, 0.05), [0, 1.13, 0.19]);
  add(g, new THREE.TorusGeometry(0.05, 0.009, 6, 16, Math.PI), mat('#5a1f1f', 0.1), [0, 1.095, 0.178], [0, 0, Math.PI]);
  if (W.hair) add(g, new THREE.SphereGeometry(0.19, 20, 14), mat(W.hair, 0.05), [0, 1.13, -0.05], [0, 0, 0], [1.08, 1.02, 1]);
  if (W.beard) add(g, new THREE.SphereGeometry(0.175, 20, 10, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), mat(W.beard, 0.05), [0, 1.13, 0.01], [0, 0, 0], [1.06, 0.95, 1.05]);
  // capacete com "ETEC ZL"
  add(g, new THREE.SphereGeometry(0.205, 28, 12, 0, Math.PI * 2, 0, Math.PI / 2), helmetM, [0, 1.21, 0], [0, 0, 0], [1, 0.95, 1.06]);
  add(g, new THREE.CylinderGeometry(0.245, 0.25, 0.022, 28), helmetM, [0, 1.21, 0.035]);
  add(g, new THREE.BoxGeometry(0.04, 0.05, 0.34), helmetM, [0, 1.395, 0]);
  const txt = textPlane(drawHelmetText, 0.2, 0.06, 384, 116);
  txt.position.set(0, 1.3, 0.19);
  txt.rotation.x = -0.55;
  g.add(txt);
  const arm = (sx: number, rx: number, rz: number) => {
    const a = new THREE.Group();
    a.position.set(sx * 0.215, 0.92, 0);
    a.rotation.set(rx, 0, rz);
    g.add(a);
    add(a, new THREE.CapsuleGeometry(0.056, 0.24, 4, 10), shirt, [0, -0.15, 0]);
    add(a, new THREE.SphereGeometry(0.058, 12, 10), W.gloves ? mat(W.gloves, 0.1) : skin, [0, -0.31, 0]);
    return a;
  };
  if (kind === 'inspetor') {
    arm(-1, 0, -0.18);
    const r = arm(1, -0.75, 0.15);
    add(g, new THREE.BoxGeometry(0.3, 0.07, 0.03), new THREE.MeshStandardMaterial({ color: '#bfe3ff', transparent: true, opacity: 0.45, roughness: 0.05, metalness: 0.3 }), [0, 1.175, 0.18]);
    const clip = add(r, new THREE.BoxGeometry(0.2, 0.26, 0.018), mat('#8a5a2b', 0.1), [-0.04, -0.33, 0.1], [0.9, 0, 0.2]);
    add(clip, new THREE.PlaneGeometry(0.16, 0.2), mat('#f5f5f0', 0.25), [0, -0.01, 0.011]);
    add(clip, new THREE.BoxGeometry(0.08, 0.03, 0.03), mat('#9aa4ae', 0.2), [0, 0.13, 0.01]);
  }
  if (kind === 'sipat') {
    arm(-1, -1.0, -0.38);
    arm(1, -1.0, 0.38);
    for (const sx of [-1, 1]) add(g, new THREE.CylinderGeometry(0.075, 0.075, 0.07, 20), helmetM, [sx * 0.2, 1.15, 0], [0, 0, Math.PI / 2]);
    const { t } = canvasTexture(drawSipatSign, 512, 512);
    add(g, new THREE.CircleGeometry(0.2, 48), new THREE.MeshBasicMaterial({ map: t }), [0, 0.8, 0.29]);
    add(g, new THREE.CylinderGeometry(0.205, 0.205, 0.02, 48), mat('#e9eef4', 0.2), [0, 0.8, 0.279], [Math.PI / 2, 0, 0]);
  }
  if (kind === 'campo') {
    arm(-1, -0.2, -0.25);
    const r = arm(1, -0.9, 0.35);
    add(g, new THREE.BoxGeometry(0.3, 0.065, 0.03), mat('#1b1f26', 0.05, { metalness: 0.7, roughness: 0.15 }), [0, 1.18, 0.18]);
    add(g, new THREE.SphereGeometry(0.07, 16, 12), mat('#3d444d', 0.04, { roughness: 0.7 }), [0, 1.085, 0.168], [0, 0, 0], [1.2, 0.85, 0.75]);
    for (const sx of [-1, 1]) add(g, new THREE.CylinderGeometry(0.042, 0.042, 0.05, 16), mat('#8fa3b8', 0.12), [sx * 0.085, 1.075, 0.17], [Math.PI / 2, 0, 0]);
    add(g, new THREE.CapsuleGeometry(0.13, 0.22, 6, 14), mat('#eef1f4', 0.2), [0, 0.86, -0.2]);
    add(g, new THREE.CylinderGeometry(0.07, 0.07, 0.06, 16), mat('#ff7a1a', 0.3), [0, 1.08, -0.2]);
    for (const sx of [-1, 1]) add(g, new THREE.BoxGeometry(0.04, 0.38, 0.02), dark, [sx * 0.1, 0.84, 0.14]);
    add(r, new THREE.CylinderGeometry(0.014, 0.014, 0.5, 8), mat('#2e7d32', 0.2), [0, -0.33, 0.2], [Math.PI / 2 - 0.2, 0, 0]);
    add(r, new THREE.CylinderGeometry(0.02, 0.012, 0.08, 8), mat('#c0c6cc', 0.3, { metalness: 0.8 }), [0, -0.38, 0.47], [Math.PI / 2 - 0.2, 0, 0]);
  }
  return g;
}

interface Pawn {
  id: string;
  index: number;
  group: THREE.Group;
  ring: THREE.Mesh<THREE.RingGeometry, THREE.MeshBasicMaterial>;
  shown: number;
  hop: { from: THREE.Vector3; to: THREE.Vector3; target: number; t0: number } | null;
}

const ease = (k: number) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);

export function webglSupported() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

export class TrilhaScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(45, 1, 0.1, 300);
  private controls: OrbitControls;
  private composer: EffectComposer;
  private bloom: UnrealBloomPass;
  private stars: THREE.Points;
  private animated: ((t: number) => void)[] = [];
  private pawns: Pawn[] = [];
  private panel: THREE.Sprite;
  private state: SceneState | null = null;
  private clock = new THREE.Clock();
  private ro: ResizeObserver;
  private userUntil = 0;
  private lite = false;
  private round = -1;
  private dot = radialTex('#ffffff');
  private tmpT = new THREE.Vector3();
  private tmpP = new THREE.Vector3();

  constructor(private container: HTMLElement, opts: { lite: boolean }) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 0.95;
    this.renderer.domElement.style.display = 'block';
    container.appendChild(this.renderer.domElement);

    const s = this.scene;
    s.background = new THREE.Color('#040a14');
    s.fog = new THREE.FogExp2('#040a14', 0.022);
    this.camera.position.set(0, 15, 21);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.maxPolarAngle = 1.32;
    this.controls.enableZoom = false;
    this.controls.enablePan = false;
    this.controls.autoRotateSpeed = 0.5;
    if (matchMedia('(pointer: coarse)').matches) {
      // no celular, arrastar o dedo rola a página em vez de girar a câmera
      this.controls.enabled = false;
      this.renderer.domElement.style.touchAction = 'pan-y';
    }
    this.controls.addEventListener('start', () => (this.userUntil = Infinity));
    this.controls.addEventListener('end', () => (this.userUntil = performance.now() + 6000));

    s.add(new THREE.HemisphereLight('#6fa8ff', '#0a0f1c', 0.7));
    const sun = new THREE.DirectionalLight('#ffffff', 1.1);
    sun.position.set(6, 14, 8);
    s.add(sun);

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(s, this.camera));
    this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.5, 0.4, 0.62);
    this.composer.addPass(this.bloom);
    this.composer.addPass(new OutputPass());

    this.stars = this.buildStars();
    this.buildEnvironment();
    this.buildTiles();
    this.buildTrack();
    this.buildScenery();
    this.panel = sprite(this.drawPanel(0), 512, 210);
    this.panel.position.set(0, 4.6, -13.5);
    this.panel.scale.set(7, 2.9, 1);
    s.add(this.panel);
    this.animated.push((t) => (this.panel.position.y = 4.6 + Math.sin(t * 0.8) * 0.2));

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(container);
    this.resize();
    this.setLite(opts.lite);
    this.renderer.setAnimationLoop(() => this.frame());
  }

  // ---------- API ----------
  update(state: SceneState) {
    this.state = state;
    if (state.round !== this.round) {
      this.round = state.round;
      this.panel.userData.redraw(this.drawPanel(Math.max(0, state.round - 1)));
    }
    // cria/recria os trabalhadores quando a lista de jogadores muda
    const ids = state.players.map((p) => `${p.id}:${p.color}`).join('|');
    if (ids !== this.pawns.map((p) => p.id).join('|')) {
      this.pawns.forEach((p) => this.scene.remove(p.group));
      this.pawns = state.players.map((p, i) => this.makePawn(p, i, `${p.id}:${p.color}`, state.positions[i] ?? 1));
    }
    this.pawns.forEach((p, i) => {
      p.ring.material.opacity = i === state.turn ? 0.9 : 0;
      // quem não é o da vez (ou partida nova) vai direto para a casa
      const target = state.positions[i] ?? 1;
      if (!(state.moving && i === state.turn) && !p.hop && p.shown !== target) this.place(p, target);
    });
  }

  setLite(lite: boolean) {
    this.lite = lite;
    this.stars.visible = !lite;
    this.renderer.setPixelRatio(lite ? 1 : Math.min(devicePixelRatio, 2));
    this.resize();
  }

  dispose() {
    this.renderer.setAnimationLoop(null);
    this.ro.disconnect();
    this.controls.dispose();
    this.scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      const mats = Array.isArray(m.material) ? m.material : m.material ? [m.material] : [];
      mats.forEach((mt) => {
        (mt as THREE.MeshBasicMaterial).map?.dispose();
        mt.dispose();
      });
    });
    this.composer.dispose();
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }

  // ---------- quadro a quadro ----------
  private frame() {
    const t = this.clock.getElapsedTime();
    const now = performance.now();
    this.animated.forEach((f) => f(t));
    this.stepPawns(now, t);
    this.stars.rotation.y = t * 0.01;
    this.updateCamera(now);
    this.controls.update();
    if (this.lite) this.renderer.render(this.scene, this.camera);
    else this.composer.render();
  }

  private stepPawns(now: number, t: number) {
    const st = this.state;
    this.pawns.forEach((p, i) => {
      const target = st?.positions[i] ?? p.shown;
      if (!p.hop && target !== p.shown) {
        const next = p.shown + Math.sign(target - p.shown);
        p.hop = { from: p.group.position.clone(), to: this.spot(next, i), target: next, t0: now };
      }
      if (p.hop) {
        const k = Math.min(1, (now - p.hop.t0) / HOP_MS);
        p.group.position.lerpVectors(p.hop.from, p.hop.to, ease(k));
        p.group.position.y += Math.sin(Math.PI * k) * 1.0;
        const d = this.tmpP.subVectors(p.hop.to, p.hop.from);
        p.group.rotation.y = Math.atan2(d.x, d.z);
        if (k >= 1) {
          p.shown = p.hop.target;
          p.hop = null;
        }
      } else {
        p.group.rotation.y += (Math.sin(t * 1.5 + i) * 0.25 - p.group.rotation.y) * 0.1;
      }
      p.ring.scale.setScalar(1 + Math.sin(t * 4) * 0.12);
    });
  }

  private updateCamera(now: number) {
    const st = this.state;
    const auto = now > this.userUntil;
    const portrait = this.aspect() < 1;
    const focus = st && st.moving ? this.pawns[st.turn] : null;
    this.controls.autoRotate = auto && !focus;
    if (!auto) return;
    if (focus) {
      this.tmpT.copy(focus.group.position);
      this.tmpP.copy(this.tmpT).add(portrait ? new THREE.Vector3(0, 9, 11) : new THREE.Vector3(0, 7, 9));
      this.controls.target.lerp(this.tmpT, 0.1);
      this.camera.position.lerp(this.tmpP, 0.07);
    } else {
      this.controls.target.lerp(this.tmpT.set(0, 0, 0), 0.03);
      const a = Math.atan2(this.camera.position.x, this.camera.position.z);
      const R = portrait ? 27 : 20, H = portrait ? 22 : 15;
      this.camera.position.lerp(this.tmpP.set(Math.sin(a) * R, H, Math.cos(a) * R), 0.02);
    }
  }

  private aspect() {
    return Math.max(1, this.container.clientWidth) / Math.max(1, this.container.clientHeight);
  }

  private resize() {
    const w = Math.max(1, this.container.clientWidth), h = Math.max(1, this.container.clientHeight);
    this.camera.aspect = w / h;
    this.camera.fov = w < h ? 58 : 45;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
  }

  // ---------- montagem ----------
  private spot(n: number, i: number) {
    return tileCenter(n).add(OFFS[i] ?? OFFS[0]).add(new THREE.Vector3(0, TOP, 0));
  }
  private place(p: Pawn, n: number) {
    p.shown = n;
    p.hop = null;
    p.group.position.copy(this.spot(n, p.index));
  }

  private makePawn(pl: ScenePlayer, i: number, id: string, pos: number): Pawn {
    const col = new THREE.Color(pl.color);
    const g = new THREE.Group();
    g.add(buildWorker(WORKER_KINDS[i % 3], pl.color));
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.42, 0.54, 40),
      new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0, side: THREE.DoubleSide, toneMapped: false }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 0.02;
    g.add(ring);
    const lamp = new THREE.PointLight('#ffffff', 2.5, 2.5);
    lamp.position.set(0, 1.2, 0.7);
    g.add(lamp);
    g.scale.setScalar(1.15);
    this.scene.add(g);
    const pawn: Pawn = { id, index: i, group: g, ring, shown: pos, hop: null };
    this.place(pawn, pos);
    return pawn;
  }

  private drawPanel(n: number): Draw {
    return (x, w, h) => {
      x.fillStyle = 'rgba(4,14,28,.9)'; glow(x, '#2fe37a', 18); x.strokeStyle = '#2fe37a'; x.lineWidth = 6;
      x.beginPath(); x.roundRect(6, 6, w - 12, h - 12, 20); x.fill(); x.stroke();
      x.shadowBlur = 0; x.fillStyle = '#8fb3d9'; x.font = '900 34px Nunito, sans-serif'; x.fillText('RODADAS SEM ACIDENTES', w / 2, 52);
      glow(x, '#2fe37a', 24); x.fillStyle = '#5cf59a'; x.font = '900 120px "Courier New", monospace';
      x.fillText(String(n).padStart(3, '0'), w / 2, 150);
    };
  }

  private buildStars() {
    const N = 1200, pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const r = 70 + Math.random() * 80, t = Math.random() * Math.PI * 2, p = Math.acos(Math.random() * 1.6 - 0.6);
      pos.set([r * Math.sin(p) * Math.cos(t), r * Math.cos(p) - 10, r * Math.sin(p) * Math.sin(t)], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const m = new THREE.Points(g, new THREE.PointsMaterial({ color: '#9fd8ff', size: 0.35, transparent: true, opacity: 0.8, fog: false }));
    this.scene.add(m);
    return m;
  }

  private buildEnvironment() {
    const grid = new THREE.GridHelper(120, 60, '#1b6fb3', '#0d3a63');
    grid.position.y = -1.6;
    const gm = grid.material as THREE.Material;
    gm.transparent = true;
    gm.opacity = 0.35;
    this.scene.add(grid);
  }

  private buildTiles() {
    const hexGeo = new THREE.CylinderGeometry(1.3, 1.42, TOP * 2, 6);
    const edgeGeo = new THREE.EdgesGeometry(hexGeo);
    for (let n = 1; n <= 20; n++) {
      const type = houseType(n), info = TYPE[type], neon = new THREE.Color(info.neon);
      const side = new THREE.MeshStandardMaterial({ color: '#0b1d33', metalness: 0.7, roughness: 0.25, emissive: neon, emissiveIntensity: type === 'normal' ? 0.08 : 0.22 });
      const face = canvasTexture((x) => {
        const g = x.createRadialGradient(128, 128, 10, 128, 128, 140);
        g.addColorStop(0, info.neon + '55'); g.addColorStop(0.75, '#08162a'); g.addColorStop(1, '#050d1a');
        x.fillStyle = g; x.fillRect(0, 0, 256, 256);
        x.shadowColor = info.neon; x.shadowBlur = 18; x.fillStyle = '#ffffff';
        x.font = `900 ${type === 'normal' ? 110 : 92}px Nunito, sans-serif`;
        x.fillText(String(n), 128, type === 'normal' ? 128 : 112);
        if (info.label) { x.shadowBlur = 10; x.fillStyle = info.neon; x.font = '900 30px Nunito, sans-serif'; x.fillText(info.label, 128, 186); }
      }).t;
      face.center.set(0.5, 0.5);
      face.rotation = Math.PI / 2;
      const top = new THREE.MeshBasicMaterial({ map: face, color: '#c9d6e6' });
      const edges = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: neon, toneMapped: false }));
      const g = new THREE.Group();
      g.add(new THREE.Mesh(hexGeo, [side, top, side]), edges);
      g.position.copy(tileCenter(n));
      g.rotation.y = Math.PI / 6;
      this.scene.add(g);
      this.decorate(n, type, g.position, neon, side, edges);
    }
  }

  private decorate(n: number, type: HouseType, c: THREE.Vector3, neon: THREE.Color, side: THREE.MeshStandardMaterial, edges: THREE.LineSegments) {
    const ph = n * 0.7, s = this.scene;
    const bob = (sp: THREE.Sprite, h: number, size: number, extra?: (t: number) => number) =>
      this.animated.push((t) => {
        sp.position.y = c.y + h + Math.sin(t * 2 + ph) * 0.15;
        const k = extra ? extra(t) : 1;
        sp.scale.set(size * k, size * k, 1);
      });
    const icon = (draw: Draw, h: number, size: number, extra?: (t: number) => number) => {
      const sp = sprite(draw);
      sp.position.set(c.x, c.y + h, c.z);
      s.add(sp);
      bob(sp, h, size, extra);
    };
    if (type === 'alerta') {
      const em = edges.material as THREE.LineBasicMaterial;
      this.animated.push((t) => {
        const k = 0.5 + 0.5 * Math.sin(t * 6);
        side.emissiveIntensity = 0.15 + k * 0.6;
        em.color.copy(neon).multiplyScalar(0.6 + k * 1.2);
      });
      icon(drawWarning, 1.9, 1.15);
      const lamp = new THREE.Group();
      lamp.position.set(c.x, c.y + 1.05, c.z);
      s.add(lamp);
      lamp.add(new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 0.22, 20), new THREE.MeshBasicMaterial({ color: '#ffb300', toneMapped: false })));
      const beamMat = new THREE.MeshBasicMaterial({ color: '#ffd21f', transparent: true, opacity: 0.28, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
      for (const dir of [1, -1]) {
        const b = new THREE.Mesh(new THREE.ConeGeometry(0.55, 2.4, 20, 1, true), beamMat);
        b.rotation.z = (dir * Math.PI) / 2;
        b.position.x = dir * 1.2;
        lamp.add(b);
      }
      this.animated.push((t) => (lamp.rotation.y = t * 4));
    }
    if (type === 'desafio') {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(1.55, 0.045, 8, 64), new THREE.MeshBasicMaterial({ color: neon, toneMapped: false }));
      ring.position.set(c.x, c.y + 0.9, c.z);
      s.add(ring);
      const ring2 = ring.clone();
      ring2.scale.setScalar(0.75);
      s.add(ring2);
      this.animated.push((t) => {
        ring.rotation.set(Math.PI / 2 + Math.sin(t) * 0.5, t * 1.2, 0);
        ring2.rotation.set(Math.PI / 2 - Math.sin(t * 1.3) * 0.6, -t * 1.6, 0);
      });
      icon(drawHardhat, 1.9, 1.1);
    }
    if (type === 'pergunta') icon(drawClipboard, 1.7, 1.1);
    if (type === 'prevencao') icon(drawShield, 1.7, 1.1, (t) => 1 + Math.max(0, Math.sin(t * 2.5)) * 0.08);
    if (type === 'saude')
      icon(drawHeart, 1.7, 1.15, (t) => {
        const p = t % 1.1;
        return 1 + (p < 0.12 ? Math.sin((p / 0.12) * Math.PI) * 0.16 : p > 0.22 && p < 0.34 ? Math.sin(((p - 0.22) / 0.12) * Math.PI) * 0.1 : 0);
      });
    if (type === 'chegada') this.buildPortal(c, neon);
  }

  private buildPortal(c: THREE.Vector3, neon: THREE.Color) {
    const s = this.scene;
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.09, 12, 80), new THREE.MeshBasicMaterial({ color: neon, toneMapped: false }));
    ring.position.set(c.x, c.y + 1.75, c.z);
    s.add(ring);
    const bt = canvasTexture((x) => {
      const g = x.createLinearGradient(0, 0, 0, 128);
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, 16, 128);
    }, 16, 128).t;
    bt.wrapS = bt.wrapT = THREE.RepeatWrapping;
    bt.repeat.set(1, 2);
    const beam = new THREE.Mesh(
      new THREE.CylinderGeometry(0.9, 1.25, 7, 32, 1, true),
      new THREE.MeshBasicMaterial({ map: bt, color: neon, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }),
    );
    beam.position.set(c.x, c.y + 3.6, c.z);
    s.add(beam);
    const N = 80, pos = new Float32Array(N * 3);
    const seed = Array.from({ length: N }, () => [Math.random() * 6.28, Math.random(), 0.4 + Math.random() * 0.9]);
    const pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    s.add(new THREE.Points(pg, new THREE.PointsMaterial({ map: this.dot, color: neon, size: 0.26, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })));
    const light = new THREE.PointLight(neon, 12, 9);
    light.position.set(c.x, c.y + 2, c.z);
    s.add(light);
    const trophy = sprite(drawTrophy, 256, 280);
    trophy.position.set(c.x, c.y + 3.4, c.z);
    trophy.scale.set(1.5, 1.64, 1);
    s.add(trophy);
    this.animated.push((t) => {
      trophy.position.y = c.y + 3.4 + Math.sin(t * 1.6) * 0.2;
      ring.rotation.set(Math.PI / 2, 0, t * 0.8);
      ring.scale.setScalar(1 + Math.sin(t * 3) * 0.05);
      bt.offset.y = -t * 0.35;
      for (let i = 0; i < N; i++) {
        const [a, h0, r] = seed[i], h = (h0 + t * 0.15) % 1;
        pos.set([c.x + Math.cos(a + t) * r * (1 - h * 0.5), c.y + 0.3 + h * 6, c.z + Math.sin(a + t) * r * (1 - h * 0.5)], i * 3);
      }
      pg.attributes.position.needsUpdate = true;
    });
  }

  private buildTrack() {
    const curve = new THREE.CatmullRomCurve3(Array.from({ length: 20 }, (_, i) => tileCenter(i + 1).add(new THREE.Vector3(0, -0.05, 0))), false, 'centripetal');
    this.scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 240, 0.07, 8, false), new THREE.MeshBasicMaterial({ color: '#2aa8ff', transparent: true, opacity: 0.55, toneMapped: false })));
    const N = 46, pos = new Float32Array(N * 3), g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.scene.add(new THREE.Points(g, new THREE.PointsMaterial({ map: this.dot, color: '#bff0ff', size: 0.36, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, toneMapped: false })));
    this.animated.push((t) => {
      for (let i = 0; i < N; i++) {
        const p = curve.getPointAt((i / N + t * 0.03) % 1);
        pos.set([p.x, p.y + 0.02, p.z], i * 3);
      }
      g.attributes.position.needsUpdate = true;
    });
  }

  private buildScenery() {
    const s = this.scene;
    // plataforma
    const slab = new THREE.Mesh(new THREE.BoxGeometry(24, 0.3, 19.5), new THREE.MeshStandardMaterial({ color: '#07142a', metalness: 0.8, roughness: 0.35 }));
    slab.position.y = FLOOR - 0.15;
    s.add(slab);
    const se = new THREE.LineSegments(new THREE.EdgesGeometry(slab.geometry), new THREE.LineBasicMaterial({ color: '#1f7fd1', toneMapped: false }));
    se.position.copy(slab.position);
    s.add(se);
    // cones
    const HX = 11.3, HZ = 9.0;
    const conePts = [[-HX, -HZ], [0, -HZ], [HX, -HZ], [HX, 0], [HX, HZ], [0, HZ], [-HX, HZ], [-HX, 0], [-HX / 2, -HZ], [HX / 2, -HZ], [-HX / 2, HZ], [HX / 2, HZ]];
    const coneGeo = new THREE.ConeGeometry(0.32, 0.95, 24), bandGeo = new THREE.CylinderGeometry(0.19, 0.24, 0.16, 24, 1, true), baseGeo = new THREE.BoxGeometry(0.75, 0.08, 0.75);
    const coneMat = new THREE.MeshStandardMaterial({ color: '#ff6a00', emissive: '#ff5a00', emissiveIntensity: 0.55, roughness: 0.4 });
    const bandMat = new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false });
    const baseMat = new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.8 });
    for (const [x, z] of conePts) {
      const cg = new THREE.Group();
      cg.position.set(x, FLOOR, z);
      add(cg, coneGeo, coneMat, [0, 0.52, 0]);
      add(cg, bandGeo, bandMat, [0, 0.6, 0]);
      add(cg, baseGeo, baseMat, [0, 0.04, 0]);
      s.add(cg);
    }
    // fita zebrada
    const tapeTex = canvasTexture((x) => {
      x.fillStyle = '#ffd21f'; x.fillRect(0, 0, 64, 16); x.fillStyle = '#111';
      for (let i = -16; i < 64; i += 32) { x.beginPath(); x.moveTo(i, 16); x.lineTo(i + 16, 0); x.lineTo(i + 32, 0); x.lineTo(i + 16, 16); x.fill(); }
    }, 64, 16).t;
    tapeTex.wrapS = THREE.RepeatWrapping;
    const sides: [number, number, number, number][] = [[0, -HZ, HX * 2, 0], [0, HZ, HX * 2, 0], [-HX, 0, HZ * 2, Math.PI / 2], [HX, 0, HZ * 2, Math.PI / 2]];
    for (const [x, z, len, rot] of sides) {
      const tex = tapeTex.clone();
      tex.needsUpdate = true;
      tex.repeat.set(len / 1.2, 1);
      const tape = new THREE.Mesh(new THREE.PlaneGeometry(len, 0.22), new THREE.MeshBasicMaterial({ map: tex, side: THREE.DoubleSide, color: '#d9d9d9' }));
      tape.position.set(x, FLOOR + 0.82, z);
      tape.rotation.y = rot;
      s.add(tape);
      this.animated.push((t) => (tex.offset.x = -t * 0.25));
    }
    // placas em holograma
    SIGNS.forEach(({ draw, at }, i) => {
      const sp = sprite(draw, 256, 300);
      sp.position.set(...at);
      sp.scale.set(2.6, 3.05, 1);
      s.add(sp);
      this.animated.push((t) => {
        sp.position.y = at[1] + Math.sin(t * 1.2 + i) * 0.25;
        sp.material.opacity = 0.78 + Math.sin(t * 9 + i * 3) * 0.05 + (Math.random() < 0.012 ? -0.4 : 0);
      });
    });
    // cidade em linhas de luz
    const lineMat = new THREE.LineBasicMaterial({ color: '#1b4f8a', transparent: true, opacity: 0.8 });
    const lit: number[] = [];
    for (let i = 0; i < 44; i++) {
      const a = (i / 44) * Math.PI * 2 + Math.random() * 0.08, r = 52 + Math.random() * 16;
      const w = 2.5 + Math.random() * 4, h = 5 + Math.random() * 20, d = 2.5 + Math.random() * 4;
      const b = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), lineMat);
      b.position.set(Math.cos(a) * r, -1.6 + h / 2, Math.sin(a) * r);
      b.rotation.y = -a;
      s.add(b);
      for (let k = 0; k < 6; k++) lit.push(b.position.x + (Math.random() - 0.5) * w, -1.6 + Math.random() * h, b.position.z + (Math.random() - 0.5) * d);
    }
    const wg = new THREE.BufferGeometry();
    wg.setAttribute('position', new THREE.Float32BufferAttribute(lit, 3));
    s.add(new THREE.Points(wg, new THREE.PointsMaterial({ map: this.dot, color: '#ffcf66', size: 0.6, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
    // guindastes
    const craneMat = new THREE.LineBasicMaterial({ color: '#ffb300', transparent: true, opacity: 0.85 });
    const box = (w: number, h: number, d: number) => new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), craneMat);
    ([[-32, -36, 0.12], [36, -30, -0.09]] as const).forEach(([x, z, speed]) => {
      const H = 24, crane = new THREE.Group();
      crane.position.set(x, -1.6, z);
      s.add(crane);
      for (let k = 0; k < 8; k++) { const seg = box(1.2, H / 8, 1.2); seg.position.y = H / 16 + (k * H) / 8; crane.add(seg); }
      const top = new THREE.Group();
      top.position.y = H;
      crane.add(top);
      const jib = box(16, 0.9, 0.9); jib.position.x = 6; top.add(jib);
      const counter = box(5, 0.9, 0.9); counter.position.x = -3.5; top.add(counter);
      const weight = box(1.6, 1.4, 1.2); weight.position.set(-5.2, -0.8, 0); top.add(weight);
      top.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(11, 0, 0), new THREE.Vector3(11, -8, 0)]), craneMat));
      const hook = box(0.8, 0.8, 0.8); hook.position.set(11, -8.4, 0); top.add(hook);
      const blink = new THREE.Mesh(new THREE.SphereGeometry(0.25, 12, 8), new THREE.MeshBasicMaterial({ color: '#ff3b3b', toneMapped: false }));
      blink.position.set(14, 0.7, 0);
      top.add(blink);
      this.animated.push((t) => {
        top.rotation.y = Math.sin(t * speed) * 1.2;
        blink.visible = Math.sin(t * 5) > 0;
      });
    });
  }
}
