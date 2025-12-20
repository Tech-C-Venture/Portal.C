"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

type NavigationProps = {
    roles?: string[];
};

export function Navigation({ roles }: NavigationProps) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // layoutから roles が渡されるならそれを優先、無ければuseSessionから拾う
    const roleList = roles ?? session?.user?.roles ?? [];

    const isAdmin = useMemo(() => {
        return roleList.some((r) => r.toLowerCase().includes("admin"));
    }, [roleList]);

    const navItems = useMemo(
        () => [
            { href: "/events", label: "イベント一覧" },
            { href: "/members", label: "メンバー" },
            { href: "/timetable", label: "時間割" },
            { href: "/profile", label: "プロフィール" },
            { href: "/admin", label: "管理画面", adminOnly: true },
        ],
        []
    );

    const filteredItems = useMemo(() => {
        return navItems.filter((i) => !i.adminOnly || isAdmin);
    }, [navItems, isAdmin]);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    return (
        <>
            <nav className="sticky top-0 z-50">
                <div className="relative overflow-hidden border-b border-border bg-white/75 backdrop-blur-xl">
                    {/* うっすら動く光（アクセント色） */}
                    <div className="pointer-events-none absolute inset-0">
                        <div className="nav-aurora absolute -inset-x-20 -top-16 h-56 rounded-full blur-3xl opacity-60" />
                        <div className="nav-aurora2 absolute -inset-x-20 -bottom-20 h-56 rounded-full blur-3xl opacity-55" />
                    </div>

                    <div className="container mx-auto px-4">
                        <div className="flex h-16 items-center justify-between">
                            <Link href="/" className="relative z-10 flex items-center gap-2">
                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent1 ring-1 ring-border shadow-soft overflow-hidden">
                                    <Image
                                    src="/images/logo.png"
                                    alt="Portal.C"
                                    width={36}
                                    height={36}
                                    priority
                                    unoptimized
                                    />
                                </span>
                                <span className="text-lg font-semibold tracking-wide text-primary">
                                    Portal.C
                                </span>
                            </Link>

                            {/* Desktop */}
                            <div className="hidden md:flex items-center gap-1">
                                {filteredItems.map((item) => {
                                    const active = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={[
                                                "group relative rounded-xl px-4 py-2 text-sm font-medium transition",
                                                "text-primary/80 hover:text-primary",
                                                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                                                active
                                                    ? "bg-accent1 ring-1 ring-border shadow-[0_10px_26px_rgba(42,97,179,0.10)]"
                                                    : "hover:bg-accent1/70",
                                            ].join(" ")}
                                        >
                                            <span className="relative z-10">{item.label}</span>
                                            <span
                                                className={[
                                                    "pointer-events-none absolute inset-x-3 -bottom-[2px] h-[2px] rounded-full",
                                                    "bg-gradient-to-r from-primary/40 via-primary/70 to-primary/40",
                                                    "transition-transform duration-300 ease-out origin-left",
                                                    active
                                                        ? "scale-x-100"
                                                        : "scale-x-0 group-hover:scale-x-100",
                                                ].join(" ")}
                                            />
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Mobile button */}
                            <button
                                onClick={() => setIsMenuOpen((v) => !v)}
                                className="md:hidden z-10 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent1/70 text-primary hover:bg-accent2/70 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
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

                        {/* Mobile menu */}
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
                                <div className="rounded-2xl border border-border bg-white/80 p-2 shadow-soft">
                                    {filteredItems.map((item) => {
                                        const active = pathname === item.href;
                                        return (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className={[
                                                    "block rounded-xl px-4 py-3 text-base font-medium transition",
                                                    "text-primary/80 hover:text-primary hover:bg-accent1/70",
                                                    active ? "bg-accent1 ring-1 ring-border" : "",
                                                ].join(" ")}
                                            >
                        <span className="flex items-center justify-between">
                          {item.label}
                            <span
                                className={[
                                    "h-2 w-2 rounded-full transition-opacity",
                                    active
                                        ? "opacity-100 bg-primary"
                                        : "opacity-0 bg-primary",
                                ].join(" ")}
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

            {/* ナビ背景アニメ（軽量・停止対応） */}
            <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          .nav-aurora,
          .nav-aurora2 {
            animation: none !important;
          }
        }
        .nav-aurora {
          background: radial-gradient(
            closest-side,
            rgba(220, 240, 248, 0.95),
            rgba(220, 240, 248, 0)
          );
          animation: float-slow 10s ease-in-out infinite;
        }
        .nav-aurora2 {
          background: radial-gradient(
            closest-side,
            rgba(183, 224, 228, 0.9),
            rgba(183, 224, 228, 0)
          );
          animation: float-slow 12s ease-in-out infinite reverse;
        }
      `}</style>
        </>
    );
}
