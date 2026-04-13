/**
 * LogoLoading コンポーネント
 * Tech.C VentureのダイヤモンドロゴをUnicodeブロック文字で描画し、
 * フレームアニメーションで段階的に表示するローディング画面
 */

'use client';

import { useEffect, useState } from 'react';

// ロゴのUnicodeブロックアートフレーム（段階的に描画）
const LOGO_FRAMES = [
  // Frame 0: 外枠上部
  [
    '        ▄▄        ',
    '      ▄████▄      ',
    '    ▄████████▄    ',
    '                  ',
    '                  ',
    '                  ',
    '                  ',
    '                  ',
    '                  ',
  ],
  // Frame 1: 外枠上部 + 中央部
  [
    '        ▄▄        ',
    '      ▄████▄      ',
    '    ▄████████▄    ',
    '  ▄████████████▄  ',
    '▄██████████████████▄',
    '                  ',
    '                  ',
    '                  ',
    '                  ',
  ],
  // Frame 2: 外枠全体（ダイヤモンド）
  [
    '        ▄▄        ',
    '      ▄████▄      ',
    '    ▄████████▄    ',
    '  ▄████████████▄  ',
    '▄██████████████████▄',
    '  ▀████████████▀  ',
    '    ▀████████▀    ',
    '      ▀████▀      ',
    '        ▀▀        ',
  ],
  // Frame 3: ダイヤモンド + C字の切り抜き開始
  [
    '        ▄▄        ',
    '      ▄████▄      ',
    '    ▄███  ███▄    ',
    '  ▄███  ▄▄  ███▄  ',
    '▄████  ████  █████▄',
    '  ▀███  ▀▀  ███▀  ',
    '    ▀███  ███▀    ',
    '      ▀████▀      ',
    '        ▀▀        ',
  ],
  // Frame 4: 完成形 - ダイヤモンド内にCの切り抜き
  [
    '        ▄▄        ',
    '      ▄████▄      ',
    '    ▄██▀  ▀██▄    ',
    '  ▄██▀  ▄▄  ▀██▄  ',
    '▄████  ████  █████▄',
    '  ▀██▄  ▀▀  ▄██▀  ',
    '    ▀██▄  ▄██▀    ',
    '      ▀████▀      ',
    '        ▀▀        ',
  ],
];

interface LogoLoadingProps {
  message?: string;
}

export function LogoLoading({ message = '読み込み中...' }: LogoLoadingProps) {
  const [frame, setFrame] = useState(0);
  const [phase, setPhase] = useState<'drawing' | 'pulsing'>('drawing');

  useEffect(() => {
    // prefers-reduced-motion 対応
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      // モーション削減時は完成形を即表示
      setFrame(LOGO_FRAMES.length - 1);
      setPhase('pulsing');
      return;
    }

    if (phase === 'drawing') {
      if (frame < LOGO_FRAMES.length - 1) {
        const timer = setTimeout(() => setFrame((f) => f + 1), 180);
        return () => clearTimeout(timer);
      } else {
        setPhase('pulsing');
      }
    }
  }, [frame, phase]);

  const currentFrame = LOGO_FRAMES[frame];

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-6">
      <div
        className={[
          'transition-opacity duration-500',
          phase === 'pulsing' ? 'logo-loading-pulse' : '',
        ].join(' ')}
        role="img"
        aria-label="Portal.C ロゴ"
      >
        <pre
          className="select-none text-center font-mono text-sm leading-tight text-primary sm:text-base"
          aria-hidden
        >
          {currentFrame.join('\n')}
        </pre>
      </div>
      <p className="text-sm font-medium text-muted animate-pulse">{message}</p>
    </div>
  );
}
