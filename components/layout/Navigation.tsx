"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

export function Navigation() {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const { data: session, status } = useSession();
    const isAdmin = !!session?.user?.roles?.includes("admin");

    const navItems = useMemo(() => {
        const items = [
            { href: "/events", label: "イベント一覧" },
            { href: "/members", label: "メンバー" },
            { href: "/timetable", label: "時間割" },
            { href: "/profile", label: "プロフィール" },
        ];

        // 読み込み中は非表示、確定でadminなら表示
        if (status === "authenticated" && isAdmin) {
            items.push({ href: "/admin", label: "管理画面" });
        }

        return items;
    }, [status, isAdmin]);

    // 以下は既存のままでOK
    useEffect(() => setIsMenuOpen(false), [pathname]);
    const toggleMenu = () => setIsMenuOpen((v) => !v);

    return (
    <>
      <nav className="sticky top-0 z-50">
        <div className="relative overflow-hidden border-b border-border bg-background">
          {/* うっすら動くアクセント（白背景用に控えめ） */}
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute -inset-x-24 -top-24 h-56 blur-2xl opacity-70 animate-aurora"
              style={{
                background:
                  "linear-gradient(90deg, rgba(220,240,248,0.85), rgba(183,224,228,0.55), rgba(220,240,248,0.85))",
              }}
            />
            <div
              className="absolute -inset-x-24 -bottom-24 h-56 blur-2xl opacity-60 animate-aurora2"
              style={{
                background:
                  "linear-gradient(90deg, rgba(183,224,228,0.60), rgba(220,240,248,0.80), rgba(183,224,228,0.60))",
              }}
            />
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
