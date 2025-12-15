import type { Member } from "@/types";
import { calculateGrade } from "@/types";

// ダミーデータ
const mockMembers: Member[] = [
  {
    id: "1",
    name: "山田太郎",
    schoolEmail: "yamada@example.ed.jp",
    enrollmentYear: 2022,
    grade: calculateGrade(2022, false),
    isRepeating: false,
    department: "情報システム科",
    skills: ["React", "TypeScript", "Next.js"],
    interests: ["Web開発", "UI/UX"],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    name: "佐藤花子",
    schoolEmail: "sato@example.ed.jp",
    enrollmentYear: 2023,
    grade: calculateGrade(2023, false),
    isRepeating: false,
    department: "AIシステム科",
    skills: ["Python", "機械学習", "データ分析"],
    interests: ["AI", "データサイエンス"],
    currentStatus: {
      message: "課題中...",
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function MembersPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">メンバー一覧</h1>
        <p className="text-gray-600">Tech.C Ventureのメンバー</p>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="スキルや興味で検索..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockMembers.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full mr-4"></div>
              <div>
                <h2 className="text-lg font-semibold">{member.name}</h2>
                <p className="text-sm text-gray-500">
                  {member.grade}年生 / {member.department}
                </p>
              </div>
            </div>
            {member.currentStatus && (
              <div className="mb-3 p-2 bg-blue-50 rounded text-sm text-blue-700">
                💬 {member.currentStatus.message}
              </div>
            )}
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-1">スキル:</p>
              <div className="flex flex-wrap gap-1">
                {member.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">興味:</p>
              <div className="flex flex-wrap gap-1">
                {member.interests.map((interest) => (
                  <span
                    key={interest}
                    className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
