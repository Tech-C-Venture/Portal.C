"use client";

import Link from "next/link";

export function MatterHero() {
  return (
      <section className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        {/* 背景グロー */}
        <div className="pointer-events-none absolute inset-0">
          <div className="hero-glow-1 absolute -left-24 -top-24 h-72 w-72 rounded-full blur-3xl opacity-70" />
          <div className="hero-glow-2 absolute -right-24 -bottom-24 h-72 w-72 rounded-full blur-3xl opacity-60" />
        </div>

        <div className="relative px-6 py-10 sm:px-10 sm:py-14">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-primary">
            Portal.C
          </h1>
          <p className="mt-3 text-base sm:text-lg text-primary/70">
            Tech.C Venture メンバー管理システム
          </p>

          <div className="mt-6">
            <Link
                href="/events"
                className={[
                  "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold",
                  "bg-primary text-white shadow-[0_14px_30px_rgba(42,97,179,0.18)]",
                  "transition will-change-transform",
                  "hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(42,97,179,0.22)]",
                  "active:translate-y-0",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                ].join(" ")}
            >
              イベントを見る
            </Link>
          </div>
        </div>

        <style jsx global>{`
        @media (prefers-reduced-motion: reduce) {
          .hero-glow-1,
          .hero-glow-2 {
            animation: none !important;
          }
        }
        .hero-glow-1 {
          background: radial-gradient(
            closest-side,
            rgba(220, 240, 248, 0.95),
            rgba(220, 240, 248, 0)
          );
          animation: float-slow 11s ease-in-out infinite;
        }
        .hero-glow-2 {
          background: radial-gradient(
            closest-side,
            rgba(183, 224, 228, 0.9),
            rgba(183, 224, 228, 0)
          );
          animation: float-slow 13s ease-in-out infinite reverse;
        }
      `}</style>
      </section>
  );
}
