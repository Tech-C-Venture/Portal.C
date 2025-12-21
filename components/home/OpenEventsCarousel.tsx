"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { EventDTO } from "@/application/dtos";

type Props = {
  events: EventDTO[];
};

function formatRange(startISO: string, endISO: string) {
  const s = new Date(startISO);
  const e = new Date(endISO);
  const sTxt = s.toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  const eTxt = e.toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${sTxt} 〜 ${eTxt}`;
}

export function OpenEventsCarousel({ events }: Props) {
  const items = useMemo(() => events ?? [], [events]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((v) => (v + 1) % items.length);
    }, 6500);
    return () => window.clearInterval(id);
  }, [items.length]);

  useEffect(() => {
    if (index >= items.length) setIndex(0);
  }, [items.length, index]);

  if (items.length === 0) {
    return (
        <div className="rounded-2xl border border-border bg-white p-6 text-primary/70">
          現在、参加申込受付中のイベントはありません。
        </div>
    );
  }

  const current = items[index];

  return (
      <div className="relative">
        <div className="rounded-2xl border border-border bg-white shadow-soft overflow-hidden">
          <div className="relative p-6 sm:p-8">
            {/* 背景 */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-br from-accent1 via-white to-accent2 opacity-90" />
              <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-accent2/70 blur-3xl" />
              <div className="absolute -right-24 -bottom-24 h-64 w-64 rounded-full bg-accent1/80 blur-3xl" />
            </div>

            <div className="relative">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold text-primary/70">
                    参加申込受付中
                  </div>
                  <h3 className="mt-2 text-xl sm:text-2xl font-bold text-primary">
                    {current.title}
                  </h3>
                  <p className="mt-2 text-sm text-primary/70">
                    {formatRange(current.startDate, current.endDate)}
                  </p>
                  <p className="mt-1 text-sm text-primary/70">
                    📍 {current.location}
                  </p>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                  <button
                      type="button"
                      onClick={() =>
                          setIndex((v) => (v - 1 + items.length) % items.length)
                      }
                      className="h-10 w-10 rounded-xl border border-border bg-white/70 text-primary hover:bg-accent1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                      aria-label="前へ"
                  >
                    ←
                  </button>
                  <button
                      type="button"
                      onClick={() => setIndex((v) => (v + 1) % items.length)}
                      className="h-10 w-10 rounded-xl border border-border bg-white/70 text-primary hover:bg-accent1 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                      aria-label="次へ"
                  >
                    →
                  </button>
                </div>
              </div>

              <p className="mt-4 text-sm text-primary/80 line-clamp-3">
                {current.description}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                    href="/events"
                    className={[
                      "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold",
                      "bg-primary text-white shadow-[0_14px_30px_rgba(42,97,179,0.18)]",
                      "transition hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(42,97,179,0.22)]",
                      "active:translate-y-0",
                    ].join(" ")}
                >
                  一覧で見る
                </Link>

                <span className="text-xs text-primary/70">
                {index + 1} / {items.length}
              </span>
              </div>

              {/* ドット */}
              <div className="mt-5 flex items-center gap-2">
                {items.map((_, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => setIndex(i)}
                        className={[
                          "h-2.5 w-2.5 rounded-full transition",
                          i === index ? "bg-primary" : "bg-primary/20 hover:bg-primary/35",
                        ].join(" ")}
                        aria-label={`スライド ${i + 1}`}
                    />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* モバイル用矢印 */}
        <div className="sm:hidden mt-3 flex items-center justify-end gap-2">
          <button
              type="button"
              onClick={() => setIndex((v) => (v - 1 + items.length) % items.length)}
              className="h-10 w-10 rounded-xl border border-border bg-white text-primary hover:bg-accent1 transition"
              aria-label="前へ"
          >
            ←
          </button>
          <button
              type="button"
              onClick={() => setIndex((v) => (v + 1) % items.length)}
              className="h-10 w-10 rounded-xl border border-border bg-white text-primary hover:bg-accent1 transition"
              aria-label="次へ"
          >
            →
          </button>
        </div>
      </div>
  );
}
