'use client';

import { useActionState, useMemo, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@openameba/spindle-ui';
import '@openameba/spindle-ui/Button/Button.css';
import {
  createPublicTimetableAction,
  type PublicTimetableFormState,
} from '@/app/actions/timetables';
import type { TimeSlotEntry } from '@/app/admin/_data';
import { departmentOptions } from '@/lib/constants/departments';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="large" variant="contained" disabled={pending}>
      {pending ? '登録中...' : '時間割を登録'}
    </Button>
  );
}

export function PublicTimetableForm({
  timeSlots,
}: {
  timeSlots: TimeSlotEntry[];
}) {
  const [state, formAction] = useActionState<PublicTimetableFormState, FormData>(
    createPublicTimetableAction,
    {
      error: null,
      success: null,
    }
  );
  const [dayOfWeek, setDayOfWeek] = useState('');
  const [timeSlotId, setTimeSlotId] = useState('');
  const [grade, setGrade] = useState('');
  const [major, setMajor] = useState('');
  const activeTimeSlots = useMemo(
    () => timeSlots.filter((slot) => slot.isActive),
    [timeSlots]
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

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="block text-sm font-medium mb-2">曜日</label>
          <select
            name="dayOfWeek"
            value={dayOfWeek}
            onChange={(event) => setDayOfWeek(event.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">選択</option>
            <option value="1">月</option>
            <option value="2">火</option>
            <option value="3">水</option>
            <option value="4">木</option>
            <option value="5">金</option>
            <option value="6">土</option>
            <option value="0">日</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">時限</label>
          <select
            name="timeSlotId"
            value={timeSlotId}
            onChange={(event) => setTimeSlotId(event.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">選択</option>
            {activeTimeSlots.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {slot.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">学年</label>
          <select
            name="grade"
            value={grade}
            onChange={(event) => setGrade(event.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">選択</option>
            {[1, 2, 3, 4].map((value) => (
              <option key={value} value={value}>
                {value}年
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">専攻</label>
        <select
          name="major"
          value={major}
          onChange={(event) => setMajor(event.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        >
          <option value="">選択</option>
          {departmentOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">教科名</label>
        <input
          type="text"
          name="courseName"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="データ構造"
          required
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-2">教室</label>
          <input
            type="text"
            name="classroom"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="A-201"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">担当講師</label>
          <input
            type="text"
            name="instructor"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="山田先生"
          />
        </div>
      </div>

      <div className="w-full">
        <SubmitButton />
      </div>
    </form>
  );
}
