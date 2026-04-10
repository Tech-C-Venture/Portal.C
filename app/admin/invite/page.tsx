import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { InviteUserForm } from "@/components/admin/InviteUserForm";
import { CsvInviteForm } from "@/components/admin/CsvInviteForm";

export default async function AdminInvitePage() {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/events");
  }

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
    </div>
  );
}
