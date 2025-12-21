'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@openameba/spindle-ui';
import '@openameba/spindle-ui/Button/Button.css';
import {
  createTimeSlotAction,
  type TimeSlotFormState,
} from '@/app/actions/timetables';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="large" variant="contained" disabled={pending}>
      {pending ? '登録中...' : '時間帯を追加'}
    </Button>
  );
}

export function TimeSlotForm() {
  const [state, formAction] = useActionState<TimeSlotFormState, FormData>(
    createTimeSlotAction,
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

      <div className="grid gap-4 md:grid-cols-5">
        <div>
          <label className="block text-sm font-medium mb-2">時限</label>
          <input
            type="number"
            name="period"
            min={1}
            max={10}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="1"
            required
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2">表示ラベル</label>
          <input
            type="text"
            name="label"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="1限 9:00-10:30"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">開始</label>
          <input
            type="time"
            name="startTime"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">終了</label>
          <input
            type="time"
            name="endTime"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isActive"
          id="time-slot-active"
          defaultChecked
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="time-slot-active" className="text-gray-700">
          現在有効として登録する
        </label>
      </div>

      <div className="w-full">
        <SubmitButton />
      </div>
    </form>
  );
}
