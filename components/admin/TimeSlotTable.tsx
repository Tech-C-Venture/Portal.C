'use client';

import { useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import type { TimeSlotEntry } from '@/app/admin/_data';
import {
  updateTimeSlotAction,
  type TimeSlotFormState,
  deleteTimeSlotAction,
} from '@/app/actions/timetables';
import { TimeSlotDeleteButton } from '@/components/admin/TimeSlotDeleteButton';

function UpdateButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      disabled={pending}
    >
      {pending ? '更新中...' : '更新'}
    </button>
  );
}

function TimeSlotRow({ slot }: { slot: TimeSlotEntry }) {
  const [state, formAction] = useActionState<TimeSlotFormState, FormData>(
    updateTimeSlotAction,
    {
      error: null,
      success: null,
    }
  );
  const formRef = useRef<HTMLFormElement | null>(null);
  const deleteButtonRef = useRef<HTMLButtonElement | null>(null);

  const handleDelete = () => {
    if (!formRef.current || !deleteButtonRef.current) return;
    formRef.current.requestSubmit(deleteButtonRef.current);
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <form
        ref={formRef}
        action={formAction}
        className="grid gap-4 md:grid-cols-[90px_1.5fr_120px_120px_120px_auto] md:items-center"
      >
        <input type="hidden" name="timeSlotId" value={slot.id} />
        <button
          ref={deleteButtonRef}
          type="submit"
          formAction={deleteTimeSlotAction}
          className="hidden"
          aria-hidden
          tabIndex={-1}
        />
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            時限
          </label>
          <input
            type="number"
            name="period"
            min={1}
            max={10}
            defaultValue={slot.period}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            表示ラベル
          </label>
          <input
            type="text"
            name="label"
            defaultValue={slot.label}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            開始
          </label>
          <input
            type="time"
            name="startTime"
            defaultValue={slot.startTime}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            終了
          </label>
          <input
            type="time"
            name="endTime"
            defaultValue={slot.endTime}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={slot.isActive}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-700">有効</span>
        </div>
        <div className="flex items-center gap-2">
          <UpdateButton />
          <TimeSlotDeleteButton onConfirm={handleDelete} />
        </div>
      </form>

      {state.error && (
        <p className="mt-3 text-xs text-rose-600">{state.error}</p>
      )}
      {state.success && (
        <p className="mt-3 text-xs text-emerald-600">{state.success}</p>
      )}
    </div>
  );
}

export function TimeSlotTable({ timeSlots }: { timeSlots: TimeSlotEntry[] }) {
  if (timeSlots.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        まだ時間帯が登録されていません。
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {timeSlots.map((slot) => (
        <TimeSlotRow key={slot.id} slot={slot} />
      ))}
    </div>
  );
}
