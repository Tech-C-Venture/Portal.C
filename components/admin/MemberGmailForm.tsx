'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@openameba/spindle-ui';
import '@openameba/spindle-ui/Button/Button.css';
import {
  updateMemberGmailAction,
  type AdminGmailFormState,
} from '@/app/actions/members';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="large" variant="contained" disabled={pending}>
      {pending ? '更新中...' : 'Gmailを登録'}
    </Button>
  );
}

export function MemberGmailForm() {
  const [state, formAction] = useActionState<AdminGmailFormState, FormData>(
    updateMemberGmailAction,
    {
      error: null,
      success: null,
    }
  );

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </div>
      )}

      {state.success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.success}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-2">
          学校メールアドレス（検索キー）
        </label>
        <input
          type="email"
          name="schoolEmail"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="taro@example.ed.jp"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">私用Gmailアドレス</label>
        <input
          type="email"
          name="gmailAddress"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="taro@gmail.com"
          required
        />
      </div>

      <div className="w-full">
        <SubmitButton />
      </div>
    </form>
  );
}
