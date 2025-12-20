import { MemberGmailForm } from '@/components/admin/MemberGmailForm';

export default function AdminGmailPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Gmail登録</h1>
        <p className="text-gray-600">
          学校メールアドレスから私用Gmailを登録します。
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-2">私用Gmail登録</h2>
        <p className="text-sm text-gray-600 mb-4">
          管理者専用: 学校メールアドレスで検索し、私用Gmailを登録します。
        </p>
        <MemberGmailForm />
      </div>
    </div>
  );
}
