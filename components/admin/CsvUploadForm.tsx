'use client';

import { useActionState, useRef, useState } from 'react';
import { Button } from '@openameba/spindle-ui';
import '@openameba/spindle-ui/Button/Button.css';
import type { CsvUploadState } from '@/app/actions/timetables';

function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return (
    <Button type="submit" size="medium" variant="contained" disabled={pending}>
      {pending ? 'アップロード中...' : label}
    </Button>
  );
}

export function CsvUploadForm({
  action,
  label,
  confirmMessage,
  accept = '.csv',
}: {
  action: (state: CsvUploadState, formData: FormData) => Promise<CsvUploadState>;
  label: string;
  confirmMessage: string;
  accept?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [fileName, setFileName] = useState<string>('');

  const wrappedAction = async (
    prevState: CsvUploadState,
    formData: FormData
  ): Promise<CsvUploadState> => {
    return action(prevState, formData);
  };

  const [state, formAction, isPending] = useActionState<CsvUploadState, FormData>(
    wrappedAction,
    { error: null, errors: null, success: null }
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!window.confirm(confirmMessage)) {
      e.preventDefault();
    }
  };

  return (
    <form
      ref={formRef}
      action={formAction}
      onSubmit={handleSubmit}
      className="space-y-3"
    >
      {state.error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {state.error}
        </div>
      )}
      {state.errors && state.errors.length > 0 && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <p className="font-medium mb-2">バリデーションエラー:</p>
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
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {state.success}
        </div>
      )}

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">
          <span>{fileName || 'ファイルを選択'}</span>
          <input
            type="file"
            name="file"
            accept={accept}
            className="hidden"
            required
            onChange={(e) => {
              const file = e.target.files?.[0];
              setFileName(file ? file.name : '');
            }}
          />
        </label>
        <SubmitButton pending={isPending} label={label} />
      </div>
    </form>
  );
}
