"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { EventDTO } from "@/application/dtos";

const BRAND = "#2a61b3";
const ACCENT_1 = "#dcf0f8";
const ACCENT_2 = "#b7e0e4";

function formatJa(dtIso: string) {
    const d = new Date(dtIso);
    return new Intl.DateTimeFormat("ja-JP", {
        month: "2-digit",
        day: "2-digit",
        weekday: "short",
        hour: "2-digit",
        minute: "2-digit",
    }).format(d);
}

export function OpenEventsCarousel({ events }: { events: EventDTO[] }) {
    const openEvents = useMemo(() => {
        const now = new Date();
        return events
            .filter((e) => !e.isFull)
            .filter((e) => new Date(e.endDate) >= now) // 終了してないものだけ
            .sort((a, b) => +new Date(a.startDate) - +new Date(b.startDate));
    }, [events]);

    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (openEvents.length <= 1) return;
        const t = window.setInterval(() => {
            setIndex((i) => (i + 1) % openEvents.length);
        }, 4500);
        return () => window.clearInterval(t);
    }, [openEvents.length]);

    useEffect(() => {
        if (index >= openEvents.length) setIndex(0);
    }, [index, openEvents.length]);

    return (
        <section className="space-y-2">
            <div className="flex items-center justify-between">
                <h2 className="text-sm sm:text-base font-semibold" style={{ color: BRAND }}>
                    参加申込受付中
                </h2>

                {openEvents.length > 1 && (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            className="rounded-full px-3 py-1 text-xs font-medium transition"
                            style={{ background: ACCENT_1, color: BRAND, border: `1px solid ${ACCENT_2}` }}
                            onClick={() => setIndex((i) => (i - 1 + openEvents.length) % openEvents.length)}
                        >
                            前
                        </button>
                        <button
                            type="button"
                            className="rounded-full px-3 py-1 text-xs font-medium transition"
                            style={{ background: ACCENT_1, color: BRAND, border: `1px solid ${ACCENT_2}` }}
                            onClick={() => setIndex((i) => (i + 1) % openEvents.length)}
                        >
                            次
                        </button>
                    </div>
                )}
            </div>

            <div
                className="relative overflow-hidden rounded-2xl border bg-white"
                style={{ borderColor: ACCENT_2, boxShadow: "0 14px 36px rgba(42,97,179,0.10)" }}
            >
                {openEvents.length === 0 ? (
                    <div className="p-6 text-center text-sm" style={{ color: "rgba(42,97,179,0.75)" }}>
                        現在、参加申込受付中のイベントはありません。
                    </div>
                ) : (
                    <>
                        <div
                            className="flex transition-transform duration-500 ease-out"
                            style={{ transform: `translateX(-${index * 100}%)` }}
                        >
                            {openEvents.map((e) => (
                                <div key={e.id} className="min-w-full p-4 sm:p-6">
                                    <Link
                                        href="/events"
                                        className="block rounded-2xl border p-4 sm:p-5 transition-transform duration-300 hover:-translate-y-0.5"
                                        style={{
                                            borderColor: ACCENT_2,
                                            background:
                                                "linear-gradient(135deg, rgba(220,240,248,0.95), rgba(255,255,255,0.95))",
                                        }}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                      <span
                          className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                          style={{ background: BRAND, color: "#fff" }}
                      >
                        受付中
                      </span>
                                            <span className="text-xs sm:text-sm" style={{ color: "rgba(42,97,179,0.75)" }}>
                        {formatJa(e.startDate)}
                      </span>
                                        </div>

                                        <div className="mt-3 text-base sm:text-lg font-semibold" style={{ color: BRAND }}>
                                            {e.title}
                                        </div>

                                        <div className="mt-1 text-xs sm:text-sm" style={{ color: "rgba(42,97,179,0.75)" }}>
                                            📍 {e.location} / 👥 {e.participantCount}名
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>

                        {openEvents.length > 1 && (
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                                {openEvents.map((_, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        aria-label={`スライド ${i + 1}`}
                                        onClick={() => setIndex(i)}
                                        className="h-2.5 w-2.5 rounded-full transition"
                                        style={{ background: i === index ? BRAND : ACCENT_2 }}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}
