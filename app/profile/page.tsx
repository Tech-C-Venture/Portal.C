import { getCurrentMemberProfileAction } from "@/app/actions/members";
import { MemberProfileForm } from "@/components/members/MemberProfileForm";

export default async function ProfilePage() {
  const member = await getCurrentMemberProfileAction();
  const needsOnboarding =
    !member.studentId ||
    !member.department ||
    member.department.trim().length === 0 ||
    member.skills.length === 0 ||
    member.interests.length === 0;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">プロフィール</h1>
        <p className="text-muted">あなたの情報を編集</p>
      </div>

      {needsOnboarding && (
        <div className="mb-8 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <h2 className="text-lg font-semibold text-amber-900 mb-2">
            初回ログインの設定
          </h2>
          <p className="text-sm text-amber-800">
            学籍番号と所属専攻が未登録です。プロフィールを入力して保存してください。
          </p>
        </div>
      )}

      <div className="max-w-2xl bg-white rounded-lg shadow-md p-8">
        <div className="mb-6 flex items-center">
          <div className="w-24 h-24 bg-gray-300 rounded-full mr-6"></div>
        </div>

        <MemberProfileForm member={member} mode="profile" submitLabel="保存" />
      </div>
    </div>
  );
}
