/**
 * LogoLoading コンポーネント
 * ブレイルアートロゴを常時表示し、
 * 行ごとにスタガーした色波アニメーションで演出するローディング画面
 */

'use client';

// prettier-ignore
const LOGO_LINES = [
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

interface LogoLoadingProps {
  message?: string;
}

export function LogoLoading({ message = '読み込み中...' }: LogoLoadingProps) {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes llw {
          0%, 100% { color: #1f1f1f; text-shadow: none; }
          50% { color: #9ca3af; text-shadow: 0 0 10px rgba(42,97,179,0.25); }
        }
      `}} />
      <div role="img" aria-label="Portal.C ロゴ">
        <pre
          className="select-none text-center font-mono text-[10px] leading-[1.2] sm:text-xs sm:leading-[1.25]"
          aria-hidden
        >
          {LOGO_LINES.map((line, i) => (
            <span
              key={i}
              style={{
                display: 'block',
                color: '#1f1f1f',
                animation: `llw 2s ${i * 0.1}s ease-in-out infinite`,
              }}
            >
              {line}
            </span>
          ))}
        </pre>
      </div>
      <p className="text-sm font-medium text-muted animate-pulse">{message}</p>
    </div>
  );
}
