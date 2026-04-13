/**
 * LogoLoading コンポーネント
 * ブレイルアートロゴを左上から右下へスライドイン表示するローディング画面
 */

'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const BLANK = '\u2800';

// prettier-ignore
const RAW_LINES = [
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣞⡦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣟⡷⣯⢿⣽⢤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣞⡷⣯⢿⣽⣻⣞⣿⢽⡤⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⣠⣞⡷⣯⢿⣽⣻⣞⣷⣻⣞⣯⣟⣷⢤⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⡠⣞⡷⣯⢿⣽⡻⠊⣷⣻⣞⣷⣻⣞⣷⣻⡽⣷⢤⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⣀⣮⢿⡽⣯⢿⡽⠊⡠⣞⣾⣳⣟⣾⡣⠑⢟⡾⣯⢿⡽⣷⣄⠀⠀⠀⠀',
  '⠀⠀⢠⡼⣗⣿⢽⡯⡿⠝⢠⡼⣯⢿⣺⣗⡿⠚⠀⠀⠀⠙⢽⡯⣟⣷⣻⢷⣄⠀⠀',
  '⢠⡼⣯⢿⡽⣞⡯⠏⢁⡴⣯⢿⡽⣯⢷⠋⠁⠀⠀⠀⠀⠀⠀⠙⢟⣾⢽⣻⣞⡷⣄',
  '⠙⢽⢯⡿⣽⠋⢠⣄⠉⠿⣽⢯⡿⣽⣻⣆⡀⠀⠀⠀⠀⠀⢀⣤⡀⠙⢯⡷⣯⠟⠁',
  '⠀⠀⠙⠝⢁⡴⣯⣟⡷⣄⠉⠿⣽⣻⣞⡷⣯⣆⡀⠀⢀⢴⣳⡯⣿⢦⡀⠛⠁⠀⠀',
  '⠀⠀⠀⠀⠙⢯⡷⣯⢿⣽⣳⣄⠑⢻⣞⣯⢷⠻⠂⣰⡽⣯⢷⣻⡽⡯⠋⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠫⢿⡽⣞⣷⣻⢶⡄⠘⠝⠃⣠⣟⣷⣻⡽⣯⠷⠋⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠫⢿⣺⡽⣯⣟⣧⢤⣞⣷⣻⣞⣷⡻⠉⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠱⣻⣗⣿⣺⡯⣷⣻⣞⡷⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠛⣾⣳⢿⡽⣞⠇⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠺⢯⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
];

// 各行を配列化して幅を統一
const MAX_W = Math.max(...RAW_LINES.map((l) => [...l].length));
const LINES = RAW_LINES.map((l) => {
  const chars = [...l];
  while (chars.length < MAX_W) chars.push(BLANK);
  return chars;
});
const ROWS = LINES.length;

// 斜め距離の範囲（左上→右下: x + y*ASPECT）
const ASPECT = 2.0;
let MIN_D = Infinity;
let MAX_D = -Infinity;
for (let y = 0; y < ROWS; y++) {
  for (let x = 0; x < MAX_W; x++) {
    if (LINES[y][x] !== BLANK) {
      const d = x + y * ASPECT;
      if (d < MIN_D) MIN_D = d;
      if (d > MAX_D) MAX_D = d;
    }
  }
}

const WAVE_AMP = 2;
const WAVE_FREQ = 0.5;

function renderFrame(front: number): string {
  return LINES.map((chars, y) => {
    const wave = Math.sin(y * WAVE_FREQ) * WAVE_AMP;
    return chars.map((ch, x) => {
      if (ch === BLANK) return BLANK;
      const d = x + y * ASPECT;
      return d <= front + wave ? ch : BLANK;
    }).join('');
  }).join('\n');
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
    const duration = 1200;

    if (elapsed < duration) {
      const progress = easeOutCubic(Math.min(elapsed / duration, 1));
      const start = MIN_D - WAVE_AMP - 4;
      const end = MAX_D + WAVE_AMP + 4;
      setText(renderFrame(start + progress * (end - start)));
      raf.current = requestAnimationFrame(tick);
    } else {
      setText(renderFrame(MAX_D + WAVE_AMP + 4));
      setDone(true);
    }
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      setText(renderFrame(MAX_D + WAVE_AMP + 4));
      setDone(true);
      return;
    }

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [tick]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6">
      <div role="img" aria-label="Portal.C ロゴ">
        <pre
          className="select-none text-center font-mono text-[10px] leading-[1.2] text-gray-900 sm:text-xs sm:leading-[1.25]"
          style={{ opacity: done ? 1 : 0.9 }}
          aria-hidden
        >
          {text}
        </pre>
      </div>
      <p className="text-sm font-medium text-muted animate-pulse">{message}</p>
    </div>
  );
}
