'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@openameba/spindle-ui';
import '@openameba/spindle-ui/Button/Button.css';
import {
  inviteUserAction,
  type InviteUserFormState,
} from '@/app/actions/users';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="large" variant="contained" disabled={pending}>
      {pending ? '招待中...' : 'メンバーを招待'}
    </Button>
  );
}

export function InviteUserForm() {
  const [state, formAction] = useActionState<InviteUserFormState, FormData>(
    inviteUserAction,
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

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-2">姓</label>
          <input
            type="text"
            name="familyName"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="山田"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">名</label>
          <input
            type="text"
            name="givenName"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="太郎"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">メールアドレス</label>
        <input
          type="email"
          name="email"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="taro.yamada@example.com"
          required
        />
      </div>

      <div className="pt-2">
        <SubmitButton />
      </div>

      <p className="text-xs text-gray-500">
        招待されたユーザーには認証メールが送信されます。メール認証後、初回ログイン時にオンボーディングが開始されます。
      </p>
    </form>
  );
}
