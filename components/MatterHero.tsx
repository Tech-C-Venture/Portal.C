"use client";

import Link from "next/link";

const BRAND = "#2a61b3";
const ACCENT_2 = "#b7e0e4";

export function MatterHero() {
    return (
        <>
            <section
                className="relative w-full overflow-hidden rounded-2xl border bg-white px-6 py-14 sm:px-10 sm:py-16 text-center"
                style={{
                    borderColor: ACCENT_2,
                    boxShadow: "0 18px 44px rgba(42,97,179,0.14)",
                }}
            >
                <div className="pointer-events-none absolute inset-0 hero-bg" />

                <div className="relative z-10">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight" style={{ color: BRAND }}>
                        Portal.C
                    </h1>

                    <p className="mt-3 text-sm sm:text-base md:text-lg" style={{ color: "rgba(42,97,179,0.80)" }}>
                        Tech.C Venture メンバー管理システム
                    </p>

                    <div className="mt-7">
                        <Link
                            href="/events"
                            className="inline-flex items-center justify-center rounded-full px-8 py-3 md:px-10 md:py-3.5 text-sm md:text-base font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2"
                            style={{
                                background: BRAND,
                                boxShadow: "0 12px 28px rgba(42,97,179,0.22)",
                                outlineColor: ACCENT_2,
                            }}
                        >
                            イベントを見る
                        </Link>
                    </div>
                </div>
            </section>

            <style jsx global>{`
                @media (prefers-reduced-motion: reduce) {
                    .hero-bg {
                        animation: none !important;
                    }
                }
                .hero-bg {
                    background:
                            radial-gradient(900px 420px at 18% 28%, rgba(220, 240, 248, 0.92), rgba(255, 255, 255, 0) 65%),
                            radial-gradient(820px 420px at 82% 32%, rgba(183, 224, 228, 0.72), rgba(255, 255, 255, 0) 60%),
                            radial-gradient(900px 520px at 50% 95%, rgba(42, 97, 179, 0.10), rgba(255, 255, 255, 0) 65%);
                    animation: heroGlow 10s ease-in-out infinite;
                }
                @keyframes heroGlow {
                    0% { transform: translateY(0) translateX(0) scale(1); }
                    50% { transform: translateY(8px) translateX(-10px) scale(1.02); }
                    100% { transform: translateY(0) translateX(0) scale(1); }
                }
            `}</style>
        </>
    );
}
