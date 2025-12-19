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
        const eventRepository = container.resolve<IEventRepository>(REPOSITORY_KEYS.EVENT);
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

export default async function HomePage() {
    const events = await getEvents();

    return (
        <div className="space-y-6">
            <MatterHero />
            <OpenEventsCarousel events={events} />
            <DualMonthCalendars events={events} />
        </div>
    );
}
