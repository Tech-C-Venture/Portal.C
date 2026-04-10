'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@openameba/spindle-ui';
import '@openameba/spindle-ui/Button/Button.css';
import { inviteMembersCsvAction } from '@/app/actions/users';
import type { CsvUploadState } from '@/lib/csv';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="medium" variant="contained" disabled={pending}>
      {pending ? '招待処理中...' : 'CSVで一括招待'}
    </Button>
  );
}

export function CsvInviteForm() {
  const [fileName, setFileName] = useState('');

  const wrappedAction = async (
    prevState: CsvUploadState,
    formData: FormData
  ): Promise<CsvUploadState> => {
    return inviteMembersCsvAction(prevState, formData);
  };

  const [state, formAction] = useActionState<CsvUploadState, FormData>(
    wrappedAction,
    { error: null, errors: null, success: null }
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!window.confirm('CSVファイルの内容でメンバーを一括招待します。よろしいですか？')) {
      e.preventDefault();
    }
  };

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-4">
      {state.error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </div>
      )}
      {state.errors && state.errors.length > 0 && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <p className="font-medium mb-2">エラー:</p>
          <ul className="list-disc list-inside space-y-1">
            {state.errors.map((err, i) => (
              <li key={i}>
                {err.row > 0 ? `${err.row}行目: ` : ''}{err.message}
              </li>
            ))}
          </ul>
        </div>
      )}
      {state.success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 whitespace-pre-line">
          {state.success}
        </div>
      )}

      <div>
        <p className="text-sm text-gray-600 mb-3">
          CSVファイルで複数メンバーをまとめて招待できます。
        </p>
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-600 mb-3">
          <p className="font-medium mb-1">CSVフォーマット:</p>
          <code>姓,名,メールアドレス,ロール</code>
          <p className="mt-1">
            ロール列に <code className="bg-gray-200 px-1 rounded">admin</code> と入力するとadminロールで招待されます。空欄や他の値はmemberロールになります。
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">
          <span>{fileName || 'CSVファイルを選択'}</span>
          <input
            type="file"
            name="file"
            accept=".csv"
            className="hidden"
            required
            onChange={(e) => {
              const file = e.target.files?.[0];
              setFileName(file ? file.name : '');
            }}
          />
        </label>
        <SubmitButton />
      </div>

      <div>
        <a
          href="/api/admin/csv/invite-template"
          download="invite_template.csv"
          className="text-sm text-blue-600 hover:underline"
        >
          CSVテンプレートをダウンロード
        </a>
      </div>
    </form>
  );
}
