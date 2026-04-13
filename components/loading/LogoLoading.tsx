/**
 * LogoLoading コンポーネント
 * ブレイルアートロゴを常時表示し、
 * 斜めに光が波打つCSSアニメーションで演出するローディング画面
 */

'use client';

// prettier-ignore
const LOGO_ART =
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣞⡦⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n' +
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣟⡷⣯⢿⣽⢤⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n' +
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣞⡷⣯⢿⣽⣻⣞⣿⢽⡤⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n' +
  '⠀⠀⠀⠀⠀⠀⠀⠀⣠⣞⡷⣯⢿⣽⣻⣞⣷⣻⣞⣯⣟⣷⢤⠀⠀⠀⠀⠀⠀⠀⠀\n' +
  '⠀⠀⠀⠀⠀⠀⡠⣞⡷⣯⢿⣽⡻⠊⣷⣻⣞⣷⣻⣞⣷⣻⡽⣷⢤⠀⠀⠀⠀⠀⠀\n' +
  '⠀⠀⠀⠀⣀⣮⢿⡽⣯⢿⡽⠊⡠⣞⣾⣳⣟⣾⡣⠑⢟⡾⣯⢿⡽⣷⣄⠀⠀⠀⠀\n' +
  '⠀⠀⢠⡼⣗⣿⢽⡯⡿⠝⢠⡼⣯⢿⣺⣗⡿⠚⠀⠀⠀⠙⢽⡯⣟⣷⣻⢷⣄⠀⠀\n' +
  '⢠⡼⣯⢿⡽⣞⡯⠏⢁⡴⣯⢿⡽⣯⢷⠋⠁⠀⠀⠀⠀⠀⠀⠙⢟⣾⢽⣻⣞⡷⣄\n' +
  '⠙⢽⢯⡿⣽⠋⢠⣄⠉⠿⣽⢯⡿⣽⣻⣆⡀⠀⠀⠀⠀⠀⢀⣤⡀⠙⢯⡷⣯⠟⠁\n' +
  '⠀⠀⠙⠝⢁⡴⣯⣟⡷⣄⠉⠿⣽⣻⣞⡷⣯⣆⡀⠀⢀⢴⣳⡯⣿⢦⡀⠛⠁⠀⠀\n' +
  '⠀⠀⠀⠀⠙⢯⡷⣯⢿⣽⣳⣄⠑⢻⣞⣯⢷⠻⠂⣰⡽⣯⢷⣻⡽⡯⠋⠀⠀⠀⠀\n' +
  '⠀⠀⠀⠀⠀⠀⠫⢿⡽⣞⣷⣻⢶⡄⠘⠝⠃⣠⣟⣷⣻⡽⣯⠷⠋⠀⠀⠀⠀⠀⠀\n' +
  '⠀⠀⠀⠀⠀⠀⠀⠀⠫⢿⣺⡽⣯⣟⣧⢤⣞⣷⣻⣞⣷⡻⠉⠀⠀⠀⠀⠀⠀⠀⠀\n' +
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠱⣻⣗⣿⣺⡯⣷⣻⣞⡷⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n' +
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠛⣾⣳⢿⡽⣞⠇⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀\n' +
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠺⢯⠏⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀';

interface LogoLoadingProps {
  message?: string;
}

export function LogoLoading({ message = '読み込み中...' }: LogoLoadingProps) {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6">
      <div role="img" aria-label="Portal.C ロゴ">
        <pre
          className="logo-wave select-none text-center font-mono text-[10px] leading-[1.2] sm:text-xs sm:leading-[1.25]"
          aria-hidden
        >
          {LOGO_ART}
        </pre>
      </div>
      <p className="text-sm font-medium text-muted animate-pulse">{message}</p>
    </div>
  );
}
