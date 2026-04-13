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
      <div role="img" aria-label="Portal.C ロゴ">
        <pre
          className="select-none text-center font-mono text-[10px] leading-[1.2] sm:text-xs sm:leading-[1.25]"
          aria-hidden
        >
          {LOGO_LINES.map((line, i) => (
            <span
              key={i}
              className="block"
              style={{
                animation: 'logo-line-wave 2s ease-in-out infinite',
                animationDelay: `${i * 0.1}s`,
                color: '#1f1f1f',
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
