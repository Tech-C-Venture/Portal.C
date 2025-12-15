import type { Event } from "@/types";

// ダミーデータ（後でデータベースから取得）
const mockEvents: Event[] = [
  {
    id: "1",
    title: "技育プロジェクトVol.16 キックオフ",
    description: "Portal.Cプロジェクトのキックオフミーティング",
    date: new Date("2024-04-01T18:00:00"),
    location: "オンライン",
    capacity: 30,
    participantIds: [],
    createdBy: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    title: "ハッカソン準備会",
    description: "次回のハッカソンに向けた準備とチーム編成",
    date: new Date("2024-04-15T19:00:00"),
    location: "東京工学院専門学校",
    capacity: 50,
    participantIds: [],
    createdBy: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function EventsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">イベント一覧</h1>
        <p className="text-gray-600">Tech.C Ventureのイベントに参加しよう</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
            <p className="text-gray-600 mb-4">{event.description}</p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>📅 {new Date(event.date).toLocaleString("ja-JP")}</p>
              <p>📍 {event.location}</p>
              {event.capacity && (
                <p>
                  👥 {event.participantIds.length} / {event.capacity}名
                </p>
              )}
            </div>
            <button className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors">
              参加する
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
