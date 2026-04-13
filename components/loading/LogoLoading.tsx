/**
 * LogoLoading コンポーネント
 * ブレイルアートロゴを左から右へ波打つように描画するローディング画面
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

// 非空白文字のx範囲を取得
let MIN_X = MAX_W;
let MAX_X = 0;
for (let y = 0; y < ROWS; y++) {
  for (let x = 0; x < MAX_W; x++) {
    if (LINES[y][x] !== BLANK) {
      if (x < MIN_X) MIN_X = x;
      if (x > MAX_X) MAX_X = x;
    }
  }
}

// 波の幅（ソフトエッジ）
const WAVE_WIDTH = 6;
const WAVE_AMP = 3;
const WAVE_FREQ = 0.5;

function renderWaveFrame(waveFront: number): string {
  return LINES.map((chars, y) => {
    const waveOffset = Math.sin(y * WAVE_FREQ) * WAVE_AMP;
    return chars.map((ch, x) => {
      if (ch === BLANK) return BLANK;
      const edge = waveFront + waveOffset;
      return x <= edge ? ch : BLANK;
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
      // 波の先端をMIN_X - マージンからMAX_X + マージンまで動かす
      const start = MIN_X - WAVE_AMP - WAVE_WIDTH;
      const end = MAX_X + WAVE_AMP + WAVE_WIDTH;
      const front = start + progress * (end - start);
      setText(renderWaveFrame(front));
      raf.current = requestAnimationFrame(tick);
    } else {
      setText(renderWaveFrame(MAX_X + WAVE_AMP + WAVE_WIDTH));
      setDone(true);
    }
  }, []);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      setText(renderWaveFrame(MAX_X + WAVE_AMP + WAVE_WIDTH));
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
          className="select-none text-center font-mono text-[10px] leading-[1.2] text-gray-900 sm:text-xs sm:leading-[1.25]"
          aria-hidden
        >
          {text}
        </pre>
      </div>
      <p className="text-sm font-medium text-muted animate-pulse">{message}</p>
    </div>
  );
}
