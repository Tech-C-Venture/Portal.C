import { isAdmin } from "@/lib/auth";
import { redirect } from "next/navigation";
import { InviteUserForm } from "@/components/admin/InviteUserForm";

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
        <InviteUserForm />
      </div>
    </div>
  );
}
