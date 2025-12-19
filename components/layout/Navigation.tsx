"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type NavigationProps = {
  roles?: string[];
};

export function Navigation({ roles }: NavigationProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAdmin = Array.isArray(roles) && roles.includes("admin");

  const navItems = [
    { href: "/events", label: "イベント一覧" },
    { href: "/members", label: "メンバー" },
    { href: "/timetable", label: "時間割" },
    { href: "/profile", label: "プロフィール" },
    { href: "/admin", label: "管理画面" },
  ].filter((item) => item.href !== "/admin" || isAdmin);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* ロゴ */}
          <Link href="/" className="text-xl font-bold z-10">
            Tech.C Venture 総合ポータル
          </Link>

          {/* デスクトップメニュー (md以上で表示) */}
          <div className="hidden md:flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-gray-900 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="container mx-auto px-4">
            <div className="flex h-16 items-center justify-between">
              {/* ロゴ */}
              <Link href="/" className="relative z-10 flex items-center gap-2">
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--primary) 0%, var(--accent-2) 100%)",
                    boxShadow: "0 0 18px rgba(42,97,179,0.18)",
                  }}
                >
                  <span className="h-3 w-3 rounded-full bg-white/90" />
                </span>
                <span className="text-lg font-semibold tracking-wide text-foreground">
                  Portal.C
                </span>
              </Link>

              {/* デスクトップメニュー */}
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={[
                        "group relative rounded-xl px-4 py-2 text-sm font-medium transition",
                        "text-foreground hover:bg-accent1",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        active
                          ? "bg-accent1 shadow-[0_0_0_1px_rgba(183,224,228,0.9),0_10px_24px_rgba(42,97,179,0.10)]"
                          : "",
                      ].join(" ")}
                    >
                      <span className="relative z-10">{item.label}</span>

                      {/* 下線（ホバーで伸びる / アクティブで常時） */}
                      <span
                        className={[
                          "pointer-events-none absolute inset-x-3 -bottom-[2px] h-[2px] rounded-full",
                          "transition-transform duration-300 ease-out origin-left",
                          active
                            ? "scale-x-100"
                            : "scale-x-0 group-hover:scale-x-100",
                        ].join(" ")}
                        style={{
                          background:
                            "linear-gradient(90deg, var(--accent-2) 0%, var(--accent-1) 100%)",
                        }}
                      />
                    </Link>
                  );
                })}
              </div>

              {/* モバイル：ハンバーガー */}
              <button
                onClick={toggleMenu}
                className="md:hidden z-10 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent1 text-foreground hover:opacity-90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="メニュー"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                <span className="relative block h-4 w-5">
                  <span
                    className={[
                      "absolute left-0 top-0 h-[2px] w-5 rounded bg-current transition-transform duration-300",
                      isMenuOpen
                        ? "translate-y-[7px] rotate-45"
                        : "translate-y-0 rotate-0",
                    ].join(" ")}
                  />
                  <span
                    className={[
                      "absolute left-0 top-[7px] h-[2px] w-5 rounded bg-current transition-opacity duration-200",
                      isMenuOpen ? "opacity-0" : "opacity-100",
                    ].join(" ")}
                  />
                  <span
                    className={[
                      "absolute left-0 bottom-0 h-[2px] w-5 rounded bg-current transition-transform duration-300",
                      isMenuOpen
                        ? "-translate-y-[7px] -rotate-45"
                        : "translate-y-0 rotate-0",
                    ].join(" ")}
                  />
                </span>
              </button>
            </div>

            {/* モバイルメニュー */}
            <div
              id="mobile-menu"
              className={[
                "md:hidden overflow-hidden transition-[max-height,opacity,transform] duration-300 ease-out",
                isMenuOpen
                  ? "max-h-96 opacity-100 translate-y-0"
                  : "max-h-0 opacity-0 -translate-y-2",
              ].join(" ")}
            >
              <div className="pb-4 pt-2">
                <div className="rounded-2xl border border-border bg-white p-2 shadow-soft">
                  {navItems.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={[
                          "block rounded-xl px-4 py-3 text-base font-medium transition",
                          "text-foreground hover:bg-accent1",
                          active ? "bg-accent1" : "",
                        ].join(" ")}
                      >
                        <span className="flex items-center justify-between">
                          {item.label}
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{
                              background: active ? "var(--primary)" : "transparent",
                              opacity: active ? 1 : 0,
                              transition: "opacity 200ms ease",
                            }}
                          />
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          .animate-aurora,
          .animate-aurora2 {
            animation: none !important;
          }
        }

        .animate-aurora {
          animation: aurora 10s ease-in-out infinite;
        }
        .animate-aurora2 {
          animation: aurora2 12s ease-in-out infinite;
        }

        @keyframes aurora {
          0% {
            transform: translateX(-6%) translateY(0) scale(1);
          }
          50% {
            transform: translateX(6%) translateY(6%) scale(1.05);
          }
          100% {
            transform: translateX(-6%) translateY(0) scale(1);
          }
        }
        @keyframes aurora2 {
          0% {
            transform: translateX(6%) translateY(0) scale(1);
          }
          50% {
            transform: translateX(-6%) translateY(-6%) scale(1.06);
          }
          100% {
            transform: translateX(6%) translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
}
