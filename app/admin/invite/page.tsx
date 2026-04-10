import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { InviteUserForm } from "@/components/admin/InviteUserForm";
import { CsvInviteForm } from "@/components/admin/CsvInviteForm";
import { MemberListWithDelete } from "@/components/admin/MemberListWithDelete";
import { getMembers } from "@/app/admin/_data";

export default async function AdminInvitePage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/events");
  }

  const members = await getMembers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">メンバー招待</h1>
        <p className="text-gray-600">
          新しいメンバーをZITADELに登録し、招待メールを送信します。
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-lg">
        <h2 className="text-lg font-semibold mb-4">個別招待</h2>
        <InviteUserForm />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-lg">
        <h2 className="text-lg font-semibold mb-4">CSV一括招待</h2>
        <CsvInviteForm />
      </div>

      <div className="max-w-lg">
        <h2 className="text-lg font-semibold mb-4">登録済みメンバー管理</h2>
        <p className="text-sm text-gray-600 mb-3">
          ZITADELで削除済みのユーザーをPortal.Cからも登録解除できます。
        </p>
        <MemberListWithDelete members={members} />
      </div>
    </div>
  );
}
