import type { EventDTO } from "@/application/dtos";

const BRAND = "#2a61b3";
const ACCENT_1 = "#dcf0f8";
const ACCENT_2 = "#b7e0e4";
const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function pad2(n: number) {
    return String(n).padStart(2, "0");
}
function toYmd(d: Date) {
    return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}
function buildMonthCells(year: number, monthIndex0: number) {
    const first = new Date(year, monthIndex0, 1);
    const last = new Date(year, monthIndex0 + 1, 0);
    const startDay = first.getDay();
    const daysInMonth = last.getDate();

    const cells: Array<{ date: Date | null; ymd?: string }> = [];
    for (let i = 0; i < startDay; i++) cells.push({ date: null });
    for (let d = 1; d <= daysInMonth; d++) {
        const dt = new Date(year, monthIndex0, d);
        cells.push({ date: dt, ymd: toYmd(dt) });
    }
    while (cells.length % 7 !== 0) cells.push({ date: null });
    return { first, cells };
}

function MonthCalendar({
                           year,
                           monthIndex0,
                           highlightYmdSet,
                       }: {
    year: number;
    monthIndex0: number;
    highlightYmdSet: Set<string>;
}) {
    const { first, cells } = buildMonthCells(year, monthIndex0);
    const todayYmd = toYmd(new Date());

    return (
        <div
            className="rounded-2xl border bg-white p-4 sm:p-5"
            style={{ borderColor: ACCENT_2, boxShadow: "0 14px 36px rgba(42,97,179,0.10)" }}
        >
            <div className="mb-3 text-base sm:text-lg font-semibold" style={{ color: BRAND }}>
                {first.getFullYear()}年{first.getMonth() + 1}月
            </div>

            <div className="grid grid-cols-7 gap-1 text-xs sm:text-sm mb-2">
                {WEEKDAYS.map((w, i) => (
                    <div
                        key={w}
                        className="text-center py-1"
                        style={{ color: i === 0 ? "rgba(42,97,179,0.75)" : "rgba(42,97,179,0.65)" }}
                    >
                        {w}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {cells.map((c, idx) => {
                    if (!c.date) return <div key={idx} className="h-9 sm:h-10" />;

                    const ymd = c.ymd!;
                    const isToday = ymd === todayYmd;
                    const hasEvent = highlightYmdSet.has(ymd);

                    return (
                        <div
                            key={idx}
                            className="relative h-9 sm:h-10 rounded-lg flex items-center justify-center text-sm select-none"
                            style={{
                                background: hasEvent ? "rgba(220,240,248,0.85)" : "rgba(220,240,248,0.45)",
                                color: BRAND,
                                border: isToday ? `1px solid ${BRAND}` : `1px solid rgba(183,224,228,0.9)`,
                            }}
                            title={hasEvent ? "参加申込受付中のイベントがあります" : undefined}
                        >
                            {c.date.getDate()}
                            {hasEvent && (
                                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1.5 w-1.5 rounded-full" style={{ background: BRAND }} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export function DualMonthCalendars({ events }: { events: EventDTO[] }) {
    const now = new Date();
    const openEvents = events
        .filter((e) => !e.isFull)
        .filter((e) => new Date(e.endDate) >= now);

    const highlight = new Set<string>();
    for (const e of openEvents) {
        highlight.add(toYmd(new Date(e.startDate)));
    }

    const y = now.getFullYear();
    const m0 = now.getMonth();
    const nextY = m0 === 11 ? y + 1 : y;
    const nextM0 = (m0 + 1) % 12;

    return (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            <MonthCalendar year={y} monthIndex0={m0} highlightYmdSet={highlight} />
            <MonthCalendar year={nextY} monthIndex0={nextM0} highlightYmdSet={highlight} />
        </section>
    );
}
