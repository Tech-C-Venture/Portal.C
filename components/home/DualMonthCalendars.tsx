"use client";

import type { EventDTO } from "@/application/dtos";
import { useMemo } from "react";

type Props = {
  events: EventDTO[]; // 受付中イベントを渡す想定
};

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function toKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function buildMonthCells(year: number, month0: number) {
  const first = new Date(year, month0, 1);
  const firstDow = first.getDay();
  const days = new Date(year, month0 + 1, 0).getDate();

  const cells: Array<number | null> = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);

  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function MonthCard({
                     year,
                     month0,
                     highlightKeys,
                   }: {
  year: number;
  month0: number;
  highlightKeys: Set<string>;
}) {
  const title = new Date(year, month0, 1).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
  });
  const cells = buildMonthCells(year, month0);

  return (
      <div className="rounded-2xl border border-border bg-white shadow-soft overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-accent1/60">
          <div className="text-sm font-semibold text-primary">{title}</div>
        </div>

        <div className="p-4">
          <div className="grid grid-cols-7 gap-2 text-xs text-primary/70 mb-2">
            {WEEKDAYS.map((w) => (
                <div key={w} className="text-center font-semibold">
                  {w}
                </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {cells.map((d, idx) => {
              if (d === null) return <div key={idx} className="h-10" />;

              const date = new Date(year, month0, d);
              const key = toKey(date);
              const highlighted = highlightKeys.has(key);

              return (
                  <div
                      key={idx}
                      className={[
                        "h-10 rounded-xl border text-center text-sm flex items-center justify-center relative",
                        "transition",
                        highlighted
                            ? "bg-accent2/60 border-border"
                            : "bg-white border-border/60 hover:bg-accent1/50",
                      ].join(" ")}
                  >
                    <span className="text-primary">{d}</span>
                    {highlighted && (
                        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </div>
              );
            })}
          </div>

          <div className="mt-4 text-xs text-primary/70">
            ●：受付中イベント（開始日）
          </div>
        </div>
      </div>
  );
}

export function DualMonthCalendars({ events }: Props) {
  const now = new Date();
  const y = now.getFullYear();
  const m0 = now.getMonth();

  const highlightKeys = useMemo(() => {
    const set = new Set<string>();
    for (const e of events ?? []) {
      const d = new Date(e.startDate);
      set.add(toKey(d));
    }
    return set;
  }, [events]);

  // 次月
  const next = new Date(y, m0 + 1, 1);
  const ny = next.getFullYear();
  const nm0 = next.getMonth();

  return (
      <div className="space-y-4">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-lg font-bold text-primary">カレンダー</h2>
          <div className="text-xs text-primary/70">
            今月（左） / 来月（右）
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <MonthCard year={y} month0={m0} highlightKeys={highlightKeys} />
          <MonthCard year={ny} month0={nm0} highlightKeys={highlightKeys} />
        </div>
      </div>
  );
}
