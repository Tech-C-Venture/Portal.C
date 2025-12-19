import { getCurrentMemberProfileAction } from "@/app/actions/members";
import { MemberProfileForm } from "@/components/members/MemberProfileForm";

export default async function OnboardingPage() {
  const member = await getCurrentMemberProfileAction();

  return (
    <div className="rounded-xl bg-gray-50 p-6 text-gray-900">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">プロフィール入力</h1>
        <p className="text-gray-600">最初に基本情報を入力してください</p>
      </div>

      <div className="max-w-2xl bg-white rounded-lg border border-gray-200 shadow-md p-8">
        <MemberProfileForm
          member={member}
          mode="onboarding"
          redirectTo="/"
          submitLabel="はじめる"
        />
      </div>
    </div>
  );
}
