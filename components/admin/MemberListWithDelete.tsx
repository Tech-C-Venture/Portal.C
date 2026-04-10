'use client';

import { useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@openameba/spindle-ui';
import '@openameba/spindle-ui/Button/Button.css';
import {
  deleteMemberAction,
  type DeleteMemberFormState,
} from '@/app/actions/members';
import type { MemberDTO } from '@/application/dtos/MemberDTO';

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="small" variant="contained" disabled={pending}>
      {pending ? '削除中...' : '最終確認：削除を実行する'}
    </Button>
  );
}

type DeleteStep = 'idle' | 'step1' | 'step2' | 'step3';

function MemberDeleteDialog({
  member,
  onClose,
}: {
  member: MemberDTO;
  onClose: () => void;
}) {
  const [step, setStep] = useState<DeleteStep>('step1');
  const [state, formAction] = useActionState<DeleteMemberFormState, FormData>(
    deleteMemberAction,
    { error: null, success: null }
  );

  if (state.success) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {state.success}
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200"
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {state.error && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {state.error}
          </div>
        )}

        {/* Step 1: 初回確認 */}
        {step === 'step1' && (
          <>
            <h3 className="text-lg font-semibold text-gray-900">
              メンバーを削除しますか？
            </h3>
            <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
              <p className="text-sm font-medium text-gray-900">{member.name}</p>
              <p className="text-xs text-gray-500">{member.schoolEmail}</p>
              {member.department && (
                <p className="text-xs text-gray-500">{member.department} / {member.grade}年</p>
              )}
            </div>
            <p className="mt-3 text-sm text-gray-600">
              この操作はPortal.Cからメンバー情報を削除します。
              ZITADELで既に削除済みのユーザーの登録解除に使用してください。
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={() => setStep('step2')}
                className="rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                削除に進む
              </button>
            </div>
          </>
        )}

        {/* Step 2: 影響範囲の確認 */}
        {step === 'step2' && (
          <>
            <h3 className="text-lg font-semibold text-rose-700">
              削除の影響を確認してください
            </h3>
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              <p>以下のデータが完全に削除されます：</p>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>メンバープロフィール情報</li>
                <li>イベント参加記録</li>
                <li>スキル・興味タグ</li>
              </ul>
              <p className="mt-2 font-medium text-rose-600">
                この操作は取り消せません。
              </p>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setStep('step1')}
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                戻る
              </button>
              <button
                type="button"
                onClick={() => setStep('step3')}
                className="rounded-md bg-rose-600 px-3 py-2 text-sm font-semibold text-white hover:bg-rose-700"
              >
                理解した上で続行する
              </button>
            </div>
          </>
        )}

        {/* Step 3: 最終確認と実行 */}
        {step === 'step3' && (
          <form action={formAction}>
            <input type="hidden" name="memberId" value={member.id} />
            <h3 className="text-lg font-semibold text-rose-700">
              最終確認
            </h3>
            <p className="mt-3 text-sm text-gray-700">
              <span className="font-semibold">{member.name}</span>（{member.schoolEmail}）を
              <span className="font-semibold text-rose-600">完全に削除</span>します。
            </p>
            <div className="mt-4 rounded-lg border-2 border-rose-300 bg-rose-50 px-4 py-3 text-xs text-rose-700">
              削除ボタンを押すと即座に実行されます。この操作は元に戻せません。
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setStep('step2')}
                className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                戻る
              </button>
              <DeleteButton />
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export function MemberListWithDelete({ members }: { members: MemberDTO[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [deletingMember, setDeletingMember] = useState<MemberDTO | null>(null);

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left shadow-sm hover:bg-gray-50"
      >
        <span className="text-sm font-semibold text-gray-700">
          登録済みメンバー一覧（{members.length}名）
        </span>
        <svg
          className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-2 rounded-lg border border-gray-200 bg-white shadow-sm">
          {members.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-gray-500">
              登録済みメンバーはいません。
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {member.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {member.schoolEmail}
                      {member.department && ` / ${member.department}`}
                      {member.grade > 0 && ` / ${member.grade}年`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeletingMember(member)}
                    className="ml-3 shrink-0 rounded-md border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100"
                  >
                    削除
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {deletingMember && (
        <MemberDeleteDialog
          member={deletingMember}
          onClose={() => setDeletingMember(null)}
        />
      )}
    </div>
  );
}
