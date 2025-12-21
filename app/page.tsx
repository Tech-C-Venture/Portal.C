/**
 * トップページ
 * content1: MatterHero
 * content2: 参加申込受付中イベント スライダー
 * calendar: 今月/来月の2カレンダー（受付中イベント日をハイライト）
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

/* eslint-disable no-restricted-imports */
import { container } from "@/infrastructure/di/setup";
import { REPOSITORY_KEYS } from "@/infrastructure/di/keys";
import type { IEventRepository } from "@/application/ports";
import type { EventDTO } from "@/application/dtos";
import { MatterHero } from "@/components/MatterHero";
import { OpenEventsCarousel } from "@/components/home/OpenEventsCarousel";
import { DualMonthCalendars } from "@/components/home/DualMonthCalendars";

async function getEvents(): Promise<EventDTO[]> {
    try {
        const eventRepository =
            container.resolve<IEventRepository>(REPOSITORY_KEYS.EVENT);
        const result = await eventRepository.findAll();

        if (!result.success) {
            console.error("Failed to fetch events:", result.error);
            return [];
        }

        const { EventMapper } = await import("@/application/mappers/EventMapper");
        return EventMapper.toDTOList(result.value);
    } catch (error) {
        console.error("Error fetching events:", error);
        return [];
    }
}

export default async function Home() {
    const events = await getEvents();
    const now = new Date();

    // 受付中: isFull === false かつ endDate >= now（開始日でソート）
    const openEvents = (events ?? [])
        .filter((e) => !e.isFull && new Date(e.endDate) >= now)
        .sort(
            (a, b) =>
                new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );

    return (
        <div className="space-y-10">
            {/* content1 */}
            <MatterHero />

            {/* content2 slider */}
            <section className="space-y-4">
                <div className="flex items-baseline justify-between gap-4">
                    <h2 className="text-lg font-bold text-primary">
                        参加申込受付中のイベント
                    </h2>
                    <p className="text-xs text-primary/70">
                        自動切替 / 手動切替（矢印・ドット）
                    </p>
                </div>
                <OpenEventsCarousel events={openEvents} />
            </section>

            {/* calendar */}
            <section className="rounded-2xl border border-border bg-card shadow-soft p-6">
                <DualMonthCalendars events={openEvents} />
            </section>
        </div>
    );
}
