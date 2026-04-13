/**
 * LogoLoading コンポーネント
 * ブレイルアートロゴをrequestAnimationFrameで
 * 中心から放射状に滑らかに描画するローディング画面
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const BLANK = '\u2800';

// prettier-ignore
const RAW_LINES = [
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣞⣷⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣞⣷⣻⡾⣽⡯⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣞⣷⣻⣾⣳⣟⣯⡿⣽⢷⣢⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣞⣷⣻⢾⣳⣟⡾⣯⢷⣟⣯⣿⢽⡷⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣞⣷⣻⣞⣯⣿⣽⢾⣻⣽⡯⣿⣺⣽⢯⣟⣿⣺⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣞⣷⣻⢾⣳⣟⡷⣷⣻⡯⣿⣞⣯⡿⣽⢾⣻⣽⢾⡯⣟⣷⡤⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣞⣷⣻⣞⣯⣿⣽⢾⣻⡽⡺⣟⡷⣯⡷⣟⣟⣯⡿⣾⣻⣽⣯⢷⣟⣷⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣞⣷⣻⣞⣷⣻⣗⣷⣟⡯⠏⠀⣸⢯⣿⣳⡿⣯⣟⡷⡿⣽⣗⣿⣺⢿⡽⣾⡽⣷⡤⡀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⣠⣞⣷⣻⣞⣷⢯⣷⢿⣺⣗⠏⠀⣠⢾⣽⣻⣞⣷⣟⣷⣻⣽⠈⠪⢷⢯⡿⣽⣻⣗⡿⣗⣿⣳⣄⡀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⣠⣞⣷⣻⣞⣷⣟⣾⢿⡽⡯⠏⠀⡠⣮⢿⣽⢾⣳⣿⣺⣗⣯⡿⡚⠀⠀⠀⠙⢿⡽⣗⣿⡽⣯⡷⣿⢽⡾⣄⠀⠀⠀⠀⠀',
  '⠀⠀⠀⣠⣞⣷⣻⡾⣽⢾⣳⣟⣾⢯⠏⠁⡠⣮⢿⣽⣻⢾⣻⣽⢾⣳⣟⠗⠁⠀⠀⠀⠀⠀⠀⠙⢯⣷⣟⣯⢿⡽⣯⣟⣿⣳⡤⡀⠀⠀',
  '⠀⣠⣞⣷⣻⣞⣷⣟⣟⣿⢽⡗⠏⠂⡠⣮⢿⣽⣻⣞⣯⣿⣻⢾⣻⠝⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠱⢻⣽⢯⣿⡽⣾⣳⡿⣽⣳⣄⠀',
  '⣺⢷⣻⣞⡷⣟⣾⣳⡿⣞⠏⠈⠀⠼⣽⢯⡿⣞⣷⣻⣗⡿⣞⣯⡁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢿⣺⣯⣟⣷⣻⡯⣯⣟⡗',
  '⠀⠙⢿⣺⣟⣯⢿⣺⠋⠀⡠⣦⣢⠀⠉⠿⣽⣯⢷⣿⣺⣟⣯⢿⡽⣦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⢶⣀⠀⠙⢾⣳⣯⡷⣟⡯⠃⠀',
  '⠀⠀⠀⠙⢾⡯⠛⠀⣠⣺⣻⣽⢾⡷⣄⠀⠑⢻⣽⢾⣳⣯⢿⣽⣻⣗⡿⣆⠄⠀⠀⠀⠀⠀⢀⣴⣻⡽⣯⢿⣶⣀⠀⠙⢾⠻⠑⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⢠⣺⣞⣯⢿⣞⣿⡽⣟⣷⣄⠀⠘⢻⣽⢾⣻⣗⡿⣞⣿⣻⣟⡦⠀⠀⢀⡴⣯⡷⣿⢽⣻⣽⢾⣻⢶⡀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠹⢽⣾⣻⣽⣞⣿⢽⣷⣻⣷⢤⠀⠘⢻⡽⣾⣻⡯⣷⣟⠞⠁⢠⢴⣻⣽⢯⡿⣽⣻⣽⢯⣿⠽⠃⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠑⢿⢾⣽⢾⣻⣾⣳⣟⣯⣷⢤⠀⠘⢫⡷⣟⠗⠁⢠⣸⣾⣻⣽⢾⣻⣽⡯⣿⣺⠟⠊⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⢾⣻⣽⢾⣳⣯⡷⣟⣟⣷⣄⠀⠈⠁⢠⣜⣷⣻⡾⣽⢾⣻⣯⢷⣟⠯⠃⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠹⢽⣻⣽⣞⣯⡿⣽⢾⡯⣿⣄⡼⣞⣷⢯⡷⣟⣟⣯⡿⣞⡯⠃⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢷⣯⢷⣟⣿⣽⣻⣗⣯⡿⣯⢿⣽⣻⡯⣟⣷⡻⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢯⡿⡾⣞⣷⣻⣗⣿⡽⣟⣾⣳⡿⡯⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢿⢯⣿⣺⣽⢾⣻⣽⢷⠯⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠙⢾⣽⢾⣻⣽⠾⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢿⠽⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
];

// 各行を配列化して幅を統一
const MAX_W = Math.max(...RAW_LINES.map((l) => [...l].length));
const LINES = RAW_LINES.map((l) => {
  const chars = [...l];
  while (chars.length < MAX_W) chars.push(BLANK);
  return chars;
});
const ROWS = LINES.length;
const COLS = MAX_W;

// 視覚的中心を非空白文字の重心から算出
let _sx = 0, _sy = 0, _n = 0;
for (let y = 0; y < ROWS; y++) {
  for (let x = 0; x < COLS; x++) {
    if (LINES[y][x] !== BLANK) { _sx += x; _sy += y; _n++; }
  }
}
const CX = _n > 0 ? _sx / _n : COLS / 2;
const CY = _n > 0 ? _sy / _n : ROWS / 2;

// 非空白文字の最大距離（文字アスペクト比補正: 縦≈横の2倍）
const ASPECT = 1.8;
let MAX_DIST = 0;
for (let y = 0; y < ROWS; y++) {
  for (let x = 0; x < COLS; x++) {
    if (LINES[y][x] !== BLANK) {
      const d = Math.hypot(x - CX, (y - CY) * ASPECT);
      if (d > MAX_DIST) MAX_DIST = d;
    }
  }
}

function renderFrame(radius: number): string {
  return LINES.map((chars, y) =>
    chars.map((ch, x) => {
      if (ch === BLANK) return BLANK;
      return Math.hypot(x - CX, (y - CY) * ASPECT) <= radius ? ch : BLANK;
    }).join('')
  ).join('\n');
}

const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;

interface LogoLoadingProps {
  message?: string;
}

export function LogoLoading({ message = '読み込み中...' }: LogoLoadingProps) {
  const [text, setText] = useState('');
  const [done, setDone] = useState(false);
  const t0 = useRef(0);
  const raf = useRef(0);

  const tick = useCallback((ts: number) => {
    if (!t0.current) t0.current = ts;
    const elapsed = ts - t0.current;
    const duration = 1000;

    if (elapsed < duration) {
      const progress = easeOutCubic(Math.min(elapsed / duration, 1));
      setText(renderFrame(progress * MAX_DIST));
      raf.current = requestAnimationFrame(tick);
    } else {
      setText(renderFrame(MAX_DIST));
      setDone(true);
    }
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      setText(renderFrame(MAX_DIST));
      setDone(true);
      return;
    }

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [tick]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6">
      <div
        className={done ? 'logo-loading-pulse' : ''}
        role="img"
        aria-label="Portal.C ロゴ"
      >
        <pre
          className="select-none text-center font-mono text-[10px] leading-[1.1] text-primary sm:text-xs sm:leading-[1.15]"
          aria-hidden
        >
          {text}
        </pre>
      </div>
      <p className="text-sm font-medium text-muted animate-pulse">{message}</p>
    </div>
  );
}
